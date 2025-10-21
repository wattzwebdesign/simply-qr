# Getting Started with Simply QR

Quick start guide to get Simply QR running in minutes.

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- A Cloudflare account ([Sign up](https://dash.cloudflare.com/sign-up))
- A Clerk account ([Sign up](https://clerk.com))

## 5-Minute Setup

### Step 1: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 2: Set Up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Create Application"
3. Choose "Next.js" as framework
4. Copy your keys

### Step 3: Configure Environment

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your Clerk keys:

\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
\`\`\`

### Step 4: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) 🎉

## What You Can Do Now

### Without Cloudflare Setup
- ✅ View the landing page
- ✅ Sign up / Sign in
- ✅ Browse the UI
- ❌ Create QR codes (requires D1/R2)
- ❌ View analytics (requires D1)

### To Enable Full Features

You need to set up Cloudflare D1 and R2. See below.

## Full Cloudflare Setup (10 minutes)

### Step 1: Install Wrangler

\`\`\`bash
npm install -g wrangler
wrangler login
\`\`\`

### Step 2: Create D1 Database

\`\`\`bash
wrangler d1 create simply-qr-db
\`\`\`

Copy the output and update `wrangler.toml`:

\`\`\`toml
[[d1_databases]]
binding = "DB"
database_name = "simply-qr-db"
database_id = "paste-your-id-here"  # ← Update this
\`\`\`

### Step 3: Initialize Database

\`\`\`bash
wrangler d1 execute simply-qr-db --local --file=./database/schema.sql
\`\`\`

### Step 4: Create R2 Bucket

\`\`\`bash
wrangler r2 bucket create simply-qr
\`\`\`

### Step 5: Get R2 Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on R2
3. Click "Manage R2 API Tokens"
4. Create token with "Object Read & Write" permissions
5. Copy the credentials

### Step 6: Get Account ID

In Cloudflare Dashboard, your Account ID is shown in the sidebar.

### Step 7: Update .env

Add to your `.env`:

\`\`\`env
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_ACCOUNT_ID=your-account-id
R2_BUCKET_NAME=simply-qr
CLOUDFLARE_ACCOUNT_ID=your-account-id
\`\`\`

### Step 8: Test with Local Preview

\`\`\`bash
npm run preview
\`\`\`

Now you have full functionality! 🚀

## First QR Code

1. Sign up at http://localhost:3000
2. Click "Create QR Code"
3. Fill in:
   - **Name**: "My First QR"
   - **URL**: "https://example.com"
4. Click "Create QR Code"
5. Copy the short URL
6. Test it!

## Common First-Time Issues

### "Database not available"

**Fix**: Make sure you:
1. Created the D1 database
2. Added the database ID to `wrangler.toml`
3. Ran the schema migration

\`\`\`bash
wrangler d1 execute simply-qr-db --local --file=./database/schema.sql
\`\`\`

### "Failed to upload to R2"

**Fix**: Check your `.env` has:
- Correct R2 credentials
- Correct account ID
- Bucket name matches what you created

### Clerk Redirect Issues

**Fix**: In Clerk dashboard, add to allowed URLs:
- `http://localhost:3000`
- `http://localhost:3000/*`

## Project Structure at a Glance

\`\`\`
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Main app
│   └── api/                  # Backend
├── components/               # UI components
└── lib/                      # Services (DB, QR, R2)
\`\`\`

## Development Workflow

### Daily Development

\`\`\`bash
npm run dev
\`\`\`

### Make Changes

1. Edit files in `src/`
2. Browser auto-refreshes
3. Check terminal for errors

### Check Database

\`\`\`bash
wrangler d1 execute simply-qr-db --local --command="SELECT * FROM qr_codes"
\`\`\`

## Next Steps

### For Development
- [ ] Read [SETUP.md](./SETUP.md) for detailed setup
- [ ] Customize colors in `tailwind.config.js`
- [ ] Add your logo to the nav bar
- [ ] Explore the code structure

### For Production
- [ ] Read [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Set up custom domain
- [ ] Configure production database
- [ ] Deploy to Cloudflare Pages

## Quick Links

- 📚 [Full Documentation](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 🔧 [Setup Guide](./SETUP.md)
- 📊 [Project Summary](./PROJECT_SUMMARY.md)

## Getting Help

### Stuck?

1. Check the error message in terminal
2. Look in [SETUP.md](./SETUP.md) for common issues
3. Search [GitHub Issues](https://github.com/wattzwebdesign/simply-qr/issues)
4. Create a new issue with details

### Resources

- [Cloudflare Docs](https://developers.cloudflare.com)
- [Clerk Docs](https://clerk.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## What's Included?

✅ Complete QR code generator with customization
✅ User authentication (Clerk)
✅ Analytics dashboard with charts
✅ Short URL system
✅ Cloudflare D1 database integration
✅ Cloudflare R2 storage integration
✅ Responsive design
✅ TypeScript
✅ Tailwind CSS

## Quick Commands

\`\`\`bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Test with Cloudflare bindings
npm run deploy       # Deploy to Cloudflare
\`\`\`

## Tips for Success

1. **Start Simple**: Get basic setup working first
2. **Test Often**: Use the preview feature to test
3. **Read Errors**: Terminal errors are usually helpful
4. **Use TypeScript**: It'll catch bugs before runtime
5. **Check Docs**: Cloudflare and Clerk have great docs

## Ready to Build?

You're all set! Start by running:

\`\`\`bash
npm run dev
\`\`\`

And visit http://localhost:3000

Happy coding! 🎉
