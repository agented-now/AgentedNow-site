# Website
Brand name & domain: **agented.now**

## General
* Site will be node.js (and served locally with `npx serve` for testing), deployed on Vercel, with Vercel analytics.
* Site must be well-designed and proportioned, mobile-friendly, SEO-friendly, with site icon, social preview, og-image, modern, clean, responsive. og-image should be 1:1.19 and <300Kb to load on WA.

## Concept
* Single page site
* Clear, impressive, techy, minimal
* Each text (title, paragraphs, buttons etc) should appear in typing animation when their section reveals, one after the other according to order on the section, with a nice delay between elements for convenient reading.
* Site designed as a CLI/Claude Code style chat for (optional) personalized & interactive user experience. Icons and animations - CLI/Claude Code style.
* Site should have themes defaulted as user system theme, with a toggle in the top panel (dropdown): dark-blue, light, dark-orange.
* Show WA and email icon buttons in the top panel, with a glowing animation.
* Show section buttons in the top panel, to jump to a specific section
* Make all default texts show for Google and other search engines - even if not presented to the user.

# Sections
## Hero section
1. Site slogan - big, options rotate by over-writing in an endless loop:
    Get AI superpowers for your [engineering|marketing|sales|BizDev|product|operations|HR] team.
    Get agented. Now!
2. Subtitle: "We build <u>custom</u> <u>GenAI</u> & <u>AI Agent</u> solutions to assist employees or automate workflows."
3. Runner looping endlessly with png logos of all past clients in this order: Panaya, Natural Intelligence, Kaltura, JOINT, CBS, Ministry of Labor, Yess.ai, Swish.ai, Stampli, Adam Milo, Storywise.ai.

## Offering section
* There are endless generic GenAI & agentic solutions you can't fully customize, trust, control.
* Our solutions can be **tailored for your exact needs**:
* Animation sentences: each sentence is typed with first option, and options rotate by over-writing in an endless loop:
    * Your [data|systems|integrations|inputs]. Your [rules|terminology|business|policies].
    * Empowering your [engineers|analysts|sales|marketing|BizDev|HR] in their [workflows|tasks|operations|processes].
    * Your desired [user experience|UI (frontend)|design|format] for the [product|automation|outputs]. With [user roles|permissions|admin panel|usage logs & reports].
    * As [safe|secure|compliant] as you need it, [in the cloud|on-prem|air-gapped].
    * As [performant|cost-effective|fast|efficient|reliable|scalable] as you need it. Your [metrics|evaluation methods|benchmarks|KPIs].

## Portfolio section
* H2 title: Some of our public products
    * Our public & live AI outreach product - reach out to thousands of factories in the speed of AI! Add iframe with link to open site in a new tab: https://co-lab.dev/
    * Our agentic BI concept product - allowing business owners to directly interact with their data with no need for analysts! Add YouTube iframe: https://youtu.be/jtmxXnwVknY

* Add client runner from hero section.
* H2 title: Some of the custom solutions we built for clients
    * GenAI & agentic products for [internal research|data analysis], with [RAG|improved RAG|agentic (!)] semantic search over company materials, according to company [ workflows|guidelines|output specs].
    * An agentic product assisting system engineers in a complex internal research - to develop, analyze & troubleshoot the core product.
    * An agentic product assisting sales & marketing in preparing for conferences, presentations etc - based on company materials & guidelines, web-browsing in competitor URLs, roles, admin control etc.

## About us section
Two columns with circle photos (at /visuals/photos) for each:
* Oz Livneh (https://www.linkedin.com/in/oz-livneh) - Co-Founder, Co-CEO. Top-tier expert in GenAI & AI agents, 10+ years in AI, ex-PhD & ex-Physicist.
* Ido Livneh (https://www.linkedin.com/in/ido-livneh-il/) - Co-Founder, Co-CEO. Expert in Product & Marketing.

## Contact us section
* Title: "Let's talk about your needs!"
* WA: https://wa.me/972509567332
* Email: business@agented.now

---

## Running the Site Locally

### Prerequisites
- Node.js installed

### Installation & Run
```bash
npm install
npm start
```

Or run directly without installation:
```bash
npx serve
```

The site will be available at `http://localhost:3000` (or the port shown in terminal).