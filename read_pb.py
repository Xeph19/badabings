import os
import re

pb_files = [
    '512dc7fa-ed03-4762-a227-444f99723fe6.pb',
    '7a76503c-b5e8-42fc-911e-df8a4898d95e.pb',
    '9ded9a3b-3ee6-4200-b299-7b07485342ff.pb',
    'babc0201-f638-4df0-a60d-10d6b4371c34.pb'
]
dir_path = r'C:\Users\johnr\.gemini\antigravity-ide\conversations'

for p in pb_files:
    fpath = os.path.join(dir_path, p)
    if os.path.exists(fpath):
        with open(fpath, 'rb') as f:
            data = f.read()
            # Find USER_REQUEST block roughly
            idx = data.find(b'USER_REQUEST')
            if idx != -1:
                print(f"--- {p} ---")
                block = data[idx:idx+200]
                print(re.sub(rb'[^a-zA-Z0-9_<>\n\r /:.\-]', b'', block).decode('ascii', errors='ignore'))
            else:
                print(f"--- {p} --- No USER_REQUEST found")
