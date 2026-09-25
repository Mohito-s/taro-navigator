import json
import os
import subprocess
import sys
import time
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

CORE_PATH = r"C:\Users\Furianec\AppData\Local\Microsoft\WinGet\Packages\MatsuriDayo.NekoRay_Microsoft.Winget.Source_8wekyb3d8bbwe\nekoray\nekobox_core.exe"
TEST_PORT = 20809

for transport_type in ["xhttp", "splithttp", "http"]:
    config = {
        "log": {"level": "info"},
        "inbounds": [{
            "type": "mixed",
            "tag": "mixed-in",
            "listen": "127.0.0.1",
            "listen_port": TEST_PORT
        }],
        "outbounds": [{
            "type": "vless",
            "tag": "vless-out",
            "server": "cdn.shadowlinkapp.online",
            "server_port": 443,
            "uuid": "6993ed34-beba-4d5a-a9a5-f1b43874a743",
            "transport": {
                "type": transport_type,
                "path": "/sl-xh",
                "headers": {"Host": "cdn.shadowlinkapp.online"}
            },
            "tls": {
                "enabled": True,
                "server_name": "cdn.shadowlinkapp.online",
                "utls": {"enabled": True, "fingerprint": "chrome"}
            }
        }, {"type": "direct", "tag": "direct"}]
    }
    temp_cfg = f"temp_test_{transport_type}.json"
    with open(temp_cfg, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

    proc = subprocess.Popen([CORE_PATH, "run", "-c", temp_cfg], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    time.sleep(1.5)
    
    proxy_handler = urllib.request.ProxyHandler({
        "http": f"http://127.0.0.1:{TEST_PORT}",
        "https": f"http://127.0.0.1:{TEST_PORT}"
    })
    opener = urllib.request.build_opener(proxy_handler)
    
    success = False
    result = ""
    try:
        req = urllib.request.Request("https://api.ipify.org", headers={"User-Agent": "curl/8.0"})
        with opener.open(req, timeout=5) as r:
            result = r.read().decode("utf-8").strip()
            success = True
    except Exception as e:
        result = str(e)
    finally:
        proc.kill()
        proc.wait()
        if os.path.exists(temp_cfg):
            os.remove(temp_cfg)

    print(f"Transport: {transport_type:<10} -> Success={success}, Result={result}")
