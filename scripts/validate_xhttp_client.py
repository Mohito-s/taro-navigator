import subprocess
import json

client_cfg = {
    "log": {"loglevel": "warning"},
    "inbounds": [{"tag": "socks-in", "port": 10855, "listen": "127.0.0.1", "protocol": "socks"}],
    "outbounds": [
        {
            "protocol": "vless",
            "tag": "vless-out",
            "settings": {
                "vnext": [{
                    "address": "cdn.shadowlinkapp.online",
                    "port": 443,
                    "users": [{"id": "6993ed34-beba-4d5a-a9a5-f1b43874a743", "encryption": "none"}]
                }]
            },
            "streamSettings": {
                "network": "xhttp",
                "security": "tls",
                "tlsSettings": {"serverName": "cdn.shadowlinkapp.online"},
                "xhttpSettings": {"path": "/sl-xh", "mode": "auto"}
            }
        }
    ]
}

payload = json.dumps(client_cfg)
cmd = "docker exec -i remnanode sh -c 'cat > /tmp/test-xh-client.json && xray run -test -c /tmp/test-xh-client.json'"
p = subprocess.Popen(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", cmd],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
)
out, err = p.communicate(input=payload)
print("OUT:", out)
print("ERR:", err)
