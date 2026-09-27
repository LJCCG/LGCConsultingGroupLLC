# Deploying to Cloudflare Workers (domains registered at GoDaddy)

## How this works (the short version)

- **GoDaddy** stays the place where you *own* (register and renew) the domains. Nothing changes about billing or ownership.
- **Cloudflare** takes over two jobs: **DNS** (the "phone book" that tells the internet where the domain points) and **hosting** (serving the website).
- You connect the two by changing one setting at GoDaddy: the domain's **nameservers**. That hands DNS to Cloudflare.

| Domain | Role |
|---|---|
| `ljccg.com` | **Primary** — the site lives here (matches the `info@LJCCG.com` email address) |
| `ljcconsultantgroup.com` | **Redirect** — anyone visiting it is sent to `ljccg.com` |

> If a domain ends in something other than `.com`, or you'd rather make `ljcconsultantgroup.com` the primary, swap the names everywhere below.

**Time required:** about 1 hour of hands-on work, plus up to 24 hours (rarely 48) waiting for the nameserver change to take effect.

---

## Before you start

- [ ] **Fix asset paths (the site won't look right until this is done).** Every page links to `assets/site.css`, `assets/site.js`, `assets/ljc-logo.png` and `assets/ljc-mark.png`, but those files sit in the top folder, not in an `assets/` folder. Either move those four files into an `assets/` folder, or remove `assets/` from the links in the HTML files.
- [ ] Replace `YOUR-PRIMARY-DOMAIN` in `robots.txt` and `sitemap.xml` with `ljccg.com`.
- [ ] Add the final legal business address, phone, leadership bios, and verified credentials.
- [ ] Add a Privacy Policy and Terms of Use reviewed against actual practices.
- [ ] **Screenshot your current GoDaddy DNS records for both domains** (GoDaddy → *My Products* → domain → *DNS*). If `info@LJCCG.com` already receives email, those records keep it working, and you'll check them against Cloudflare in Step 2.

---

## Step 1 — Create a Cloudflare account

1. Go to <https://dash.cloudflare.com/sign-up> and create a free account.
2. Verify your email address.

## Step 2 — Add both domains to Cloudflare

Do this once for `ljccg.com`, then again for `ljcconsultantgroup.com`.

1. In the Cloudflare dashboard, click **Add a domain** (sometimes shown as **+ Add → Connect a domain**).
2. Type the domain (e.g. `ljccg.com`). Leave **Quick scan for DNS records** selected and click **Continue**.
3. Choose the **Free** plan.
4. Cloudflare shows the DNS records it copied from GoDaddy. **Compare them to your screenshot:**
   - **Email records must be present:** every `MX` record, plus any `TXT` records (SPF, starting with `v=spf1`, and DMARC, named `_dmarc`) and any email `CNAME`s (such as `autodiscover`, `email`, or Microsoft/Google verification records). Add any that are missing by clicking **Add record**.
   - Any email-related `CNAME` should be set to **DNS only** (grey cloud), not Proxied (orange cloud).
   - **Delete** any `A` record for `@` and any `CNAME` for `www` that pointed at GoDaddy's parked page or website builder. The Worker replaces those in Step 5. (If you don't delete them now, Step 5 will warn you about a conflict.)
5. Click **Continue**. Cloudflare now shows **two nameservers**, something like:
   ```
   ada.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
   Copy them down exactly. Keep this tab open.

## Step 3 — Point GoDaddy at Cloudflare (change nameservers)

Do this for **each** domain, using the nameservers Cloudflare gave you for **that** domain. The two domains may get different pairs.

1. Log in to GoDaddy → **My Products** → find the domain → **DNS** (or **Manage DNS**).
2. **Turn off DNSSEC first**, if it's on. It's on the same DNS page, under **DNSSEC**. Leaving it on while changing nameservers can take the domain offline.
3. Open the **Nameservers** tab → **Change Nameservers** → choose **I'll use my own nameservers** (or "Enter my own nameservers").
4. Delete the GoDaddy entries (`nsXX.domaincontrol.com`) and enter the two Cloudflare nameservers.
5. **Save** and confirm the warning. GoDaddy warns that its DNS settings will stop applying, which is what you want.
6. Back in Cloudflare, click **Check nameservers now**.

Cloudflare emails you when each domain shows **Active**. That's usually within an hour, but it can take up to 24 to 48 hours. You can keep going with Step 4 in the meantime.

## Step 4 — Put the website on Cloudflare Workers

This repo already includes the files Cloudflare needs:
- `wrangler.jsonc` tells Cloudflare to serve this folder as a static website (Worker name: `ljc-consulting`).
- `.assetsignore` keeps non-website files (like this README, `.git`, and `node_modules`) from being published.

Pick **one** of the options below. Option A is recommended because the site then updates automatically whenever changes are pushed to GitHub.

### Option A — Connect the GitHub repo (recommended, no command line)

1. In Cloudflare, go to **Workers & Pages** → **Create** → **Import a repository** (under the Workers tab).
2. Click **Connect GitHub**, sign in, and allow access to the **LJCCG/LGCConsultingGroupLLC** repository.
3. Select the repository. On the settings screen:
   - **Project name:** `ljc-consulting`
   - **Build command:** leave empty
   - **Deploy command:** `npx wrangler deploy` (the default)
4. Click **Deploy**. After a minute you'll get a test address like `https://ljc-consulting.<your-account>.workers.dev`. Open it and click through every page.

From now on, every push to the repo's main branch redeploys the site automatically.

### Option B — Deploy from this computer (command line)

Requires [Node.js](https://nodejs.org) (LTS version). In a terminal opened in this folder:

```bash
npx wrangler login     # opens a browser window; click "Allow"
npx wrangler deploy    # uploads the site
```

The output ends with the test `workers.dev` address. Run `npx wrangler deploy` again whenever you change the site.

## Step 5 — Connect `ljccg.com` to the site

Wait until `ljccg.com` shows **Active** in Cloudflare (see Step 3).

1. **Workers & Pages** → click **ljc-consulting** → **Settings** → **Domains & Routes** → **+ Add** → **Custom domain**.
2. Enter `ljccg.com` → **Add domain**.
3. Repeat for `www.ljccg.com`.

Cloudflare creates the DNS records and the HTTPS (SSL) certificate automatically. It can take a few minutes before `https://ljccg.com` loads.

> **"A DNS record already exists" error?** Go to the `ljccg.com` domain → **DNS** → **Records**, delete the old `A`/`CNAME` record for that name (see Step 2.4), and try again. **Don't** delete `MX` or `TXT` records.

## Step 6 — Send `ljcconsultantgroup.com` to `ljccg.com`

Wait until `ljcconsultantgroup.com` shows **Active**. All of these steps happen inside the **ljcconsultantgroup.com** domain in Cloudflare.

**6a. Add placeholder DNS records.** Cloudflare needs to receive the traffic before it can redirect it. Go to **DNS** → **Records** → **Add record** and add both of these:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| `A` | `@` | `192.0.2.1` | **Proxied** (orange cloud) |
| `CNAME` | `www` | `ljcconsultantgroup.com` | **Proxied** (orange cloud) |

(`192.0.2.1` is a reserved dummy address. It's never actually contacted because Cloudflare redirects visitors first.)

**6b. Create the redirect rule.** Go to **Rules** → **Overview** → **Create rule** → **Redirect Rule**, then:

- **Rule name:** `Redirect to ljccg.com`
- **If incoming requests match:** choose **All incoming requests**
- **Then:**
  - **Type:** Dynamic
  - **Expression:** `concat("https://ljccg.com", http.request.uri.path)`
  - **Status code:** `301`
  - Tick **Preserve query string**
- Click **Deploy**.

Now `ljcconsultantgroup.com/services.html` goes to `ljccg.com/services.html`, and so on.

## Step 7 — HTTPS settings (both domains)

For **each** domain in Cloudflare:

1. **SSL/TLS** → **Overview**: leave it on the default (**Full** or automatic mode).
2. **SSL/TLS** → **Edge Certificates**: turn **Always Use HTTPS** **On**.

## Step 8 — Final check

- [ ] `https://ljccg.com` and `https://www.ljccg.com` load the site with the logo and styling.
- [ ] `http://ljccg.com` (no "s") switches to `https://` on its own.
- [ ] `ljcconsultantgroup.com` and `www.ljcconsultantgroup.com` redirect to `ljccg.com`.
- [ ] Every page in the menu opens, and the Contact form opens an email to `info@LJCCG.com`.
- [ ] **Send a test email to `info@LJCCG.com` from an outside address** (e.g. Gmail) to confirm email still arrives.
- [ ] Submit `https://ljccg.com/sitemap.xml` in [Google Search Console](https://search.google.com/search-console). If Search Console asks you to verify with a TXT record, add it in Cloudflare → `ljccg.com` → **DNS**.
- [ ] (Optional) Turn on free analytics: `ljccg.com` domain → **Analytics & Logs** → **Web Analytics**.

---

## Updating the site later

- **Option A (GitHub):** commit and push to GitHub. Cloudflare redeploys in about a minute.
- **Option B (command line):** run `npx wrangler deploy` from this folder.

The domains still **renew at GoDaddy**. Keep auto-renew on there. Cloudflare has nothing to do with renewal.

## Troubleshooting

| Problem | Fix |
|---|---|
| Domain stuck on "Pending" in Cloudflare | Check the GoDaddy nameservers exactly match Cloudflare's (no typos, GoDaddy's removed). Make sure DNSSEC is off at GoDaddy. Allow up to 48 hours. |
| Site loads but has no styling or logo | Asset paths aren't fixed yet. See the first item in *Before you start*. |
| Email stopped arriving | A mail record didn't carry over. Compare Cloudflare → DNS → Records with your GoDaddy screenshot, re-add missing `MX`/`TXT`/`CNAME` records, and set email `CNAME`s to **DNS only**. |
| "Too many redirects" | Set SSL/TLS mode to **Full** (Step 7). |
| Redirect domain shows an error page instead of redirecting | Make sure both placeholder records in Step 6a are **Proxied** (orange cloud), and the redirect rule is deployed. |
| Pages show as `/about` instead of `/about.html` | That's normal. Cloudflare serves clean URLs automatically, and both forms work. |

## Optional: move the domains to Cloudflare entirely

Once the site is live, you *can* transfer registration from GoDaddy to Cloudflare (**Domain Registration** → **Transfer Domains**). Cloudflare charges renewal at cost, usually cheaper than GoDaddy. This is **not required**, and domains registered in the last 60 days can't be transferred yet.
