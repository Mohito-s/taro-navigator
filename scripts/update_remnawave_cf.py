#!/usr/bin/env python3
import subprocess

sql = (
    "UPDATE hosts SET "
    "address = 'cdn.shadowlinkapp.online', "
    "sni = 'cdn.shadowlinkapp.online', "
    "host = 'cdn.shadowlinkapp.online', "
    "remark = 'Helsinki Cloudflare Shield' "
    "WHERE uuid = 'e3a4a917-4796-4844-8e89-9cebd1a83cd1';"
)

remote_cmd = f"docker exec -i remnawave-db psql -U postgres -d postgres -c \"{sql}\""
res = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", remote_cmd],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
