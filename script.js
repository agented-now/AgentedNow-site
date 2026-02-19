/* ============================================
   agented.now — Interactive CLI-Style Website
   ============================================ */

// ============ CONTENT BY ROLE ============
const ROLE_CONTENT = {
    ceo: {
        offeringTitle: 'Tailored for Your Business',
        lines: [
            {
                template: 'Your {0}. Your {1}.',
                rotations: [
                    ['revenue streams', 'market position', 'growth trajectory', 'bottom line'],
                    ['strategy', 'vision', 'competitive advantage', 'business model']
                ]
            },
            {
                template: 'Empowering your {0} in their {1}.',
                rotations: [
                    ['leadership team', 'organization', 'departments', 'business units'],
                    ['decision-making', 'strategy execution', 'operations', 'planning']
                ]
            },
            {
                template: 'As {0} as you need it, {1}.',
                rotations: [
                    ['profitable', 'competitive', 'scalable', 'transformative'],
                    ['in the cloud', 'on-prem', 'enterprise-grade', 'globally deployed']
                ]
            }
        ]
    },
    cto: {
        offeringTitle: 'Engineered for Your Stack',
        lines: [
            {
                template: 'Your {0}. Your {1}.',
                rotations: [
                    ['APIs', 'infrastructure', 'databases', 'data pipelines'],
                    ['architecture', 'protocols', 'standards', 'tech stack']
                ]
            },
            {
                template: 'Empowering your {0} in their {1}.',
                rotations: [
                    ['developers', 'engineers', 'DevOps teams', 'data scientists'],
                    ['development cycles', 'deployments', 'system design', 'code reviews']
                ]
            },
            {
                template: 'As {0} as you need it, {1}.',
                rotations: [
                    ['secure', 'compliant', 'resilient', 'hardened'],
                    ['in Kubernetes', 'on-prem', 'hybrid cloud', 'air-gapped']
                ]
            }
        ]
    },
    other: {
        offeringTitle: 'Built for Your Needs',
        lines: [
            {
                template: 'Your {0}. Your {1}.',
                rotations: [
                    ['data', 'systems', 'integrations', 'inputs'],
                    ['rules', 'terminology', 'business', 'policies']
                ]
            },
            {
                template: 'Empowering your {0} in their {1}.',
                rotations: [
                    ['engineers', 'analysts', 'sales teams', 'marketing'],
                    ['workflows', 'tasks', 'operations', 'processes']
                ]
            },
            {
                template: 'As {0} as you need it, {1}.',
                rotations: [
                    ['performant', 'cost-effective', 'fast', 'efficient'],
                    ['metrics', 'evaluation methods', 'benchmarks', 'KPIs']
                ]
            }
        ]
    }
};

const HERO_ROTATING_WORDS = [
    'your team AI superpowers',
    'your work done faster & smoother',
    'agented. Now'
];

const HERO_SUBTITLE = 'We build custom GenAI & agentic solutions to assist employees or automate workflows.';
const ROLE_PROMPT = "I'd love to personalize your experience. What's your role?";

// ============ STATE ============
let appState = 'INIT'; // INIT | HERO_TYPING | ROLE_SELECT | ANIMATING | REVEALING | COMPLETE
let selectedRole = null;
let selectedIndex = 0;
let experienceMode = null; // 'agentic' | 'regular'
let heroRotationInterval = null;
let offeringRotationIntervals = [];
let scrollListenerActive = false;

// ============ DOM REFS ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============ TYPEWRITER ============
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

// ============ HERO ANIMATION ============
async function runHeroAnimation() {
    appState = 'HERO_TYPING';
    const rotatingEl = $('#hero-rotating');
    const cursorEl = $('#hero-cursor');

    // Type through rotating words
    for (let i = 0; i < HERO_ROTATING_WORDS.length; i++) {
        await typeText(rotatingEl, HERO_ROTATING_WORDS[i], 45);
        await sleep(1200);

        if (i < HERO_ROTATING_WORDS.length - 1) {
            await eraseText(rotatingEl, 20);
            await sleep(300);
        }
    }

    // After last word, pause then continue
    await sleep(600);

    // Hide hero cursor
    cursorEl.style.display = 'none';

    // Show subtitle
    const subtitleLine = $('#hero-subtitle-line');
    subtitleLine.classList.remove('hidden');
    subtitleLine.style.display = 'flex';
    await typeText($('#hero-subtitle'), HERO_SUBTITLE, 30);

    await sleep(500);

    // Show role prompt
    const rolePromptLine = $('#role-prompt-line');
    rolePromptLine.classList.remove('hidden');
    rolePromptLine.style.display = 'flex';
    await typeText($('#role-prompt-text'), ROLE_PROMPT, 35);

    await sleep(400);

    // Show role selector
    appState = 'ROLE_SELECT';
    const roleSelector = $('#role-selector');
    roleSelector.classList.remove('hidden');
    roleSelector.style.display = 'block';

    // Show scroll indicator
    const scrollInd = $('#scroll-indicator');
    scrollInd.classList.remove('hidden');

    // Enable scroll listener for skip
    enableScrollSkip();

    // Focus for keyboard events
    document.addEventListener('keydown', handleRoleKeyboard);
}

// ============ ROLE SELECTOR ============
function handleRoleKeyboard(e) {
    if (appState !== 'ROLE_SELECT') return;

    const options = $$('.role-option');

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        options[selectedIndex].classList.remove('selected');
        selectedIndex = (selectedIndex + 1) % options.length;
        options[selectedIndex].classList.add('selected');
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        options[selectedIndex].classList.remove('selected');
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        options[selectedIndex].classList.add('selected');
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const role = options[selectedIndex].dataset.role;
        selectRole(role, 'agentic');
    }
}

// Click/tap handlers for role options
document.addEventListener('DOMContentLoaded', () => {
    $$('.role-option').forEach((opt, i) => {
        opt.addEventListener('click', () => {
            if (appState !== 'ROLE_SELECT') return;
            // Update visual selection
            $$('.role-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedIndex = i;
            selectRole(opt.dataset.role, 'agentic');
        });
    });
});

async function selectRole(role, mode) {
    if (appState !== 'ROLE_SELECT') return;
    appState = 'ANIMATING';
    selectedRole = role;
    experienceMode = mode;

    // Remove keyboard listener
    document.removeEventListener('keydown', handleRoleKeyboard);
    disableScrollSkip();

    // Hide scroll indicator
    $('#scroll-indicator').classList.add('hidden');

    // Show confirmed selection
    const confirmedLine = $('#role-confirmed-line');
    confirmedLine.classList.remove('hidden');
    confirmedLine.style.display = 'flex';
    $('#role-confirmed-text').textContent = role.toUpperCase();

    // Hide role selector
    $('#role-selector').style.display = 'none';

    await sleep(500);

    if (mode === 'agentic') {
        // Play 3D road animation
        await playRoadAnimation();
    }

    // Populate and reveal sections
    populateOffering(role);
    addNavSections();
    revealSections();
}

// ============ SCROLL-TO-SKIP ============
function enableScrollSkip() {
    scrollListenerActive = true;
    window.addEventListener('wheel', onScrollSkip, { passive: false });
    window.addEventListener('touchmove', onTouchSkip, { passive: false });
}

function disableScrollSkip() {
    scrollListenerActive = false;
    window.removeEventListener('wheel', onScrollSkip);
    window.removeEventListener('touchmove', onTouchSkip);
}

function onScrollSkip(e) {
    if (appState !== 'ROLE_SELECT' || !scrollListenerActive) return;
    if (e.deltaY > 20) {
        // User scrolled down — trigger regular CEO experience
        selectRole('ceo', 'regular');
    }
}

let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

function onTouchSkip(e) {
    if (appState !== 'ROLE_SELECT' || !scrollListenerActive) return;
    const touchY = e.touches[0].clientY;
    if (touchStartY - touchY > 40) {
        selectRole('ceo', 'regular');
    }
}

// ============ 3D ROAD ANIMATION ============
function playRoadAnimation() {
    return new Promise(resolve => {
        const overlay = $('#road-overlay');
        const canvas = $('#road-canvas');

        overlay.classList.remove('hidden');
        overlay.style.display = 'block';
        overlay.style.opacity = '1';

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Stars
        const stars = Array.from({ length: 250 }, () => ({
            x: (Math.random() - 0.5) * 2500,
            y: (Math.random() - 0.5) * 2500,
            z: Math.random() * 2000
        }));

        // Grid horizontal lines
        const gridH = Array.from({ length: 50 }, (_, i) => ({
            z: i * 100
        }));

        const startTime = performance.now();
        const duration = 3000;

        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const speed = 4 + progress * 25;

            // Clear with motion trail
            ctx.fillStyle = `rgba(7, 8, 12, ${0.15 + progress * 0.05})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Vertical perspective lines (road edges)
            const numVLines = 24;
            ctx.lineWidth = 1;
            for (let i = -numVLines / 2; i <= numVLines / 2; i++) {
                const spread = Math.abs(i) / (numVLines / 2);
                const alpha = 0.08 + (1 - spread) * 0.12;
                ctx.strokeStyle = `rgba(0, 240, 192, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(cx + i * 120, canvas.height);
                ctx.lineTo(cx + i * 1.5, cy - 40);
                ctx.stroke();
            }

            // Horizontal grid lines (rushing toward viewer)
            for (const line of gridH) {
                line.z -= speed;
                if (line.z < 1) line.z += 5000;

                const scale = 500 / line.z;
                const y = cy + 250 * scale;

                if (y > cy && y < canvas.height + 20) {
                    const alpha = Math.min(0.5, scale * 1.5);
                    ctx.strokeStyle = `rgba(0, 240, 192, ${alpha})`;
                    ctx.lineWidth = Math.min(2, scale * 3);
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                }
            }

            // Stars / particles
            for (const star of stars) {
                star.z -= speed * 1.8;
                if (star.z < 1) {
                    star.z = 2000 + Math.random() * 500;
                    star.x = (Math.random() - 0.5) * 2500;
                    star.y = (Math.random() - 0.5) * 2500;
                }

                const scale = 500 / star.z;
                const sx = cx + star.x * scale;
                const sy = cy + star.y * scale;
                const size = Math.max(0.5, 2.5 * scale);
                const alpha = Math.min(1, scale * 3);

                ctx.fillStyle = `rgba(0, 240, 192, ${alpha})`;
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2);
                ctx.fill();

                // Speed trails
                if (speed > 12 && scale > 0.1) {
                    const trailX = sx + (star.x > 0 ? -1 : 1) * size * speed * 0.06;
                    const trailY = sy + (star.y > 0 ? -1 : 1) * size * speed * 0.06;
                    ctx.strokeStyle = `rgba(0, 240, 192, ${alpha * 0.3})`;
                    ctx.lineWidth = size * 0.7;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(trailX, trailY);
                    ctx.stroke();
                }
            }

            // Center glow (vanishing point)
            const grad = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy - 20, 250 + progress * 100);
            grad.addColorStop(0, `rgba(0, 240, 192, ${0.04 + progress * 0.08})`);
            grad.addColorStop(0.5, `rgba(0, 240, 192, ${0.02 + progress * 0.03})`);
            grad.addColorStop(1, 'rgba(0, 240, 192, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Text flash at the end
            if (progress > 0.7 && progress < 0.9) {
                const textAlpha = (progress - 0.7) / 0.2;
                ctx.fillStyle = `rgba(0, 240, 192, ${textAlpha * 0.6})`;
                ctx.font = `700 ${24 + progress * 20}px 'JetBrains Mono', monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('agented.now', cx, cy);
            }

            // Fade out
            if (progress > 0.85) {
                const fadeAlpha = (progress - 0.85) / 0.15;
                ctx.fillStyle = `rgba(7, 8, 12, ${fadeAlpha})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Done
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    resolve();
                }, 500);
            }
        }

        // Clear canvas initially
        ctx.fillStyle = 'rgba(7, 8, 12, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        requestAnimationFrame(animate);
    });
}

// ============ POPULATE OFFERING ============
function populateOffering(role) {
    const content = ROLE_CONTENT[role];
    $('#offering-title').textContent = content.offeringTitle;

    const container = $('#offering-lines');
    container.innerHTML = '';

    content.lines.forEach((line, lineIdx) => {
        const div = document.createElement('div');
        div.className = 'offering-line';

        const prompt = document.createElement('span');
        prompt.className = 'line-prompt';
        prompt.textContent = '>';
        div.appendChild(prompt);

        const textSpan = document.createElement('span');
        textSpan.className = 'line-text';

        // Parse template and create rotating word spans
        const parts = line.template.split(/\{(\d+)\}/);
        parts.forEach((part, i) => {
            if (i % 2 === 0) {
                // Static text
                textSpan.appendChild(document.createTextNode(part));
            } else {
                // Rotating word placeholder
                const rotIdx = parseInt(part);
                const span = document.createElement('span');
                span.className = 'rotating-word';
                span.dataset.lineIndex = lineIdx;
                span.dataset.rotIndex = rotIdx;
                span.textContent = line.rotations[rotIdx][0];
                textSpan.appendChild(span);
            }
        });

        div.appendChild(textSpan);
        container.appendChild(div);
    });

    // Start rotation
    startOfferingRotation(role);
}

// Typewriter erase then type for a single element
function typewriterSwap(el, newWord, eraseSpeed = 75, typeSpeed = 85) {
    return new Promise(resolve => {
        const current = el.textContent;
        let i = current.length;

        // Phase 1: erase backwards
        const eraseInterval = setInterval(() => {
            if (i > 0) {
                i--;
                el.textContent = current.substring(0, i);
            } else {
                clearInterval(eraseInterval);

                // Phase 2: type new word forward
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

function startOfferingRotation(role) {
    // Clear any existing timeouts
    offeringRotationIntervals.forEach(id => clearTimeout(id));
    offeringRotationIntervals = [];

    const content = ROLE_CONTENT[role];
    const rotatingWords = $$('.rotating-word');

    // Group by line
    const lineGroups = {};
    rotatingWords.forEach(el => {
        const lineIdx = el.dataset.lineIndex;
        if (!lineGroups[lineIdx]) lineGroups[lineIdx] = [];
        lineGroups[lineIdx].push(el);
    });

    // Each line rotates independently with staggered timing
    Object.keys(lineGroups).forEach((lineIdx, groupIdx) => {
        const elements = lineGroups[lineIdx];
        const lineData = content.lines[parseInt(lineIdx)];
        let currentIndices = elements.map(() => 0);

        async function rotateLineWords() {
            // Swap all rotating words in this line simultaneously
            const swaps = elements.map((el, elIdx) => {
                const rotIdx = parseInt(el.dataset.rotIndex);
                const words = lineData.rotations[rotIdx];
                const nextIdx = (currentIndices[elIdx] + 1) % words.length;
                currentIndices[elIdx] = nextIdx;
                return typewriterSwap(el, words[nextIdx]);
            });

            await Promise.all(swaps);

            // Schedule next rotation — long pause so each word breathes
            const timeoutId = setTimeout(rotateLineWords, 4000 + groupIdx * 500);
            offeringRotationIntervals.push(timeoutId);
        }

        // Initial delay before first rotation (staggered per line)
        const initialId = setTimeout(rotateLineWords, 4500 + groupIdx * 800);
        offeringRotationIntervals.push(initialId);
    });
}

// ============ NAV SECTIONS ============
function addNavSections() {
    const nav = $('#nav-sections');
    nav.innerHTML = '';

    const sections = [
        { id: 'offering', label: 'Offering' },
        { id: 'portfolio', label: 'Portfolio' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' }
    ];

    sections.forEach(sec => {
        const link = document.createElement('a');
        link.className = 'nav-section-link';
        link.textContent = sec.label;
        link.href = '#' + sec.id;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(sec.id).scrollIntoView({ behavior: 'smooth' });
        });
        nav.appendChild(link);
    });
}

// ============ REVEAL SECTIONS ============
async function revealSections() {
    appState = 'REVEALING';

    const sections = ['offering', 'portfolio', 'about', 'contact'];

    if (experienceMode === 'agentic') {
        // Make all sections present in DOM but invisible, so scroll works
        sections.forEach(id => {
            const el = document.getElementById(id);
            el.classList.remove('hidden');
            el.classList.add('revealing');
        });

        // Reveal the first section (Offering) immediately with a smooth entrance
        await sleep(200);
        const first = document.getElementById(sections[0]);
        first.classList.remove('revealing');
        first.classList.add('visible');

        // Smooth scroll to offering
        await sleep(400);
        first.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Remaining sections reveal when the user scrolls to them
        setupScrollAnimations();
    } else {
        // Regular mode — show all at once
        sections.forEach(id => {
            const el = document.getElementById(id);
            el.classList.remove('hidden');
            el.classList.add('visible');
        });
        setupScrollAnimations();
    }

    appState = 'COMPLETE';
}

// ============ SCROLL ANIMATIONS ============
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('revealing');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    $$('.content-section').forEach(section => {
        observer.observe(section);
    });
}

// ============ WINDOW RESIZE HANDLER (for canvas) ============
window.addEventListener('resize', () => {
    const canvas = $('#road-canvas');
    if (canvas && appState === 'ANIMATING') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    // Small delay then start hero animation
    setTimeout(() => {
        runHeroAnimation();
    }, 500);
});
