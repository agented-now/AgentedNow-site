# Company Overview
Brand name & domain: **agented.now**

We build **custom** GenAI & **agentic** B2B products (SaaS apps, tools etc), end-to-end, allowing **total control & customization** over all product aspects according to client needs.

* We have top talent in GenAI (LLMs), especially (custom) AI agents, usually complex ones that require LangGraph etc
* We have top talent in vibe coding:
    * Faster & cheaper by orders of magnitude compared to traditional software development.
    * Much more flexible: easy to improve, add features, maintain.

## Our focus/preference
* Building custom agentic internal SaaS apps, to assist employees in complex tasks.
* Per-hour pricing, working hand-2-hand and end-2-end:
    1. Defining & planning the product, benchmark (examples), metrics & evaluation.
    2. Step-by-step R&D, building POCs from MVP to full product - e.g. starting with a naive Claude Code POC and moving to a custom agentic app with more and more features.
* Our champion is usually the CTO / VP Engineering, sometimes VP Product.
* Our previous clients were Israeli startups and companies that want to move fast and have a proper budget for it, e.g. ~$20-50k/app, and sometimes with special requirements, especially in cyber or homeland security (requiring strict security, compliance, IP protection, etc).
* We want to expand abroad, especially US, with ~50-100k/app.

## Examples of great projects we did
* A complex custom agentic app (first CLI, then GUI) for internal research of system logs for system engineers to troubleshoot & develop the system:
    * Logs were huge, so the agent analyzed them by generating and executing Python code.
    * Agent was integrated with app and UI - to show results interactively, log app actions and events etc.
    * Complex knowledge management across users, roles, permissions, etc.
    * Very sensitive:
        * Using open-source models on private machines, and although weak - we squeezed performance by controlling the agentic architecture.
        * The agent was properly isolated & restricted, unsafe operations needed user confirmation.
* A custom agentic app for sales & marketing:
    * Finding relevant sources and answering user requests according to company guidelines & terminology - writing summaries/points before meetings/conferences, explaining strengths against competitors...
    * A complex custom agent with tools: semantic search (agent can decide queries, extend results), grep, get more/all pages including visual, web searching & scraping.
    * Admin control over data, guidelines for users, usage stats etc.
    * Customization of output format, linking to materials and allowing preview and download.
    * Safe for sensitive data - using user cloud environment for LLM/embedding models, app serving etc.
    * Shelf products like AskGuru did not allow full customization for client needs and requirements, and were not reliable enough.
* A complex custom agentic BI app, for internal data analysis by business owners (skipping analysts):
    * Agent generated & executed Python code for efficient high-level data analysis.
    * Agent was integrated with app and UI - to create interactive widgets on a BI canvas. We invented the method for the agent to create code that plots into the UI, efficiently and accurately (directly from the data).

## Why GenAI & AI agents?
* Increasing profitability, competitiveness: do more and/or faster with existing/less resources.
* Improve employee experience, satisfaction, retention.
* Report on AI investments, ROI, etc.

## GenAI automations vs agentic products
* GenAI automations save "lots of cheap time" - use AI models (LLMs) in fixed workflows to perform tasks that are not necessarily complex but time-consuming or repetitive, e.g.:
    * Data extraction, processing, classification, cleaning, etc
    * Generating fixed content, reports, summaries, etc
    * (Simple) search & analysis of custom data
* GenAI automations can have UI, or even be headless - e.g. run on each email...

* AI agents are autonomous intelligent programs that can perform complex intelligent tasks with no fixed workflow - by interacting with the user and system (tools), reasoning and making decisions, retrying failed attempts.
    * Research & analysis of complex internal data, e.g. of system engineers, business analysts, etc.
    * Chatting with complex data, company materials, preparing custom outputs etc.
* Agentic products integrate agents with UX/UI for optimal experience.

## Why custom products?
We build end-2-end, allowing total control & customization over all product aspects:
    * Functionality, features, integrations, etc
    * UX/UI, design, branding, etc
    * Performance, efficiency, cost, time
    * Security, IP - we can use open-source models, on-prem etc

This allows total customization to the client's exact needs:
    * Tasks/workflows/processes
    * Data & inputs
    * Business rules, terminology etc
    * Formats, outputs
    * User roles, permissions, etc


# Website
## General
* Site will be node.js (and served locally with `npx serve` for testing), deployed on Vercel, add Vercel analytics.
* Site must be well-designed and proportioned, mobile-friendly, SEO-friendly, with site icon, social preview, og-image, modern, clean, responsive. og-image should be 1:1.19 and <300Kb to load on WA.

## Concept
* Single page site
* Clear, impressive, techy, minimal
* Each text (title, paragraphs, buttons etc) should appear in typing animation when their section reveals (by order, with a nice delay between elements for convenient reading)
* Site designed as a CLI/Claude Code style chat for (optional) personalized & interactive user experience. Icons and animations - CLI/Claude Code style.
* Each interaction appears with options where the first is highlighted, to choose by clicking - or keyboard (for desktop view). After choosing, the option becomes "written" by the user (in a chat box), with an edit button next to it. Then the next elements are typed with auto-scrolling down, until reaching the next interaction - that waits for the user to respond.
* If the user scrolls down - the current interaction scrolls up until minimized into a line frozen for later - can be scorlled up or clicked to reveal it again.
* Site should have themes defaulted as user system theme, with a toggle in the top panel: dark, light, orange, blue.
* Show email, WA and LI buttons in the top panel.
* Show section buttons in the top panel, to jump to a specific section
* Make all default texts show for Google and other search engines - even if not presented to the user.

1. Main slogan idea (can improve): Get your team AI superpowers. Get agented. Now.
3. Main animation: 
    a. Fixed titles: "We build **custom** GenAI & **agentic** products:"
    b. Customization ideas (decreasing importance): each typed, paused, then deleted and a new one is typed instead, e.g.:
        * Your data. Your workflows. Your UX/UI. Your rules.
        * For your engineers? Analysts? Sales & marketing? BizDev? HR?
        * In the cloud? On-prem? Air-gapped? Open-source models?
        * Integrated in your product? An internal tool? An automation? MCP?
        * Your success criteria - performance, cost, time. Your metrics, evaluation.
    c. Final title: "We can build it tailored for you!\nWe can also help you plan it - from POCs to MVP to full product".
3. Interaction: Our site can be customized for you!
    * Great, I'd like a personalized & interactive experience!
    * For now I just want to scroll through a static site, no further interactions.
    (this chooses the defaults for all interactions, adds all sections to page, and the user can scroll through them, each section reveals in typing animations for all elements)
4. Interaction: Great! First, your convenience. What's most comfortable for your eyes?
    * [User system's default theme]
    * the rest of the themes
5. Interaction: May I know your first name?
    * Text input field
    * Thanks, I'd consider supplying my name later (this skips next part)
6. Hi [name], I'm happy to assist you!
7. What would you like to know?
    (this is the final section, with option names of the remaining sections, including "I'd like to contact you". When each is clicked - its section is typed. invent optimal section order, titles, texts!)

## Contact buttons
* Email: contact@agented.now
* WA: https://wa.me/972509567332
* LI: https://www.linkedin.com/in/agented.now



