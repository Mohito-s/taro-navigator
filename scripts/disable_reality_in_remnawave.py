#!/usr/bin/env python3
import subprocess

# 1. Disable the failing/monitored REALITY host in Remnawave
sql = "UPDATE hosts SET is_disabled = true WHERE uuid = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';"
remote_cmd = f'docker exec -i remnawave-db psql -U postgres -d postgres -c "{sql}"'
res = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", remote_cmd],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
print("Remnawave disable REALITY:", res.stdout.strip())

# 2. Restart Remnawave backend & subscription page
subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", "docker restart remnawave remnawave-subscription-page"],
    capture_output=True,
    text=True
)
print("Remnawave containers restarted.")
