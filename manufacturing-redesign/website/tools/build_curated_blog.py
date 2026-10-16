#!/usr/bin/env python3
"""Build a small, reviewable Metalcorex knowledge center.

Legacy generated posts stay online for old links but are removed from search
indexing. Only the editorial articles below are published in the sitemap/feed.
"""

from __future__ import annotations

import html
import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TODAY = date(2026, 7, 26)

ARTICLES = [
    {
        "category": "Speaker Components",
        "category_slug": "speaker-components",
        "slug": "how-speaker-waveguides-improve-sound-and-manufacturing-quality",
        "title": "Speaker Waveguide Manufacturing: From Acoustic Surface to Production Part",
        "description": "A practical guide to waveguide prototypes, acoustic surfaces, molding DFM, datums, texture, and inspection for professional loudspeaker programs.",
        "image": "/assets/audio-waveguide.jpg",
        "audience": "Acoustic and mechanical engineers",
        "intro": "A waveguide is both an acoustic device and a manufactured component. The production route must preserve the surfaces that control directivity while also providing draft, wall structure, fastening, finish, and repeatable inspection. Treating it as ordinary cosmetic plastic usually creates avoidable tooling or assembly problems.",
        "sections": [
            (
                "Separate acoustic geometry from supporting geometry",
                [
                    "The throat transition, flare profile, mouth boundary, and relationship to the compression driver are usually the surfaces that deserve the tightest design control. Mounting flanges, hidden ribs, bosses, and rear supports can often be adjusted for manufacturing without changing acoustic intent, provided the design team identifies that freedom before DFM begins.",
                    "A useful drawing distinguishes acoustic surfaces, sealing surfaces, driver datums, cabinet interfaces, cosmetic zones, and non-critical structure. This gives the toolmaker room to solve shrinkage, ejection, cooling, and stiffness while protecting what the acoustic simulation and listening tests actually depend on.",
                ],
                ["Mark driver and cabinet datums", "Identify no-change acoustic surfaces", "Define gasket compression and fastener access"],
            ),
            (
                "Prototype the question you need to answer",
                [
                    "CNC machining is useful when the priority is acoustic geometry, driver alignment, or fast iteration without mold tooling. Additive manufacturing can be useful for form and assembly checks, but material stiffness and surface texture may differ from production. A prototype plan should state whether the sample is for acoustic test, packaging, appearance, or assembly.",
                    "Before moving to a mold, compare the validated prototype with the molded design. Draft, radii, wall transitions, parting line, gate position, and texture can all alter the final surface. The production CAD revision should be re-reviewed rather than assuming that a successful machined prototype automatically guarantees a successful molded part.",
                ],
                ["CNC for geometry-led acoustic tests", "Printed samples for packaging and fit", "Revalidate the production CAD after DFM"],
            ),
            (
                "Design the mold around visible and acoustic surfaces",
                [
                    "Parting lines and ejector marks should be kept away from critical acoustic transitions and visible front surfaces where practical. Gate location affects weld lines, pressure, appearance, and dimensional stability. Thick-to-thin transitions can create sink or uneven shrinkage, while insufficient draft can damage texture during ejection.",
                    "Material choice changes the DFM discussion. ABS offers practical processing and appearance; PC/ABS can improve impact performance; glass-filled PA can add stiffness but may influence surface, shrinkage, and dimensional behavior. Resin should be chosen from acoustic, structural, environmental, cosmetic, and production needs together.",
                ],
                ["Agree parting, gate, and ejector zones", "Review wall and rib ratios", "Confirm texture with draft and resin"],
            ),
            (
                "Inspect what protects sound and assembly",
                [
                    "Inspection should follow the part function. Throat and driver interfaces, mounting patterns, flange flatness, cabinet fit, and critical profile checks normally matter more than applying tight tolerances to every dimension. A profile fixture, CMM strategy, scan comparison, or section gauges may be appropriate depending on geometry and risk.",
                    "The production standard should also cover flash, short shot, sink, color, texture, contamination, and packing protection. Approved samples and a clear change record help acoustic, purchasing, and supplier teams avoid judging each batch from memory.",
                ],
                ["Critical interface report", "Approved appearance sample", "Fit and acoustic validation owned by the product team"],
            ),
        ],
        "rfq": ["3D STEP model and controlled 2D drawing", "Driver and cabinet mating information", "Prototype purpose and annual quantity", "Resin, texture, color, and environmental target", "Critical acoustic and assembly surfaces"],
    },
    {
        "category": "Sheet Metal",
        "category_slug": "audio-manufacturing",
        "slug": "metal-vs-plastic-speaker-grilles-for-professional-audio-products",
        "title": "Metal vs Plastic Speaker Grilles: An Engineering Selection Guide",
        "description": "Compare perforated metal and molded plastic speaker grilles for acoustic opening, impact, tooling, finish, environment, assembly, and cost.",
        "image": "/assets/audio-real-products/speaker-grille-closeup.webp",
        "audience": "Speaker product and sourcing teams",
        "intro": "Grille material affects far more than appearance. It changes acoustic opening, stiffness, impact behavior, cabinet attachment, tooling investment, finish options, corrosion protection, and replacement strategy. The right choice depends on the product architecture and production volume, not a universal preference for metal or plastic.",
        "sections": [
            (
                "Start with acoustic opening and protection",
                [
                    "Perforated metal provides a predictable round-hole or slot pattern and can protect a large driver area with relatively thin material. The useful comparison is not only percentage open area; bridge width, sheet thickness, formed depth, foam, and distance from the cone influence airflow, stiffness, and noise risk.",
                    "Molded plastic can integrate ribs, logos, clips, local thickness, and complex contour. Those features may support styling and assembly, but the opening pattern must still avoid weak sections, molding defects, and acoustic restriction. Both routes should be validated in the final cabinet rather than judged from a flat sample.",
                ],
                ["Define target open area", "Check peak cone excursion clearance", "Evaluate grille and foam together"],
            ),
            (
                "Compare impact, vibration, and environment",
                [
                    "Touring and portable products often favor formed steel because it resists knocks and can be repaired or replaced. Installation and outdoor products require careful attention to coating system, cut edges, drainage, galvanic contact, and salt or moisture exposure. Aluminum reduces mass and corrosion risk but changes stiffness and cost.",
                    "Plastic grilles avoid metal corrosion and may resist small cosmetic dents, yet polymer selection must account for UV, heat, creep, flame requirements, and impact at service temperature. Snap features and screw bosses also need repeated vibration and service review.",
                ],
                ["Identify handling and impact scenario", "State indoor, outdoor, and chemical exposure", "Review attachment under vibration"],
            ),
            (
                "Account for tooling and product volume",
                [
                    "Metal grilles can often start with lower tooling investment using perforation, laser cutting, press-brake forming, rolling, and simple forming fixtures. Unit cost is influenced by material yield, hole process, forming complexity, edge treatment, welding, foam, and coating.",
                    "Plastic grilles require mold investment but can consolidate multiple features and reduce secondary assembly at volume. The business case should include tool maintenance, resin variation, cycle time, scrap, cosmetic approval, and future design changes, not only the first unit-price comparison.",
                ],
                ["Prototype the attachment and profile", "Model total assembly cost", "Consider future service and revision risk"],
            ),
            (
                "Write a grille specification suppliers can repeat",
                [
                    "A strong specification defines material grade, gauge or resin, opening pattern, critical envelope, attachment datums, edge condition, finish, color and gloss, foam type, adhesive method, cosmetic zones, and packaging. For metal, coating build can change fit at return edges and fastener interfaces.",
                    "Inspection should include profile or fit, hole consistency, burr and sharp-edge control, coating appearance, adhesion requirements where specified, foam position, and packing protection. Acoustic validation belongs to the speaker manufacturer, while the supplier should provide repeatable dimensional and appearance evidence.",
                ],
                ["Approved CAD and drawing", "Appearance and color sample", "Fit fixture or cabinet check"],
            ),
        ],
        "rfq": ["Cabinet opening and attachment details", "Open-area or acoustic target", "Impact and environmental requirements", "Expected annual volume", "Finish, foam, appearance, and packaging standard"],
    },
    {
        "category": "CNC Machining",
        "category_slug": "cnc-machining",
        "slug": "cnc-machining-tolerances-for-aluminum-audio-hardware",
        "title": "CNC Tolerances for Aluminum Audio Hardware: Tighten Only What Matters",
        "description": "How to assign practical CNC tolerances to amplifier housings, heat sinks, brackets, knobs, adapters, and other aluminum audio components.",
        "image": "/assets/audio-real-products/aluminum-heat-sink.webp",
        "audience": "Mechanical engineers and buyers",
        "intro": "A blanket tight tolerance rarely improves an audio product. It usually increases setups, inspection, cycle time, and rejection risk. Better drawings identify the interfaces that control fit, heat flow, alignment, sealing, or appearance and allow practical manufacturing tolerance elsewhere.",
        "sections": [
            (
                "Build tolerance from function and datum",
                [
                    "Start with how the part locates in the assembly. A heat sink may use one primary mounting plane, a PCB or device interface, and connector or fastener patterns. A bracket may depend on hole position to a cabinet datum. A knob may depend on bore fit and indicator orientation. These relationships should drive the datum scheme.",
                    "When dimensions are chained without a functional datum, variation accumulates and inspection becomes difficult to interpret. Coordinate or position controls tied to assembly datums often communicate intent more clearly than many independent plus-minus dimensions.",
                ],
                ["Choose assembly datums first", "Control relationships, not isolated dimensions", "Avoid redundant or conflicting dimensions"],
            ),
            (
                "Recognize the features that drive cost",
                [
                    "Deep pockets, thin walls, long slender features, small internal radii, tight bores, large flat surfaces, and dimensions spanning multiple setups can require slower cutting, special tools, stress management, or additional inspection. Cosmetic surfaces may need separate handling even when their dimensions are simple.",
                    "Anodizing, blasting, polishing, and coating occur after machining and can influence size, thread behavior, contact, and appearance. Drawings should identify mask zones and whether dimensions apply before or after finish. Otherwise suppliers may quote different assumptions.",
                ],
                ["Mark post-finish requirements", "Review tool access and internal radii", "Separate cosmetic and dimensional acceptance"],
            ),
            (
                "Use process capability as a discussion, not a website number",
                [
                    "Achievable tolerance depends on part size, geometry, material condition, setup, machine, feature type, inspection method, and batch strategy. A supplier can hold a demanding local feature on one part while a broad statement about every dimension would be misleading.",
                    "For quotation, classify features as critical, assembly, cosmetic, or reference. Ask the supplier to identify the dimensions that require special control and the proposed inspection method. This creates a more useful capability conversation than asking for one general tolerance value.",
                ],
                ["Flag safety and fit-critical features", "Agree inspection method before production", "Use general tolerance for non-critical geometry"],
            ),
            (
                "Control first article and repeat production",
                [
                    "The first article should confirm the manufacturing datum strategy, critical dimensions, threads, finish interfaces, and trial assembly where available. It should also expose drawing ambiguities before repeat batches begin.",
                    "For production, the control plan can combine setup verification, in-process gauges, periodic dimensional checks, visual standards, and final sampling. The level of documentation should match part risk and purchase requirements rather than adding paperwork with no decision value.",
                ],
                ["First-article report for agreed characteristics", "Thread and fit gauges where practical", "Revision and approved-deviation control"],
            ),
        ],
        "rfq": ["STEP model plus controlled 2D drawing", "Critical dimensions and datum references", "Mating parts or assembly description", "Material temper and finish", "Prototype and annual quantities"],
    },
    {
        "category": "Rigging Hardware",
        "category_slug": "design-tips",
        "slug": "line-array-rigging-hardware-material-and-inspection",
        "title": "Line Array Rigging Hardware: Material, Load Path, and Inspection",
        "description": "Manufacturing considerations for line array links, fly plates, pins, yokes, brackets, and other load-bearing professional audio hardware.",
        "image": "/assets/audio-real-products/rigging-rail.webp",
        "audience": "Rigging designers and supplier quality teams",
        "intro": "Line array and flown-speaker hardware must be treated as structural product hardware, not ordinary decorative metalwork. The speaker manufacturer owns the system design and validation; the manufacturing plan must preserve the approved material, geometry, interfaces, heat treatment, finish, and traceability.",
        "sections": [
            (
                "Map the complete load path",
                [
                    "Review every interface from cabinet structure through rails, links, pins, brackets, fasteners, and suspension points. A strong individual part does not guarantee a safe assembly if bearing area, edge distance, hole wear, fastener engagement, or load direction is misunderstood.",
                    "The controlled drawing should identify safety-critical characteristics and reference the validation basis used by the system designer. Manufacturing feedback can improve access, bend feasibility, inspection, or repeatability, but design changes affecting load must return to the responsible engineer for approval.",
                ],
                ["Identify all primary and secondary load paths", "Mark safety-critical characteristics", "Control mating pin and hole interfaces"],
            ),
            (
                "Control material and process history",
                [
                    "Material grade, condition, rolling direction where relevant, heat treatment, weld procedure, and surface processing can influence performance. Substitutions should never be made only from a similar strength value without engineering review of toughness, fatigue, corrosion, weldability, and manufacturing history.",
                    "Traceability requirements should be agreed at quotation: mill certificate, batch identification, heat-treatment record, plating or coating record, and retention period. Not every part needs the same documentation, but the requirement must be explicit before price and lead time are fixed.",
                ],
                ["No unapproved material substitution", "Define certificate and batch needs", "Review welding and heat effects"],
            ),
            (
                "Protect critical geometry through finishing",
                [
                    "Hole position, diameter, edge distance, bend location, flatness, and mating profile can affect assembly and load distribution. Burrs, sharp edges, weld distortion, or excessive coating build may interfere with pins and joints even when the raw part was correct.",
                    "Masking, post-finish gauges, and assembly fixtures should be considered for interfaces sensitive to plating or powder coating. A finish selected for corrosion must also be compatible with contact wear and galvanic conditions in the complete system.",
                ],
                ["Inspect after the final relevant process", "Gauge pin and mating interfaces", "Define edge and burr acceptance"],
            ),
            (
                "Agree validation ownership and evidence",
                [
                    "Dimensional inspection and material records do not replace structural validation, proof testing, fatigue assessment, or regulatory review. The manufacturer and customer should state who owns design validation and which production tests, if any, are required.",
                    "A practical release package may include first-article dimensions, material identity, process records, visual and coating checks, assembly fit, and customer-approved samples. Any change to material, source, tooling, or critical process should follow written change control.",
                ],
                ["State engineering validation owner", "Define production test and sampling", "Require change approval for critical inputs"],
            ),
        ],
        "rfq": ["Controlled drawing with critical characteristics", "Load case and validation responsibility", "Material condition and certificate requirements", "Finish and corrosion environment", "Inspection, testing, traceability, and change-control needs"],
    },
    {
        "category": "Amplifier Hardware",
        "category_slug": "sheet-metal",
        "slug": "amplifier-chassis-thermal-emi-and-assembly-design",
        "title": "Amplifier Chassis Design for Thermal, EMI, and Efficient Assembly",
        "description": "A manufacturing guide to sheet metal and machined amplifier enclosures for active speakers, touring racks, and professional audio electronics.",
        "image": "/assets/audio-real-products/amplifier-chassis.webp",
        "audience": "Audio electronics and mechanical teams",
        "intro": "An amplifier chassis is a structural frame, thermal path, electrical enclosure, user interface, and assembly platform. Decisions about sheet metal, heat sinks, ventilation, grounding, connector positions, service access, and finish should be reviewed as one system before drawings are released.",
        "sections": [
            (
                "Define the mechanical and electrical architecture",
                [
                    "Begin with PCB, power device, transformer, fan, connector, display, and cable locations. Identify which surfaces establish board position, which joints provide shielding or grounding, and which panels must be removable for service. This prevents late conflicts between electronics and fabrication.",
                    "A chassis assembled from several bent parts can be economical and serviceable, while an extrusion or machined housing can combine thermal and cosmetic functions. Hybrid construction is common: sheet metal internal structure with a machined heat sink or faceplate.",
                ],
                ["Define board and connector datums", "Map service and tool access", "Identify grounding and shielding contacts"],
            ),
            (
                "Design the thermal path before cosmetic finish",
                [
                    "Power devices need controlled contact to a heat spreader or heat sink. Flatness, interface material, mounting pressure, fastener sequence, and coating masks may matter more than the appearance of the surrounding surface. Vent patterns and fan paths must also account for internal obstructions.",
                    "Anodizing and paint may be desirable externally but can interfere with electrical or thermal contact. Drawings should identify bare, masked, or conductive interfaces and define how those areas are protected during handling and assembly.",
                ],
                ["Mark thermal contact zones", "Define mask boundaries", "Review airflow in the assembled product"],
            ),
            (
                "Make sheet metal tolerant of real assembly",
                [
                    "Bend relief, inside radius, hardware clearance, weld sequence, and tolerance stack determine whether panels align without forcing. Captive nuts or self-clinching hardware can improve assembly, but edge distance and insertion access must be designed correctly.",
                    "Connector cutouts should use the supplier drawing for the actual component and include access for mating plugs and locking features. Cable bend radius, strain relief, and harness routing are often missed when only the front view is reviewed.",
                ],
                ["Check formed-part tolerance stack", "Validate all connector keep-out zones", "Plan captive hardware and assembly sequence"],
            ),
            (
                "Release with fit, finish, and function evidence",
                [
                    "A first assembly is more informative than isolated dimensional reports. It can reveal connector misalignment, panel gaps, screw access, grounding contact, cable interference, heat sink seating, and cosmetic damage during assembly.",
                    "Production control may include key dimensions, thread and insert checks, finish appearance, mask zones, trial assembly, labels, and protective packing. Electrical safety, EMC, and thermal performance remain the responsibility of the product validation program.",
                ],
                ["First article with trial assembly", "Approved appearance and label sample", "Separate manufacturing checks from product compliance tests"],
            ),
        ],
        "rfq": ["3D assembly and 2D part drawings", "PCB, connector, and heat-source layout", "Thermal, grounding, and masking requirements", "Finish and cosmetic zones", "Assembly, labeling, testing, and packing scope"],
    },
    {
        "category": "Injection Molding",
        "category_slug": "injection-molding",
        "slug": "speaker-horn-tooling-and-dfm-guide",
        "title": "Speaker Horn Tooling and DFM: Questions to Resolve Before Mold Steel",
        "description": "DFM guidance for injection molded speaker horns and waveguides, including resin, wall design, draft, tooling surfaces, sampling, and approval.",
        "image": "/assets/audio-real-products/plastic-speaker-parts.webp",
        "audience": "Acoustic product and tooling teams",
        "intro": "The expensive moment in a molded horn project is not the first quotation; it is cutting tool steel before acoustic, cosmetic, assembly, and molding requirements have been separated. A disciplined DFM review makes those decisions visible while they are still inexpensive to change.",
        "sections": [
            (
                "Freeze the right surfaces, not the entire model",
                [
                    "Acoustic surfaces and driver alignment may be fixed by simulation and prototype testing. Hidden ribs, bosses, draft transitions, fastening features, and local thickness can often change. The DFM package should clearly identify which regions require customer approval for any modification.",
                    "Provide the compression driver interface, gasket strategy, cabinet mounting, and nearby parts. A horn that is manufacturable by itself can still fail assembly because screws, tools, wires, or seals do not have enough space.",
                ],
                ["Classify acoustic, assembly, cosmetic, and flexible regions", "Share mating parts", "Define revision approval responsibility"],
            ),
            (
                "Select resin from the complete use case",
                [
                    "Material choice should consider stiffness, impact, temperature, moisture, UV, flammability, appearance, cost, and availability. Filled materials may increase rigidity but affect flow, surface, wear, and dimensional behavior. Unfilled materials may offer better appearance or toughness but require different structural design.",
                    "Avoid specifying only a resin family when the project depends on a particular performance level. Agree whether equivalent grades are allowed and which properties or certifications must be documented.",
                ],
                ["State environment and performance priorities", "Define approved grade or equivalency route", "Include color and texture expectations"],
            ),
            (
                "Review parting, gate, ejection, cooling, and texture together",
                [
                    "A gate must fill the part without placing unacceptable weld lines or vestige on important surfaces. Ejectors need sufficient area and should avoid acoustic and visible regions. Cooling affects cycle time and dimensional stability, while texture increases draft needs.",
                    "Wall thickness should transition smoothly. Ribs and bosses need proportions that provide stiffness without visible sink. Undercuts and side actions may be justified, but each adds tool complexity, maintenance, and timing risk.",
                ],
                ["Review marked-up tool concept", "Agree visible defect boundaries", "Avoid hidden tooling complexity without product value"],
            ),
            (
                "Plan sampling as an engineering loop",
                [
                    "First shots are information, not automatic production approval. Record molding conditions, measure agreed characteristics, inspect appearance, test assembly, and perform acoustic validation. Corrections should be tracked against a controlled issue list and updated CAD.",
                    "The approved sample should be paired with drawing revision, material, color, texture, process assumptions, and acceptance evidence. This becomes the reference for repeat production and helps distinguish real process drift from subjective visual differences.",
                ],
                ["T0/T1 issue list and revision control", "Critical dimension and fit report", "Approved appearance and acoustic validation"],
            ),
        ],
        "rfq": ["Production CAD and marked critical surfaces", "Prototype test status", "Material and compliance targets", "Annual volume and tool-life expectation", "Appearance, validation, and sampling plan"],
    },
]

MAIN_PAGES = [
    ("", "1.0"),
    ("about", "0.7"),
    ("services", "0.9"),
    ("products", "0.9"),
    ("stage-audio-parts", "0.8"),
    ("industries", "0.7"),
    ("processes", "0.8"),
    ("materials", "0.8"),
    ("surface-treatment", "0.8"),
    ("design-engineering", "0.8"),
    ("case-studies", "0.8"),
    ("resources", "0.7"),
    ("blog", "0.8"),
    ("contact", "0.8"),
    ("rope-products", "0.6"),
    ("privacy", "0.3"),
    ("terms", "0.3"),
]


HEADER = """
<header class="site-header solid-header">
  <a class="brand" href="/" aria-label="Metalcorex home"><img class="brand-logo" src="/assets/metalcorex-logo.png" alt="Metalcorex"></a>
  <nav class="nav" aria-label="Main navigation">
    <a href="/about">About</a><a href="/services">Services</a><a href="/products">Products</a><a href="/stage-audio-parts">Stage Audio</a><a href="/processes">Processes</a>
    <div class="nav-item resources-nav"><button class="resources-toggle" type="button" aria-expanded="false">Resources</button><div class="resources-menu" id="resources-menu"><a class="resource-menu-link" href="/resources">Resource Center</a><a class="resource-menu-link" href="/design-engineering">Design Engineering</a><a class="resource-menu-link" href="/blog">Blog</a><a class="resource-menu-link" href="/materials">Materials</a><a class="resource-menu-link" href="/surface-treatment">Surface Treatment</a><a class="resource-menu-link" href="/case-studies">Case Studies</a></div></div>
    <a href="/contact">Contact</a><a class="nav-rfq" href="/#quote">RFQ</a>
  </nav>
</header>
"""


def article_url(article: dict) -> str:
    return f"https://metalcorex.com/blog/{article['category_slug']}/{article['slug']}/"


def render_article(article: dict) -> str:
    url = article_url(article)
    sections = []
    toc = []
    for index, (heading, paragraphs, bullets) in enumerate(article["sections"], 1):
        toc.append(f'<a href="#section-{index}">{html.escape(heading)}</a>')
        sections.append(
            f"""<section id="section-{index}">
              <p class="article-section-number">0{index}</p>
              <h2>{html.escape(heading)}</h2>
              {''.join(f'<p>{html.escape(paragraph)}</p>' for paragraph in paragraphs)}
              <ul>{''.join(f'<li>{html.escape(item)}</li>' for item in bullets)}</ul>
            </section>"""
        )
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article["title"],
        "description": article["description"],
        "image": f"https://metalcorex.com{article['image']}",
        "datePublished": TODAY.isoformat(),
        "dateModified": TODAY.isoformat(),
        "author": {"@type": "Organization", "name": "Metalcorex Engineering Team"},
        "publisher": {"@type": "Organization", "name": "Metalcorex", "logo": {"@type": "ImageObject", "url": "https://metalcorex.com/assets/metalcorex-logo.png"}},
        "mainEntityOfPage": url,
    }
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{html.escape(article['title'])} | Metalcorex</title>
    <meta name="description" content="{html.escape(article['description'], quote=True)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="{url}">
    <meta property="og:type" content="article"><meta property="og:title" content="{html.escape(article['title'], quote=True)}"><meta property="og:description" content="{html.escape(article['description'], quote=True)}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://metalcorex.com{article['image']}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="/favicon.svg?v=metalcorex-logo-2" type="image/svg+xml"><link rel="stylesheet" href="/styles.css?v=editorial-20260726">
    <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
  </head>
  <body class="platform-page editorial-article-page">
    {HEADER}
    <main>
      <article class="editorial-article">
        <header class="editorial-article-hero">
          <div><nav class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog">Knowledge Center</a><span>/</span><span>{html.escape(article['category'])}</span></nav><p class="eyebrow">{html.escape(article['category'])}</p><h1>{html.escape(article['title'])}</h1><p>{html.escape(article['description'])}</p><div class="article-meta-line"><span>Engineering guide</span><span>Updated {TODAY.isoformat()}</span><span>{html.escape(article['audience'])}</span></div></div>
          <figure><img src="{article['image']}" alt="{html.escape(article['title'], quote=True)}"><figcaption>Representative component and application reference</figcaption></figure>
        </header>
        <div class="editorial-article-layout">
          <aside><strong>In this guide</strong>{''.join(toc)}<a class="button primary" href="/#quote">Review My Drawing</a></aside>
          <div class="editorial-article-body">
            <p class="article-lede">{html.escape(article['intro'])}</p>
            {''.join(sections)}
            <section class="article-rfq-checklist"><p class="article-section-number">RFQ</p><h2>Information to send with the drawing</h2><ul>{''.join(f'<li>{html.escape(item)}</li>' for item in article['rfq'])}</ul></section>
            <section class="article-responsibility-note"><h2>Engineering responsibility</h2><p>This guide describes manufacturing considerations, not a product certification or universal specification. Acoustic, structural, thermal, electrical, safety, and regulatory validation remain project-specific and must be approved by the responsible product team.</p></section>
            <section class="article-author"><strong>Metalcorex Engineering Team</strong><p>We support professional audio brands with drawing-based CNC machining, sheet metal fabrication, mold design and molding, finishing, assembly, inspection, and export preparation.</p><div class="hero-actions"><a class="button primary" href="/#quote">Upload Project Files</a><a class="button secondary dark-text" href="/contact">Contact Engineering</a></div></section>
          </div>
        </div>
      </article>
    </main>
    <footer class="site-footer"><span>&copy; <span id="year"></span> Metalcorex.</span><span class="site-footer-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/blog">Knowledge Center</a></span></footer>
    <script src="/script.js?v=editorial-20260726"></script>
  </body>
</html>
"""


def render_blog_index() -> str:
    cards = []
    for article in ARTICLES:
        path = f"/blog/{article['category_slug']}/{article['slug']}/"
        cards.append(
            f"""<article class="editorial-card" data-category="{article['category_slug']}">
              <a href="{path}"><img src="{article['image']}" alt="{html.escape(article['title'], quote=True)}" loading="lazy"></a>
              <div><span>{html.escape(article['category'])}</span><h2><a href="{path}">{html.escape(article['title'])}</a></h2><p>{html.escape(article['description'])}</p><a class="text-link" href="{path}">Read engineering guide</a></div>
            </article>"""
        )
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Professional Audio Manufacturing Knowledge Center | Metalcorex</title>
    <meta name="description" content="Original engineering guides for waveguides, speaker grilles, CNC audio hardware, line array rigging, amplifier chassis, and molded speaker components.">
    <meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://metalcorex.com/blog">
    <meta property="og:type" content="website"><meta property="og:title" content="Professional Audio Manufacturing Knowledge Center"><meta property="og:description" content="Focused manufacturing guidance for professional audio engineers and sourcing teams."><meta property="og:url" content="https://metalcorex.com/blog"><meta property="og:image" content="https://metalcorex.com/assets/audio-real-products/speaker-cabinet-scene.webp">
    <meta name="twitter:card" content="summary_large_image"><link rel="alternate" type="application/rss+xml" title="Metalcorex Engineering Guides" href="/feed.xml">
    <link rel="icon" href="/favicon.svg?v=metalcorex-logo-2" type="image/svg+xml"><link rel="stylesheet" href="/styles.css?v=editorial-20260726">
  </head>
  <body class="platform-page curated-blog-page">
    {HEADER}
    <main>
      <section class="editorial-index-hero"><div><p class="eyebrow">Professional Audio Manufacturing</p><h1>Engineering notes for the parts behind the sound.</h1><p>Focused guidance for audio engineers and sourcing teams making decisions about acoustic geometry, structural hardware, thermal enclosures, molded components, finishes, inspection, and supplier release.</p></div><figure><img src="/assets/audio-real-products/speaker-cabinet-scene.webp" alt="Professional speaker cabinet and custom component application"><figcaption>Component decisions in system context</figcaption></figure></section>
      <section class="editorial-principles"><strong>Editorial standard</strong><span>Written for professional audio applications</span><span>Manufacturing decisions before marketing claims</span><span>Project-specific limits clearly identified</span></section>
      <section class="editorial-index-intro"><div><p class="eyebrow">Selected Guides</p><h2>Six useful starting points, not one hundred repeated articles.</h2></div><p>We publish only material that helps a designer or buyer make a clearer manufacturing decision. Older template content has been removed from search indexing while it is reviewed.</p></section>
      <section class="editorial-card-grid">{''.join(cards)}</section>
      <section class="catalog-cta"><div><p class="eyebrow">Apply It to Your Part</p><h2>The drawing is more useful than a generic capability claim.</h2><p>Send the file, application, material, quantity, finish, mating context, and critical requirements. We will identify the manufacturing questions that need answers before quotation.</p></div><div class="hero-actions"><a class="button primary" href="/#quote">Upload Drawing</a><a class="button secondary dark-text" href="/design-engineering">Design Support</a></div></section>
    </main>
    <footer class="site-footer"><span>&copy; <span id="year"></span> Metalcorex.</span><span class="site-footer-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Contact</a></span></footer>
    <script src="/script.js?v=editorial-20260726"></script>
  </body>
</html>
"""


def mark_legacy_noindex(curated_paths: set[Path]) -> int:
    updated = 0
    for path in ROOT.glob("blog/**/index.html"):
        if path in curated_paths:
            continue
        source = path.read_text(encoding="utf-8")
        if 'name="robots"' in source:
            source = source.replace('content="index,follow"', 'content="noindex,follow"')
        else:
            source = source.replace(
                '<meta name="viewport" content="width=device-width, initial-scale=1">',
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n    <meta name="robots" content="noindex,follow">',
                1,
            )
        path.write_text(source, encoding="utf-8")
        updated += 1
    return updated


def write_feed() -> None:
    items = []
    for article in ARTICLES:
        url = article_url(article)
        items.append(
            f"<item><title>{html.escape(article['title'])}</title><link>{url}</link><guid>{url}</guid><description>{html.escape(article['description'])}</description><pubDate>Sun, 26 Jul 2026 00:00:00 GMT</pubDate></item>"
        )
    feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Metalcorex Engineering Guides</title><link>https://metalcorex.com/blog</link><description>Professional audio component manufacturing guidance.</description>{''.join(items)}</channel></rss>
"""
    (ROOT / "feed.xml").write_text(feed, encoding="utf-8")


def write_sitemap() -> None:
    entries = []
    for path, priority in MAIN_PAGES:
        suffix = f"/{path}" if path else "/"
        entries.append(
            f"<url><loc>https://metalcorex.com{suffix}</loc><lastmod>{TODAY.isoformat()}</lastmod><changefreq>weekly</changefreq><priority>{priority}</priority></url>"
        )
    for article in ARTICLES:
        entries.append(
            f"<url><loc>{article_url(article)}</loc><lastmod>{TODAY.isoformat()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>"
        )
    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{''.join(entries)}</urlset>
"""
    (ROOT / "sitemap.xml").write_text(sitemap, encoding="utf-8")


def main() -> None:
    curated_paths = {
        ROOT / "blog" / article["category_slug"] / article["slug"] / "index.html"
        for article in ARTICLES
    }
    legacy_count = mark_legacy_noindex(curated_paths)
    for article in ARTICLES:
        target = ROOT / "blog" / article["category_slug"] / article["slug"] / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_article(article), encoding="utf-8")
    (ROOT / "blog.html").write_text(render_blog_index(), encoding="utf-8")
    write_feed()
    write_sitemap()
    print(f"Published {len(ARTICLES)} curated guides; marked {legacy_count} legacy pages noindex.")


if __name__ == "__main__":
    main()
