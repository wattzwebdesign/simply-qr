# Setup Guide

Complete setup guide for Simply QR development and deployment.

## Quick Start (Development)

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Update .env with your credentials
# - Get Clerk keys from https://dashboard.clerk.com
# - Get Cloudflare credentials from https://dash.cloudflare.com

# 4. Run development server
npm run dev
\`\`\`

Visit http://localhost:3000

## Detailed Setup

### 1. Clerk Authentication Setup

1. Create account at [Clerk](https://clerk.com)
2. Create new application
3. Get your API keys from the dashboard
4. Add to `.env`:
   \`\`\`
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   \`\`\`

### 2. Cloudflare Setup

#### Install Wrangler CLI

\`\`\`bash
npm install -g wrangler
\`\`\`

#### Login to Cloudflare

\`\`\`bash
wrangler login
\`\`\`

#### Create D1 Database

\`\`\`bash
wrangler d1 create simply-qr-db
\`\`\`

Copy the database ID to \`wrangler.toml\`:

\`\`\`toml
[[d1_databases]]
binding = "DB"
database_name = "simply-qr-db"
database_id = "paste-id-here"
\`\`\`

#### Initialize Database Schema

For local development:
\`\`\`bash
wrangler d1 execute simply-qr-db --local --file=./database/schema.sql
\`\`\`

For production:
\`\`\`bash
wrangler d1 execute simply-qr-db --remote --file=./database/schema.sql
\`\`\`

#### Create R2 Bucket

\`\`\`bash
wrangler r2 bucket create simply-qr
\`\`\`

#### Generate R2 API Tokens

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2
3. Click "Manage R2 API Tokens"
4. Create new token with Read & Write permissions
5. Copy Access Key ID and Secret Access Key to `.env`

#### Get Account ID

1. Go to Cloudflare Dashboard
2. Account ID is shown in the sidebar
3. Add to `.env`:
   \`\`\`
   R2_ACCOUNT_ID=your-account-id
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   \`\`\`

### 3. Environment Variables

Complete `.env` file:

\`\`\`env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Cloudflare D1 Database
D1_DATABASE_ID=your-database-id

# Cloudflare R2 Storage
R2_BUCKET_NAME=simply-qr
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_ACCOUNT_ID=your-account-id
R2_PUBLIC_DOMAIN=your-public-domain.r2.dev

# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
\`\`\`

### 4. Development Workflow

#### Start Development Server

\`\`\`bash
npm run dev
\`\`\`

#### Test with Local D1 Database

\`\`\`bash
# Initialize local database
wrangler d1 execute simply-qr-db --local --file=./database/schema.sql

# Run development with local bindings
npm run preview
\`\`\`

#### Database Operations

View local database:
\`\`\`bash
wrangler d1 execute simply-qr-db --local --command="SELECT * FROM qr_codes"
\`\`\`

View production database:
\`\`\`bash
wrangler d1 execute simply-qr-db --remote --command="SELECT * FROM qr_codes"
\`\`\`

### 5. Building for Production

\`\`\`bash
npm run build
\`\`\`

### 6. Testing

Create a test QR code:
1. Sign up at http://localhost:3000
2. Go to Dashboard
3. Click "Create QR Code"
4. Fill in the form and submit
5. Test the short URL
6. Check analytics

## Project Structure

\`\`\`
simply-qr/
├── src/
│   ├── app/                    # Next.js pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   ├── types/                 # TypeScript types
│   └── styles/                # CSS
├── database/
│   └── schema.sql            # Database schema
├── functions/                 # Cloudflare Pages Functions
├── public/                    # Static assets
├── .env                       # Environment variables (local)
├── .env.example              # Environment template
├── wrangler.toml             # Cloudflare config
└── package.json              # Dependencies
\`\`\`

## Common Issues

### Issue: "Database not available"

**Solution**: Make sure you've:
1. Created the D1 database
2. Added the database ID to `wrangler.toml`
3. Run the schema migration

### Issue: R2 upload fails

**Solution**:
1. Verify R2 credentials in `.env`
2. Check bucket exists: `wrangler r2 bucket list`
3. Verify API token permissions

### Issue: Authentication not working

**Solution**:
1. Check Clerk keys are correct
2. Verify redirect URLs in Clerk dashboard match your app
3. Clear browser cookies and try again

## Development Tips

### Hot Reload

Next.js supports hot reload. Changes to code will automatically refresh the browser.

### TypeScript

The project uses TypeScript. Run type checking:
\`\`\`bash
npx tsc --noEmit
\`\`\`

### Linting

\`\`\`bash
npm run lint
\`\`\`

### Database Migrations

When you update the schema:
1. Update `database/schema.sql`
2. Run migration:
   \`\`\`bash
   wrangler d1 execute simply-qr-db --local --file=./database/schema.sql
   \`\`\`

### Debugging

Use browser DevTools for frontend debugging. For API routes, add console.log statements - they'll appear in the terminal.

## Next Steps

After setup:
1. Customize the branding (colors, logo)
2. Add custom domain
3. Set up monitoring
4. Configure backups
5. Add additional features

See `DEPLOYMENT.md` for production deployment instructions.
