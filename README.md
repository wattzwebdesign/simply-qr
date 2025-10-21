# Simply QR - QR Code Management Platform

A complete QR code management and analytics platform built with Next.js, deployed on Cloudflare Pages with D1 database and R2 storage.

## Features

- **QR Code Generation**: Create customizable QR codes with logos, colors, and error correction levels
- **Analytics Dashboard**: Track scans with detailed analytics including location, device type, and time-based metrics
- **User Authentication**: Secure authentication powered by Clerk
- **Cloud Storage**: QR codes stored in Cloudflare R2 buckets
- **Database**: User data, QR codes, and analytics stored in Cloudflare D1 (SQLite)
- **Scan Tracking**: Automatic tracking of scans with geolocation and device detection
- **Organization**: Organize QR codes with folders and tags
- **Short URLs**: Clean, short URLs for easy sharing

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Hosting**: Cloudflare Pages
- **Analytics**: Recharts for data visualization
- **QR Generation**: qrcode + sharp for image processing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Cloudflare account
- Clerk account

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/wattzwebdesign/simply-qr.git
cd simply-qr
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

Copy \`.env.example\` to \`.env\` and fill in the required values:

\`\`\`bash
cp .env.example .env
\`\`\`

Required environment variables:

- \`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\`: Your Clerk publishable key
- \`CLERK_SECRET_KEY\`: Your Clerk secret key
- \`R2_ACCESS_KEY_ID\`: Cloudflare R2 access key
- \`R2_SECRET_ACCESS_KEY\`: Cloudflare R2 secret key
- \`R2_ACCOUNT_ID\`: Your Cloudflare account ID
- \`R2_BUCKET_NAME\`: Name of your R2 bucket
- \`CLOUDFLARE_ACCOUNT_ID\`: Your Cloudflare account ID
- \`CLOUDFLARE_API_TOKEN\`: Your Cloudflare API token

### 4. Set up Cloudflare resources

#### Create D1 Database

\`\`\`bash
npm run cf:d1:create
\`\`\`

Copy the database ID from the output and update your \`wrangler.toml\` file.

#### Run Database Migration

\`\`\`bash
npm run cf:d1:migrate
\`\`\`

#### Create R2 Bucket

\`\`\`bash
npm run cf:r2:create
\`\`\`

### 5. Run development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Cloudflare Pages

1. Build the application:

\`\`\`bash
npm run pages:build
\`\`\`

2. Deploy to Cloudflare Pages:

\`\`\`bash
npm run deploy
\`\`\`

### Configure Environment Variables in Cloudflare

In your Cloudflare Pages dashboard:

1. Go to your project settings
2. Navigate to "Environment variables"
3. Add all the environment variables from your \`.env\` file

### Bind D1 and R2 to your Pages project

In \`wrangler.toml\`, ensure the bindings are correctly configured:

\`\`\`toml
[[d1_databases]]
binding = "DB"
database_name = "simply-qr-db"
database_id = "your-database-id"

[[r2_buckets]]
binding = "QR_BUCKET"
bucket_name = "simply-qr"
\`\`\`

## Project Structure

\`\`\`
simply-qr/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── qr-codes/     # QR code CRUD operations
│   │   │   ├── scan/         # Scan tracking
│   │   │   └── analytics/    # Analytics endpoints
│   │   ├── dashboard/        # Dashboard pages
│   │   └── s/                # Short URL redirects
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard components
│   │   └── qr/              # QR code components
│   ├── lib/                  # Utility libraries
│   │   ├── db.ts            # Database operations
│   │   ├── qr-generator.ts  # QR code generation
│   │   └── r2-storage.ts    # R2 storage operations
│   ├── types/               # TypeScript types
│   └── styles/              # Global styles
├── database/
│   └── schema.sql           # Database schema
├── wrangler.toml            # Cloudflare configuration
└── package.json
\`\`\`

## API Routes

### QR Codes

- \`GET /api/qr-codes\` - List all QR codes for authenticated user
- \`POST /api/qr-codes\` - Create a new QR code
- \`GET /api/qr-codes/[id]\` - Get QR code details
- \`PATCH /api/qr-codes/[id]\` - Update QR code
- \`DELETE /api/qr-codes/[id]\` - Delete QR code
- \`GET /api/qr-codes/[id]/image\` - Serve QR code image

### Analytics

- \`GET /api/analytics/[id]\` - Get analytics for a QR code

### Scan Tracking

- \`GET /api/scan/[shortCode]\` - Track scan and redirect to target URL

## Database Schema

The application uses the following main tables:

- \`users\` - User accounts (synced from Clerk)
- \`qr_codes\` - QR code configurations and metadata
- \`scans\` - Scan events with analytics data
- \`folders\` - Organization folders
- \`tags\` - Tags for categorization
- \`qr_code_folders\` - QR code to folder relationships
- \`qr_code_tags\` - QR code to tag relationships

See \`database/schema.sql\` for the complete schema.

## Features in Detail

### QR Code Customization

- Custom foreground and background colors
- Logo overlay support
- Error correction levels (L, M, Q, H)
- Custom sizes
- PNG format output

### Analytics Tracking

- Total scans and time-based metrics
- Geographic location (country, region, city)
- Device information (type, OS, browser)
- Scan history over time
- Visual charts and graphs

### Organization

- Create folders to organize QR codes
- Add tags for categorization
- Search and filter capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/wattzwebdesign/simply-qr/issues) page.
