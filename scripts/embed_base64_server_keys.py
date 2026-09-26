import base64
import re
import os

def get_b64(path):
    with open(path, "rb") as f:
        return f"data:image/png;base64,{base64.b64encode(f.read()).decode('ascii')}"

server_keys_path = r"c:\Users\Furianec\Desktop\Taro\SERVER_KEYS_AND_CONFIGS.md"
with open(server_keys_path, "r", encoding="utf-8") as f:
    content = f.read()

qr_dir = r"C:\Users\Furianec\Desktop\Taro\img\qr"
for fname in os.listdir(qr_dir):
    if fname.endswith(".png"):
        b64 = get_b64(os.path.join(qr_dir, fname))
        pattern = rf'<img src="[^"]*{fname}"([^>]*)>'
        content = re.sub(pattern, f'<img src="{b64}"\\1>', content)

with open(server_keys_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SERVER_KEYS_AND_CONFIGS.md with base64 images.")
