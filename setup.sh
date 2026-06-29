#!/bin/bash

echo "🚀 MangaHub - Quick Setup"
echo "========================"

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend
cp .env.example .env
npm install
echo "✅ Backend ready. Edit backend/.env with your DATABASE_URL"

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd ../frontend
cp .env.local.example .env.local
npm install
echo "✅ Frontend ready"

echo ""
echo "🎯 Next steps:"
echo "  1. Edit backend/.env with your PostgreSQL connection string"
echo "  2. Start backend: cd backend && npm run dev"
echo "  3. Start frontend: cd frontend && npm run dev"
echo "  4. Open http://localhost:3000 in your browser"
echo "  5. Go to http://localhost:3000/admin to add manga and upload chapters"
