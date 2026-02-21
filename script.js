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
const HERO_VARIATIONS = [
    { slot1: '10\u00D7 the output',   slot2: 'No new headcount' },
    { slot1: 'Half the errors',       slot2: 'No quality tradeoff' },
    { slot1: '3\u00D7 the speed',     slot2: 'No added complexity' }
];
const HERO_CLOSING = 'Custom AI agents. Built for you. Deployed your way.';
let heroRotationActive = false;

async function runHeroAnimation() {
    const slot1El = $('#hero-slot1');
    const slot2El = $('#hero-slot2');
    const row1 = $('.hero-row-1');
    const row2 = $('.hero-row-2');
    const row3 = $('.hero-row-3');
    const closingLine = $('#hero-closing-line');
    const closingEl = $('#hero-closing');

    // Set all text upfront so layout space is reserved from the start
    slot1El.textContent = HERO_VARIATIONS[0].slot1;
    slot2El.textContent = HERO_VARIATIONS[0].slot2;
    closingEl.textContent = HERO_CLOSING;

    // Staggered reveal: row 1 → row 2 → row 3
    await sleep(500);
    row1.classList.add('visible');
    await sleep(600);
    row2.classList.add('visible');
    await sleep(600);
    row3.classList.add('visible');
    await sleep(800);

    // Fade in closing line smoothly
    closingLine.classList.add('visible');
    await sleep(900);

    // Show scroll indicator
    $('#scroll-indicator').classList.remove('hidden');

    // Start rotation
    await sleep(2000);
    heroRotationActive = true;
    runHeroRotation();
}

async function runHeroRotation() {
    const slot1El = $('#hero-slot1');
    const slot2El = $('#hero-slot2');
    let idx = 1;
    while (heroRotationActive) {
        await sleep(3000);
        if (!heroRotationActive) break;
        // Fade out both slots
        slot1El.classList.add('fade-out');
        slot2El.classList.add('fade-out');
        await sleep(500);
        // Swap text
        slot1El.textContent = HERO_VARIATIONS[idx].slot1;
        slot2El.textContent = HERO_VARIATIONS[idx].slot2;
        // Fade in
        slot1El.classList.remove('fade-out');
        slot2El.classList.remove('fade-out');
        idx = (idx + 1) % HERO_VARIATIONS.length;
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

// ============ SOLUTION ROTATIONS ============
const SOLUTION_ROTATIONS = {
    'sol-0-0': ['internal research', 'data analysis'],
    'sol-0-1': ['RAG', 'improved RAG', 'agentic (!)'],
    'sol-0-2': ['workflows', 'guidelines', 'output specs']
};

let solutionRotationTimeouts = [];

function startSolutionRotations() {
    solutionRotationTimeouts.forEach(id => clearTimeout(id));
    solutionRotationTimeouts = [];

    Object.keys(SOLUTION_ROTATIONS).forEach((group, groupIdx) => {
        const el = $(`.rotating-word[data-group="${group}"]`);
        if (!el) return;

        const words = SOLUTION_ROTATIONS[group];
        let currentIdx = 0;

        async function rotate() {
            currentIdx = (currentIdx + 1) % words.length;
            await typewriterSwap(el, words[currentIdx]);
            const tid = setTimeout(rotate, 3500 + groupIdx * 500);
            solutionRotationTimeouts.push(tid);
        }

        const initialId = setTimeout(rotate, 5000 + groupIdx * 800);
        solutionRotationTimeouts.push(initialId);
    });
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

    // Pillar line reveals + slot rotations for solution section
    if (section.id === 'solution') {
        const pillarLines = section.querySelectorAll('.pillar-line');
        pillarLines.forEach((line, i) => {
            setTimeout(() => {
                line.classList.add('revealed');
            }, (items.length * 250) + (i * 200));
        });

        setTimeout(() => {
            startPillarRotations();
        }, (items.length * 250) + 1000);
    }

    // Solution rotations for proof section
    if (section.id === 'proof') {
        setTimeout(() => {
            startSolutionRotations();
        }, items.length * 250 + 500);
    }
}

// ============ NAV SMOOTH SCROLL ============
function setupNavLinks() {
    $$('.nav-section-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    initWarp();
    setupNavLinks();
    setupScrollReveal();

    // Start hero animation, then arm warp trigger
    setTimeout(() => {
        runHeroAnimation().then(() => {
            setupWarpTrigger();
        });
    }, 500);
});
