import io
import os
import base64
import qrcode
from qrcode.image.styledpil import StyledPilImage

# Read Amnzeia configs
awg_android_conf = ""
awg_iphone_conf = ""
if os.path.exists(r"C:\Users\Furianec\Desktop\amnezia_helsinki.conf"):
    with open(r"C:\Users\Furianec\Desktop\amnezia_helsinki.conf", "r", encoding="utf-8") as f:
        awg_android_conf = f.read().strip()

if os.path.exists(r"C:\Users\Furianec\Desktop\amnezia_helsinki_iphone.conf"):
    with open(r"C:\Users\Furianec\Desktop\amnezia_helsinki_iphone.conf", "r", encoding="utf-8") as f:
        awg_iphone_conf = f.read().strip()

# Links
sub_url = "https://sub.shadowlinkapp.online/api/sub/sMtET-VfUXYEdRTF"
vless_xhttp = "vless://6993ed34-beba-4d5a-a9a5-f1b43874a743@cdn.shadowlinkapp.online:443?encryption=none&type=xhttp&path=%2Fsl-xh&host=cdn.shadowlinkapp.online&mode=auto&extra=%7B%22mode%22%3A%22auto%22%7D&security=tls&sni=cdn.shadowlinkapp.online&fp=chrome#Helsinki%20Cloudflare%20XHTTP%20Shield"
vless_reality = "vless://6993ed34-beba-4d5a-a9a5-f1b43874a743@193.168.198.57:8443?encryption=none&flow=xtls-rprx-vision&type=tcp&security=reality&sni=gateway.icloud.com&fp=chrome&pbk=4cmjrzhLAVvPC5s7PcXfBSEF5PR4sEi00fR38OBjSyQ&sid=6ba85179e30d4fc2#Helsinki%20REALITY%20Direct"
vless_ws_direct = "vless://6993ed34-beba-4d5a-a9a5-f1b43874a743@193.168.198.57:443?encryption=none&type=ws&path=%2Fsl-rw&host=shadowlinkapp.online&security=tls&sni=shadowlinkapp.online&fp=chrome#Helsinki%20Direct%20(Port%20443)"
olcrtc_telemost = "olcrtc://telemost?vp8&fps=60&batch=64@71384762492861#6797073265d03feb0f454e238c78d01aa52c48534c1772c44493bd718fb62be1$Helsinki_Telemost"
tg_proxy = "tg://proxy?server=proxy.shadowlinkapp.online&port=8444&secret=ee671a094e1a88bbaab8607d8cac67cc3270726f78792e736861646f776c696e6b6170702e6f6e6c696e65"
sub_portal = "https://sub.shadowlinkapp.online/sMtET-VfUXYEdRTF"

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

qrs = {
    "awg_android": make_qr_base64(awg_android_conf or "AmneziaWG Android"),
    "awg_iphone": make_qr_base64(awg_iphone_conf or "AmneziaWG iPhone"),
    "sub_url": make_qr_base64(sub_url),
    "vless_xhttp": make_qr_base64(vless_xhttp),
    "vless_reality": make_qr_base64(vless_reality),
    "vless_ws": make_qr_base64(vless_ws_direct),
    "olcrtc_telemost": make_qr_base64(olcrtc_telemost),
    "tg_proxy": make_qr_base64(tg_proxy),
    "sub_portal": make_qr_base64(sub_portal),
}

# Create HTML file on Desktop
html_content = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VPN Подключения и QR-коды — ShadowLink</title>
<style>
  body {{
    background: #111114;
    color: #f0ece4;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 24px;
  }}
  h1 {{
    color: #c9a96e;
    text-align: center;
    font-size: 28px;
    margin-bottom: 8px;
  }}
  .subtitle {{
    text-align: center;
    color: #8a857c;
    margin-bottom: 32px;
    font-size: 15px;
  }}
  .grid {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1300px;
    margin: 0 auto;
  }}
  .card {{
    background: #1c1c20;
    border: 1px solid rgba(201,169,110,0.25);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    transition: transform 0.2s, border-color 0.2s;
  }}
  .card:hover {{
    border-color: #c9a96e;
    transform: translateY(-2px);
  }}
  .badge {{
    background: rgba(201,169,110,0.15);
    color: #c9a96e;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .card h2 {{
    margin: 0 0 8px 0;
    font-size: 19px;
    color: #f0ece4;
  }}
  .desc {{
    font-size: 13px;
    color: #8a857c;
    margin-bottom: 16px;
    min-height: 38px;
  }}
  .qr-box {{
    background: #ffffff;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }}
  .qr-box img {{
    display: block;
    width: 190px;
    height: 190px;
  }}
  .code-preview {{
    background: #111114;
    border: 1px solid #2a2a30;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 11px;
    color: #c9a96e;
    width: 100%;
    box-sizing: border-box;
    word-break: break-all;
    max-height: 60px;
    overflow-y: auto;
    text-align: left;
    margin-bottom: 12px;
    font-family: monospace;
  }}
  .btn {{
    background: #c9a96e;
    color: #111114;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 13px;
    width: 100%;
    transition: background 0.2s;
  }}
  .btn:hover {{
    background: #dfc28d;
  }}
  .btn.copied {{
    background: #28a745;
    color: #fff;
  }}
  .alert {{
    max-width: 1300px;
    margin: 0 auto 24px auto;
    background: rgba(201,169,110,0.1);
    border-left: 4px solid #c9a96e;
    padding: 14px 18px;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
  }}
</style>
</head>
<body>

<h1>⚡ Все VPN Подключения и QR-коды</h1>
<div class="subtitle">Отсканируй нужный QR-код камерой приложения или скопируй ключ в 1 клик</div>

<div class="alert">
  💡 <b>Как сканировать:</b><br>
  • <b>AmneziaWG</b> ➔ открой официальное приложение <b>Amnezia VPN</b> ➔ нажми «+» ➔ «Подключиться по QR-коду».<br>
  • <b>Авто-подписка RemnaWave</b> ➔ в <b>Happ</b>, <b>v2raytun</b> или <b>Hiddify</b> нажми «+» ➔ «Сканировать QR». Приложение само загрузит все доступные ноды сервера!<br>
  • <b>Telegram Прокси</b> ➔ наведи обычную камеру смартфона, он сразу предложит открыть Telegram.
</div>

<div class="grid">

  <!-- 1. Auto Sub -->
  <div class="card">
    <div class="badge">Рекомендуется (Авто-обновление)</div>
    <h2>⚡ Авто-подписка RemnaWave</h2>
    <div class="desc">Для Happ, v2raytun, Hiddify, Sing-box. Автоматически загружает и обновляет все протоколы (Direct, WS, XHTTP).</div>
    <div class="qr-box">
      <img src="{qrs['sub_url']}" alt="QR Авто-подписка">
    </div>
    <div class="code-preview">{sub_url}</div>
    <button class="btn" onclick="copyText('{sub_url}', this)">📋 Скопировать ссылку</button>
  </div>

  <!-- 2. VLESS XHTTP Cloudflare -->
  <div class="card">
    <div class="badge">Новейший обход ТСПУ 2026</div>
    <h2>🟧 VLESS XHTTP Cloudflare</h2>
    <div class="desc">Split HTTP через сеть Cloudflare. Защита реального IP сервера + обход блокировок WebSocket на мобильных сетях.</div>
    <div class="qr-box">
      <img src="{qrs['vless_xhttp']}" alt="QR VLESS XHTTP">
    </div>
    <div class="code-preview">{vless_xhttp}</div>
    <button class="btn" onclick="copyText('{vless_xhttp}', this)">📋 Скопировать VLESS XHTTP</button>
  </div>

  <!-- 3. AmneziaWG Android -->
  <div class="card">
    <div class="badge">Amnezia VPN (Роман)</div>
    <h2>📱 AmneziaWG (Android)</h2>
    <div class="desc">Устойчивый к глушилкам протокол с обфускацией пакетов. Уникальный IP 10.8.1.2.</div>
    <div class="qr-box">
      <img src="{qrs['awg_android']}" alt="QR AmneziaWG Android">
    </div>
    <div class="code-preview">{awg_android_conf[:120]}...</div>
    <button class="btn" onclick="copyText(window.rawAwgAndroid, this)">📋 Скопировать конфиг</button>
  </div>

  <!-- 4. AmneziaWG iPhone -->
  <div class="card">
    <div class="badge">Amnezia VPN (Жена)</div>
    <h2>🍏 AmneziaWG (iPhone)</h2>
    <div class="desc">Отдельный защищённый канал для второго устройства. Уникальный IP 10.8.1.3.</div>
    <div class="qr-box">
      <img src="{qrs['awg_iphone']}" alt="QR AmneziaWG iPhone">
    </div>
    <div class="code-preview">{awg_iphone_conf[:120]}...</div>
    <button class="btn" onclick="copyText(window.rawAwgIphone, this)">📋 Скопировать конфиг</button>
  </div>

  <!-- 5. OlcRTC Telemost -->
  <div class="card">
    <div class="badge">Абсолютная маскировка WebRTC</div>
    <h2>📞 OlcRTC Яндекс Телемост</h2>
    <div class="desc">Маскировка под официальную видеоконференцию Яндекс Телемоста (комната 71384762492861). Для приложения Olcbox.</div>
    <div class="qr-box">
      <img src="{qrs['olcrtc_telemost']}" alt="QR OlcRTC Telemost">
    </div>
    <div class="code-preview">{olcrtc_telemost}</div>
    <button class="btn" onclick="copyText('{olcrtc_telemost}', this)">📋 Скопировать OlcRTC ключ</button>
  </div>

  <!-- 6. VLESS WS Direct -->
  <div class="card">
    <div class="badge">Резерв (Прямой порт 443)</div>
    <h2>🛡️ VLESS WS Direct</h2>
    <div class="desc">Классический VLESS WebSocket через прямой порт 443 с TLS 1.3 на shadowlinkapp.online.</div>
    <div class="qr-box">
      <img src="{qrs['vless_ws']}" alt="QR VLESS WS">
    </div>
    <div class="code-preview">{vless_ws_direct}</div>
    <button class="btn" onclick="copyText('{vless_ws_direct}', this)">📋 Скопировать VLESS WS</button>
  </div>

  <!-- 7. Telegram MTProto -->
  <div class="card">
    <div class="badge">1 Клик для Telegram</div>
    <h2>✈️ Telegram MTProto Proxy</h2>
    <div class="desc">Собственный быстрый прокси для Telegram с Fake TLS на proxy.shadowlinkapp.online.</div>
    <div class="qr-box">
      <img src="{qrs['tg_proxy']}" alt="QR Telegram Proxy">
    </div>
    <div class="code-preview">{tg_proxy}</div>
    <button class="btn" onclick="copyText('{tg_proxy}', this)">📋 Скопировать ссылку</button>
  </div>

  <!-- 8. Web Portal -->
  <div class="card">
    <div class="badge">Личный Кабинет</div>
    <h2>🌐 Веб-портал подписки</h2>
    <div class="desc">Страница проверки статуса, остатка трафика и срока действия до 2027 года.</div>
    <div class="qr-box">
      <img src="{qrs['sub_portal']}" alt="QR Web Portal">
    </div>
    <div class="code-preview">{sub_portal}</div>
    <button class="btn" onclick="copyText('{sub_portal}', this)">📋 Скопировать адрес</button>
  </div>

</div>

<script>
window.rawAwgAndroid = `{awg_android_conf}`;
window.rawAwgIphone = `{awg_iphone_conf}`;

function copyText(text, btn) {{
  navigator.clipboard.writeText(text).then(() => {{
    const old = btn.innerText;
    btn.innerText = "✅ Скопировано!";
    btn.classList.add("copied");
    setTimeout(() => {{
      btn.innerText = old;
      btn.classList.remove("copied");
    }}, 2000);
  }}).catch(err => {{
    alert("Скопируйте вручную из поля выше");
  }});
}}
</script>
</body>
</html>
"""

desktop_html_path = r"C:\Users\Furianec\Desktop\QR_VPN_CONNECT.html"
with open(desktop_html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Desktop HTML written to:", desktop_html_path)
