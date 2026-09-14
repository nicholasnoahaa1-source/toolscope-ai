export type CategoryId =
  | "trilhas-sonoras"
  | "fotos"
  | "videos"
  | "tipografia"
  | "paletas"
  | "documentos"
  | "vetores"
  | "modelos-3d"
  | "referencias"
  | "outros";

export type ArquivoCategory = {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  /** Extensões usadas para auto-classificar um arquivo importado. */
  extensions: string[];
  /** Prefixos de MIME type usados para auto-classificar. */
  mimePrefixes: string[];
};

export const CATEGORIES: ArquivoCategory[] = [
  {
    id: "trilhas-sonoras",
    name: "Trilhas sonoras",
    description: "Músicas, beats, efeitos sonoros e locuções.",
    icon: "🎵",
    extensions: ["mp3", "wav", "flac", "aac", "ogg", "m4a", "aiff", "wma", "opus"],
    mimePrefixes: ["audio/"],
  },
  {
    id: "fotos",
    name: "Fotos",
    description: "Fotografias, capturas de tela e imagens em geral.",
    icon: "🖼️",
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "heic", "tiff", "bmp", "raw", "cr2", "nef", "dng", "avif"],
    mimePrefixes: ["image/"],
  },
  {
    id: "videos",
    name: "Vídeos",
    description: "Clipes, brutos, renders e animações.",
    icon: "🎬",
    extensions: ["mp4", "mov", "mkv", "webm", "avi", "m4v", "mpg", "mpeg", "prores"],
    mimePrefixes: ["video/"],
  },
  {
    id: "tipografia",
    name: "Tipografia",
    description: "Fontes e famílias tipográficas.",
    icon: "🔤",
    extensions: ["ttf", "otf", "woff", "woff2", "eot", "fon", "ttc"],
    mimePrefixes: ["font/"],
  },
  {
    id: "paletas",
    name: "Paletas de cor",
    description: "Paletas salvas em hex ou exportadas de outros apps.",
    icon: "🎨",
    extensions: ["ase", "aco", "acb", "gpl", "clr", "sketchpalette"],
    mimePrefixes: [],
  },
  {
    id: "documentos",
    name: "Documentos",
    description: "PDFs, textos, planilhas, contratos e briefings.",
    icon: "📄",
    extensions: ["pdf", "doc", "docx", "txt", "md", "rtf", "odt", "xls", "xlsx", "csv", "ppt", "pptx", "key", "pages"],
    mimePrefixes: ["text/"],
  },
  {
    id: "vetores",
    name: "Vetores e ícones",
    description: "SVGs, ícones, logos e arquivos vetoriais.",
    icon: "✒️",
    extensions: ["svg", "ai", "eps", "cdr", "sketch", "fig", "afdesign", "psd", "xd"],
    mimePrefixes: [],
  },
  {
    id: "modelos-3d",
    name: "Modelos 3D",
    description: "Malhas, cenas, texturas e projetos tridimensionais.",
    icon: "🧊",
    extensions: ["obj", "fbx", "glb", "gltf", "blend", "stl", "dae", "c4d", "3ds", "usdz"],
    mimePrefixes: ["model/"],
  },
  {
    id: "referencias",
    name: "Referências",
    description: "Moodboards, links salvos e materiais de inspiração.",
    icon: "📌",
    extensions: ["url", "webloc", "html", "htm"],
    mimePrefixes: [],
  },
  {
    id: "outros",
    name: "Outros",
    description: "Tudo que ainda não tem uma prateleira própria.",
    icon: "📦",
    extensions: [],
    mimePrefixes: [],
  },
];

export const CATEGORY_MAP = new Map<string, ArquivoCategory>(
  CATEGORIES.map((c) => [c.id, c]),
);

export function getCategory(id: string): ArquivoCategory {
  return CATEGORY_MAP.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function extensionOf(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i === -1 ? "" : fileName.slice(i + 1).toLowerCase();
}

/** Descobre a categoria de um arquivo pela extensão e, em segundo lugar, pelo MIME. */
export function detectCategory(fileName: string, mimeType: string): CategoryId {
  const ext = extensionOf(fileName);
  if (ext) {
    const byExt = CATEGORIES.find((c) => c.extensions.includes(ext));
    if (byExt) return byExt.id;
  }
  if (mimeType) {
    const byMime = CATEGORIES.find((c) =>
      c.mimePrefixes.some((p) => mimeType.startsWith(p)),
    );
    if (byMime) return byMime.id;
  }
  return "outros";
}
