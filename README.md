# LJC Consulting Group LLC — Website

The marketing website for **LJC Consulting Group LLC**, live at **https://ljcconsultinggroup.com**.

LJC Consulting Group is a multidisciplinary management consulting firm serving private- and public-sector organizations. It works across four connected disciplines (Risk Management, Finance, Technology and Operations) and looks at how a decision in one area affects the whole organization.

## What's on the site

| Page | Content |
| --- | --- |
| **Home** (`/`) | Firm positioning, the four disciplines at a glance, and why clients choose LJC |
| **About** (`/about`) | Who the firm is, the sectors it serves, its five-step approach (Understand → Assess → Strategize → Implement → Improve) and its values |
| **Services** (`/services`) | Detailed service lines for Risk Management, Finance, Technology and Operations |
| **Contact** (`/contact`) | Inquiry form and email (`info@LJCCG.com`) |

## How it's built

- **Plain static site:** hand-written HTML with one stylesheet and one small script. No framework and no build step.
- **Hosted on Cloudflare Workers** as static assets, with no server code. Security and cache headers live in `public/_headers`, and redirects for retired URLs live in `public/_redirects`.
- **Clean URLs:** pages are served at `/about` rather than `/about.html`.

## Repository layout

```
public/            Everything that gets deployed
  *.html           Site pages (index, about, services, contact, 404)
  assets/          CSS, JS, logo and favicon
  robots.txt       Crawler rules + sitemap pointer
  sitemap.xml
  _headers         Security and cache headers applied by Cloudflare
  _redirects       301s for retired URLs
brand/             Original logo source (kept in the repo, not deployed)
wrangler.jsonc     Cloudflare Worker config
```

## Setup and deployment

See **[SETUP.md](SETUP.md)** for local preview, deployment, domain and DNS configuration, and the pre-launch checklist.
