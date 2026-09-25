import subprocess
import json

cfg = {
    "log": {"loglevel": "warning"},
    "inbounds": [{
        "tag": "VLESS_XHTTP",
        "port": 10111,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {"clients": [{"id": "6993ed34-beba-4d5a-a9a5-f1b43874a743"}], "decryption": "none"},
        "streamSettings": {"network": "xhttp", "xhttpSettings": {"path": "/sl-xh", "mode": "auto"}}
    }],
    "outbounds": [{"protocol": "freedom", "tag": "direct"}]
}
payload = json.dumps(cfg)
cmd = "docker exec -i remnanode sh -c 'cat > /tmp/test-xh.json && xray run -test -c /tmp/test-xh.json'"
p = subprocess.Popen(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", cmd],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)
out, err = p.communicate(input=payload)
print("OUT:", out)
print("ERR:", err)
