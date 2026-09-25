#!/usr/bin/env python3
import subprocess

def run_sql(sql: str) -> str:
    remote_cmd = f'docker exec -i remnawave-db psql -U postgres -d postgres -c "{sql}"'
    res = subprocess.run(
        ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", remote_cmd],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    return res.stdout.strip()

# 1. Update host 1 to Direct port 443 with domain shadowlinkapp.online
sql1 = (
    "UPDATE hosts SET "
    "remark = 'Helsinki Direct (Port 443)', "
    "address = 'shadowlinkapp.online', "
    "port = 443, "
    "path = '/sl-rw', "
    "sni = 'shadowlinkapp.online', "
    "host = 'shadowlinkapp.online', "
    "fingerprint = 'chrome', "
    "security_layer = 'TLS', "
    "is_disabled = false, "
    "view_position = 1 "
    "WHERE uuid = 'e3a4a917-4796-4844-8e89-9cebd1a83cd1';"
)
print("Update 1:", run_sql(sql1))

# 2. Delete any previous test hosts if any, then insert Cloudflare Shield host
run_sql("DELETE FROM hosts WHERE remark LIKE '%Cloudflare Shield%';")

sql2 = (
    "INSERT INTO hosts ("
    "uuid, view_position, remark, address, port, path, sni, host, "
    "fingerprint, is_disabled, security_layer, config_profile_inbound_uuid, "
    "config_profile_uuid, server_description, exclude_from_subscription_types, tags"
    ") VALUES ("
    "gen_random_uuid(), 2, 'Helsinki Cloudflare Shield', 'cdn.shadowlinkapp.online', 443, '/sl-rw', "
    "'cdn.shadowlinkapp.online', 'cdn.shadowlinkapp.online', 'chrome', false, 'TLS', "
    "'8e4f155c-1cb0-4a53-a694-02d281af97c0', '2cbe04c7-6177-41e4-8585-b66aca821181', "
    "'Cloudflare CDN Shield', '{}', '{}'"
    ");"
)
print("Insert 2:", run_sql(sql2))

# 3. Restart subscription page
subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", "docker restart remnawave-subscription-page"],
    capture_output=True,
    text=True
)
print("Subscription page restarted.")
