/* ============================================
   agented.now — Interactive Site (Indigo Theme)
   ============================================ */

// ============ DOM HELPERS ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============ TYPEWRITER UTILITIES ============
function typeText(element, text, speed = 40) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';
        const interval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text[i];
                i++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

function eraseText(element, speed = 25) {
    return new Promise(resolve => {
        const text = element.textContent;
        let i = text.length;
        const interval = setInterval(() => {
            if (i > 0) {
                element.textContent = text.substring(0, i - 1);
                i--;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function typewriterSwap(el, newWord, eraseSpeed = 60, typeSpeed = 70) {
    return new Promise(resolve => {
        const current = el.textContent;
        let i = current.length;
        const eraseInterval = setInterval(() => {
            if (i > 0) {
                i--;
                el.textContent = current.substring(0, i);
            } else {
                clearInterval(eraseInterval);
                let j = 0;
                const typeInterval = setInterval(() => {
                    if (j < newWord.length) {
                        j++;
                        el.textContent = newWord.substring(0, j);
                    } else {
                        clearInterval(typeInterval);
                        resolve();
                    }
                }, typeSpeed);
            }
        }, eraseSpeed);
    });
}

// ============ HERO SECTION ============
const HERO_WORDS = ['business', 'team', 'product'];
let heroRotationActive = false;

async function runHeroAnimation() {
    const line1 = document.getElementById('hero-line-1');
    const line2 = document.getElementById('hero-line-2');
    const line3 = document.getElementById('hero-line-3');
    const heroLogos = document.querySelector('.hero-logos');
    const scrollInd = document.getElementById('scroll-indicator');

    // Staggered fade-in
    await sleep(500);
    if (line1) line1.classList.add('visible');
    await sleep(600);
    if (line2) line2.classList.add('visible');
    await sleep(750);
    if (line3) line3.classList.add('visible');
    await sleep(800);

    // Show logos
    if (heroLogos) heroLogos.classList.add('visible');
    await sleep(600);

    // Show scroll indicator
    if (scrollInd) scrollInd.classList.remove('hidden');

    // Start rotation after a delay
    await sleep(2000);
    heroRotationActive = true;
    runHeroRotation();
}

async function runHeroRotation() {
    const slot = document.getElementById('hero-rotating');
    if (!slot) return;
    let idx = 1;
    while (heroRotationActive) {
        await sleep(3000);
        if (!heroRotationActive) break;
        // Fade out
        slot.classList.add('fade-out');
        await sleep(500);
        // Swap text
        slot.textContent = HERO_WORDS[idx];
        // Fade in
        slot.classList.remove('fade-out');
        idx = (idx + 1) % HERO_WORDS.length;
    }
}

// ============ WARP SPEED ANIMATION ============
const WARP = {
    STAR_COUNT: 600,
    BG: '#111118',
    STAR_COLOR: '#5b5fc7',
    GLOW_COLOR: '#5b5fc7',
    GLOW_R: 91,
    GLOW_G: 95,
    GLOW_B: 199,
    DURATION: 2500,
    FADE_OUT_START: 2000,
    SPREAD: 1600,
    Z_DEPTH: 2000,
    Z_NEAR: 1,
    TUNNEL_RINGS: 5
};

let warpCanvas, warpCtx;
let warpStars = [];
let warpAnimationId = null;
let warpTriggered = false;

function createStar() {
    return {
        x: (Math.random() - 0.5) * WARP.SPREAD,
        y: (Math.random() - 0.5) * WARP.SPREAD,
        z: Math.random() * WARP.Z_DEPTH,
        pz: 0,
        speed: 0.8 + Math.random() * 0.4
    };
}

function warpSpeedCurve(t) {
    return Math.max(0.02, Math.sin(Math.PI * t));
}

function initWarp() {
    warpCanvas = $('#warp-canvas');
    if (warpCanvas) {
        warpCtx = warpCanvas.getContext('2d');
    }
}

function startWarpAnimation() {
    if (warpTriggered || !warpCanvas) return;
    warpTriggered = true;

    // Read current theme bg for fade-out transition
    const bgHex = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#fafaf8';
    let bgR = 250, bgG = 250, bgB = 248;
    if (bgHex.startsWith('#') && bgHex.length >= 7) {
        bgR = parseInt(bgHex.slice(1, 3), 16) || 250;
        bgG = parseInt(bgHex.slice(3, 5), 16) || 250;
        bgB = parseInt(bgHex.slice(5, 7), 16) || 248;
    }

    // Size canvas
    warpCanvas.width = window.innerWidth;
    warpCanvas.height = window.innerHeight;

    // Create stars
    warpStars = [];
    for (let i = 0; i < WARP.STAR_COUNT; i++) {
        const star = createStar();
        star.pz = star.z;
        warpStars.push(star);
    }

    // Show canvas
    warpCanvas.classList.add('active');

    // Lock scrolling
    document.body.style.overflow = 'hidden';

    // Hide scroll indicator
    const ind = $('#scroll-indicator');
    if (ind) ind.classList.add('hidden');

    const startTime = performance.now();
    let lastFrame = startTime;

    // Handle resize during animation
    function onResize() {
        warpCanvas.width = window.innerWidth;
        warpCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    function frame(now) {
        const elapsed = now - startTime;
        const dt = now - lastFrame;
        lastFrame = now;

        if (elapsed >= WARP.DURATION) {
            window.removeEventListener('resize', onResize);
            endWarpAnimation();
            return;
        }

        const t = elapsed / WARP.DURATION;
        const speedFactor = warpSpeedCurve(t);
        const w = warpCanvas.width;
        const h = warpCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const focal = Math.max(w, h) * 0.5;

        // Clear
        warpCtx.fillStyle = WARP.BG;
        warpCtx.fillRect(0, 0, w, h);

        // Tunnel rings
        drawTunnelRings(cx, cy, focal, t, speedFactor, w, h);

        // Central glow
        drawCentralGlow(cx, cy, t, speedFactor, w, h);

        // Stars
        for (let i = 0; i < warpStars.length; i++) {
            const star = warpStars[i];
            star.pz = star.z;
            star.z -= dt * 2.0 * speedFactor * star.speed;

            if (star.z < WARP.Z_NEAR) {
                star.x = (Math.random() - 0.5) * WARP.SPREAD;
                star.y = (Math.random() - 0.5) * WARP.SPREAD;
                star.z = WARP.Z_DEPTH;
                star.pz = star.z;
                continue;
            }

            const sx = (star.x / star.z) * focal + cx;
            const sy = (star.y / star.z) * focal + cy;
            const px = (star.x / star.pz) * focal + cx;
            const py = (star.y / star.pz) * focal + cy;

            if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;

            drawStarStreak(sx, sy, px, py, star.z, speedFactor);
        }

        // Brand flash near peak
        if (t > 0.5 && t < 0.94) {
            const flashAlpha = Math.sin((t - 0.5) / 0.44 * Math.PI) * 0.6;
            warpCtx.fillStyle = `rgba(${WARP.GLOW_R}, ${WARP.GLOW_G}, ${WARP.GLOW_B}, ${flashAlpha})`;
            warpCtx.font = `700 ${28 + speedFactor * 16}px 'JetBrains Mono', monospace`;
            warpCtx.textAlign = 'center';
            warpCtx.textBaseline = 'middle';
            warpCtx.fillText('agented.now', cx, cy);
        }

        // Fade out (last 500ms) — transition to page bg
        if (elapsed >= WARP.FADE_OUT_START) {
            const fadeT = (elapsed - WARP.FADE_OUT_START) / (WARP.DURATION - WARP.FADE_OUT_START);
            const flashAlpha = fadeT < 0.4 ? fadeT / 0.4 : 1.0;
            warpCtx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, ${flashAlpha * 0.95})`;
            warpCtx.fillRect(0, 0, w, h);
        }

        warpAnimationId = requestAnimationFrame(frame);
    }

    warpAnimationId = requestAnimationFrame(frame);
}

function drawStarStreak(sx, sy, px, py, z, speedFactor) {
    const brightness = Math.min(1, (1 - z / WARP.Z_DEPTH) * 1.5);
    const dx = sx - px;
    const dy = sy - py;
    const streakLen = Math.sqrt(dx * dx + dy * dy);
    const lineWidth = Math.max(0.5, (1 - z / WARP.Z_DEPTH) * 3.0);
    const alpha = brightness * Math.min(1, speedFactor * 2);

    warpCtx.save();
    warpCtx.strokeStyle = WARP.STAR_COLOR;
    warpCtx.globalAlpha = alpha;
    warpCtx.lineWidth = lineWidth;
    warpCtx.lineCap = 'round';

    if (streakLen < 1.5) {
        warpCtx.beginPath();
        warpCtx.arc(sx, sy, lineWidth * 0.5, 0, Math.PI * 2);
        warpCtx.fillStyle = WARP.STAR_COLOR;
        warpCtx.fill();
    } else {
        warpCtx.beginPath();
        warpCtx.moveTo(px, py);
        warpCtx.lineTo(sx, sy);
        warpCtx.stroke();

        if (streakLen > 8) {
            warpCtx.globalAlpha = alpha * 0.6;
            warpCtx.lineWidth = lineWidth * 2.5;
            const hx = px + dx * 0.8;
            const hy = py + dy * 0.8;
            warpCtx.beginPath();
            warpCtx.moveTo(hx, hy);
            warpCtx.lineTo(sx, sy);
            warpCtx.stroke();
        }
    }

    warpCtx.restore();
}

function drawTunnelRings(cx, cy, focal, t, speedFactor, w, h) {
    for (let i = 0; i < WARP.TUNNEL_RINGS; i++) {
        const phase = ((t * 3) + (i / WARP.TUNNEL_RINGS)) % 1.0;
        const ringZ = WARP.Z_DEPTH * (1 - phase);
        if (ringZ < 10) continue;

        const worldRadius = WARP.SPREAD * 0.3;
        const screenRadius = (worldRadius / ringZ) * focal;
        const depthNorm = 1 - ringZ / WARP.Z_DEPTH;
        const ringAlpha = Math.sin(Math.PI * depthNorm) * 0.15 * speedFactor;

        if (ringAlpha < 0.005 || screenRadius < 2) continue;

        warpCtx.save();
        warpCtx.strokeStyle = WARP.GLOW_COLOR;
        warpCtx.globalAlpha = ringAlpha;
        warpCtx.lineWidth = Math.max(1, 3 * depthNorm);
        warpCtx.beginPath();
        warpCtx.arc(cx, cy, screenRadius, 0, Math.PI * 2);
        warpCtx.stroke();
        warpCtx.restore();
    }
}

function drawCentralGlow(cx, cy, t, speedFactor, w, h) {
    const maxRadius = Math.max(w, h) * 0.4;
    const radius = 40 + maxRadius * speedFactor;
    const alpha = 0.12 + 0.3 * speedFactor;

    const grad = warpCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(${WARP.GLOW_R}, ${WARP.GLOW_G}, ${WARP.GLOW_B}, ${alpha})`);
    grad.addColorStop(0.2, `rgba(${WARP.GLOW_R}, ${WARP.GLOW_G}, ${WARP.GLOW_B}, ${alpha * 0.5})`);
    grad.addColorStop(0.5, `rgba(${WARP.GLOW_R}, ${WARP.GLOW_G}, ${WARP.GLOW_B}, ${alpha * 0.1})`);
    grad.addColorStop(1, `rgba(${WARP.GLOW_R}, ${WARP.GLOW_G}, ${WARP.GLOW_B}, 0)`);

    warpCtx.save();
    warpCtx.fillStyle = grad;
    warpCtx.fillRect(0, 0, w, h);
    warpCtx.restore();

    // Core dot
    const coreAlpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 8);
    const coreRadius = 3 + 5 * speedFactor;
    warpCtx.save();
    warpCtx.fillStyle = `rgba(255, 255, 255, ${coreAlpha})`;
    warpCtx.beginPath();
    warpCtx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    warpCtx.fill();
    warpCtx.restore();
}

function endWarpAnimation() {
    if (warpAnimationId) {
        cancelAnimationFrame(warpAnimationId);
        warpAnimationId = null;
    }

    warpCanvas.classList.remove('active');
    warpCanvas.classList.add('fade-out');

    document.body.style.overflow = '';

    const offering = document.getElementById('offering');
    if (offering) {
        offering.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
        warpCanvas.classList.remove('fade-out');
        warpCanvas.width = 0;
        warpCanvas.height = 0;
    }, 600);
}

// ============ WARP SCROLL TRIGGER ============
function setupWarpTrigger() {
    let scrollLocked = false;

    function handleScroll(e) {
        const hero = document.getElementById('hero');
        if (!hero) return;
        const rect = hero.getBoundingClientRect();

        if (rect.top > -100 && rect.bottom > window.innerHeight * 0.5) {
            const isDown = e.type === 'keydown' || e.deltaY > 0 ||
                           (e.touches && e.touches.length > 0);

            if (isDown && !scrollLocked) {
                e.preventDefault();
                scrollLocked = true;

                window.removeEventListener('wheel', handleScroll, { capture: true });
                window.removeEventListener('touchmove', handleTouchScroll, { capture: true });
                window.removeEventListener('keydown', handleKeyScroll, { capture: true });

                startWarpAnimation();
            }
        }
    }

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    function handleTouchScroll(e) {
        const touchY = e.touches[0].clientY;
        if (touchStartY - touchY > 30) {
            handleScroll(e);
        }
    }

    function handleKeyScroll(e) {
        if (['Space', 'PageDown', 'ArrowDown'].includes(e.code)) {
            handleScroll(e);
        }
    }

    window.addEventListener('wheel', handleScroll, { capture: true, passive: false });
    window.addEventListener('touchmove', handleTouchScroll, { capture: true, passive: false });
    window.addEventListener('keydown', handleKeyScroll, { capture: true });
}

// ============ SINGLE-LINE TYPE INTO BOX ============
function typeIntoBox(containerEl, cursorEl, fullText, options) {
    const speed = (options && options.speed) || 20;
    if (!containerEl) return { promise: Promise.resolve(), abort: () => {} };
    if (cursorEl) cursorEl.style.visibility = 'visible';
    containerEl.innerHTML = '';
    let timeoutId = null;
    let aborted = false;
    const abort = () => {
        aborted = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (cursorEl) cursorEl.style.visibility = 'hidden';
    };
    const promise = new Promise((resolve) => {
        let i = 0;
        function tick() {
            if (aborted) return resolve();
            if (i < fullText.length) {
                containerEl.textContent = fullText.substring(0, i + 1);
                i++;
                timeoutId = setTimeout(tick, speed);
            } else {
                if (cursorEl) cursorEl.style.visibility = 'hidden';
                resolve();
            }
        }
        timeoutId = setTimeout(tick, speed);
    });
    return { promise, abort };
}

// ============ OFFERING SECTION ============
const OFFERING_INTRO = {
    employees: "Great, here's how we can help empower your employees/business:",
    products: "Excellent, here's how we can help empower your products/tech:"
};

const OFFERING_CARDS = {
    employees: [
        { title: "Consulting", description: "Helping you find teams to empower or workflows to automate with custom GenAI & agentic solutions.", icon: "consulting" },
        { title: "Building custom solutions", description: "Building custom end-to-end GenAI & agentic solutions (internal products or automations) to empower your employees or automate your workflows, tailored to your needs in every aspect.", icon: "build" },
        { title: "Customizing/selling existing products", description: "Customizing our existing generic products to fit your needs, or selling them as services.", icon: "customize" }
    ],
    products: [
        { title: "Consulting", description: "Helping you plan and implement GenAI & AI agents in your products or tech.", icon: "consulting" },
        { title: "Building custom solutions", description: "Building custom GenAI & agentic solutions to integrate with your products or tech.", icon: "build" }
    ]
};

const OFFERING_ICONS = {
    consulting: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-3.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>',
    build: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    customize: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>'
};

const OFFERING_DESC_PREVIEW_LEN = 50;

function renderOfferingCards(key) {
    const grid = $('#offeringCardsGrid');
    const cards = OFFERING_CARDS[key];
    if (!grid || !cards) return;
    grid.innerHTML = cards.map(card => {
        const desc = card.description || '';
        const preview = desc.length <= OFFERING_DESC_PREVIEW_LEN ? desc : desc.slice(0, OFFERING_DESC_PREVIEW_LEN).trim() + '...';
        return `<div class="offering-card">
            <div class="offering-card-header">
                <div class="offering-card-icon">${OFFERING_ICONS[card.icon] || OFFERING_ICONS.consulting}</div>
                <h4 class="offering-card-title">${card.title}</h4>
            </div>
            <p class="offering-card-desc-preview">${preview}</p>
        </div>`;
    }).join('');
}

function initOfferingInteraction() {
    const contentEl = $('#offeringResponseContent');
    const cursorEl = $('#offeringCursor');
    const btns = $$('#offeringOptionTitles .option-title-btn');
    let currentAbort = () => {};

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-offering');
            const intro = OFFERING_INTRO[key];
            if (!intro) return;

            currentAbort();

            btns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            renderOfferingCards(key);

            const placeholder = contentEl && contentEl.querySelector('.response-placeholder');
            if (placeholder) placeholder.remove();
            if (contentEl) contentEl.textContent = '';

            const { promise, abort } = typeIntoBox(contentEl, cursorEl, intro, { speed: 18 });
            currentAbort = abort;
            promise.then(() => { currentAbort = () => {}; });
        });
    });
}

// ============ CUSTOMIZATION SECTION ============
const CUSTOMIZATION_CONTENT = {
    security: [
        "Our solutions can be served from our/your cloud (any provider you prefer), on-prem, air-gapped.",
        "We can use open-source or proprietary models - any provider you choose.",
        "We can work remotely, on laptops you provide, or on-prem."
    ],
    workflows: [
        "We work closely with our clients to understand their exact needs, workflows, tasks, etc.",
        "We can customize any solution aspect according to client needs."
    ],
    data: [
        "We can process any data type you need.",
        "We can integrate with any system, database, API or MCP you need."
    ],
    ui: [
        "We can build products with any UI/UX you need.",
        "We can build headless solutions that simply process inputs and get outputs - APIs, automations (e.g. triggered by email) etc.",
        "We can build any outputs you need, including styled reports, interactive dashboards, etc."
    ],
    rules: [
        "We can define and enforce any business rules, terminology, policies you need.",
        "We can allow you to edit them, e.g. in a custom admin panel."
    ],
    roles: [
        "We can allow you to manage users, roles, permissions, etc.",
        "We can build a custom admin panel for you to manage users or settings, see usage stats, etc."
    ],
    performance: [
        "We can help you define your goals, metrics, benchmarks, evaluation methods.",
        "We can optimize the solution architecture for performance, efficiency, cost."
    ],
    architecture: [
        "We build the solution architecture (agentic or not) according to client needs.",
        "We are experts in LangChain, LangGraph.",
        "This allows absolute control over the solution architecture, optimizing for performance, efficiency, cost, etc."
    ]
};

function initCustomizationInteraction() {
    const contentEl = $('#customizationResponseContent');
    const cursorEl = $('#customizationCursor');
    const btns = $$('#customizationOptionTitles .option-title-btn');
    let currentAbort = () => {};

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-custom');
            const lines = CUSTOMIZATION_CONTENT[key];
            if (!lines || !contentEl) return;

            currentAbort();

            const placeholder = contentEl.querySelector('.response-placeholder');
            if (placeholder) placeholder.remove();

            btns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const { promise, abort } = typeLinesIntoBox(contentEl, cursorEl, lines);
            currentAbort = abort;
            promise.then(() => { currentAbort = () => {}; });
        });
    });
}

// ============ LOGO RUNNER (OZ-STYLE) ============
function initLogoRunner() {
    $$('.logo-track').forEach(track => {
        if (track.dataset.cloned) return;
        const items = Array.from(track.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
        track.dataset.cloned = 'true';

        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });
}

// ============ TYPE LINES INTO BOX (response box) ============
function typeLinesIntoBox(containerEl, cursorEl, lines) {
    const speed = 16;
    const lineDelay = 120;
    if (!containerEl || !lines || !lines.length) return { promise: Promise.resolve(), abort: () => {} };
    if (cursorEl) cursorEl.style.visibility = 'visible';
    containerEl.innerHTML = '';

    const textSpans = [];
    lines.forEach(text => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'typed-line';
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt-symbol';
        promptSpan.textContent = '> ';
        const textSpan = document.createElement('span');
        textSpan.className = 'typed-line-text';
        lineDiv.appendChild(promptSpan);
        lineDiv.appendChild(textSpan);
        containerEl.appendChild(lineDiv);
        textSpans.push(textSpan);
    });

    let intervalId = null;
    let aborted = false;
    const abort = () => {
        aborted = true;
        if (intervalId) clearInterval(intervalId);
        if (cursorEl) cursorEl.style.visibility = 'hidden';
    };

    const promise = new Promise(resolve => {
        const progress = lines.map(() => 0);
        const startTime = Date.now();
        function tick() {
            if (aborted) return resolve();
            const elapsed = Date.now() - startTime;
            let anyProgress = false;
            for (let i = 0; i < lines.length; i++) {
                if (elapsed >= i * lineDelay && progress[i] < lines[i].length) {
                    progress[i]++;
                    anyProgress = true;
                }
                textSpans[i].textContent = lines[i].substring(0, progress[i]);
            }
            if (!anyProgress && progress.every((p, i) => p === lines[i].length)) {
                if (intervalId) clearInterval(intervalId);
                if (cursorEl) cursorEl.style.visibility = 'hidden';
                return resolve();
            }
        }
        intervalId = setInterval(tick, speed);
    });
    return { promise, abort };
}

// ============ SECTION REVEAL ON SCROLL ============
function setupScrollReveal() {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                section.classList.add('visible');
                revealSectionItems(section);
                sectionObserver.unobserve(section);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    $$('.content-section').forEach(section => {
        sectionObserver.observe(section);
    });
}

function revealSectionItems(section) {
    const items = section.querySelectorAll('.reveal-item');
    items.forEach((item, i) => {
        setTimeout(() => {
            item.classList.add('revealed');
        }, i * 250);
    });

}

// ============ NAVIGATION (Oz-style) ============
function initNavigation() {
    const navLinks = $$('.nav-link, .mobile-link');
    const sections = $$('section[id]');

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Close mobile menu
                const mobileMenu = document.getElementById('mobileMenu');
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                if (mobileMenu) mobileMenu.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            }
        });
    });

    // Active link tracking on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    const linkSection = link.getAttribute('data-section');
                    if (linkSection === sectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
}

// ============ MOBILE MENU ============
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            btn.classList.remove('active');
            menu.classList.remove('active');
        }
    });
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    initWarp();
    initNavigation();
    initMobileMenu();
    setupScrollReveal();
    initLogoRunner();
    initOfferingInteraction();
    initCustomizationInteraction();

    // Start hero animation, then arm warp trigger
    setTimeout(() => {
        runHeroAnimation().then(() => {
            setupWarpTrigger();
        });
    }, 500);
});
