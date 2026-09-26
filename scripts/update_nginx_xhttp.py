import subprocess

new_nginx = """# ==============================================================================
# 1. Main Tarot WebApp & VLESS Endpoints (shadowlinkapp.online)
# ==============================================================================
server {
    server_name shadowlinkapp.online www.shadowlinkapp.online cdn.shadowlinkapp.online;

    root /var/www/taro;

    # RemnaWave VLESS-XHTTP Endpoint (Anti-censorship Cloudflare CDN)
    location /sl-xh {
        proxy_pass http://127.0.0.1:10111;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        keepalive_timeout 86400s;
        client_max_body_size 0;
    }

    # RemnaWave VLESS-WS Endpoint
    location /sl-rw {
        proxy_pass http://127.0.0.1:10110;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        keepalive_timeout 86400s;
    }

    # High-Performance Static Delivery (Direct from disk, bypassing Python)
    location /css/ {
        alias /var/www/taro/css/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    location /js/ {
        alias /var/www/taro/js/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    location /img/ {
        alias /var/www/taro/img/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    location /books/ {
        alias /var/www/taro/books/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Taro FastAPI WebApp Backend & Pages
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen [::]:443 ssl http2;
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/shadowlinkapp.online-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shadowlinkapp.online-0001/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# ==============================================================================
# 2. RemnaWave Admin Panel (panel.shadowlinkapp.online)
# ==============================================================================
server {
    server_name panel.shadowlinkapp.online;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    listen [::]:443 ssl http2;
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/shadowlinkapp.online-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shadowlinkapp.online-0001/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# ==============================================================================
# 3. RemnaWave Subscription Page (sub.shadowlinkapp.online)
# ==============================================================================
server {
    server_name sub.shadowlinkapp.online;

    # Admin Login redirect if user accesses /auth/login on sub domain
    location = /auth/login {
        return 301 https://panel.shadowlinkapp.online/auth/login;
    }

    location / {
        # Seamlessly rewrite short slugs (e.g. /sMtET-VfUXYEdRTF) to /api/sub/$1
        rewrite "^/([a-zA-Z0-9_-]{10,})$" /api/sub/$1 break;

        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        proxy_request_buffering off;
    }

    listen [::]:443 ssl http2;
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/shadowlinkapp.online-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shadowlinkapp.online-0001/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# ==============================================================================
# HTTP -> HTTPS Redirect
# ==============================================================================
server {
    listen 80;
    listen [::]:80;
    server_name shadowlinkapp.online www.shadowlinkapp.online panel.shadowlinkapp.online sub.shadowlinkapp.online cdn.shadowlinkapp.online;
    return 301 https://$host$request_uri;
}
"""

p = subprocess.Popen(
    ["ssh", "-p", "1993", "-i", r"C:\Users\Furianec\.ssh\id_ed25519", "roman@193.168.198.57", "sudo tee /etc/nginx/sites-available/shadowlinkapp.online > /dev/null && sudo nginx -t && sudo systemctl reload nginx"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    encoding="utf-8"
)
out, err = p.communicate(input=new_nginx)
print("Output:", out)
print("Error:", err)
