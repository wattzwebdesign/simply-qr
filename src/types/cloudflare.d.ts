/// <reference types="@cloudflare/workers-types" />

// Make Cloudflare types available globally
declare global {
  type D1Database = import('@cloudflare/workers-types').D1Database
  type R2Bucket = import('@cloudflare/workers-types').R2Bucket
}

export {}
