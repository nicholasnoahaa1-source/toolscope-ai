"""
Gera a sequência de quadros do sacolé girando, a partir da foto real.

Não há 3D em tempo de execução: um cilindro é analítico, então dá para
resolvê-lo direto em numpy. A textura vem de um trecho limpo do corpo do
sacolé na foto — o mesmo creme, os mesmos pedaços de biscoito — mapeado na
superfície. O resultado é o produto real girando, não um desenho dele.

    python3 ferramentas/gerar-frames.py
"""
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path

FOTO = '/root/.claude/uploads/7bdc680f-68af-5335-bd50-2c66c4124003/1237909c-image.png'
SAIDA = Path('public/frames')
QUADROS = 36

# trecho do corpo sem a mão na frente. O recorte é apertado de propósito:
# qualquer pixel de fundo escuro que entre aqui reaparece como uma faixa preta
# na borda da peça quando a textura encosta na silhueta.
CORPO = (512, 455, 616, 688)


def achatar_luz(a, raio=48):
    """Remove a iluminação que já está gravada na foto, preservando o granulado.

    O trecho recortado tem o próprio claro-escuro do sol da tarde. Se ele for
    para a superfície junto com o granulado, briga com a nossa iluminação e
    aparece como uma faixa escura na emenda. Dividir pela versão borrada deixa
    só a variação fina — os pedaços de biscoito e o granulado do creme.

    Dois cuidados: o borrão precisa dar a volta na faixa, senão as bordas ficam
    corrigidas errado e a emenda escurece; e a média é por canal, senão a peça
    perde a cor de creme e vira metal.
    """
    larg = a.shape[1]
    m = larg // 4
    volta = np.concatenate([a[:, -m:], a, a[:, :m]], axis=1)     # costura cíclica
    suave = np.asarray(
        Image.fromarray((volta * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(raio))
    ).astype(np.float32) / 255
    suave = suave[:, m:m + larg]
    media = a.reshape(-1, 3).mean(0)                              # por canal: mantém o creme
    plano = np.clip(a / np.maximum(suave, 0.08) * media, 0, 1)
    # Os pedaços de biscoito são escuros de verdade, mas sombra residual da foto
    # também é. Um piso baixo corta a sombra sem apagar o biscoito.
    return np.clip((plano - 0.08) / 0.92, 0, 1) * 0.93 + 0.07


# Proporção de cor do creme real, neutralizada da luz alaranjada da foto.
# Usada só como razão entre canais — nunca como nível de exposição.
CREME = np.array([0.92, 0.885, 0.84], np.float32)


def textura_360(crop, largura=720, altura=900):
    """Costura o trecho numa faixa que fecha em 360°.

    Dois espelhos lado a lado fecham a volta sem emenda, mas deixam uma
    borboleta óbvia no meio da peça. Em vez de embaralhar os tiles — o que
    reintroduz cortes — a simetria é quebrada por uma modulação suave feita de
    cossenos de período inteiro, que por construção também fecha a volta.
    """
    base = crop.resize((largura // 2, altura), Image.LANCZOS)
    faixa = Image.new('RGB', (largura, altura))
    faixa.paste(base, (0, 0))
    faixa.paste(base.transpose(Image.FLIP_LEFT_RIGHT), (largura // 2, 0))

    a = achatar_luz(np.asarray(faixa).astype(np.float32) / 255)

    # Só balanço de branco: corrige o dourado do fim de tarde sem mexer na
    # exposição. Forçar a média para uma cor-alvo estoura os meios-tons e a
    # peça perde o volume.
    m = np.maximum(a.reshape(-1, 3).mean(0), 1e-3)
    ganho = CREME / m
    ganho /= ganho.mean()
    return np.clip(a * ganho, 0, 1)


def silhueta(h, w, raio_px):
    """Máscara do corpo: fundo selado embaixo, ombro fechando em cima.

    `t` vai de 0 no PÉ da peça a 1 no topo — a linha 0 do array é o topo da
    imagem, então é preciso inverter, senão a peça sai de cabeça para baixo.
    """
    y = np.arange(h)[:, None]
    t = 1 - y / (h - 1)
    r = np.ones_like(t, dtype=np.float32)
    base = t < 0.045
    r = np.where(base, np.sin(np.clip(t / 0.045, 0, 1) * np.pi / 2), r)
    ombro = t > 0.86
    k = np.clip((t - 0.86) / 0.14, 0, 1)
    # expoente alto mantém o ombro cheio e só fecha no fim, como o saquinho real
    r = np.where(ombro, np.maximum(1 - k ** 2.6 * 0.92, 0.07), r)
    return (r * raio_px).astype(np.float32)


def quadro(tex, angulo, w=400, h=760):
    raio = w * 0.30
    alt_corpo = int(h * 0.80)
    topo = h - alt_corpo

    perfil = silhueta(alt_corpo, w, raio)                       # (alt,1)
    x = np.arange(w)[None, :] - w / 2                            # (1,larg)
    dentro = np.abs(x) <= perfil

    # u de -1 a 1 na largura do corpo; phi é o ângulo na superfície
    u = np.clip(np.divide(x, perfil, out=np.zeros((alt_corpo, w), np.float32),
                          where=perfil > 0), -1, 1)
    phi = np.arcsin(u)

    th, tw, _ = tex.shape
    s = ((phi + angulo) / (2 * np.pi)) % 1.0
    v = np.linspace(0, 1, alt_corpo)[:, None] * np.ones((1, w))
    cor = tex[(v * (th - 1)).astype(int), (s * (tw - 1)).astype(int)]

    # luz: queda pelo cosseno mais um realce especular onde a superfície
    # devolve a luz para a câmera — é o que faz ler como plástico molhado
    n = np.cos(phi)
    luz = (0.60 + 0.55 * np.clip(n, 0, 1) ** 0.75)[..., None]
    # brilho largo e discreto: forte demais e o creme lê como metal polido
    espec = (np.clip(np.cos(phi - 0.6), 0, 1) ** 9 * 0.16)[..., None]
    corpo = np.clip(cor * luz + espec, 0, 1)

    rgba = np.zeros((h, w, 4), np.float32)
    rgba[topo:topo + alt_corpo, :, :3] = corpo
    rgba[topo:topo + alt_corpo, :, 3] = dentro.astype(np.float32)
    img = Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA')

    # anti-serrilhado barato: o alfa duro vira uma borda suave
    a = img.getchannel('A').filter(ImageFilter.GaussianBlur(0.6))
    img.putalpha(a)
    return img


def main():
    foto = Image.open(FOTO).convert('RGB')
    tex = textura_360(foto.crop(CORPO))

    SAIDA.mkdir(parents=True, exist_ok=True)
    for i in range(QUADROS):
        ang = 2 * np.pi * i / QUADROS
        img = quadro(tex, ang)
        w, h = img.size

        img.save(SAIDA / f'{i + 1:04d}.webp', 'WEBP', quality=80, method=6)
        img.resize((w // 2, h // 2), Image.LANCZOS).save(
            SAIDA / f'{i + 1:04d}-sm.webp', 'WEBP', quality=76, method=6)

    peso = sum(f.stat().st_size for f in SAIDA.glob('*.webp'))
    print(f'{QUADROS} quadros · {peso / 1024:.0f} kB no total')


if __name__ == '__main__':
    main()
