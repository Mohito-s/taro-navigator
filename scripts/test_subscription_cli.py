#!/usr/bin/env python3
"""
TARO & SHADOWLINK - Autonomous VPN & Proxy Subscription Tester
Uses local nekobox_core.exe to test connections on an isolated local port (20808)
WITHOUT touching Windows system proxy, adapters, or DNS.
"""

import base64
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DEFAULT_SUB_URL = "https://sub.shadowlinkapp.online/sMtET-VfUXYEdRTF"
CORE_PATH = r"C:\Users\Furianec\AppData\Local\Microsoft\WinGet\Packages\MatsuriDayo.NekoRay_Microsoft.Winget.Source_8wekyb3d8bbwe\nekoray\nekobox_core.exe"
TEST_PORT = 20808


def fetch_subscription(url: str) -> list[str]:
    print(f"[*] Fetching subscription from: {url}")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "v2rayNG/1.8.12", "Host": "sub.shadowlinkapp.online"},
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw_b64 = resp.read().decode("utf-8").strip()

    decoded = base64.b64decode(raw_b64).decode("utf-8", errors="replace")
    links = [line.strip() for line in decoded.splitlines() if line.strip()]
    return links


def parse_vless_link(link: str) -> dict | None:
    if not link.startswith("vless://"):
        return None

    # Format: vless://uuid@host:port?params#name
    m = re.match(r"^vless://([^@]+)@([^:]+):(\d+)\?(.*?)#(.*)$", link)
    if not m:
        return None

    uuid, host, port, query_str, name = m.groups()
    params = urllib.parse.parse_qs(query_str)
    get_p = lambda k, d="": params.get(k, [d])[0]

    outbound = {
        "type": "vless",
        "tag": "vless-out",
        "server": host,
        "server_port": int(port),
        "uuid": uuid,
    }

    flow = get_p("flow")
    if flow:
        outbound["flow"] = flow

    sec = get_p("security")
    net_type = get_p("type", "tcp")

    if net_type == "ws":
        outbound["transport"] = {
            "type": "ws",
            "path": get_p("path", "/"),
            "headers": {"Host": get_p("host", host)},
        }

    if sec == "reality":
        outbound["tls"] = {
            "enabled": True,
            "server_name": get_p("sni", host),
            "utls": {"enabled": True, "fingerprint": get_p("fp", "chrome")},
            "reality": {
                "enabled": True,
                "public_key": get_p("pbk"),
                "short_id": get_p("sid"),
            },
        }
    elif sec == "tls":
        outbound["tls"] = {
            "enabled": True,
            "server_name": get_p("sni", host),
            "utls": {"enabled": True, "fingerprint": get_p("fp", "chrome")},
        }

    return {"name": urllib.parse.unquote(name), "outbound": outbound}


def test_outbound(name: str, outbound: dict) -> tuple[bool, str, float]:
    config = {
        "log": {"level": "warn"},
        "inbounds": [
            {
                "type": "mixed",
                "tag": "mixed-in",
                "listen": "127.0.0.1",
                "listen_port": TEST_PORT,
            }
        ],
        "outbounds": [
            outbound,
            {"type": "direct", "tag": "direct"}
        ],
    }

    temp_cfg = os.path.abspath(f"temp_test_{int(time.time()*1000)}.json")
    with open(temp_cfg, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

    proc = subprocess.Popen(
        [CORE_PATH, "run", "-c", temp_cfg],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    time.sleep(1.5)

    proxy_handler = urllib.request.ProxyHandler(
        {
            "http": f"http://127.0.0.1:{TEST_PORT}",
            "https": f"http://127.0.0.1:{TEST_PORT}",
        }
    )
    opener = urllib.request.build_opener(proxy_handler)

    success = False
    result_text = ""
    elapsed = 0.0

    start = time.time()
    try:
        req = urllib.request.Request(
            "https://api.ipify.org", headers={"User-Agent": "curl/8.0"}
        )
        with opener.open(req, timeout=8) as resp:
            elapsed = time.time() - start
            result_text = resp.read().decode("utf-8").strip()
            success = True
    except Exception as e:
        elapsed = time.time() - start
        result_text = str(e)
    finally:
        proc.terminate()
        try:
            proc.communicate(timeout=2)
        except Exception:
            proc.kill()
        if os.path.exists(temp_cfg):
            os.remove(temp_cfg)

    return success, result_text, elapsed


def main():
    sub_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SUB_URL
    links = fetch_subscription(sub_url)
    print(f"[+] Loaded {len(links)} links from subscription.\n")

    print(
        f"{'#':<3} | {'Status':<7} | {'Latency':<8} | {'Exit IP / Detail':<22} | {'Name'}"
    )
    print("-" * 75)

    for idx, link in enumerate(links, start=1):
        parsed = parse_vless_link(link)
        if not parsed:
            print(f"{idx:<3} | SKIP    | -        | Non-VLESS link         | {link[:30]}...")
            continue

        name = parsed["name"]
        ok, detail, latency = test_outbound(name, parsed["outbound"])

        status_str = "[OK]  " if ok else "[FAIL]"
        lat_str = f"{latency*1000:.0f} ms"
        print(f"{idx:<3} | {status_str} | {lat_str:<8} | {detail:<22} | {name}")


if __name__ == "__main__":
    main()
