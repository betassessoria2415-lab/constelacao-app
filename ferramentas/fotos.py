"""Gera as versões responsivas da Via Láctea a partir dos originais do ESO.

Uso:  python -P ferramentas/fotos.py <pasta-com-os-originais> img

Originais (JPEG "large" do site do ESO, licença CC BY 4.0):
  mw_vertical_ut4_pano-cc.jpg  3105 x 6652  crédito: Juan Carlos Muñoz-Mateos/ESO
      https://www.eso.org/public/images/mw_vertical_ut4_pano-cc/
  eso0932a.jpg                 6000 x 3000  crédito: ESO/S. Brunier
      https://www.eso.org/public/images/eso0932a/

Recortes e tratamento (os mesmos números estão em img/CREDITOS.md):
  celular  recorte x 26,5% a 85,8%, y 0% a 80% do original (proporção 9:26); fica de fora a base
           com os telescópios. Saída em 520, 780 e 1170 px de largura.
  desktop  recorte central x 20% a 80%, y 22,5% a 77,5% do original (proporção 24:11).
           Saída em 1600 e 2560 px de largura.
  cor      brilho x 0,86 e mistura de 8% com o azul-noite #0A0B1A. Sem filtro de nitidez,
           sem saturação extra: os detalhes da fotografia ficam como no original.
"""
import os, sys
from PIL import Image, ImageEnhance

Image.MAX_IMAGE_PIXELS = None
origem, destino = sys.argv[1], sys.argv[2]
os.makedirs(destino, exist_ok=True)

def tratar(im):
    im = ImageEnhance.Brightness(im).enhance(0.86)
    return Image.blend(im, Image.new("RGB", im.size, (10, 11, 26)), 0.08)

def salvar(im, nome, largura):
    alt = round(im.height * largura / im.width)
    r = im.resize((largura, alt), Image.LANCZOS)
    r.save(os.path.join(destino, f"{nome}-{largura}.avif"), quality=48, speed=4)
    r.save(os.path.join(destino, f"{nome}-{largura}.webp"), quality=68, method=6)
    for ext in ("avif", "webp"):
        p = os.path.join(destino, f"{nome}-{largura}.{ext}")
        print(f"{p}  {largura}x{alt}  {os.path.getsize(p) // 1024} KB")

v = Image.open(os.path.join(origem, "mw_vertical_ut4_pano-cc.jpg")).convert("RGB")
W, H = v.size
alto = round(H * 0.80); largo = round(alto * 9 / 26); x0 = round(W * 0.265)
cel = tratar(v.crop((x0, 0, x0 + largo, alto)))
print("celular: recorte", (x0, 0, x0 + largo, alto))
for w in (520, 780, 1170):
    salvar(cel, "via-celular", w)

p = Image.open(os.path.join(origem, "eso0932a.jpg")).convert("RGB")
W, H = p.size
desk = tratar(p.crop((round(W * 0.20), round(H * 0.225), round(W * 0.80), round(H * 0.775))))
print("desktop: recorte", (round(W * 0.20), round(H * 0.225), round(W * 0.80), round(H * 0.775)))
for w in (1600, 2560):
    salvar(desk, "via-desktop", w)
