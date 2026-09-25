#!/usr/bin/env python3
import subprocess
import json

def run_sql(sql: str) -> str:
    remote_cmd = f'docker exec -i remnawave-db psql -U postgres -d postgres -t -c "{sql}"'
    res = subprocess.run(
        ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", remote_cmd],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    return res.stdout.strip()

# Fetch active profile
raw = run_sql("SELECT config FROM config_profiles WHERE uuid = '2cbe04c7-6177-41e4-8585-b66aca821181';")
cfg = json.loads(raw)

# 1. Configure freedom outbound with domainStrategy: UseIPv4
for ob in cfg.get("outbounds", []):
    if ob.get("protocol") == "freedom":
        ob["settings"] = {"domainStrategy": "UseIPv4"}

# 2. Add DNS queryStrategy: UseIPv4
cfg["dns"] = {
    "servers": ["77.88.8.8", "1.1.1.1", "8.8.8.8"],
    "queryStrategy": "UseIPv4"
}

# 3. Add routing rule to block raw IPv6
if "routing" not in cfg:
    cfg["routing"] = {"rules": []}

# Check if block rule exists
has_ipv6_rule = False
for r in cfg["routing"].get("rules", []):
    if "::/0" in r.get("ip", []):
        has_ipv6_rule = True
        break

if not has_ipv6_rule:
    cfg["routing"]["rules"].insert(0, {
        "type": "field",
        "ip": ["::/0"],
        "outboundTag": "BLOCK"
    })

new_json_str = json.dumps(cfg).replace("'", "''")
update_sql = f"UPDATE config_profiles SET config = '{new_json_str}' WHERE uuid = '2cbe04c7-6177-41e4-8585-b66aca821181';"
res_up = run_sql(update_sql)
print("Config profile update:", res_up)

# Restart remnanode
subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", "docker restart remnanode"],
    capture_output=True,
    text=True
)
print("remnanode restarted.")
