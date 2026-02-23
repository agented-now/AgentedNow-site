document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initHeroReveal();
    initHeroRotatingWord();
    initGlobalTypingAnimation();
    initOfferingInteraction();
    initCustomizationInteraction();
    initScrollIndicator();
    initLogoRunner();
    initMobileMenu();
});

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on system preference or saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// Path-based section URLs (/solutions, /customization, etc.)
function pathToSectionId(pathOrHref) {
    const raw = (pathOrHref != null ? pathOrHref : window.location.pathname).toString().replace(/^\//, '').replace(/\/$/, '');
    return raw && document.getElementById(raw) ? raw : 'home';
}

function sectionIdToPath(sectionId) {
    return '/' + (sectionId || 'home');
}

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link, .nav-logo');
    const sections = document.querySelectorAll('.section');
    
    // Smooth scroll for nav links (path hrefs: /home, /solutions, etc.)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href') || '/home';
            const targetId = pathToSectionId(href);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, '', sectionIdToPath(targetId));
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobileMenu');
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    });
    
    // Update active nav link on scroll
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                updateActiveNavLink(sectionId);
                updateURL(sectionId);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

function updateActiveNavLink(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link, .nav-logo');
    navLinks.forEach(link => {
        const linkSection = link.getAttribute('data-section');
        if (linkSection === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateURL(sectionId) {
    const newPath = sectionIdToPath(sectionId);
    if (window.location.pathname !== newPath) {
        history.replaceState(null, '', newPath);
    }
}

// Hero section: reveal runner after last slogan line (CTA), then "> continue"
function initHeroReveal() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const elements = hero.querySelectorAll('.glide-down-element.hero-glide');
    // CTA (last slogan line) ends at 1.01s delay + 0.5s duration = 1.51s
    const CTA_END_MS = 1510;
    const RUNNER_DELAY_MS = 400;   // pause after CTA before showing runner
    const RUNNER_ENTRANCE_MS = 300; // match .glide-down-element transition (hero)
    // Order: [0] clients-section, [1] logo-runner, [2] scroll-indicator
    const runnerShowAt = CTA_END_MS + RUNNER_DELAY_MS;
    setTimeout(() => {
        if (elements[0]) elements[0].classList.add('revealed');
        if (elements[1]) elements[1].classList.add('revealed');
    }, runnerShowAt);
    setTimeout(() => {
        if (elements[2]) {
            elements[2].classList.add('revealed');
            typeHeroContinue();
        }
    }, runnerShowAt + RUNNER_ENTRANCE_MS);
}

function typeHeroContinue() {
    const textEl = document.getElementById('heroContinueText');
    const cursorEl = document.getElementById('heroContinueCursor');
    if (!textEl) return;
    const fullText = ' continue';
    const SPEED_MS = 45;
    let i = 0;
    if (cursorEl) cursorEl.style.visibility = 'visible';
    function tick() {
        if (i < fullText.length) {
            textEl.textContent += fullText[i];
            i++;
            setTimeout(tick, SPEED_MS);
        } else if (cursorEl) {
            cursorEl.style.visibility = '';
        }
    }
    setTimeout(tick, SPEED_MS);
}

// Hero slogan: rotate [business|team|product] with smooth fade transition
function initHeroRotatingWord() {
    const el = document.getElementById('heroRotatingWord');
    if (!el || el.dataset.rotating) return;
    el.dataset.rotating = 'true';
    const words = ['business', 'team', 'product'];
    let currentIndex = 0;
    const PAUSE_MS = 2600;
    const FADE_MS = 400;

    function showNext() {
        // Fade out current word
        el.classList.add('word-fade-out');
        setTimeout(() => {
            // Swap text while hidden, position for fade-in
            currentIndex = (currentIndex + 1) % words.length;
            el.textContent = words[currentIndex];
            el.classList.remove('word-fade-out');
            el.classList.add('word-fade-in');
            // Trigger reflow so the transition picks up the change
            void el.offsetWidth;
            el.classList.remove('word-fade-in');
            // Schedule next rotation
            setTimeout(showNext, PAUSE_MS);
        }, FADE_MS);
    }

    setTimeout(showNext, PAUSE_MS);
}

// Global Typing Animation - Single inline cursor types all lines sequentially
function initGlobalTypingAnimation() {
    // Collect all typeable elements in document order
    const typeableSelectors = [
        '.typing-line',
        '.typing-text',
        '.section-title',
        '.section-subtitle',
        '.interaction-prompt'
    ];
    
    // Get all elements and sort by their position in the document
    const allElements = [];
    document.querySelectorAll(typeableSelectors.join(', ')).forEach(el => {
        // Skip elements inside response boxes (they have their own typing)
        if (el.closest('.response-box') || el.closest('.response-box-content')) return;
        // Skip elements that are children of other typeable elements (avoid duplicates)
        if (el.closest('.typing-container') && el.classList.contains('typing-line')) {
            allElements.push(el);
        } else if (!el.querySelector('.typing-line')) {
            allElements.push(el);
        }
    });
    
    // Store original content and prepare elements
    const elementsData = allElements.map(el => {
        const originalHTML = el.innerHTML;
        const textContent = el.textContent;
        el.setAttribute('data-original-html', originalHTML);
        el.innerHTML = '';
        el.classList.add('typing-ready');
        return { el, originalHTML, textContent };
    });
    
    // Typing configuration
    const TYPING_SPEED = 15; // ms per character
    const LINE_DELAY = 100; // ms delay between lines
    
    let hasStartedTyping = new Set();
    let currentCursors = new Map(); // section -> cursor element
    
    // Create an inline cursor for an element
    function createInlineCursor(el) {
        const cursor = document.createElement('span');
        cursor.className = 'global-typing-cursor';
        cursor.textContent = '|';
        // Match the line height and font of the parent element
        const computedStyle = window.getComputedStyle(el);
        cursor.style.lineHeight = computedStyle.lineHeight;
        cursor.style.fontSize = computedStyle.fontSize;
        return cursor;
    }
    
    // Remove cursor for a specific section
    function removeCursorForSection(section) {
        const cursor = currentCursors.get(section);
        if (cursor && cursor.parentNode) {
            cursor.parentNode.removeChild(cursor);
        }
        currentCursors.delete(section);
    }
    
    // Track typing state per section
    const sectionTypingState = new Map(); // section -> { isTyping, queue }
    
    // Get the section an element belongs to
    function getSection(el) {
        return el.closest('.section') || el.closest('main') || document.body;
    }
    
    // Get or create typing state for a section
    function getSectionState(section) {
        if (!sectionTypingState.has(section)) {
            sectionTypingState.set(section, { isTyping: false, queue: [] });
        }
        return sectionTypingState.get(section);
    }
    
    // Reveal glide-down elements that follow a typed element
    function revealNextGlideElements(typedEl) {
        // Find all following siblings that have glide-down-element class
        let sibling = typedEl.nextElementSibling;
        let delay = 0;
        const STAGGER_DELAY = 100; // ms between each element reveal
        
        while (sibling) {
            if (sibling.classList.contains('glide-down-element') && !sibling.classList.contains('revealed')) {
                // Stagger the reveal
                const el = sibling;
                setTimeout(() => {
                    el.classList.add('revealed');
                }, delay);
                delay += STAGGER_DELAY;
                
                // If this sibling is a typeable element, or a container with typeable content (e.g. interaction-block),
                // stop here so that content types first, then its completion will reveal the rest (options, then box).
                const isTypeable = sibling.classList.contains('typing-text') ||
                    sibling.classList.contains('section-title') ||
                    sibling.classList.contains('interaction-prompt');
                const hasTypeableChild = sibling.querySelector('.typing-text, .section-title, .interaction-prompt');
                if (isTypeable || hasTypeableChild) {
                    break;
                }
            } else if (!sibling.classList.contains('glide-down-element')) {
                // If we hit a non-glide element, check its children for glide elements
                const childGlides = sibling.querySelectorAll('.glide-down-element:not(.revealed)');
                childGlides.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('revealed');
                    }, delay + index * STAGGER_DELAY);
                });
                if (childGlides.length > 0) {
                    delay += childGlides.length * STAGGER_DELAY;
                }
            }
            sibling = sibling.nextElementSibling;
        }
        
        // If the typed element is inside a block (e.g. interaction-prompt inside interaction-block),
        // reveal the parent's next sibling (e.g. response-box) after the in-block siblings (options) are revealed.
        const parent = typedEl.parentElement;
        if (parent && !parent.classList.contains('section') && parent.nextElementSibling &&
            parent.nextElementSibling.classList.contains('glide-down-element') &&
            !parent.nextElementSibling.classList.contains('revealed')) {
            const boxEl = parent.nextElementSibling;
            setTimeout(() => {
                boxEl.classList.add('revealed');
            }, delay);
        }
        
        // Also check parent's next siblings (walk up the tree in case we're nested, e.g. span > h1 > hero-content)
        let parentWalk = typedEl.parentElement;
        while (parentWalk && parentWalk !== document.body) {
            if (parentWalk.classList.contains('section')) break; // don't reveal next section's elements
            let parentSibling = parentWalk.nextElementSibling;
            while (parentSibling) {
                if (parentSibling.classList.contains('glide-down-element') && !parentSibling.classList.contains('revealed')) {
                    const el = parentSibling;
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, delay);
                    delay += STAGGER_DELAY;
                    
                    const isTypeable = parentSibling.classList.contains('typing-text') ||
                        parentSibling.classList.contains('section-title') ||
                        parentSibling.classList.contains('interaction-prompt');
                    const hasTypeableChild = parentSibling.querySelector('.typing-text, .section-title, .interaction-prompt');
                    if (isTypeable || hasTypeableChild) {
                        parentSibling = null;
                        break;
                    }
                } else if (!parentSibling.classList.contains('glide-down-element')) {
                    const childGlides = parentSibling.querySelectorAll('.glide-down-element:not(.revealed)');
                    childGlides.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('revealed');
                        }, delay + index * STAGGER_DELAY);
                    });
                    if (childGlides.length > 0) {
                        delay += childGlides.length * STAGGER_DELAY;
                    }
                }
                parentSibling = parentSibling.nextElementSibling;
            }
            parentWalk = parentWalk.parentElement;
        }
    }
    
    // Type a single element with HTML support and inline cursor
    function typeElement(data, callback) {
        const { el, originalHTML } = data;
        const section = getSection(el);
        el.classList.add('typing-active');
        
        // Remove any existing cursor for this section
        removeCursorForSection(section);
        
        // Create new inline cursor for this element
        const currentCursor = createInlineCursor(el);
        currentCursors.set(section, currentCursor);
        
        // Parse HTML and type character by character
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        
        // Flatten to typeable segments (text nodes and their parent tags)
        const segments = [];
        function extractSegments(node, parentTags = []) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    segments.push({ char: text[i], tags: [...parentTags] });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagInfo = {
                    tagName: node.tagName.toLowerCase(),
                    className: node.className,
                    id: node.id,
                    attributes: {}
                };
                // Copy relevant attributes
                for (const attr of node.attributes) {
                    if (attr.name !== 'class' && attr.name !== 'id') {
                        tagInfo.attributes[attr.name] = attr.value;
                    }
                }
                const newParentTags = [...parentTags, tagInfo];
                for (const child of node.childNodes) {
                    extractSegments(child, newParentTags);
                }
            }
        }
        
        for (const child of tempDiv.childNodes) {
            extractSegments(child);
        }
        
        let charIndex = 0;
        el.innerHTML = '';
        
        // Add cursor at start
        el.appendChild(currentCursor);
        
        function typeNextChar() {
            if (charIndex >= segments.length) {
                // Remove cursor when done with this element
                removeCursorForSection(section);
                el.classList.remove('typing-active');
                el.classList.add('typing-complete');
                // Start rotating words after hero is typed
                if (el.querySelector('#rotatingWord') || el.querySelector('.rotating-word')) {
                    startRotatingWords();
                }
                if (el.querySelector('#rotatingIndustry') || el.querySelector('.rotating-industry')) {
                    startRotatingIndustry();
                }
                // Reveal next glide-down elements if this element has data-reveal-next (optionally after a delay)
                if (el.hasAttribute('data-reveal-next')) {
                    const revealDelay = parseInt(el.getAttribute('data-reveal-delay'), 10) || 0;
                    const delayAfter = parseInt(el.getAttribute('data-delay-after'), 10) || LINE_DELAY;
                    const runRevealAndCallback = () => {
                        revealNextGlideElements(el);
                        startRotatingIndustry();
                        if (callback) setTimeout(callback, delayAfter);
                    };
                    if (revealDelay > 0) {
                        setTimeout(runRevealAndCallback, revealDelay);
                    } else {
                        runRevealAndCallback();
                    }
                    return;
                }
                const delayAfter = parseInt(el.getAttribute('data-delay-after'), 10) || LINE_DELAY;
                if (callback) setTimeout(callback, delayAfter);
                return;
            }
            
            // Build the HTML up to this point
            let html = '';
            const openTags = [];
            
            for (let i = 0; i <= charIndex; i++) {
                const seg = segments[i];
                
                // Close tags that are no longer needed
                while (openTags.length > 0 && 
                       (seg.tags.length < openTags.length || 
                        !tagsMatch(seg.tags[openTags.length - 1], openTags[openTags.length - 1]))) {
                    const closingTag = openTags.pop();
                    html += `</${closingTag.tagName}>`;
                }
                
                // Open new tags
                while (openTags.length < seg.tags.length) {
                    const tagInfo = seg.tags[openTags.length];
                    let tagHTML = `<${tagInfo.tagName}`;
                    if (tagInfo.id) tagHTML += ` id="${tagInfo.id}"`;
                    if (tagInfo.className) tagHTML += ` class="${tagInfo.className}"`;
                    for (const [attr, val] of Object.entries(tagInfo.attributes)) {
                        tagHTML += ` ${attr}="${val}"`;
                    }
                    tagHTML += '>';
                    html += tagHTML;
                    openTags.push(tagInfo);
                }
                
                html += seg.char;
            }
            
            // Close remaining open tags
            while (openTags.length > 0) {
                const closingTag = openTags.pop();
                html += `</${closingTag.tagName}>`;
            }
            
            // Set HTML and re-append cursor at the end
            el.innerHTML = html;
            el.appendChild(currentCursor);
            
            charIndex++;
            setTimeout(typeNextChar, TYPING_SPEED);
        }
        
        function tagsMatch(tag1, tag2) {
            if (!tag1 || !tag2) return false;
            return tag1.tagName === tag2.tagName && 
                   tag1.className === tag2.className && 
                   tag1.id === tag2.id;
        }
        
        typeNextChar();
    }
    
    // Process typing queue for a specific section
    function processQueueForSection(section) {
        const state = getSectionState(section);
        if (state.isTyping || state.queue.length === 0) return;
        
        state.isTyping = true;
        const nextData = state.queue.shift();
        typeElement(nextData, () => {
            state.isTyping = false;
            processQueueForSection(section);
        });
    }
    
    // Check which elements are visible and should start typing
    function checkVisibleElements() {
        // Group elements by section
        const sectionElements = new Map();
        
        for (let i = 0; i < elementsData.length; i++) {
            const data = elementsData[i];
            if (hasStartedTyping.has(i)) continue;
            
            const section = getSection(data.el);
            if (!sectionElements.has(section)) {
                sectionElements.set(section, []);
            }
            sectionElements.get(section).push({ index: i, data });
        }
        
        // For each section, check visibility and queue elements in order
        for (const [section, elements] of sectionElements) {
            const sectionRect = section.getBoundingClientRect();
            const sectionVisible = sectionRect.top < window.innerHeight && sectionRect.bottom > 0;
            
            if (!sectionVisible) continue;
            
            // Get elements in this section that are visible
            for (const { index, data } of elements) {
                const rect = data.el.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - 50 && rect.bottom > 0;
                
                if (isVisible) {
                    // Check if all previous elements IN THIS SECTION have started
                    let allPreviousInSectionStarted = true;
                    for (const { index: prevIndex } of elements) {
                        if (prevIndex < index && !hasStartedTyping.has(prevIndex)) {
                            allPreviousInSectionStarted = false;
                            break;
                        }
                    }
                    
                    if (allPreviousInSectionStarted) {
                        hasStartedTyping.add(index);
                        const state = getSectionState(section);
                        state.queue.push(data);
                        processQueueForSection(section);
                    }
                }
            }
        }
    }
    
    // Rotating words functionality (starts after typing completes)
    function startRotatingWords() {
        const rotatingWord = document.getElementById('rotatingWord');
        if (!rotatingWord || rotatingWord.dataset.rotating) return;
        rotatingWord.dataset.rotating = 'true';
        
        const words = ['business', 'employees', 'products', 'operations'];
        let currentIndex = 0;
        
        function rotateWord() {
            currentIndex = (currentIndex + 1) % words.length;
            let charIndex = 0;
            const word = words[currentIndex];
            const typeInterval = setInterval(() => {
                rotatingWord.textContent = word.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === word.length) {
                    clearInterval(typeInterval);
                    setTimeout(rotateWord, 1500);
                }
            }, 40);
        }
        
        setTimeout(rotateWord, 2000);
    }
    
    function startRotatingIndustry() {
        const el = document.getElementById('rotatingIndustry');
        if (!el || el.dataset.rotating) return;
        el.dataset.rotating = 'true';
        
        const words = ['cyber', 'hi-tech', 'government', 'fin-tech', 'HR-tech', 'med-tech'];
        let currentIndex = 0;
        
        function rotateIndustry() {
            currentIndex = (currentIndex + 1) % words.length;
            let charIndex = 0;
            const word = words[currentIndex];
            const typeInterval = setInterval(() => {
                el.textContent = word.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === word.length) {
                    clearInterval(typeInterval);
                    setTimeout(rotateIndustry, 1500);
                }
            }, 40);
        }
        
        setTimeout(rotateIndustry, 2500);
    }
    
    // Initial check and scroll listener
    setTimeout(() => {
        checkVisibleElements();
    }, 300);
    
    window.addEventListener('scroll', () => {
        checkVisibleElements();
    }, { passive: true });
    
    // Also check on resize
    window.addEventListener('resize', () => {
        checkVisibleElements();
    }, { passive: true });
}

// Type text into a content box (single box, character-by-character). Returns { promise, abort }.
function typeIntoBox(containerEl, cursorEl, fullText, options) {
    const speed = (options && options.speed) || 20;
    const onComplete = (options && options.onComplete) || (() => {});
    if (!containerEl) return { promise: Promise.resolve(), abort: () => {} };
    if (cursorEl) cursorEl.style.visibility = 'visible';
    containerEl.textContent = '';
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
                containerEl.textContent += fullText[i];
                i++;
                timeoutId = setTimeout(tick, speed);
            } else {
                if (cursorEl) cursorEl.style.visibility = 'hidden';
                onComplete();
                resolve();
            }
        }
        timeoutId = setTimeout(tick, speed);
    });
    return { promise, abort };
}

// Offering Section: boxes with icon + title that expand on hover
const OFFERING_INTRO = {
    employees: "Here's how we can supercharge your team/business:",
    products: "Here's how we can supercharge your product/tech:"
};

const OFFERING_CARDS = {
    employees: [
        { title: "Consulting", description: "Helping you find teams to empower or workflows to automate with custom GenAI & agentic solutions.", icon: "consulting" },
        { title: "Custom solutions", description: "Building custom end-to-end GenAI & agentic solutions (internal products or automations) to empower your employees or automate your workflows, tailored to your needs in every aspect.", icon: "build" },
        { title: "Existing products", description: "Customizing our existing generic products to fit your needs, or selling them as services.", icon: "customize" }
    ],
    products: [
        { title: "Consulting", description: "Helping you plan and implement GenAI & AI agents in your products or tech.", icon: "consulting" },
        { title: "Custom solutions", description: "Building custom GenAI & agentic solutions to integrate with your products or tech.", icon: "build" }
    ]
};

const OFFERING_ICONS = {
    consulting: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-3.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>',
    build: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    customize: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>'
};

function renderOfferingPlaceholder() {
    const grid = document.getElementById('offeringCardsGrid');
    if (grid) grid.innerHTML = '';
}

function renderOfferingCards(key) {
    const grid = document.getElementById('offeringCardsGrid');
    const cards = OFFERING_CARDS[key];
    if (!grid || !cards) return;
    grid.innerHTML = cards.map(card => {
        const desc = card.description || '';
        return `
        <div class="offering-card">
            <div class="offering-card-header">
                <div class="offering-card-icon">${OFFERING_ICONS[card.icon] || OFFERING_ICONS.consulting}</div>
                <h4 class="offering-card-title">${card.title}</h4>
                <span class="offering-card-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                </span>
            </div>
            <div class="offering-card-body">
                <p class="offering-card-desc">${desc}</p>
            </div>
        </div>
        `;
    }).join('');

    // Add click-to-pin behavior
    grid.querySelectorAll('.offering-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('pinned');
        });
    });
}

function initOfferingInteraction() {
    const contentEl = document.getElementById('offeringResponseContent');
    const cursorEl = document.getElementById('offeringCursor');
    const responseBox = document.getElementById('offeringResponseBox');
    const btns = document.querySelectorAll('#offeringOptionTitles .option-title-btn');
    let currentAbort = () => {};
    let currentKey = null;

    function selectOffering(key, animate) {
        const intro = OFFERING_INTRO[key];
        if (!intro) return;
        if (key === currentKey) return;
        currentAbort();
        currentKey = key;

        btns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        const activeBtn = document.querySelector(`#offeringOptionTitles .option-title-btn[data-offering="${key}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', 'true');
        }
        if (responseBox) responseBox.classList.add('has-selection');

        if (animate) {
            // Fade out existing content (including placeholder), then type new
            if (responseBox) responseBox.classList.add('response-transitioning');
            setTimeout(() => {
                renderOfferingCards(key);
                if (contentEl) contentEl.innerHTML = '';
                if (responseBox) responseBox.classList.remove('response-transitioning');
                const { promise, abort } = typeIntoBox(contentEl, cursorEl, intro, { speed: 18 });
                currentAbort = abort;
                promise.then(() => { currentAbort = () => {}; });
            }, 200);
        } else {
            renderOfferingCards(key);
            if (contentEl) contentEl.innerHTML = '';
            const { promise, abort } = typeIntoBox(contentEl, cursorEl, intro, { speed: 18 });
            currentAbort = abort;
            promise.then(() => { currentAbort = () => {}; });
        }
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-offering');
            selectOffering(key, true);
        });
    });
}

// Customization Section: each bullet typed as a new line
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

// Mobile-friendly shorter versions
const CUSTOMIZATION_CONTENT_MOBILE = {
    security: [
        "Served from your cloud, on-prem, or air-gapped.",
        "Open-source or proprietary models - any provider.",
        "Remote, on your laptops, or on-prem."
    ],
    workflows: [
        "Close collaboration to understand your exact needs, workflows, tasks.",
        "Any solution aspect customized to your needs."
    ],
    data: [
        "Any data type you need.",
        "Any system, database, API or MCP integration."
    ],
    ui: [
        "Any UI/UX you need.",
        "Headless solutions - APIs, automations (e.g. triggered by email).",
        "Styled reports, interactive dashboards, and more."
    ],
    rules: [
        "Any business rules, terminology, policies enforced.",
        "Editable via a custom admin panel."
    ],
    roles: [
        "Full user, role, and permission management.",
        "Custom admin panel with settings and usage stats."
    ],
    performance: [
        "Goals, metrics, benchmarks, evaluation methods defined together.",
        "Architecture optimized for performance, efficiency, cost."
    ],
    architecture: [
        "Solution architecture (agentic or not) built to your needs.",
        "Experts in LangChain, LangGraph.",
        "Absolute control, optimized for performance, efficiency, cost."
    ]
};

function getCustomizationContent() {
    return window.matchMedia('(max-width: 768px)').matches
        ? CUSTOMIZATION_CONTENT_MOBILE
        : CUSTOMIZATION_CONTENT;
}

// Type multiple lines in parallel: each line prefixed with green "> ", lines start with a little delay between each
function typeLinesIntoBoxParallel(containerEl, cursorEl, rawLines, options) {
    const speed = (options && options.speed) || 16;
    const lineDelay = (options && options.lineDelay) ?? 120;
    const onComplete = (options && options.onComplete) || (() => {});
    if (!containerEl || !rawLines || !rawLines.length) return { promise: Promise.resolve(), abort: () => {} };
    if (cursorEl) cursorEl.style.visibility = 'visible';
    containerEl.innerHTML = '';
    const textSpans = [];
    rawLines.forEach((text) => {
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
    const promise = new Promise((resolve) => {
        const progress = rawLines.map(() => 0);
        const startTime = Date.now();
        function tick() {
            if (aborted) return resolve();
            const elapsed = Date.now() - startTime;
            let anyProgress = false;
            for (let i = 0; i < rawLines.length; i++) {
                if (elapsed >= i * lineDelay && progress[i] < rawLines[i].length) {
                    progress[i]++;
                    anyProgress = true;
                }
                textSpans[i].textContent = rawLines[i].substring(0, progress[i]);
            }
            if (!anyProgress && progress.every((p, i) => p === rawLines[i].length)) {
                if (intervalId) clearInterval(intervalId);
                if (cursorEl) cursorEl.style.visibility = 'hidden';
                onComplete();
                return resolve();
            }
        }
        intervalId = setInterval(tick, speed);
    });
    return { promise, abort };
}

function initCustomizationInteraction() {
    const contentEl = document.getElementById('customizationResponseContent');
    const cursorEl = document.getElementById('customizationCursor');
    const responseBox = document.getElementById('customizationResponseBox');
    const btns = document.querySelectorAll('#customizationOptionTitles .option-title-btn');
    let currentAbort = () => {};
    let currentKey = null;

    function selectCustomization(key, animate) {
        const lines = getCustomizationContent()[key];
        if (!lines || !contentEl) return;
        if (key === currentKey) return;
        currentAbort();
        currentKey = key;

        btns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        const activeBtn = document.querySelector(`#customizationOptionTitles .option-title-btn[data-custom="${key}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', 'true');
        }
        if (responseBox) responseBox.classList.add('has-selection');

        if (animate) {
            if (responseBox) responseBox.classList.add('response-transitioning');
            setTimeout(() => {
                if (contentEl) contentEl.innerHTML = '';
                if (responseBox) responseBox.classList.remove('response-transitioning');
                const { promise, abort } = typeLinesIntoBoxParallel(contentEl, cursorEl, lines, {
                    speed: 16,
                    lineDelay: 120
                });
                currentAbort = abort;
                promise.then(() => { currentAbort = () => {}; });
            }, 200);
        } else {
            if (contentEl) contentEl.innerHTML = '';
            const { promise, abort } = typeLinesIntoBoxParallel(contentEl, cursorEl, lines, {
                speed: 16,
                lineDelay: 120
            });
            currentAbort = abort;
            promise.then(() => { currentAbort = () => {}; });
        }
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-custom');
            selectCustomization(key, true);
        });
    });
}

// Scroll Indicator
function initScrollIndicator() {
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const targetId = scrollIndicator.getAttribute('data-scroll-to');
            const target = targetId ? document.getElementById(targetId) : null;
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Logo runner (from OzWiz): seamless loop + hover to pause
function initLogoRunner() {
    const logoTrack = document.querySelector('.logo-track');
    if (!logoTrack) return;

    // Duplicate track content once for seamless infinite scroll
    if (!logoTrack.dataset.cloned) {
        const items = Array.from(logoTrack.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            logoTrack.appendChild(clone);
        });
        logoTrack.dataset.cloned = 'true';
    }

    // Pause animation on hover, resume on leave
    logoTrack.addEventListener('mouseenter', () => {
        logoTrack.style.animationPlayState = 'paused';
    });
    logoTrack.addEventListener('mouseleave', () => {
        logoTrack.style.animationPlayState = 'running';
    });
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });
}

// Handle initial path and browser back/forward (path-based URLs)
function scrollToSectionFromPath(options) {
    const { behavior = 'smooth' } = options || {};
    const sectionId = pathToSectionId(window.location.pathname);
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior });
        updateActiveNavLink(sectionId);
    }
}

// On initial load: scroll immediately so user lands on the right section
function initScrollFromUrl() {
    scrollToSectionFromPath({ behavior: 'auto' });
}

// Run as soon as DOM is ready so we don't show top of page then scroll
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollFromUrl);
} else {
    initScrollFromUrl();
}

window.addEventListener('popstate', () => scrollToSectionFromPath({ behavior: 'smooth' }));
