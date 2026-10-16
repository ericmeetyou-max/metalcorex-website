from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
source=root/'website'; output=root/'dist'
if output.exists(): shutil.rmtree(output)
output.mkdir()
excluded={'worker.js','functions','db','tools','README.md','CLOUDFLARE_SETUP.md'}
for p in source.iterdir():
 if p.name in excluded or p.name.startswith('.'): continue
 if p.is_dir(): shutil.copytree(p,output/p.name)
 else: shutil.copy2(p,output/p.name)
print('Static assets ready in dist; Worker entry remains website/worker.js')
