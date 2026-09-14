/**
 * Escritor e leitor de ZIP sem compressão (método "store").
 *
 * Guardar sem comprimir é proposital: o acervo é quase todo mídia já
 * comprimida (mp3, jpg, mp4), então o ganho seria mínimo e em troca dá para
 * ler o pacote de volta sem embutir um inflate no bundle.
 */

export type ZipEntry = { path: string; blob: Blob; date?: Date };

/** Uint8Array é aceito pelo Blob em runtime; o cast só acalma o tipo genérico. */
function part(bytes: Uint8Array): BlobPart {
  return bytes as unknown as BlobPart;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    (Math.floor(date.getSeconds() / 2) & 0x1f);
  const day =
    ((Math.max(date.getFullYear() - 1980, 0) & 0x7f) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { time, date: day };
}

/** Normaliza um nome para virar caminho dentro do zip sem quebrar o pacote. */
export function safePath(name: string): string {
  return (
    name
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/^\.+/, "")
      .trim()
      .slice(0, 120) || "sem-nome"
  );
}

export async function createZip(entries: ZipEntry[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const parts: BlobPart[] = [];
  const central: BlobPart[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path);
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(data);
    const { time, date } = dosDateTime(entry.date ?? new Date());

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // versão mínima
    local.setUint16(6, 0x0800, true); // nomes em UTF-8
    local.setUint16(8, 0, true); // método: store
    local.setUint16(10, time, true);
    local.setUint16(12, date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);

    parts.push(local.buffer, part(nameBytes), part(data));

    const dir = new Uint8Array(46 + nameBytes.length);
    const dirView = new DataView(dir.buffer);
    dirView.setUint32(0, 0x02014b50, true);
    dirView.setUint16(4, 20, true);
    dirView.setUint16(6, 20, true);
    dirView.setUint16(8, 0x0800, true);
    dirView.setUint16(10, 0, true);
    dirView.setUint16(12, time, true);
    dirView.setUint16(14, date, true);
    dirView.setUint32(16, crc, true);
    dirView.setUint32(20, data.length, true);
    dirView.setUint32(24, data.length, true);
    dirView.setUint16(28, nameBytes.length, true);
    dirView.setUint32(42, offset, true);
    dir.set(nameBytes, 46);
    central.push(part(dir));

    offset += 30 + nameBytes.length + data.length;
  }

  const centralSize = entries.reduce(
    (total, entry) => total + 46 + new TextEncoder().encode(entry.path).length,
    0,
  );
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, offset, true);

  return new Blob([...parts, ...central, eocd.buffer], {
    type: "application/zip",
  });
}

export type ReadZipEntry = { path: string; bytes: Uint8Array };

/**
 * Lê um zip gerado por `createZip`. Entradas comprimidas são ignoradas — o
 * chamador avisa quantas ficaram de fora.
 */
export async function readZip(
  file: Blob,
): Promise<{ entries: ReadZipEntry[]; skipped: number }> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(buffer.buffer);
  const decoder = new TextDecoder();

  let eocdAt = -1;
  for (
    let i = buffer.length - 22;
    i >= 0 && i >= buffer.length - 22 - 65535;
    i--
  ) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdAt = i;
      break;
    }
  }
  if (eocdAt === -1) throw new Error("Arquivo .zip inválido ou corrompido.");

  const count = view.getUint16(eocdAt + 10, true);
  let pointer = view.getUint32(eocdAt + 16, true);

  const entries: ReadZipEntry[] = [];
  let skipped = 0;

  for (let i = 0; i < count; i++) {
    if (view.getUint32(pointer, true) !== 0x02014b50) break;
    const method = view.getUint16(pointer + 10, true);
    const size = view.getUint32(pointer + 24, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const path = decoder.decode(
      buffer.subarray(pointer + 46, pointer + 46 + nameLength),
    );

    if (!path.endsWith("/")) {
      if (method === 0) {
        const localNameLength = view.getUint16(localOffset + 26, true);
        const localExtraLength = view.getUint16(localOffset + 28, true);
        const dataAt = localOffset + 30 + localNameLength + localExtraLength;
        entries.push({ path, bytes: buffer.slice(dataAt, dataAt + size) });
      } else {
        skipped++;
      }
    }

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return { entries, skipped };
}
