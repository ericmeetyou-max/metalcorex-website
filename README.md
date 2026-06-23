# Metalcorex Website

Static B2B website for `metalcorex.com`, ready for Cloudflare Pages.

## Local Preview

Open `index.html` directly in a browser, or run a small local server:

```bash
cd website
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to Cloudflare Pages

1. Log in to Cloudflare and add the domain `metalcorex.com`.
2. Change your domain registrar nameservers to the two Cloudflare nameservers shown in Cloudflare.
3. Go to **Workers & Pages** -> **Create application** -> **Pages**.
4. Choose **Direct Upload** for the fastest first launch.
5. Upload the contents of this `website` folder.
6. In the Pages project, add the custom domain `metalcorex.com` and also `www.metalcorex.com`.
7. In DNS, keep Cloudflare proxy enabled and let Cloudflare issue the SSL certificate.

## RFQ Drawing Upload Backend

The home page RFQ form posts to `POST /api/rfq`.

Cloudflare bindings needed:

- D1 database binding name: `DB`
- R2 bucket binding name: `RFQ_FILES`
- Environment variable: `ADMIN_TOKEN`

D1 schema:

```bash
wrangler d1 execute <YOUR_D1_DATABASE_NAME> --file db/schema.sql
```

Admin inbox:

```text
/admin.html
```

Enter `ADMIN_TOKEN` in the admin page and click refresh to load submissions and download drawing files.

## Notes

- The current RFQ form submits drawings and machining requirements to the Cloudflare backend when deployed.
- The RFQ drawing backend is scaffolded with Cloudflare Pages Functions, D1, and R2.
- Replace the email address if your business email is different.
- Public visitors use `products.html` for the Gallery.
- Internal product image preparation is in `admin.html`. The current static version stores uploaded images in the browser only; a real online backend needs Cloudflare storage or another serverless upload service.
