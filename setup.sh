#!/bin/bash

echo "🏋️ Setting up GymTracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️ MongoDB is not detected. Please make sure MongoDB is installed and running."
fi

echo "📦 Installing dependencies..."
npm run install-all

echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

echo "🌱 Seeding database..."
npm run seed

echo "🎉 Setup complete!"
echo "🚀 Run 'npm run dev' to start the application"
echo "📱 Then open http://localhost:3000 in your browser"
