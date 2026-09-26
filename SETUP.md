# Setup & Deployment

How to preview, deploy and configure the LJC Consulting Group website. For an overview of the project, see [README.md](README.md).

## Local preview

```sh
npm install
npm run dev        # http://localhost:8787
```

Opening the HTML files straight from disk won't work well because links and assets use root-relative paths (`/assets/...`). Use `npm run dev` instead.

## Deploy

**Recommended: Git integration.** In the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository**, then pick `LJCCG/LGCConsultingGroupLLC`. Leave the build command empty and set the deploy command to `npx wrangler deploy`. After that, every push to `main` deploys.

**Manual:** `npx wrangler login`, then `npm run deploy`.

## Routing

Internal links use clean URLs (`/about`, not `about.html`). Cloudflare serves `about.html` at `/about` and redirects `/about.html` there. Unknown paths get `404.html`. This behaviour is set in `wrangler.jsonc`; retired URLs are redirected in `public/_redirects`.

## Domains

| Domain | Purpose |
| --- | --- |
| `ljcconsultinggroup.com` | Primary website (Worker custom domain, set in `wrangler.jsonc`) |
| `ljccg.com` | Email (`info@LJCCG.com`). Web visits redirect to the primary domain |

One-time setup in Cloudflare (both zones must be added to the account):

1. **Custom domain.** The first deploy attaches `ljcconsultinggroup.com` to the Worker and creates its DNS record. Remove any existing apex A/AAAA/CNAME record that conflicts with it first.
2. **Redirects.** Send `www.ljcconsultinggroup.com`, `ljccg.com` and `www.ljccg.com` to the primary domain:
   - Make sure each hostname has a **proxied** (orange-cloud) DNS record. If none exists, add `AAAA <name> 100::` (proxied).
   - In each zone, go to **Rules → Redirect Rules** and create a dynamic redirect: match on the hostname, target `concat("https://ljcconsultinggroup.com", http.request.uri.path)`, status **301**, preserve query string.
3. **Keep email working.** Do **not** change or delete the MX, SPF (TXT), DKIM or DMARC records on `ljccg.com`. The redirect only affects web (HTTP) traffic.
4. In the SSL/TLS settings for both zones, set the mode to **Full** and turn on **Always Use HTTPS**.

## Before launch (content)

- Add the legal business address, phone number, leadership bios and verified credentials.
- Add a Privacy Policy and Terms of Use that reflect actual practices.
- The contact form currently opens the visitor's email app (`mailto:`). For server-side delivery, connect it to a form or email provider.
- Set up analytics (e.g. Cloudflare Web Analytics) and submit `sitemap.xml` in Google Search Console.
