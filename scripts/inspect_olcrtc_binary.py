import subprocess

remote_cmd = """python3 -c "
import subprocess
s = subprocess.check_output(['strings', '/opt/olcrtc/olcrtc']).decode('utf-8', 'ignore')
lines = [l for l in s.splitlines() if any(k in l.lower() for k in ['v2/client', 'v2/server', 'olc2', 'recordmagic', 'newcipher', 'keysize'])]
print('\\n'.join(lines))
" """

res = subprocess.run(
    ["ssh", "-p", "1993", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "roman@193.168.198.57", remote_cmd],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
print("Output:\n", res.stdout)
