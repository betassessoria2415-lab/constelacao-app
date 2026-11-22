# Créditos das fotografias

As duas imagens de fundo são astrofotografias reais do ESO (European Southern Observatory), usadas sob a licença [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br), conforme a política de uso do ESO: https://www.eso.org/public/copyright/

| Onde aparece | Fotografia | Crédito | Página do original |
|---|---|---|---|
| Trilha do Caminho (celular e coluna central) | *Our gleaming Milky Way* | **Juan Carlos Muñoz-Mateos/ESO** | https://www.eso.org/public/images/mw_vertical_ut4_pano-cc/ |
| Fundo em telas largas (computador) | *The Milky Way panorama* | **ESO/S. Brunier** | https://www.eso.org/public/images/eso0932a/ |

O crédito aparece no próprio app, preso à fotografia: no rodapé da trilha (`Fotografia: Juan Carlos Muñoz-Mateos/ESO`) e no canto do fundo em telas largas (`Fotografia: ESO/S. Brunier`), os dois com link para a página do original.

## O que foi alterado

As imagens **foram modificadas**. Nada foi desenhado por cima da fotografia nem gerado por IA; as alterações são só estas:

| Arquivo | Original usado | Recorte | Tratamento |
|---|---|---|---|
| `via-celular-{520,780,1170}.{avif,webp}` | JPEG "large", 3105 × 6652 px | x de 26,5% a 85,8%, y de 0% a 80% (proporção 9:26). Fica de fora a base da imagem, com os telescópios | brilho × 0,86 e mistura de 8% com o azul-noite `#0A0B1A`; redimensionada para 520, 780 e 1170 px de largura |
| `via-desktop-{1600,2560}.{avif,webp}` | JPEG "large", 6000 × 3000 px | faixa central: x de 20% a 80%, y de 22,5% a 77,5% (proporção 24:11) | o mesmo; redimensionada para 1600 e 2560 px de largura |

Sem filtro de nitidez e sem saturação extra. No app, a página ainda escurece a fotografia localmente (degradês em CSS) atrás dos textos, e as estrelas, a linha da trilha e a Estela são elementos do app desenhados por cima, não parte da fotografia.

## Como refazer

Baixe os dois JPEG "large" das páginas acima para uma pasta e rode:

```
python -P ferramentas/fotos.py <pasta-com-os-originais> img
```

Os originais não ficam no repositório.
