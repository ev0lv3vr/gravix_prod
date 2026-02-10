#!/bin/bash

# Gravix API Quick Start Script

set -e

echo "🚀 Starting Gravix API..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if [ ! -f "venv/.installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "🔧 Please edit .env with your credentials before running."
    exit 1
fi

# Run the application
echo "✅ Starting FastAPI server..."
echo "📚 API docs will be available at: http://localhost:8000/docs"
echo "💚 Health check at: http://localhost:8000/health"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
