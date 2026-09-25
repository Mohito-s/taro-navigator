import subprocess
import json

cmd = "docker exec -i remnawave-db psql -U postgres -d postgres -t -c \"SELECT row_to_json(c) FROM (SELECT * FROM config_profile_inbounds WHERE tag = 'VLESS_WS_MAIN') c;\""
res = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", cmd],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
print("VLESS_WS_MAIN:\n", json.dumps(json.loads(res.stdout.strip()), indent=2))
