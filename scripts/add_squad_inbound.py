import subprocess

sql = "INSERT INTO internal_squad_inbounds (internal_squad_uuid, inbound_uuid) VALUES ('0f4867ee-5d59-4e17-adf1-7293b0c377fb', 'c5b2e987-3456-4789-9abc-0123456789ab') ON CONFLICT DO NOTHING;"
cmd = f'docker exec -i remnawave-db psql -U postgres -d postgres -c "{sql}"'
res = subprocess.run(
    ["ssh", "-p", "1993", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "roman@193.168.198.57", cmd],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
print("Output:", res.stdout)
print("Error:", res.stderr)
