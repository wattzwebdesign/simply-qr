# Cloudflare Pages Environment Variables Setup

## Quick Setup Instructions

You need to add these environment variables to your Cloudflare Pages project **before the build can succeed**.

### How to Add Environment Variables:

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com)**
2. Navigate to **Workers & Pages**
3. Click on **"simply-qr"** project
4. Click **Settings** tab
5. Scroll to **Environment variables** section
6. Click **"Add variable"** for each of the following:

### Required Environment Variables:

#### For Production Environment:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_Y2xlcmsuc2ltcGx5cXIuaW8k
```

```
CLERK_SECRET_KEY = sk_live_s6Y3jkKWsb3XcBoEMvUjRdOUYLQS3tWcxwwwkZMCD3
```

```
NEXT_PUBLIC_APP_URL = https://simply-qr.pages.dev
```

```
NODE_ENV = production
```

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
```

```
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
```

```
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
```

```
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
```

### Steps to Add Each Variable:

1. Click **"Add variable"**
2. Select **"Production"** environment
3. Enter the **Variable name** (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
4. Enter the **Value** (copy from above)
5. Click **"Save"**
6. Repeat for all variables

### After Adding Variables:

1. Click **"Save and deploy"** or go to **Deployments**
2. Click **"Retry deployment"** on the latest failed build
3. The build should now succeed!

---

## What These Variables Do:

- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Public key for Clerk authentication (client-side)
- **CLERK_SECRET_KEY**: Secret key for Clerk authentication (server-side)
- **NEXT_PUBLIC_APP_URL**: Your application's URL
- **NODE_ENV**: Sets environment to production
- **Clerk redirect URLs**: Configure sign-in/up flows

## Troubleshooting:

If the build still fails after adding variables:
1. Make sure all variables are set for **Production** environment
2. Verify no typos in variable names (they're case-sensitive)
3. Check that values don't have extra quotes or spaces
4. Try **"Retry deployment"** again

## Next Steps After Successful Build:

Once the build succeeds, you still need to add **Bindings**:

### D1 Database Binding:
- Go to **Settings > Functions > D1 database bindings**
- Click **"Add binding"**
- Variable name: `DB`
- D1 database: `simply-qr-db`
- Click **"Save"**

### R2 Bucket Binding:
- Go to **Settings > Functions > R2 bucket bindings**
- Click **"Add binding"**
- Variable name: `QR_BUCKET`
- R2 bucket: `simply-qr`
- Click **"Save"**

After adding bindings, the site will automatically redeploy and be fully functional!
