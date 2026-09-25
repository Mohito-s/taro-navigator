import paramiko
import time

k = paramiko.Ed25519Key.from_private_key_file(r"C:\Users\Furianec\.ssh\id_ed25519")
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("193.168.198.57", port=1993, username="roman", pkey=k)

telemost_cfg = """mode: srv
auth:
  provider: telemost
room:
  id: "71384762492861"
crypto:
  key: "6797073265d03feb0f454e238c78d01aa52c48534c1772c44493bd718fb62be1"
net:
  transport: vp8channel
  dns: "8.8.8.8:53"
vp8:
  fps: 60
  batch_size: 64
liveness:
  interval: 10s
  timeout: 5s
  failures: 3
data: data
debug: false
"""

sftp = c.open_sftp()
with sftp.file("/tmp/server-telemost.yaml", "w") as f:
    f.write(telemost_cfg)
sftp.close()

cmd = (
    "echo 'r0m4n_s3cur3_p4ss' | sudo -S cp /tmp/server-telemost.yaml /opt/olcrtc/server-telemost.yaml && "
    "echo 'r0m4n_s3cur3_p4ss' | sudo -S systemctl restart olcrtc-telemost.service"
)
_, out, err = c.exec_command(cmd)
print("Restart out:", out.read().decode())
print("Restart err:", err.read().decode())

time.sleep(3)
_, out, _ = c.exec_command("echo 'r0m4n_s3cur3_p4ss' | sudo -S journalctl -u olcrtc-telemost.service -n 15 --no-pager")
print("Logs:\n", out.read().decode())

c.close()
