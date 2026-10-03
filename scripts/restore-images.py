"""Recover the academy's original public images into the repository."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.parse import quote
from io import BytesIO
import hashlib,json,time
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
items=json.loads((ROOT/'content/image-sources.json').read_text())
def restore(item):
    outputs=[o for o in item['outputs'] if not (ROOT/o['path']).is_file()]
    if not outputs:return
    if not item['url'].startswith('https://adlychess.com/wp-content/uploads/'):
        raise ValueError('Unexpected image source')
    for attempt in range(3):
        try:
            with urlopen(Request(quote(item['url'],safe=':/%?=&'),headers={'User-Agent':'Mozilla/5.0'}),timeout=60) as response:
                data=response.read(30*1024*1024)
            for out in outputs:
                path=(ROOT/out['path']).resolve()
                if not path.is_relative_to(ROOT/'dist/assets'):raise ValueError('Invalid image path')
                path.parent.mkdir(parents=True,exist_ok=True)
                if out.get('webp'):
                    with Image.open(BytesIO(data)) as original:
                        image=ImageOps.exif_transpose(original).convert('RGB')
                        image=ImageOps.fit(image,tuple(out['size']),method=Image.Resampling.LANCZOS)
                        image.save(path,'WEBP',quality=85,method=6)
                else:
                    if hashlib.sha256(data).hexdigest()!=out['sha256']:
                        raise ValueError('Original image changed: '+out['path'])
                    path.write_bytes(data)
            return
        except Exception:
            if attempt==2:raise
            time.sleep(2*(attempt+1))
with ThreadPoolExecutor(max_workers=6) as pool:
    list(pool.map(restore,items))
for item in items:
    for out in item['outputs']:
        with Image.open(ROOT/out['path']) as image:image.verify()
print('All required website images are present and valid.')
