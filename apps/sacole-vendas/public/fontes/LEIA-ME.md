# Fontes

## Manrope — versionada aqui

`Manrope-Variable.woff2`, eixo `wght` 200–800, subsetada para latim.
Licença OFL, em `Manrope-OFL.txt`. Pode ficar no repositório.

## Tiempos Text Italic — NÃO versionada

Fonte paga da Klim Type Foundry. O arquivo enviado é a build de webfont
(a tabela de nomes diz "Not Licensed for Desktop Use"). Este repositório é
público, então o arquivo está no `.gitignore`: commitá-lo seria distribuir
a fonte para qualquer pessoa.

Para rodar com ela, coloque o arquivo em:

    public/fontes/TiemposText-Italic.woff2

Sem ele a página cai na pilha `Iowan Old Style / Palatino / Georgia` — o
desenho muda, mas nada quebra.

Para gerar o `.woff2` a partir do `.ttf` original:

    pip install fonttools brotli
    pyftsubset TiemposText-Italic.ttf \
      --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" \
      --layout-features='*' --flavor=woff2 \
      --output-file=public/fontes/TiemposText-Italic.woff2

Antes de publicar o site, confirme com a Klim que a licença cobre o domínio.
