# Metalcorex manufacturing website

Redesign of https://metalcorex.com for custom metal and plastic manufacturing. Covers CNC machining, sheet metal fabrication, injection molding, die casting, aluminum extrusion, 3D printing and assembly.

## Source and hosting

The production website is the Cloudflare Worker `metalcorex`, not the older static GitHub deployment. This snapshot uses the locally recovered production source. Its compiled backend was compared with the live Cloudflare Worker and was byte-for-byte identical before deployment. `metalcorex-audio` is a separate website and is not changed by this project.

- `website/`: production source and public assets, with the redesigned pages.
- `website/worker.js`: existing production backend, preserved without changes.
- `scripts/build.py`: copies public assets to `dist/`, excluding server source, SQL and tools.
- `tests/rfq.test.mjs`: isolated RFQ, attachment, validation and simulated-email tests. No live messages or production records are created.
- `wrangler.toml`: existing production routes and resource bindings. Secrets are managed in Cloudflare and are not included.

## Build and verification

Requires Python 3 and Node.js 22 or newer.

```sh
npm install
npm run build
npm test
npx wrangler deploy --dry-run
```

## Deploy

After authorizing Cloudflare Workers script and route permissions:

```sh
npm run deploy
```

Deploy only to the original `metalcorex` Worker. Keep existing database and R2 bindings, runtime secrets and environment variables. Do not use the `metalcorex-audio` project for this deployment. The website sends RFQs through the existing `/api/rfq` backend. Use simulated SMTP for testing; do not send live test messages without approval.

The new front end includes 7 capability detail pages, homepage, capabilities overview, materials and finishes, quality, about, process, contact and matching legal page layouts. Older product and blog URLs remain available. Canonical URLs and the sitemap use metalcorex.com.
