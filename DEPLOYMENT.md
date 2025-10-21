# Deployment Guide

This guide will help you deploy Simply QR to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account ([Sign up here](https://dash.cloudflare.com/sign-up))
2. A Clerk account ([Sign up here](https://clerk.com))
3. Wrangler CLI installed globally: `npm install -g wrangler`
4. Git repository connected to GitHub

## Step-by-Step Deployment

### 1. Set up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your API keys:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)
4. Configure your application URLs in Clerk:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.pages.dev`

### 2. Authenticate with Cloudflare

\`\`\`bash
wrangler login
\`\`\`

This will open a browser window to authenticate.

### 3. Create Cloudflare D1 Database

\`\`\`bash
npm run cf:d1:create
\`\`\`

Copy the database ID from the output. It will look like:
\`\`\`
[[d1_databases]]
binding = "DB"
database_name = "simply-qr-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
\`\`\`

Update the \`database_id\` in \`wrangler.toml\` with this value.

### 4. Run Database Migration

\`\`\`bash
wrangler d1 execute simply-qr-db --file=./database/schema.sql
\`\`\`

For production database:
\`\`\`bash
wrangler d1 execute simply-qr-db --remote --file=./database/schema.sql
\`\`\`

### 5. Create R2 Bucket

\`\`\`bash
npm run cf:r2:create
\`\`\`

Or manually:
\`\`\`bash
wrangler r2 bucket create simply-qr
\`\`\`

### 6. Generate R2 API Tokens

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 > Manage R2 API Tokens
3. Click "Create API Token"
4. Give it a name (e.g., "simply-qr-token")
5. Set permissions to "Object Read & Write"
6. Copy the Access Key ID and Secret Access Key

### 7. Get Your Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select any domain or go to Workers & Pages
3. Your Account ID is shown in the right sidebar

### 8. Configure Environment Variables

Create a \`.env.production\` file or set these in your Cloudflare Pages dashboard:

\`\`\`env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Cloudflare
R2_BUCKET_NAME=simply-qr
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_ACCOUNT_ID=xxxxx
R2_PUBLIC_DOMAIN=pub-xxxxx.r2.dev
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_API_TOKEN=xxxxx

# App
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev
NODE_ENV=production
\`\`\`

### 9. Deploy to Cloudflare Pages

#### Option A: Deploy via Wrangler

\`\`\`bash
npm run build
npm run deploy
\`\`\`

#### Option B: Deploy via GitHub Integration

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: \`npm run pages:build\`
   - **Build output directory**: \`.vercel/output/static\`
   - **Root directory**: \`/\`
5. Add environment variables in the dashboard
6. Click "Save and Deploy"

### 10. Configure Custom Domain (Optional)

1. Go to your Cloudflare Pages project
2. Navigate to "Custom domains"
3. Click "Set up a custom domain"
4. Follow the instructions to add your domain
5. Update your Clerk application URLs with the new domain

### 11. Set up D1 and R2 Bindings in Pages

If you deployed via GitHub, you need to manually configure bindings:

1. Go to your Pages project settings
2. Navigate to "Functions" > "Bindings"
3. Add D1 Database binding:
   - Variable name: \`DB\`
   - D1 database: Select your \`simply-qr-db\`
4. Add R2 Bucket binding:
   - Variable name: \`QR_BUCKET\`
   - R2 bucket: Select your \`simply-qr\` bucket

## Post-Deployment

### Verify Deployment

1. Visit your deployed URL
2. Test sign-up/sign-in functionality
3. Create a test QR code
4. Test the short URL redirect
5. Verify analytics are tracking

### Monitor Application

- Check Cloudflare Pages logs for errors
- Monitor D1 database usage
- Monitor R2 storage usage
- Set up Cloudflare Analytics

## Troubleshooting

### Issue: Database not found

**Solution**: Ensure D1 binding is correctly configured in \`wrangler.toml\` and in your Pages project settings.

### Issue: R2 images not loading

**Solution**:
1. Check R2 bucket permissions
2. Verify R2 binding is correct
3. Ensure API tokens have correct permissions
4. Check if R2 public domain is configured

### Issue: Authentication not working

**Solution**:
1. Verify Clerk API keys are correct
2. Check that redirect URLs are configured in Clerk dashboard
3. Ensure environment variables are set in production

### Issue: Build fails

**Solution**:
1. Check Node.js version (should be 18+)
2. Clear \`.next\` and \`node_modules\` directories
3. Run \`npm install\` again
4. Check for TypeScript errors

## Updating the Application

### Update Code

\`\`\`bash
git pull origin main
npm install
\`\`\`

### Run Database Migrations

If you've updated the schema:

\`\`\`bash
wrangler d1 execute simply-qr-db --remote --file=./database/schema.sql
\`\`\`

### Redeploy

\`\`\`bash
npm run deploy
\`\`\`

Or push to GitHub if using automatic deployments.

## Performance Optimization

### Enable Cloudflare CDN

1. Set up a custom domain
2. Configure caching rules in Cloudflare
3. Enable Auto Minify for JS, CSS, HTML

### Configure Cache Headers

QR code images are already configured with long cache headers:
\`\`\`
Cache-Control: public, max-age=31536000, immutable
\`\`\`

### Use Preview Deployments

Cloudflare Pages creates preview deployments for each branch and PR automatically. Use these to test changes before merging to production.

## Security Best Practices

1. **Never commit secrets**: Always use environment variables
2. **Rotate API keys regularly**: Update Clerk and Cloudflare credentials periodically
3. **Enable rate limiting**: Use Cloudflare rate limiting rules
4. **Monitor logs**: Check for suspicious activity
5. **Keep dependencies updated**: Run \`npm audit\` and \`npm update\` regularly

## Support

For issues specific to:
- **Cloudflare**: [Cloudflare Community](https://community.cloudflare.com/)
- **Clerk**: [Clerk Support](https://clerk.com/support)
- **This Application**: [GitHub Issues](https://github.com/wattzwebdesign/simply-qr/issues)
