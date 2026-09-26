import base64
import re
import qrcode
import io

def get_b64(path):
    with open(path, "rb") as f:
        return f"data:image/png;base64,{base64.b64encode(f.read()).decode('ascii')}"

artifact_path = r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\SUBSCRIPTIONS_QR_CODES.md"
with open(artifact_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace any file:/// or relative img tags with base64
qr_map = {
    "qr_awg_android.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_awg_android.png",
    "qr_awg_iphone.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_awg_iphone.png",
    "qr_subscription_url.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_subscription_url.png",
    "qr_vless_reality.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_vless_reality.png",
    "qr_vless_xhttp.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_vless_xhttp.png",
    "qr_vless_cf_shield.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_vless_cf_shield.png",
    "qr_vless_ws.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_vless_ws.png",
    "qr_olcrtc_telemost.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_olcrtc_telemost.png",
    "qr_olcrtc_jitsi.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_olcrtc_jitsi.png",
    "qr_tg_proxy.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_tg_proxy.png",
    "qr_sub_webpage.png": r"C:\Users\Furianec\.gemini\antigravity\brain\392dc647-11b1-489c-a29c-321e2f0322f6\qr_sub_webpage.png",
}

for name, fpath in qr_map.items():
    b64 = get_b64(fpath)
    pattern = rf'<img src="[^"]*{name}"([^>]*)>'
    content = re.sub(pattern, f'<img src="{b64}"\\1>', content)

with open(artifact_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SUBSCRIPTIONS_QR_CODES.md with base64 images.")
