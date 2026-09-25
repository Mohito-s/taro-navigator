#!/usr/bin/env python3
import subprocess

remote_cmd = 'docker exec -i remnawave-db psql -U postgres -d postgres -c "SELECT config FROM config_profiles WHERE uuid = \'2cbe04c7-6177-41e4-8585-b66aca821181\';"'
res = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", remote_cmd],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
print("Config output:\n", res.stdout[:500])
print("Contains UseIPv4:", "UseIPv4" in res.stdout)
