#!/bin/bash

echo "🔧 Installing dependencies..."
npm install --production

echo "🔧 Setting up environment..."
# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5001
DB_HOST=your-rds-endpoint.eu-west-2.rds.amazonaws.com
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=bluefish_sports
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://bluefishsports.com
ENVEOF
    echo "⚠️  Please update the .env file with your actual database credentials"
fi

echo "🔧 Installing PM2 if not installed..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo "🔧 Starting application with PM2..."
pm2 delete bluefish-backend 2>/dev/null || true
pm2 start src/app.js --name "bluefish-backend"
pm2 save
pm2 startup

echo "🔧 Checking application status..."
pm2 status
pm2 logs bluefish-backend --lines 10

echo "✅ Backend deployment completed!"
