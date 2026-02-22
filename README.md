# Website
Brand name & domain: **agented.now**

## General
* Site will be node.js (and served locally with `npx serve` for testing), deployed on Vercel, with Vercel analytics.
* Site must be well-designed and proportioned, mobile-friendly.
* Site must be SEO-optimized, with site icon, social preview, og-image, modern, clean, responsive. og-image should be 1:1.19 and <300Kb to load on WA.

## Concept
* Single page site (home page)
* Style: techy, clean, minimal, inspired by CLI chatbot and computer game interfaces.
* Each text (title, paragraphs, buttons etc) should appear in a typing animation when their section reveals, one > line after the other, with a nice delay between elements for convenient reading.
* Site should have themes, starting the site in same theme as the user system theme, with a toggle in the top panel (dropdown): dark, light.
* Show WA and email icon buttons in the top panel, with a glowing animation.
* Show section buttons in the top panel, to jump to a specific section. Each section should have a url (that should update when scrolling to it), e.g. domain/home, agented.now/about-us, agented.now/contact etc.

# Sections
## Hero section (/home)
1. Site slogan - big, options rotate by re-typing (don't delete, just overwrite) in an endless loop:
    Get <u>custom</u> <u>GenAI</u> & <u>AI agent</u> solutions
    to empower your **[employees|products|business]**.
    Get **agented**.**now**
2. Runner title: "We've helped many satisfied clients in [cyber|hi-tech|government|fin-tech|HR-tech|med-tech]"
3. Runner looping endlessly with png logos of all past clients in this order: Panaya, Kaltura, Natural Intelligence, Stampli, Adam Milo, Ministry of Labor, CBS, Yess.ai, Swish.ai, Storywise.ai.
4. Arrows >>> to invite scrolling down, as arrows in a game. If clicked - scroll to the next section.

## Our offering section (/offering)
1. Title: We're experts in <u>custom</u> <u>GenAI</u> & <u>AI agents</u>.
2. User interaction: "I'm interested in:" with horizontal options (with a relevant icon for each), clicking each makes it selected and type chatbot answer, but keeps the other options selectable for changing (bullets = boxes with icon and title that expand on hover to show the description):
    * Empowering our employees/business:
        * Consulting: Helping you to find teams to empower or workflows to automate with custom GenAI & agentic solutions.
        * Building custom solutions: Building custom end-to-end GenAI & agentic solutions (internal products or automations) to empower your employees or automate your workflows, tailored to your needs in every aspect.
        * Customizing/selling existing products: Customizing our existing generic products to fit your needs, or selling them as services. 
    * Empowering our products/tech:
        * Consulting: Helping you to plan and implement GenAI & AI agents in your products or tech.
        * Building custom solutions: Building custom GenAI & agentic solutions to integrate with your products or tech.

## Customization section (/customization)
1. Title:
    We offer GenAI & agentic solutions you can **fully customize, control and trust**.

2. User interaction: "I'm interested in customizing:" with list options that keep the others selectable:
    * Security/compliance:
        * Our solutions can be served from our/your cloud (any provider you prefer), on-prem, air-gapped.
        * We can use open-source or proprietary models - any provider you choose.
        * We can work remotely, on laptops you provide, or on-prem.
    * Workflows/tasks:
        * We work closely with our clients to understand their exact needs, workflows, tasks, etc.
        * We can customize any solution aspect according to client needs.
    * Data/integrations:
        * We can process any data type you need.
        * We can integrate with any system, database, API or MCP you need.
    * UI/UX/outputs:
        * We can build products with any UI/UX you need.
        * We can build headless solutions that simply process inputs and get outputs - APIs, automations (e.g. triggered by email) etc.
        * We can build any outputs you need, including styled reports, interactive dashboards, etc.
    * Rules/terminology/policies:
        * We can define and enforce any business rules, terminology, policies you need.
        * We can allow you to edit them, e.g. in a custom admin panel.
    * Roles/permissions/admin panel/stats:
        * We can allow you to manage users, roles, permissions, etc.
        * We can build a custom admin panel for you to manage users or settings, see usage stats, etc.
    * Performance/efficiency/cost:
        * We can help you define your goals, metrics, benchmarks, evaluation methods.
        * We can optimize the solution architecture for performance, efficiency, cost.
    * Solution architecture:
        * We build the solution architecture (agentic or not) according to client needs.
        * We are experts in LangChain, LangGraph.
        * This allows absolute control over the solution architecture, optimizing for performance, efficiency, cost, etc.

## Portfolio section
* H2 title: Selected public products
    * Our public & live AI outreach product - reach out to thousands of factories in the speed of AI! Add iframe with link to open site in a new tab: https://co-lab.dev/
    * Our agentic BI concept product - allowing business owners to directly interact with their data with no need for analysts! Add YouTube iframe: https://youtu.be/jtmxXnwVknY

* H2 title: Selected custom solutions for clients - boxes that can expand on hover to show the description:
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