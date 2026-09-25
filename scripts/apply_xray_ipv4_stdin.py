#!/usr/bin/env python3
import subprocess
import json

# 1. Fetch current config
fetch_proc = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57",
     "docker exec -i remnawave-db psql -U postgres -d postgres -t -A -c \"SELECT config FROM config_profiles WHERE uuid = '2cbe04c7-6177-41e4-8585-b66aca821181';\""],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
raw_config = fetch_proc.stdout.strip()
cfg = json.loads(raw_config)

# 2. Modify config
# Set domainStrategy: UseIPv4 for freedom outbound
for ob in cfg.get("outbounds", []):
    if ob.get("protocol") == "freedom":
        ob["settings"] = {"domainStrategy": "UseIPv4"}

# Set DNS queryStrategy: UseIPv4
cfg["dns"] = {
    "servers": ["77.88.8.8", "1.1.1.1", "8.8.8.8"],
    "queryStrategy": "UseIPv4"
}

# Block raw IPv6 connections
if "routing" not in cfg:
    cfg["routing"] = {"rules": []}

cfg["routing"]["rules"] = [r for r in cfg["routing"].get("rules", []) if "::/0" not in r.get("ip", [])]
cfg["routing"]["rules"].insert(0, {
    "type": "field",
    "ip": ["::/0"],
    "outboundTag": "BLOCK"
})

new_json = json.dumps(cfg)
sql_statement = f"UPDATE config_profiles SET config = '{new_json}' WHERE uuid = '2cbe04c7-6177-41e4-8585-b66aca821181';\n"

# 3. Send SQL via STDIN to psql
update_proc = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57",
     "docker exec -i remnawave-db psql -U postgres -d postgres"],
    input=sql_statement,
    capture_output=True,
    text=True,
    encoding="utf-8"
)
print("STDOUT:", update_proc.stdout.strip())
print("STDERR:", update_proc.stderr.strip())

# 4. Restart backend and node to apply new profile config
print("Restarting remnawave and remnanode...")
subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57",
     "docker restart remnawave remnanode"],
    capture_output=True,
    text=True
)
print("Done!")
