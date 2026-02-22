/* ============================================
   agented.now — 1-2-3 Framework Interactive Site
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
const HERO_WORDS = ['product', 'team', 'business'];
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
    await sleep(600);
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
    BG: '#0a1a10',
    STAR_COLOR: '#f0d060',
    GLOW_COLOR: '#f0d060',
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

    // Stop hero rotation
    heroRotationActive = false;

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

        // Brand flash near peak (delayed, longer hold)
        if (t > 0.5 && t < 0.94) {
            const flashAlpha = Math.sin((t - 0.5) / 0.44 * Math.PI) * 0.6;
            warpCtx.fillStyle = `rgba(240, 208, 96, ${flashAlpha})`;
            warpCtx.font = `700 ${28 + speedFactor * 16}px 'JetBrains Mono', monospace`;
            warpCtx.textAlign = 'center';
            warpCtx.textBaseline = 'middle';
            warpCtx.fillText('agented.now', cx, cy);
        }

        // Fade out (last 500ms)
        if (elapsed >= WARP.FADE_OUT_START) {
            const fadeT = (elapsed - WARP.FADE_OUT_START) / (WARP.DURATION - WARP.FADE_OUT_START);
            const flashAlpha = fadeT < 0.4 ? fadeT / 0.4 : 1.0;
            warpCtx.fillStyle = `rgba(10, 26, 16, ${flashAlpha * 0.95})`;
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
    grad.addColorStop(0, `rgba(240, 208, 96, ${alpha})`);
    grad.addColorStop(0.2, `rgba(240, 208, 96, ${alpha * 0.5})`);
    grad.addColorStop(0.5, `rgba(240, 208, 96, ${alpha * 0.1})`);
    grad.addColorStop(1, 'rgba(240, 208, 96, 0)');

    warpCtx.save();
    warpCtx.fillStyle = grad;
    warpCtx.fillRect(0, 0, w, h);
    warpCtx.restore();

    // Core dot
    const coreAlpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 8);
    const coreRadius = 3 + 5 * speedFactor;
    warpCtx.save();
    warpCtx.fillStyle = `rgba(255, 255, 240, ${coreAlpha})`;
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

    const solution = document.getElementById('solution');
    if (solution) {
        solution.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// ============ PILLAR SLOT ROTATIONS ============
const PILLAR_1_WORDS = ['data', 'rules', 'people'];
const PILLAR_2_WORDS = ['infrastructure', 'security', 'visibility'];

function startPillarRotations() {
    const slot1 = $('#pillar-slot-1');
    const slot2 = $('#pillar-slot-2');
    if (!slot1 || !slot2) return;

    let idx1 = 1;
    let idx2 = 1;

    setInterval(async () => {
        slot1.classList.add('fade-out');
        await sleep(400);
        slot1.textContent = PILLAR_1_WORDS[idx1];
        slot1.classList.remove('fade-out');
        idx1 = (idx1 + 1) % PILLAR_1_WORDS.length;
    }, 3000);

    setInterval(async () => {
        slot2.classList.add('fade-out');
        await sleep(400);
        slot2.textContent = PILLAR_2_WORDS[idx2];
        slot2.classList.remove('fade-out');
        idx2 = (idx2 + 1) % PILLAR_2_WORDS.length;
    }, 3000);
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

// ============ SOLUTION INTERACTION ============
const SOLUTION_CONTENT = {
    tailored: [
        "Your data. Your systems. Your integrations.",
        "Your rules. Your terminology. Your compliance.",
        "Your teams — engineers, sales, HR, each using it their way."
    ],
    managed: [
        "Cloud, on-prem, or air-gapped.",
        "Secure & compliant to your standards.",
        "Admin panel, user roles, permissions.",
        "Usage monitoring, metrics, KPIs."
    ]
};

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

function initSolutionInteraction() {
    const contentEl = $('#solutionResponseContent');
    const cursorEl = $('#solutionCursor');
    const btns = $$('#solutionOptionTitles .option-title-btn');
    let currentAbort = () => {};

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-solution');
            const lines = SOLUTION_CONTENT[key];
            if (!lines || !contentEl) return;

            currentAbort();

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

    // Start pillar slot rotations for solution section
    if (section.id === 'solution') {
        setTimeout(() => {
            startPillarRotations();
        }, items.length * 250 + 500);
    }

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
    initSolutionInteraction();

    // Start hero animation, then arm warp trigger
    setTimeout(() => {
        runHeroAnimation().then(() => {
            setupWarpTrigger();
        });
    }, 500);
});
