import subprocess
import time

# Script to run Xray client in background on VPS, test curl through socks port 10855, and stop
test_script = """
xray run -c /tmp/test-xh-client.json > /tmp/xray-client.log 2>&1 &
XRAY_PID=$!
sleep 2
curl -x socks5h://127.0.0.1:10855 -s https://api.ipify.org -m 6 || true
echo ""
kill $XRAY_PID 2>/dev/null || true
cat /tmp/xray-client.log | tail -n 15
"""

cmd = f"docker exec -i remnanode sh -c '{test_script}'"
p = subprocess.run(
    ["ssh", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "-p", "1993", "roman@193.168.198.57", cmd],
    capture_output=True, text=True
)
print("STDOUT:\n", p.stdout)
print("STDERR:\n", p.stderr)
