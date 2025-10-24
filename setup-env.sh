#!/bin/bash
# Setup script to create backend/.env file

echo "=== Simply QR Environment Setup ==="
echo ""

# Check if backend/.env already exists
if [ -f "backend/.env" ]; then
    echo "⚠️  backend/.env already exists!"
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Generate secure JWT secret
echo "Generating secure JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null)

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  Could not generate JWT_SECRET. Using placeholder."
    JWT_SECRET="CHANGE-THIS-TO-SECURE-SECRET-GENERATED-BY-OPENSSL"
fi

# Database credentials
DB_USER="u167824_bubbling"
DB_PASS="jciCsq8SSFUGS98f"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="s167824_bubbling"

# Create .env file
cat > backend/.env << EOF
# Database Configuration (MySQL)
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# JWT Secret for token signing
JWT_SECRET="${JWT_SECRET}"

# Server Configuration
PORT=3000
NODE_ENV=production
EOF

echo ""
echo "✅ Created backend/.env file"
echo ""
echo "Database URL: mysql://${DB_USER}:****@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "JWT Secret: ${JWT_SECRET:0:20}... (32 character secret)"
echo ""
echo "⚠️  IMPORTANT: Keep this .env file secure and never commit it to Git!"
echo ""
echo "Next steps:"
echo "  1. Review backend/.env to ensure settings are correct"
echo "  2. Run: bash .xcloud-deploy.sh"
echo "  3. Or for local dev: cd backend && npm install && npx prisma generate && npm run dev"
echo ""
