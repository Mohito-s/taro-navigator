import os
import re
import io
import base64
import qrcode

def make_qr_base64(data: str) -> str:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#000000", back_color="#ffffff")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{b64}"

awg_android_conf = ""
awg_iphone_conf = ""
if os.path.exists(r"C:\Users\Furianec\Desktop\amnezia_helsinki.conf"):
    with open(r"C:\Users\Furianec\Desktop\amnezia_helsinki.conf", "r", encoding="utf-8") as f:
        awg_android_conf = f.read().strip()

if os.path.exists(r"C:\Users\Furianec\Desktop\amnezia_helsinki_iphone.conf"):
    with open(r"C:\Users\Furianec\Desktop\amnezia_helsinki_iphone.conf", "r", encoding="utf-8") as f:
        awg_iphone_conf = f.read().strip()

sub_url = "https://sub.shadowlinkapp.online/api/sub/sMtET-VfUXYEdRTF"
vless_xhttp = "vless://6993ed34-beba-4d5a-a9a5-f1b43874a743@cdn.shadowlinkapp.online:443?encryption=none&type=xhttp&path=%2Fsl-xh&host=cdn.shadowlinkapp.online&mode=auto&extra=%7B%22mode%22%3A%22auto%22%7D&security=tls&sni=cdn.shadowlinkapp.online&fp=chrome#Helsinki%20Cloudflare%20XHTTP%20Shield"
vless_cf_ws = "vless://6993ed34-beba-4d5a-a9a5-f1b43874a743@cdn.shadowlinkapp.online:443?encryption=none&type=ws&path=%2Fsl-rw&host=cdn.shadowlinkapp.online&security=tls&sni=cdn.shadowlinkapp.online&fp=chrome#Helsinki%20Cloudflare%20WS%20Shield"
vless_ws_direct = "vless://6993ed34-beba-4d5a-a9a5-f1b43874a743@shadowlinkapp.online:443?encryption=none&type=ws&path=%2Fsl-rw&host=shadowlinkapp.online&security=tls&sni=shadowlinkapp.online&fp=chrome#Helsinki%20Direct%20(Port%20443)"
olcrtc_telemost = "olcrtc://telemost?vp8&fps=60&batch=64@71384762492861#6797073265d03feb0f454e238c78d01aa52c48534c1772c44493bd718fb62be1$Helsinki_Telemost"
olcrtc_jitsi = "olcrtc://jitsi?datachannel@https://meet.systemli.org/romario_taro_777#6797073265d03feb0f454e238c78d01aa52c48534c1772c44493bd718fb62be1$Helsinki_Jitsi"
tg_proxy = "tg://proxy?server=proxy.shadowlinkapp.online&port=8444&secret=ee671a094e1a88bbaab8607d8cac67cc3270726f78792e736861646f776c696e6b6170702e6f6e6c696e65"
sub_portal = "https://sub.shadowlinkapp.online/sMtET-VfUXYEdRTF"

qr_awg_android = make_qr_base64(awg_android_conf or "AmneziaWG Android")
qr_awg_iphone = make_qr_base64(awg_iphone_conf or "AmneziaWG iPhone")
qr_sub_url = make_qr_base64(sub_url)
qr_vless_xhttp = make_qr_base64(vless_xhttp)
qr_vless_cf_ws = make_qr_base64(vless_cf_ws)
qr_vless_ws = make_qr_base64(vless_ws_direct)
qr_olcrtc_telemost = make_qr_base64(olcrtc_telemost)
qr_olcrtc_jitsi = make_qr_base64(olcrtc_jitsi)
qr_tg_proxy = make_qr_base64(tg_proxy)
qr_sub_portal = make_qr_base64(sub_portal)

table = f"""| Сервис / Протокол | QR-код (сканируй камерой) | Быстрая ссылка / Ключ |
|---|:---:|---|
| **AmneziaWG (Android)**<br>*(Телефон 1 — Роман)* | <img src="{qr_awg_android}" width="130" height="130" alt="AmneziaWG Android" /> | Файл: `C:\\Users\\Furianec\\Desktop\\amnezia_helsinki.conf` (IP: `10.8.1.2`) |
| **AmneziaWG (iPhone)**<br>*(Телефон 2 — Жена)* | <img src="{qr_awg_iphone}" width="130" height="130" alt="AmneziaWG iPhone" /> | Файл: `C:\\Users\\Furianec\\Desktop\\amnezia_helsinki_iphone.conf` (IP: `10.8.1.3`) |
| **Авто-подписка RemnaWave**<br>*(Happ, v2raytun, Sing-box)* | <img src="{qr_sub_url}" width="130" height="130" alt="Авто-подписка" /> | `{sub_url}` |
| **VLESS Cloudflare XHTTP Shield**<br>*(Новинка Split HTTP 🟧)* | <img src="{qr_vless_xhttp}" width="130" height="130" alt="VLESS XHTTP" /> | `{vless_xhttp}` |
| **VLESS Cloudflare WS Shield**<br>*(Cloudflare CDN WebSocket 🟧)* | <img src="{qr_vless_cf_ws}" width="130" height="130" alt="VLESS CF WS" /> | `{vless_cf_ws}` |
| **VLESS-WS Direct (Резерв)**<br>*(Прямой порт 443)* | <img src="{qr_vless_ws}" width="130" height="130" alt="VLESS WS Direct" /> | `{vless_ws_direct}` |
| **OlcRTC Яндекс Телемост**<br>*(Обход ТСПУ через WebRTC v2)* | <img src="{qr_olcrtc_telemost}" width="130" height="130" alt="OlcRTC Telemost" /> | `{olcrtc_telemost}` |
| **OlcRTC WebRTC Jitsi**<br>*(Резервный канал Olcbox)* | <img src="{qr_olcrtc_jitsi}" width="130" height="130" alt="OlcRTC Jitsi" /> | `{olcrtc_jitsi}` |
| **Telegram MTProto Proxy**<br>*(Fake TLS прокси)* | <img src="{qr_tg_proxy}" width="130" height="130" alt="Telegram Proxy" /> | `{tg_proxy}` |
| **Личный веб-кабинет**<br>*(Статус и срок подписки)* | <img src="{qr_sub_portal}" width="130" height="130" alt="Web Portal" /> | `{sub_portal}` |
"""

path = r"c:\Users\Furianec\Desktop\Taro\SERVER_KEYS_AND_CONFIGS.md"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace from '| Сервис / Протокол |' to end of file
start_idx = text.find("| Сервис / Протокол |")
if start_idx != -1:
    text = text[:start_idx] + table

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated SERVER_KEYS_AND_CONFIGS.md table.")
