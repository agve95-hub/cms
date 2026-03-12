#!/bin/bash
set -e

echo "========================================="
echo "  CMS Setup Script"
echo "========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js 18+ required. You have $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Create required directories
mkdir -p data uploads backups content/pages content/posts content/menus content/settings
echo "✓ Directories created"

# Check if .env exists
if [ ! -f .env ]; then
    cp .env.example .env
    # Generate secrets
    SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    CSRF=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

    # Replace placeholder in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/generate-with-node.*/$SECRET/" .env
    else
        sed -i "s/generate-with-node.*/$SECRET/" .env
    fi

    echo "✓ .env created with generated secrets"
    echo "  IMPORTANT: Edit .env to set your NEXTAUTH_URL and other settings"
else
    echo "✓ .env already exists"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install --legacy-peer-deps
echo "✓ Dependencies installed"

# Initialize database
echo ""
echo "Initializing database..."
npx drizzle-kit push
echo "✓ Database initialized"

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "  Start dev server:  npm run dev"
echo "  Build production:  npm run build"
echo "  Start production:  npm start"
echo ""
echo "  Visit: http://localhost:3000/admin"
echo "========================================="
