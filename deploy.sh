#!/bin/bash
# Скрипт для деплоя на сервере
echo "🚀 Начинаем деплой..."

# 1. Забираем изменения из гита
echo "📥 Получаем изменения из GitHub..."
git pull origin main

# 2. Обновляем статику в Nginx
echo "📂 Копируем статику в /var/www/taro..."
rsync -av --exclude='.git' --exclude='bot' --exclude='api' --exclude='data' --exclude='venv' --exclude='scripts' --exclude='.agents' ./ /var/www/taro/

# 3. Перезапускаем PM2 процессы
echo "🔄 Перезапускаем taro-bot и taro-api..."
pm2 restart taro-bot
pm2 restart taro-api

echo "✅ Деплой успешно завершен!"
