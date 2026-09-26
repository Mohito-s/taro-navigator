import subprocess

sql = """
INSERT INTO hosts (
    uuid, view_position, remark, address, port, path, sni, host,
    fingerprint, is_disabled, security_layer, config_profile_inbound_uuid,
    config_profile_uuid, server_description, exclude_from_subscription_types, tags
) VALUES (
    'b72b8344-9876-4abc-def0-123456789abc', 3, 'Helsinki Cloudflare WS Shield', 'cdn.shadowlinkapp.online', 443, '/sl-rw',
    'cdn.shadowlinkapp.online', 'cdn.shadowlinkapp.online', 'chrome', false, 'TLS',
    '8e4f155c-1cb0-4a53-a694-02d281af97c0', '2cbe04c7-6177-41e4-8585-b66aca821181', 'Cloudflare WS Shield', '{}', '{}'
) ON CONFLICT (uuid) DO NOTHING;

INSERT INTO hosts_to_nodes (host_uuid, node_uuid)
VALUES ('b72b8344-9876-4abc-def0-123456789abc', 'd4a4045b-8a0b-4064-8cc4-372a9f02c8f1')
ON CONFLICT DO NOTHING;
"""

p = subprocess.Popen(
    ["ssh", "-p", "1993", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "roman@193.168.198.57", "docker exec -i remnawave-db psql -U postgres -d postgres"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    encoding="utf-8"
)
out, err = p.communicate(input=sql)
print("Output:", out)
print("Error:", err)
