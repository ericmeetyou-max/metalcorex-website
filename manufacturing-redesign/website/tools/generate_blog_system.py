#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import math
import shutil
from datetime import date, timedelta
from pathlib import Path
from textwrap import dedent


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://metalcorex.com"
TODAY = date(2026, 7, 5)


CATEGORIES = [
    ("speaker-components", "Speaker Components", "Speaker Components Manufacturer Resources | Metalcorex", "Engineering articles about speaker waveguides, grilles, horns, brackets, cabinet hardware, heat sinks, and custom audio components.", "Custom speaker component engineering knowledge for OEM audio brands.", "Learn how speaker hardware, acoustic plastic parts, metal grilles, brackets, and cabinet components move from CAD to repeat production."),
    ("audio-manufacturing", "Audio Manufacturing", "Professional Audio Manufacturing Guides | Metalcorex", "OEM manufacturing guides for professional audio brands sourcing custom speaker and amplifier components.", "Manufacturing knowledge for professional audio brands.", "Practical guidance for loudspeaker OEM teams, audio engineers, and purchasing managers sourcing custom components."),
    ("cnc-machining", "CNC Machining", "CNC Machining for Audio Components | Metalcorex", "CNC machining guides for aluminum audio housings, heat sinks, brackets, knobs, waveguide prototypes, and precision parts.", "CNC machining guidance for audio hardware.", "Understand machining strategy, tolerance control, finishing, inspection, and cost drivers before sending drawings."),
    ("sheet-metal", "Sheet Metal", "Sheet Metal Fabrication for Speaker Parts | Metalcorex", "Sheet metal fabrication articles for speaker grilles, amplifier chassis, brackets, plates, and audio enclosures.", "Sheet metal fabrication for speaker and amplifier parts.", "Explore laser cutting, bending, welding, perforation, powder coating, and packaging for custom audio hardware."),
    ("injection-molding", "Injection Molding", "Injection Molding for Speaker Components | Metalcorex", "Injection molding guides for speaker horns, waveguides, plastic frames, trims, knobs, and acoustic components.", "Injection molding knowledge for custom speaker parts.", "Learn about tooling, material selection, texture, shrinkage, assembly features, and molded audio component production."),
    ("materials", "Materials", "Materials for Professional Audio Components | Metalcorex", "Material selection guides for aluminum, steel, stainless steel, ABS, PC, PA, POM, silicone, rubber, and speaker hardware.", "Materials used in speaker and audio hardware.", "Compare metals, plastics, elastomers, finishes, and application tradeoffs for durable professional audio parts."),
    ("design-tips", "Design Tips", "Design Tips for Manufacturable Audio Components | Metalcorex", "DFM tips for speaker waveguides, grilles, brackets, enclosures, plastic parts, and CNC audio hardware.", "Design better custom audio components before RFQ.", "Improve drawings, tolerance notes, finish callouts, assembly features, and manufacturability for faster quoting."),
    ("manufacturing-guides", "Manufacturing Guides", "Manufacturing Guides for OEM Audio Parts | Metalcorex", "End-to-end manufacturing guides covering prototyping, tooling, production, inspection, assembly, packaging, and export.", "From prototype to production for audio components.", "Use these guides to plan process selection, sampling, production approval, QC, packaging, and international sourcing."),
    ("buying-guides", "Buying Guides", "Buying Guides for Audio OEM Manufacturing | Metalcorex", "Sourcing guides for choosing an OEM manufacturer, reducing cost, preparing RFQs, and qualifying suppliers in China.", "Buying guides for professional audio component sourcing.", "Practical sourcing checklists for speaker brands, purchasing teams, product designers, and audio engineers."),
    ("case-studies", "Case Studies", "Audio Component Manufacturing Case Studies | Metalcorex", "Case-study style manufacturing examples for speaker grilles, waveguides, amplifier housings, brackets, and molded parts.", "Realistic project examples for custom audio components.", "See how typical audio component projects move through DFM, prototyping, tooling, finishing, inspection, and export packing."),
    ("company-news", "Company News", "Metalcorex Company News and Factory Updates", "Factory updates, capability notes, process improvements, and Metalcorex news for professional audio component buyers.", "Factory updates from Metalcorex.", "Follow capability updates, process improvements, quality notes, and business news from the Metalcorex team."),
]

CATEGORY_BY_SLUG = {item[0]: item for item in CATEGORIES}

IMAGES = [
    "/assets/audio-waveguide.jpg",
    "/assets/audio-speaker-grille.jpg",
    "/assets/audio-amplifier-housing.jpg",
    "/assets/audio-metal-chassis.jpg",
    "/assets/audio-cnc-components.jpg",
    "/assets/audio-horn.jpg",
    "/assets/capability-cnc-machining.jpg",
    "/assets/capability-injection-molding.jpg",
    "/assets/capability-sheet-metal.jpg",
    "/assets/hero-manufacturing.png",
]

SERVICE_LINKS = [
    ("CNC Services", "/#capabilities"),
    ("Injection Molding", "/#capabilities"),
    ("Sheet Metal", "/#capabilities"),
    ("Speaker Waveguides", "/products.html#waveguides"),
    ("Speaker Grilles", "/products.html#grilles"),
    ("Speaker Brackets", "/products.html#brackets"),
    ("Metal Parts", "/products.html#metal-chassis"),
    ("Plastic Parts", "/products.html#plastic-frames"),
    ("Assembly", "/#capabilities"),
]


def slugify(text: str) -> str:
    chars = []
    last_dash = False
    for char in text.lower():
        if char.isalnum():
            chars.append(char)
            last_dash = False
        elif not last_dash:
            chars.append("-")
            last_dash = True
    return "".join(chars).strip("-")


def e(value: str) -> str:
    return html.escape(str(value), quote=True)


def topic(title, category, primary, secondary, intent, target, cta, cluster="audio"):
    return {
        "title": title,
        "slug": slugify(title),
        "category": category,
        "primary_keyword": primary,
        "secondary_keywords": secondary,
        "search_intent": intent,
        "target_customer": target,
        "recommended_internal_links": ["/products.html", "/#capabilities", "/#quote"],
        "recommended_cta": cta,
        "cluster": cluster,
    }


audio_titles = [
    "How Speaker Waveguides Improve Sound and Manufacturing Quality",
    "Metal vs Plastic Speaker Grilles for Professional Audio Products",
    "OEM Speaker Manufacturing: Components That Buyers Should Control",
    "Speaker Cabinet Metal Parts: Brackets, Plates, Handles, and Inserts",
    "Compression Driver Waveguide Manufacturing Guide",
    "Outdoor Speaker Components: Materials, Coatings, and Sealing Parts",
    "Injection Molding for Speakers: Horns, Frames, Trims, and Knobs",
    "Audio Hardware Manufacturing for Loudspeaker OEM Programs",
    "Aluminum Heat Sinks for Professional Audio Amplifiers",
    "Powder Coated Speaker Grilles: Design and Quality Checklist",
    "Speaker Horn Manufacturing: CNC Prototype or Injection Mold",
    "Line Array Brackets: Strength, Tolerance, and Finish Requirements",
    "Amplifier Chassis Manufacturing for Rack and Touring Equipment",
    "Plastic Speaker Frames: Tooling, Material, and Assembly Design",
    "Rubber Feet and Silicone Seals for Speaker Cabinets",
    "Custom Control Knobs for Amplifiers and Mixers",
    "Speaker Back Plates and Terminal Cup Component Manufacturing",
    "Perforated Speaker Grilles: Open Area, Strength, and Finish",
    "Waveguide Prototype Manufacturing Before Production Tooling",
    "Audio Enclosure Hardware: From Drawing to Export Packing",
    "How to Source Speaker Brackets for Installation Audio Systems",
    "Manufacturing Parts for Studio Monitors and Powered Speakers",
    "Speaker Baffle Components: Plastic, Metal, and Hybrid Designs",
    "Molded Acoustic Parts for Professional Loudspeakers",
    "CNC Aluminum Faceplates for Audio Amplifiers",
    "Sheet Metal Rear Panels for Audio Electronics",
    "Speaker Handle Hardware: Design for Load and Repeat Use",
    "OEM Audio Component Quality Control Checklist",
    "How Finish Requirements Affect Audio Component Cost",
    "Speaker Grille Packaging for Export Shipments",
    "Audio Component Assembly: Inserts, Fasteners, and Kits",
    "Designing Speaker Mounting Plates for Manufacturing",
    "Aluminum vs Steel for Speaker Cabinet Hardware",
    "Plastic Trim Rings for Speaker Systems: Tooling and Texture",
    "Professional Audio Parts That Benefit from CNC Machining",
    "When to Use Injection Molding for Speaker Component Programs",
    "How Audio Brands Can Reduce Part Variability Across Batches",
    "Designing Outdoor Audio Hardware for Corrosion Resistance",
    "Speaker Component DFM Review: What Engineers Check First",
    "Audio Product Hardware Kits: Packaging and Traceability",
    "Custom Speaker Feet: Rubber, Silicone, and TPE Options",
    "PA Speaker Cabinet Corners and Protective Hardware",
    "Manufacturing Decorative Audio Trim Without Cosmetic Defects",
    "How Acoustic Geometry Affects Waveguide Manufacturing",
    "Speaker Grille Mesh vs Perforated Sheet Metal",
    "Amplifier Heat Sink Surface Finish and Thermal Contact",
    "Audio OEM Supplier Communication: Drawings, Samples, and Revisions",
    "Manufacturing Replacement Speaker Parts for Legacy Products",
    "How to Move Speaker Parts from Prototype to Production",
    "Professional Audio Component Inspection Reports for Buyers",
    "Speaker Bracket Welding and Powder Coating Considerations",
    "CNC Machined Audio Knobs: Materials, Grip, and Finish",
    "Molded Speaker Horn Texture and Parting Line Strategy",
    "Audio Component Cost Drivers Buyers Should Understand",
    "Designing Speaker Components for Assembly Line Efficiency",
    "Custom Audio Hardware for Touring and Rental Equipment",
    "Speaker Component Supplier Qualification Checklist",
    "Engineering Review for New Loudspeaker Hardware",
    "Small Batch Speaker Parts Before Full Production Tooling",
    "Audio Component Manufacturing Terms for Purchasing Teams",
]

manufacturing_titles = [
    "CNC Machining Tolerances for Aluminum Audio Hardware",
    "DFM Checklist for CNC Machined Parts",
    "Surface Finish Options for Custom Metal Components",
    "Rapid Prototype Manufacturing for Speaker and Hardware Projects",
    "Injection Mold Tooling Basics for OEM Buyers",
    "Sheet Metal Bending Design Rules for Enclosures and Brackets",
    "Choosing Aluminum 6061, 6063, or 7075 for Custom Parts",
    "Stainless Steel vs Carbon Steel in Fabricated Components",
    "ABS vs PC vs PA for Injection Molded Components",
    "How Powder Coating Affects Sheet Metal Part Design",
    "Bead Blasting and Anodizing for Cosmetic Aluminum Parts",
    "Threaded Inserts in Plastic and Metal Components",
    "Tolerance Stack-Up in Multi-Part Assemblies",
    "CNC Prototype to Production: What Changes",
    "Designing Parts for Lower Machining Cost",
    "Laser Cutting, Bending, and Welding Workflow Explained",
    "Mold Flow and Gate Location Basics for Buyers",
    "Quality Inspection Plans for Custom Manufacturing",
    "Packaging Requirements for Exported Precision Parts",
    "Material Certificates and Inspection Documents Explained",
    "How Annual Quantity Changes the Best Manufacturing Process",
    "Selecting Surface Treatment for Outdoor Components",
    "CNC Heat Sink Manufacturing and Thermal Design Notes",
    "How to Prepare CAD Files for Faster Quotation",
    "Production Approval Samples: What Buyers Should Check",
]

buying_titles = [
    "How to Choose an OEM Manufacturer for Speaker Components",
    "How to Reduce Manufacturing Cost Without Weakening the Product",
    "China Manufacturing Guide for Professional Audio Brands",
    "RFQ Checklist for Custom Speaker and Audio Components",
    "Prototype Guide for New Audio Hardware Projects",
    "Supplier Selection for OEM Audio Component Buyers",
    "How to Compare Quotes from Custom Part Manufacturers",
    "What to Include When Uploading Drawings for RFQ",
    "How to Plan Tooling Cost for Injection Molded Speaker Parts",
    "Buying Custom Sheet Metal Parts from China",
    "How to Avoid Miscommunication in International Manufacturing",
    "When to Use One Supplier for Multi-Process Audio Parts",
    "How to Audit a Speaker Component Supplier Remotely",
    "Lead Time Planning for Custom Audio Components",
    "How to Build a Repeatable Sourcing Process for OEM Parts",
]


def build_topics():
    topics = []
    audio_categories = ["speaker-components", "audio-manufacturing", "injection-molding", "sheet-metal", "design-tips", "case-studies"]
    manufacturing_categories = ["cnc-machining", "sheet-metal", "injection-molding", "materials", "design-tips", "manufacturing-guides"]
    buying_categories = ["buying-guides", "manufacturing-guides", "audio-manufacturing"]

    for index, title in enumerate(audio_titles):
        category = audio_categories[index % len(audio_categories)]
        topics.append(topic(
            title,
            category,
            title.lower().replace(":", ""),
            ["professional audio components", "speaker parts manufacturer", "OEM audio hardware"],
            "Learn how to design, source, and manufacture professional audio components.",
            ["Speaker Manufacturers", "Professional Audio Brands", "Audio Engineers"][index % 3],
            ["Request a Quote", "Upload Drawing", "Contact Engineer", "Get DFM Review"][index % 4],
            "audio",
        ))

    for index, title in enumerate(manufacturing_titles):
        category = manufacturing_categories[index % len(manufacturing_categories)]
        topics.append(topic(
            title,
            category,
            title.lower().replace(":", ""),
            ["custom manufacturing", "DFM", "precision parts", "surface finish"],
            "Understand manufacturing decisions before requesting a quote.",
            ["Product Designers", "Purchasing Managers", "Mechanical Engineers"][index % 3],
            ["Get DFM Review", "Upload Drawing", "Request a Quote"][index % 3],
            "manufacturing",
        ))

    for index, title in enumerate(buying_titles):
        category = buying_categories[index % len(buying_categories)]
        topics.append(topic(
            title,
            category,
            title.lower().replace(":", ""),
            ["OEM supplier", "China manufacturing", "RFQ checklist", "audio component sourcing"],
            "Find and qualify a manufacturing partner for custom audio component programs.",
            ["Purchasing Managers", "Founders", "Product Managers"][index % 3],
            ["Contact Engineer", "Request a Quote", "Upload Drawing"][index % 3],
            "buying",
        ))

    company = topic(
        "How Metalcorex Supports Professional Audio Component Programs",
        "company-news",
        "Metalcorex professional audio component manufacturer",
        ["Metalcorex", "factory update", "speaker component supplier"],
        "Understand Metalcorex capability focus and RFQ workflow.",
        "Professional Audio Brands",
        "Request a Quote",
        "company",
    )
    topics.append(company)
    return topics[:100]


def article_url(post):
    return f"/blog/{post['category']}/{post['slug']}/"


def category_url(slug):
    return f"/blog/{slug}/"


def meta_description(post):
    return f"{post['title']} explained for {post['target_customer'].lower()} sourcing custom professional audio components from an OEM manufacturing partner."


def reading_minutes(text):
    words = len(text.split())
    return max(5, math.ceil(words / 220))


def header(title="Metalcorex"):
    return f"""
    <header class="site-header solid-header">
      <a class="brand" href="/" aria-label="Metalcorex home"><img class="brand-logo" src="/assets/metalcorex-logo-white.png" alt="Metalcorex"></a>
      <nav class="nav" aria-label="Main navigation">
        <a href="/#audio-components">Audio Components</a>
        <a href="/#capabilities">Capabilities</a>
        <a href="/products.html">Products</a>
        <div class="nav-item resources-nav">
          <button class="resources-toggle" type="button" aria-expanded="false">Resources</button>
          <div class="resources-menu" id="resources-menu">
            <a class="resource-menu-link" href="/blog.html">Blog</a>
            <a class="resource-menu-link" href="/materials.html">Materials</a>
            <a class="resource-menu-link" href="/surface-treatment.html">Surface Treatment</a>
          </div>
        </div>
        <a href="/#quote">RFQ</a>
      </nav>
    </header>
    """


def footer():
    return """
    <footer class="site-footer">
      <span>&copy; <span id="year"></span> Metalcorex. Professional audio component manufacturing knowledge center.</span>
      <a href="/#quote">Request a Quote</a>
    </footer>
    <script src="/script.js?v=blog-system-1"></script>
    """


def page_shell(title, description, canonical, body, extra_head="", body_class="blog-page"):
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{e(title)}</title>
    <meta name="description" content="{e(description)}">
    <link rel="canonical" href="{BASE_URL}{canonical}">
    <meta property="og:title" content="{e(title)}">
    <meta property="og:description" content="{e(description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{BASE_URL}{canonical}">
    <meta property="og:image" content="{BASE_URL}/assets/audio-waveguide.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{e(title)}">
    <meta name="twitter:description" content="{e(description)}">
    <link rel="alternate" type="application/rss+xml" title="Metalcorex Blog RSS" href="/feed.xml">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/styles.css?v=blog-system-1">
    {extra_head}
  </head>
  <body class="products-page {body_class}">
    {header(title)}
    {body}
    {footer()}
  </body>
</html>
"""


def article_body(post, index, related, previous_post=None, next_post=None, popular=None):
    image = IMAGES[index % len(IMAGES)]
    category_name = CATEGORY_BY_SLUG[post["category"]][1]
    primary = post["primary_keyword"]
    sections = [
        ("What buyers need to understand first", f"{post['title']} is not only a design topic. It is a sourcing, quality, and production-control topic. For professional audio products, a small bracket, grille, horn, waveguide, housing, or molded trim can influence assembly speed, cosmetic consistency, acoustic behavior, field durability, and final product margin. Buyers should look beyond the lowest unit price and ask how the part will be manufactured, inspected, packed, and repeated across future batches."),
        ("Manufacturing route and process selection", f"The right manufacturing route depends on annual quantity, geometry, material, finish, tolerance, and whether the part is still in prototype stage. CNC machining is useful for aluminum housings, heat sinks, prototypes, knobs, brackets, and functional samples. Sheet metal fabrication is often better for grilles, chassis, plates, panels, and installation hardware. Injection molding becomes attractive when the geometry is plastic, the volume justifies tooling, and repeat cosmetic quality matters. Metalcorex reviews these tradeoffs before quoting so the RFQ can move toward a stable production method."),
        ("Engineering details that affect cost and quality", f"Cost is usually controlled by a few engineering decisions: tolerance notes, wall thickness, undercuts, hole locations, surface finish, coating area, cosmetic class, assembly features, and packaging requirements. A drawing that marks every dimension as critical is harder to quote and inspect. A drawing that identifies only true functional interfaces helps the supplier focus measurement effort where it protects performance. For {primary}, this means separating acoustic or assembly-critical surfaces from non-critical cosmetic areas."),
        ("Quality control for repeat production", f"Professional audio brands need consistency across batches, not just one good sample. Inspection should cover critical dimensions, surface defects, thread quality, coating adhesion, color consistency, burrs, flatness, hole alignment, packaging protection, and traceability. For exported parts, photos, packing lists, commercial invoices, and clear carton labels reduce downstream friction. A useful supplier does not simply make a part; it helps prevent repeated small surprises during production and shipment."),
        ("RFQ checklist before sending drawings", "A strong RFQ should include 2D drawings, 3D files, target material, finish, quantity, annual forecast, application, visible surface requirements, tolerance priorities, packaging needs, and destination country. If the part replaces an existing supplier, include the issue you are trying to fix: cost, lead time, finish variation, packaging damage, assembly fit, or inconsistent communication. This context helps engineering teams quote the right process instead of guessing from geometry alone."),
    ]
    faq = [
        ("Can Metalcorex manufacture this type of professional audio component?", "Yes. Metalcorex manufactures custom speaker and professional audio components to customer drawings, CAD files, samples, or functional requirements."),
        ("Should I request CNC machining, sheet metal, or injection molding?", "It depends on material, geometry, quantity, tolerance, finish, and tooling budget. Send drawings for a DFM review and we can recommend the practical route."),
        ("What files help the quoting process?", "STEP, STL, PDF, DXF, DWG, material notes, finish requirements, target quantity, annual forecast, and photos of similar parts are useful."),
        ("Can you support prototypes and repeat production?", "Yes. Metalcorex supports prototypes, small batches, tooling evaluation, production runs, finishing, assembly, packaging, and export documents."),
    ]
    text_for_reading = " ".join([p for _, p in sections])
    minutes = reading_minutes(text_for_reading)
    toc = "".join(f'<li><a href="#section-{i + 1}">{e(title)}</a></li>' for i, (title, _) in enumerate(sections))
    section_html = []
    for i, (heading, paragraph) in enumerate(sections):
        section_html.append(f"""
        <section id="section-{i + 1}">
          <h2>{e(heading)}</h2>
          <p>{e(paragraph)}</p>
          <p>{e(section_practical_note(i, post))}</p>
          <p>{e(section_risk_note(i, post))}</p>
          {section_extra(i, post)}
        </section>
        """)
    related_cards = "".join(article_card(item, compact=True) for item in related[:3])
    service_links = "".join(f'<a href="{url}">{e(label)}</a>' for label, url in SERVICE_LINKS[:6])
    recent_links = "".join(f'<a href="{article_url(item)}">{e(item["title"])}</a>' for item in (popular or [])[:5])
    tag_links = "".join(f'<span>{e(tag)}</span>' for tag in post["secondary_keywords"][:4])
    prev_next = f"""
            <nav class="post-nav">
              {f'<a href="{article_url(previous_post)}"><span>Previous</span><strong>{e(previous_post["title"])}</strong></a>' if previous_post else '<span></span>'}
              {f'<a href="{article_url(next_post)}"><span>Next</span><strong>{e(next_post["title"])}</strong></a>' if next_post else '<span></span>'}
            </nav>
    """
    schema = article_schema(post, image, faq)
    return f"""
    <main>
      <article class="knowledge-article">
        <section class="blog-article-hero">
          <nav class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog.html">Blog</a><span>/</span><a href="{category_url(post['category'])}">{e(category_name)}</a></nav>
          <p class="eyebrow">{e(category_name)}</p>
          <h1>{e(post['title'])}</h1>
          <p>{e(meta_description(post))}</p>
          <div class="article-meta-line"><span>{minutes} min read</span><span>Updated {TODAY.isoformat()}</span><span>{e(post['target_customer'])}</span></div>
          <div class="share-buttons" aria-label="Share this article"><a href="https://www.linkedin.com/shareArticle?mini=true&url={BASE_URL}{article_url(post)}">LinkedIn</a><a href="https://twitter.com/intent/tweet?url={BASE_URL}{article_url(post)}">X</a><a href="mailto:?subject={e(post['title'])}&body={BASE_URL}{article_url(post)}">Email</a></div>
          <img src="{image}" alt="{e(post['title'])}" loading="eager">
        </section>
        <div class="article-shell">
          <aside class="article-sidebar">
            <div class="sidebar-card">
              <strong>Table of Contents</strong>
              <ol class="toc">{toc}</ol>
            </div>
            <div class="sidebar-card">
              <strong>Categories</strong>
              <div class="sidebar-links">{category_links()}</div>
            </div>
            <div class="sidebar-card">
              <strong>Product Links</strong>
              <div class="sidebar-links">{service_links}</div>
            </div>
            <div class="sidebar-card">
              <strong>Recent & Popular</strong>
              <div class="sidebar-links">{recent_links}</div>
            </div>
            <div class="sidebar-card">
              <strong>Tags</strong>
              <div class="tag-cloud">{tag_links}</div>
            </div>
            <div class="sidebar-card newsletter-card">
              <strong>RFQ Newsletter</strong>
              <p>Get manufacturing guides and sourcing checklists for professional audio components.</p>
              <a class="button primary full" href="/#quote">Contact Engineer</a>
            </div>
          </aside>
          <div class="blog-article-body">
            <p class="article-lede">This guide is written for engineers and purchasing teams who need practical manufacturing decisions, not generic theory. Use it to prepare a cleaner RFQ, reduce revision cycles, and discuss the part with a supplier before cost and lead time are locked.</p>
            <div class="inline-cta"><strong>Need a manufacturing review?</strong><a class="button primary" href="/#quote">Request a Quote</a><a class="button ghost" href="/#quote">Upload Drawing</a></div>
            {''.join(section_html)}
            <section id="faq">
              <h2>FAQ</h2>
              <div class="faq-list">{''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faq)}</div>
            </section>
            <section>
              <h2>Summary</h2>
              <p>{e(post['title'])} should be evaluated through engineering function, manufacturing process, tolerance strategy, finish expectations, inspection, and repeat production support. The best RFQ gives the supplier enough context to recommend a stable route instead of quoting blindly.</p>
              <div class="article-cta"><strong>Send your audio component drawings for a DFM review.</strong><div><a class="button primary" href="/#quote">Get DFM Review</a><a class="button secondary dark-text" href="mailto:sales@metalcorex.com">Contact Engineer</a></div></div>
            </section>
            <section class="author-box">
              <strong>Metalcorex Engineering Team</strong>
              <p>Metalcorex manufactures custom speaker and professional audio components including CNC machined metal parts, sheet metal grilles and chassis, injection molded speaker parts, surface finishing, assembly, packaging, and export support.</p>
            </section>
            {prev_next}
            <section>
              <h2>Related Articles</h2>
              <div class="related-grid">{related_cards}</div>
            </section>
          </div>
        </div>
      </article>
    </main>
    <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
    """


def section_extra(index, post):
    if index == 1:
        rows = [
            ("CNC machining", "Best for prototypes, aluminum hardware, heat sinks, knobs, and precise metal parts."),
            ("Sheet metal", "Best for grilles, chassis, panels, brackets, plates, and formed hardware."),
            ("Injection molding", "Best for plastic horns, frames, trims, knobs, and repeat molded production."),
        ]
        return '<table class="article-table"><thead><tr><th>Process</th><th>Typical audio component use</th></tr></thead><tbody>' + "".join(f"<tr><td>{e(a)}</td><td>{e(b)}</td></tr>" for a, b in rows) + "</tbody></table>"
    if index == 2:
        items = ["Critical dimensions and datum references", "Material and finish callouts", "Visible cosmetic surfaces", "Assembly interfaces and fastener locations", "Packaging and export requirements"]
        return '<ul class="article-checklist">' + "".join(f"<li>{e(item)}</li>" for item in items) + "</ul>"
    if index == 3:
        return '<blockquote>For professional audio components, stable repeat production is more valuable than a sample that only looks good once.</blockquote>'
    return '<figure class="article-placeholder"><span>Image placeholder</span><figcaption>Modern industrial visual: factory photo, section diagram, or component close-up for this topic.</figcaption></figure>'


def section_practical_note(index, post):
    notes = [
        f"In a real RFQ review, the first useful question is not only whether the part can be made, but whether the chosen route will remain stable when the order changes from samples to repeat production. For {post['target_customer'].lower()}, that means confirming the visible surfaces, assembly interfaces, and functional requirements before price negotiation begins.",
        "A supplier should be able to explain why a process is recommended. If CNC machining is suggested, ask which setups, tools, and inspection points drive cost. If sheet metal is suggested, ask about bend radius, flat pattern, hardware insertion, welding, and coating. If injection molding is suggested, ask about parting line, gate location, draft angle, texture, shrinkage, and tooling maintenance.",
        "The best drawing package separates critical requirements from preferences. Critical items should be measurable: hole position, fit surface, thread, coating thickness, flatness, or acoustic geometry. Preferences can be discussed as cosmetic targets or packaging expectations. This distinction helps the manufacturer avoid over-processing non-critical areas while protecting the features that affect product performance.",
        "For repeat audio component programs, quality control should be designed before the first production run. Define sample approval, first-article inspection, in-process checks, final inspection, packing inspection, photo records, and handling instructions. This is especially important for black powder-coated grilles, anodized aluminum parts, visible molded trims, and brackets used in installation or touring environments.",
        "Before sending an RFQ, include the business context. A prototype project may prioritize speed and engineering feedback. A supplier replacement project may prioritize consistency, documentation, and packaging. A cost-reduction project may prioritize tolerance review, process conversion, or material alternatives. The same CAD file can lead to different recommendations depending on the commercial goal.",
    ]
    return notes[index % len(notes)]


def section_risk_note(index, post):
    risks = [
        "A common mistake is treating every supplier quote as equivalent. Two suppliers may quote the same drawing using different assumptions about tolerance, finish, inspection, packaging, or material grade. When the quote is unclear, the lowest price may simply hide unresolved engineering questions.",
        "Another risk is approving a beautiful sample without discussing how it will be repeated. Samples are often handled carefully and inspected heavily. Production requires a clear standard that operators, inspectors, packers, and the buyer can all understand. Without that standard, small variations become disputes later.",
        "Cost problems often come from over-specified drawings. Tight tolerances, sharp internal corners, unnecessary cosmetic requirements, and unclear finish notes can add machining time, tooling complexity, scrap, or rework. A focused DFM review can often reduce cost while keeping performance unchanged.",
        "Packaging is easy to underestimate. Speaker grilles, anodized housings, powder-coated brackets, and polished trim can be damaged after inspection if packaging is weak. Export cartons, separators, protective film, labels, and pallet requirements should be discussed before production shipment.",
        "Communication drift is also a real manufacturing risk. Revision changes, alternate materials, finish samples, and delivery priorities should be recorded clearly. A good supplier confirms assumptions in writing so engineering, purchasing, and production teams are working from the same version of the requirement.",
    ]
    return risks[index % len(risks)]


def article_schema(post, image, faq):
    url = f"{BASE_URL}{article_url(post)}"
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": post["title"],
                "description": meta_description(post),
                "image": f"{BASE_URL}{image}",
                "author": {"@type": "Organization", "name": "Metalcorex Engineering Team"},
                "publisher": {"@type": "Organization", "name": "Metalcorex", "logo": {"@type": "ImageObject", "url": f"{BASE_URL}/assets/metalcorex-logo.png"}},
                "datePublished": TODAY.isoformat(),
                "dateModified": TODAY.isoformat(),
                "mainEntityOfPage": url,
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL},
                    {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE_URL}/blog.html"},
                    {"@type": "ListItem", "position": 3, "name": CATEGORY_BY_SLUG[post["category"]][1], "item": f"{BASE_URL}{category_url(post['category'])}"},
                    {"@type": "ListItem", "position": 4, "name": post["title"], "item": url},
                ],
            },
            {
                "@type": "FAQPage",
                "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq],
            },
        ],
    }


def category_links():
    return "".join(f'<a href="{category_url(slug)}">{e(name)}</a>' for slug, name, *_ in CATEGORIES)


def article_card(post, compact=False):
    cat = CATEGORY_BY_SLUG[post["category"]][1]
    image = IMAGES[hash(post["slug"]) % len(IMAGES)]
    return f"""
    <article class="blog-card knowledge-card" data-category="{e(post['category'])}" data-title="{e(post['title'].lower())}">
      <img src="{image}" alt="{e(post['title'])}" loading="lazy">
      <div>
        <p class="blog-meta">{e(cat)}</p>
        <h3>{e(post['title'])}</h3>
        <p>{e(meta_description(post))}</p>
        <a href="{article_url(post)}">Read article</a>
      </div>
    </article>
    """


def category_page(slug, posts):
    slug, name, seo_title, desc, hero, intro = CATEGORY_BY_SLUG[slug]
    featured = posts[:3]
    latest = posts[3:12]
    related_categories = [cat for cat in CATEGORIES if cat[0] != slug][:4]
    body = f"""
    <main>
      <section class="resource-hero blog-hero knowledge-hero">
        <img src="{IMAGES[len(slug) % len(IMAGES)]}" alt="{e(name)} resources for professional audio component manufacturing">
        <div class="resource-hero-content reveal">
          <nav class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog.html">Blog</a><span>/</span>{e(name)}</nav>
          <p class="eyebrow">{e(name)}</p>
          <h1>{e(hero)}</h1>
          <p>{e(intro)}</p>
          <div class="hero-actions"><a class="button primary" href="/#quote">Request a Quote</a><a class="button secondary dark-text" href="/#quote">Upload Drawing</a></div>
        </div>
      </section>
      <section class="section blog-list-section reveal">
        <div class="section-heading compact"><p class="eyebrow">Featured Articles</p><h2>Start with these {e(name.lower())} guides.</h2></div>
        <div class="blog-grid">{''.join(article_card(post) for post in featured)}</div>
      </section>
      <section class="section reveal">
        <div class="section-heading compact"><p class="eyebrow">Latest Articles</p><h2>More from {e(name)}.</h2></div>
        <div class="knowledge-list">{''.join(article_card(post, compact=True) for post in latest)}</div>
      </section>
      <section class="section reveal">
        <div class="section-heading compact"><p class="eyebrow">Related Categories</p><h2>Continue building manufacturing context.</h2></div>
        <div class="category-chip-grid">{''.join(f'<a href="{category_url(cat[0])}"><strong>{e(cat[1])}</strong><span>{e(cat[5])}</span></a>' for cat in related_categories)}</div>
      </section>
    </main>
    """
    return page_shell(seo_title, desc, category_url(slug), body, body_class="blog-page blog-category-page")


def blog_home(topics):
    featured = topics[:6]
    latest = topics[6:18]
    popular = [topics[i] for i in [0, 1, 7, 9, 12, 20]]
    recommended = [topics[i] for i in [2, 5, 14, 24, 64, 88]]
    all_articles = topics
    body = f"""
    <main>
      <section class="resource-hero blog-hero knowledge-hero">
        <img src="/assets/audio-cabinet-components.jpg" alt="Professional audio component manufacturing knowledge center">
        <div class="resource-hero-content reveal">
          <p class="eyebrow">Professional Audio Components Knowledge Center</p>
          <h1>Engineering resources for speaker brands, audio OEMs, and purchasing teams.</h1>
          <p>100 SEO articles across speaker components, audio manufacturing, CNC machining, sheet metal, injection molding, materials, DFM, buying guides, and case-study style manufacturing examples.</p>
          <div class="hero-actions"><a class="button primary" href="/#quote">Request a Quote</a><a class="button secondary dark-text" href="/#quote">Upload Drawing</a></div>
        </div>
      </section>
      <section class="section knowledge-control-panel reveal">
        <div class="section-heading compact"><p class="eyebrow">Explore Topics</p><h2>Find practical manufacturing answers faster.</h2></div>
        <div class="blog-tools">
          <input id="blogSearch" type="search" placeholder="Search speaker grilles, waveguides, CNC, molding...">
          <div class="blog-filter-row">
            <button class="blog-filter is-active" type="button" data-filter="all">All</button>
            {''.join(f'<button class="blog-filter" type="button" data-filter="{e(slug)}">{e(name)}</button>' for slug, name, *_ in CATEGORIES)}
          </div>
        </div>
      </section>
      <section class="section blog-list-section reveal"><div class="section-heading compact"><p class="eyebrow">Featured Articles</p><h2>Recommended starting points.</h2></div><div class="blog-grid blog-search-grid">{''.join(article_card(post) for post in featured)}</div></section>
      <section class="section reveal"><div class="section-heading compact"><p class="eyebrow">Latest Articles</p><h2>Recently added resources.</h2></div><div class="knowledge-list blog-search-grid">{''.join(article_card(post, compact=True) for post in latest)}</div></section>
      <section class="section reveal"><div class="section-heading compact"><p class="eyebrow">Popular Articles</p><h2>High-value pages for audio component buyers.</h2></div><div class="blog-grid">{''.join(article_card(post) for post in popular)}</div></section>
      <section class="section reveal"><div class="section-heading compact"><p class="eyebrow">Recommended Articles</p><h2>Useful before sending an RFQ.</h2></div><div class="knowledge-list">{''.join(article_card(post, compact=True) for post in recommended)}</div></section>
      <section class="section reveal" id="all-articles"><div class="section-heading compact"><p class="eyebrow">All Articles</p><h2>Complete 100-article knowledge base.</h2><p>Use the search box and category filters above to narrow the full article library.</p></div><div class="all-article-grid blog-search-grid">{''.join(article_index_card(post, i + 1) for i, post in enumerate(all_articles))}</div></section>
      <section class="section reveal"><div class="section-heading compact"><p class="eyebrow">Categories</p><h2>Build topic authority by manufacturing domain.</h2></div><div class="category-chip-grid">{''.join(f'<a href="{category_url(slug)}"><strong>{e(name)}</strong><span>{e(intro)}</span></a>' for slug, name, _, _, _, intro in CATEGORIES)}</div></section>
    </main>
    <script src="/blog.js?v=blog-system-1"></script>
    """
    return page_shell("Professional Audio Components Manufacturing Blog | Metalcorex", "Metalcorex knowledge center for professional audio components, speaker parts, CNC machining, sheet metal fabrication, injection molding, materials, design tips, and OEM buying guides.", "/blog.html", body, body_class="blog-page")


def article_index_card(post, number):
    cat = CATEGORY_BY_SLUG[post["category"]][1]
    return f"""
    <article class="article-index-card knowledge-card" data-category="{e(post['category'])}" data-title="{e(post['title'].lower())}">
      <span>{number:03d}</span>
      <div>
        <p class="blog-meta">{e(cat)}</p>
        <h3>{e(post['title'])}</h3>
        <p>{e(post['primary_keyword'])}</p>
      </div>
      <a href="{article_url(post)}">Open</a>
    </article>
    """


def topic_plan_page(topics):
    rows = "".join(f"<tr><td>{i+1}</td><td>{e(post['title'])}</td><td>{e(CATEGORY_BY_SLUG[post['category']][1])}</td><td>{e(post['primary_keyword'])}</td><td>{e(post['search_intent'])}</td><td>{e(post['target_customer'])}</td><td>{e(post['recommended_cta'])}</td></tr>" for i, post in enumerate(topics))
    body = f"""
    <main>
      <section class="resource-hero blog-hero knowledge-hero">
        <img src="/assets/audio-cnc-components.jpg" alt="Metalcorex topic authority plan">
        <div class="resource-hero-content reveal">
          <p class="eyebrow">Topic Authority Plan</p>
          <h1>100-article SEO roadmap for professional audio component manufacturing.</h1>
          <p>60% audio industry topics, 25% manufacturing topics, and 15% buying guides, structured for long-term Google topic authority.</p>
        </div>
      </section>
      <section class="section"><div class="article-table-wrap"><table class="article-table"><thead><tr><th>#</th><th>Title</th><th>Category</th><th>Primary Keyword</th><th>Search Intent</th><th>Target Customer</th><th>CTA</th></tr></thead><tbody>{rows}</tbody></table></div></section>
    </main>
    """
    return page_shell("100 Article Topic Authority Plan | Metalcorex", "SEO roadmap for Metalcorex professional audio component manufacturing blog, including keywords, search intent, target customers, and CTAs.", "/blog/topic-authority-plan/", body)


def blog_js():
    return """
const blogSearch = document.querySelector("#blogSearch");
const blogFilters = document.querySelectorAll(".blog-filter");
const blogCards = document.querySelectorAll(".knowledge-card");

const applyBlogFilters = () => {
  const active = document.querySelector(".blog-filter.is-active")?.dataset.filter || "all";
  const query = (blogSearch?.value || "").trim().toLowerCase();
  blogCards.forEach((card) => {
    const matchesCategory = active === "all" || card.dataset.category === active;
    const matchesQuery = !query || (card.dataset.title || "").includes(query) || card.textContent.toLowerCase().includes(query);
    card.hidden = !(matchesCategory && matchesQuery);
  });
};

blogFilters.forEach((button) => {
  button.addEventListener("click", () => {
    blogFilters.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    applyBlogFilters();
  });
});

blogSearch?.addEventListener("input", applyBlogFilters);
"""


def rss(topics):
    items = []
    for post in topics[:30]:
      items.append(f"""
      <item>
        <title>{e(post['title'])}</title>
        <link>{BASE_URL}{article_url(post)}</link>
        <guid>{BASE_URL}{article_url(post)}</guid>
        <description>{e(meta_description(post))}</description>
        <pubDate>{TODAY.strftime('%a, %d %b %Y')} 00:00:00 +0000</pubDate>
      </item>""")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Metalcorex Professional Audio Component Manufacturing Blog</title>
    <link>{BASE_URL}/blog.html</link>
    <description>Manufacturing resources for professional audio components, speaker parts, CNC machining, sheet metal, injection molding, and OEM sourcing.</description>
    {''.join(items)}
  </channel>
</rss>
"""


def sitemap(topics):
    urls = [
        ("/", "weekly", "1.0"),
        ("/products.html", "weekly", "0.9"),
        ("/rope-products.html", "weekly", "0.6"),
        ("/materials.html", "monthly", "0.7"),
        ("/surface-treatment.html", "monthly", "0.7"),
        ("/blog.html", "weekly", "0.9"),
        ("/blog/topic-authority-plan/", "monthly", "0.6"),
    ]
    urls += [(category_url(slug), "weekly", "0.8") for slug, *_ in CATEGORIES]
    urls += [(article_url(post), "monthly", "0.7") for post in topics]
    body = "\n".join(f'  <url><loc>{BASE_URL}{loc}</loc><lastmod>{TODAY.isoformat()}</lastmod><changefreq>{freq}</changefreq><priority>{priority}</priority></url>' for loc, freq, priority in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n'


def robots():
    return f"""User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-login
Disallow: /api/

Sitemap: {BASE_URL}/sitemap.xml
"""


def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")


def main():
    topics = build_topics()
    blog_dir = ROOT / "blog"
    if blog_dir.exists():
        shutil.rmtree(blog_dir)
    blog_dir.mkdir()

    by_category = {slug: [] for slug, *_ in CATEGORIES}
    for post in topics:
        by_category[post["category"]].append(post)

    for index, post in enumerate(topics):
        same_category = [item for item in by_category[post["category"]] if item["slug"] != post["slug"]]
        related = (same_category + topics[index + 1:index + 4] + topics[:3])[:4]
        previous_post = topics[index - 1] if index > 0 else None
        next_post = topics[index + 1] if index + 1 < len(topics) else None
        popular = topics[:8]
        content = article_body(post, index, related, previous_post, next_post, popular)
        write(ROOT / article_url(post).strip("/") / "index.html", page_shell(
            f"{post['title']} | Metalcorex",
            meta_description(post),
            article_url(post),
            content,
            body_class="blog-page blog-article",
        ))

    for slug, posts in by_category.items():
        write(ROOT / f"blog/{slug}/index.html", category_page(slug, posts))

    write(ROOT / "blog.html", blog_home(topics))
    write(ROOT / "blog/topic-authority-plan/index.html", topic_plan_page(topics))
    write(ROOT / "blog.js", blog_js())
    write(ROOT / "blog-topics.json", json.dumps(topics, indent=2, ensure_ascii=False))
    write(ROOT / "feed.xml", rss(topics))
    write(ROOT / "sitemap.xml", sitemap(topics))
    write(ROOT / "robots.txt", robots())
    print(f"Generated {len(topics)} posts, {len(CATEGORIES)} categories, sitemap, RSS, and topic plan.")


if __name__ == "__main__":
    main()
