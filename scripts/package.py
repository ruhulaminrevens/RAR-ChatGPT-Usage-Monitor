"""Reproducible, named-folder ZIP containing only extension runtime + install docs."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'manifest.json').read_text())['version']
name = f'RAR_ChatGPT_Usage_Monitor_v{version}'
files = ['manifest.json', 'core.js', 'view.js', 'content.js', 'background.js', 'styles.css', 'popup.html', 'popup.js', 'popup.css', 'LICENSE', 'docs/INSTALLATION.md', 'docs/PRIVACY.md']
files += [str(p.relative_to(root)) for p in sorted((root / 'icons').glob('*.png'))]
target = root / 'dist' / f'{name}.zip'
target.parent.mkdir(exist_ok=True)
with ZipFile(target, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for filename in sorted(files):
        info = ZipInfo(f'{name}/{filename}', date_time=(2026, 9, 27, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (root / filename).read_bytes(), compresslevel=9)
with ZipFile(target) as archive:
    assert archive.testzip() is None
    assert f'{name}/manifest.json' in archive.namelist()
digest = hashlib.sha256(target.read_bytes()).hexdigest()
(root / 'dist' / 'SHA256SUMS.txt').write_text(f'{digest}  {target.name}\n')
print(f'{target.name}: {target.stat().st_size:,} bytes; SHA256 {digest}')
