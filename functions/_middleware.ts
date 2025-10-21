// Cloudflare Pages Functions middleware
// This makes D1 and R2 bindings available to Next.js API routes

export async function onRequest(context: any) {
  // Attach Cloudflare bindings to the request
  context.request.env = context.env

  return await context.next()
}
