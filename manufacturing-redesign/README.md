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

## Visual and content revision — 2026-10-17

The expanded design includes image-led service cards, an accessible seven-tab process explorer, an icon-based navigation menu, 42 process-specific manufacturing steps, 28 design considerations and 21 expandable FAQs. Material, finish, application and project-workflow sections support the 16 redesigned pages. Polymer and assembly pages have process-appropriate secondary-operation guidance. Desktop and 390px mobile layouts, keyboard tab navigation, mobile menus, FAQs and RFQ process preselection were checked in-browser. Static page validation and all three isolated RFQ backend tests pass.

Xometry was used as a reference for information hierarchy (capabilities, processes, materials, design guidance and FAQs). No Xometry assets, proprietary text, certification claims or capability figures were copied. The manufacturing descriptions are original general process guidance; project-specific feasibility and acceptance criteria require quotation review.

Two new AI-generated representative component illustrations are used on the site and labeled as illustrations. Existing project asset-library photos and material samples are reused. Image and content provenance is recorded in `DESIGN-SOURCES.txt`.

## Image and component-gallery revision — 2026-10-17

Seven new 1536×1024 illustrative process images replace the prior capability imagery on the homepage, process explorer and service heroes. Each has a full WebP version and a 768px responsive card variant; all seven card variants total 437,084 bytes. Process illustrations are labeled and the exact built-in image generation prompts are preserved in `PROCESS-IMAGES.json`.

The homepage and `/components` now show 17 multi-part collections across brass, stainless steel, engineering plastics, silicone, steel and aluminum alloys. Three aluminum and three stainless steel collections, plus two collections for each other material, use bright studio imagery and natural material colors. Material filters, the accessible image viewer and keyboard controls are preserved. RFQ links preselect the collection, process and material. These are labeled AI-generated reference illustrations rather than stocked items or completed customer projects.

Validated at 1440px, 900px and 390px, including category counts, image viewer navigation, Escape/focus return and RFQ parameter handoff. All 17 redesigned pages pass static validation; the three isolated RFQ regression tests pass.

## Expanded service scope

The owner confirmed coverage of Xometry service categories except waterjet cutting. The service directory now contains 42 entries across seven families, with grouped navigation and process-specific RFQ links. Detailed limits and acceptance criteria remain project-specific. See SERVICE-SCOPE.json.

## Illustrated capability guides

All 42 confirmed service entries now have independent English guides with original overview copy, four process steps, three design considerations, typical applications, material context and process-specific RFQ links. The directory uses illustrated cards and navigation links directly to each guide. Fourteen new AI-generated reference images supplement the existing process imagery; captions identify illustrations. Each guide has an accessible SVG workflow. See CAPABILITY-GUIDES.json and CAPABILITY-IMAGES.json for content and image provenance.

Validation: 56 modern pages pass the internal-link, image, heading and structured-data checks. All 42 guide routes, workflow SVGs and RFQ process mappings pass static verification. Desktop and mobile layouts and a representative RFQ preselection were checked in the browser. The Worker backend is unchanged.

## Material collection imagery

Replaced dark product imagery in both component galleries with 17 multi-part component illustrations. Responsive 1536px/768px WebP variants use lazy loading. Desktop cards use three columns and narrow mobile layouts use one column to retain detail. Provenance and exact generation prompts are in MATERIAL-IMAGES.json; collection copy and quote mappings are in MATERIAL-COLLECTIONS.json.

The first gallery collection shows complex five-axis aluminum reference geometries: an impeller, a sculpted bracket, a deep-cavity housing and a multi-angle manifold. Both homepage and Components include the new image, with CNC Milling and Aluminum alloy carried into the RFQ.

A 316 stainless steel precision-valve reference collection includes bodies, stems, seats, spool cores, gland bushings and threaded adapters. Its RFQ link preselects Stainless steel 316. Material and acceptance requirements remain drawing-specific.

A dedicated Sheet metal & enclosures filter now presents amplifier chassis, rack enclosure shells, ventilated covers and mounting trays. The enquiry selects Sheet Metal Fabrication and leaves the material grade for drawing-based confirmation.

Audio component references include a grouped speaker-grille/perforated-panel collection and a plastic acoustic waveguide/horn collection. They appear first within their respective sheet-metal and plastic categories, with fabrication or injection-molding RFQ links. Acoustic geometry is presented as a design reference, not a verified performance claim.

## Expanded material and finish library

The materials page contains 23 material families and 35 finish/treatment options, searchable independently by keyword and category. Cards include representative grades, process routes, application notes and RFQ links. Six selection examples, a specification checklist and five FAQs support quoting. Content is stored in MATERIALS-LIBRARY.json. Reference taxonomy: Xometry material categories and finishing directory; Metalcorex copy is original. Material substitution, grade/process compatibility and documentation remain drawing-specific.

## Quality page expansion

Quality page includes six management principles, six inspection checkpoints, four inspection areas, six document categories, four corrective-action stages, six process-specific focus areas and five FAQs. Inspection coverage and equipment methods are scoped to the project. Owner confirmed management in accordance with ISO 9001:2015, without a certification claim. The page states the management framework and does not display certification badges. Local desktop/mobile layout and RFQ message handoff checked.

## About page

Expanded company page with 15 image placements: component hero, existing workshop photograph, eight process cards, engineering review, three component application groups and inspection illustration. Includes company scope, five project stages, four collaboration principles, owner-confirmed ISO 9001:2015 management wording and project RFQ handoff. No invented operating history, workforce, factory area or certification claims. Desktop/mobile layouts and RFQ handoff checked.

## Professional contact and RFQ page

Three fieldsets separate contact, part/production and drawings/requirements. Requested quantity is distinct from annual quantity. Optional finish, destination and delivery timing are appended to the existing message payload via the formdata event; backend remains unchanged. Native file picker supports clearing and pre-submit validation matching 8 files / 25 MB each / 50 MB total and allowed extensions. Mobile displays the single-column form before secondary contact content. Five isolated tests pass, including storage/SMTP stubs, payload handoff and attachment limits; no production test enquiry sent.
