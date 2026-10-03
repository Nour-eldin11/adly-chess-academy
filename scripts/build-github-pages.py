"""Create GitHub Pages output with links scoped to the repository URL."""
from pathlib import Path
import os
import re
import shutil

root = Path(__file__).resolve().parents[1]
source = root / 'dist'
target = root / '_site'
base = os.environ.get('PAGES_BASE_PATH', '').strip('/')
if base and not re.fullmatch(r'[A-Za-z0-9_.-]+', base):
    raise ValueError('Invalid Pages base path')
prefix = '/' + base + '/' if base else '/'
shutil.copytree(source, target, dirs_exist_ok=True)
for path in target.rglob('*'):
    if path.suffix not in {'.html', '.css', '.js'}:
        continue
    text = path.read_text()
    # Rewrite root-relative HTML attributes and JS string/template paths.
    # Protocol-relative URLs and absolute external URLs remain unchanged.
    text = re.sub(r'''(["'`])/(?!/)''', lambda m: m[1] + prefix, text)
    path.write_text(text)
(target / '.nojekyll').touch()
print(f'Built {len(list(target.rglob("*.html")))} pages for {prefix}')
