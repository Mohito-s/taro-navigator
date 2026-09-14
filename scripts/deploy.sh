#!/bin/bash
# Скрипт автоматического обновления TARO на VPS
# Выполняет git pull, синхронизирует статику в /var/www/taro и перезапускает процессы pm2.

set -e

echo "🚀 [1/3] Получение свежего кода из Git..."
git pull --ff-only

echo "📂 [2/3] Синхронизация статики веб-приложения в /var/www/taro..."
rsync -av --delete \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='bot' \
  --exclude='api' \
  --exclude='venv' \
  --exclude='data' \
  --exclude='tools' \
  --exclude='scripts' \
  ./ /var/www/taro/

echo "🔄 [3/3] Перезапуск сервисов в pm2..."
pm2 restart taro-bot taro-api || pm2 restart all

echo "✅ Деплой успешно завершён!"
