import subprocess
import json
import uuid

# We will:
# 1. Add inbound VLESS_XHTTP to config_profiles.config (port 10111, network xhttp, path /sl-xh)
# 2. Add row to config_profile_inbounds
# 3. Add mapping to config_profile_inbounds_to_nodes
# 4. Add/update host in hosts table (network=xhttp, path=/sl-xh)

inbound_uuid = "c5b2e987-3456-4789-9abc-0123456789ab"
profile_uuid = "2cbe04c7-6177-41e4-8585-b66aca821181"
node_uuid = "d4a4045b-8a0b-4064-8cc4-372a9f02c8f1"

# Check current config_profiles.config
cmd = f"docker exec -i remnawave-db psql -U postgres -d postgres -t -c \"SELECT config FROM config_profiles WHERE uuid = '{profile_uuid}';\""
res = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", cmd],
    capture_output=True, text=True, encoding="utf-8"
)
config = json.loads(res.stdout.strip())

# Check if VLESS_XHTTP already exists in inbounds
existing_tags = [ib.get("tag") for ib in config.get("inbounds", [])]
print("Existing tags:", existing_tags)

xhttp_inbound = {
    "tag": "VLESS_XHTTP",
    "port": 10111,
    "listen": "127.0.0.1",
    "protocol": "vless",
    "settings": {
        "clients": [],
        "decryption": "none"
    },
    "sniffing": {
        "enabled": True,
        "destOverride": ["http", "tls", "quic"]
    },
    "streamSettings": {
        "network": "xhttp",
        "xhttpSettings": {
            "path": "/sl-xh",
            "mode": "auto"
        }
    }
}

if "VLESS_XHTTP" not in existing_tags:
    config["inbounds"].append(xhttp_inbound)

# Also ensure routing has VLESS_XHTTP routing to DIRECT if needed
# Check routing
new_config_json = json.dumps(config)

# Update config_profiles
sql_update_profile = f"UPDATE config_profiles SET config = '{new_config_json}'::jsonb WHERE uuid = '{profile_uuid}';"

# Insert or update config_profile_inbounds
raw_inbound_json = json.dumps(xhttp_inbound)
sql_inbound = f"""
INSERT INTO config_profile_inbounds (uuid, profile_uuid, tag, type, network, security, port, raw_inbound)
VALUES ('{inbound_uuid}', '{profile_uuid}', 'VLESS_XHTTP', 'vless', 'xhttp', null, 10111, '{raw_inbound_json}'::jsonb)
ON CONFLICT (tag) DO UPDATE SET raw_inbound = EXCLUDED.raw_inbound, network = 'xhttp', port = 10111;
"""

# Link to node
sql_link_node = f"""
INSERT INTO config_profile_inbounds_to_nodes (config_profile_inbound_uuid, node_uuid)
VALUES ('{inbound_uuid}', '{node_uuid}')
ON CONFLICT DO NOTHING;
"""

# Link hosts_to_nodes for Cloudflare Shield host
sql_link_host = f"""
INSERT INTO hosts_to_nodes (host_uuid, node_uuid)
VALUES ('4964d833-11ec-47cb-aab9-534810b563bb', '{node_uuid}')
ON CONFLICT DO NOTHING;
"""

# Update host 4964d833-11ec-47cb-aab9-534810b563bb to point to VLESS_XHTTP inbound!
sql_update_host = f"""
UPDATE hosts SET
    remark = 'Helsinki Cloudflare XHTTP Shield',
    address = 'cdn.shadowlinkapp.online',
    port = 443,
    path = '/sl-xh',
    sni = 'cdn.shadowlinkapp.online',
    host = 'cdn.shadowlinkapp.online',
    fingerprint = 'chrome',
    security_layer = 'TLS',
    config_profile_inbound_uuid = '{inbound_uuid}',
    xhttp_extra_params = '{{"mode": "auto"}}'::jsonb,
    is_disabled = false
WHERE uuid = '4964d833-11ec-47cb-aab9-534810b563bb';
"""

full_sql = f"{sql_update_profile}\n{sql_inbound}\n{sql_link_node}\n{sql_link_host}\n{sql_update_host}"

p = subprocess.Popen(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", "docker exec -i remnawave-db psql -U postgres -d postgres"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
)
out, err = p.communicate(input=full_sql)
print("SQL OUT:", out)
print("SQL ERR:", err)
