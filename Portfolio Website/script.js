// ==========================================================================
// 1. INITIALIZATION & UTILS
// ==========================================================================
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Initialize Lenis for Smooth Scrolling safely
let lenis = null;
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Sync Lenis scroll with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
    }

    // Drive Lenis with requestAnimationFrame (most reliable method)
    function raf(time) {
        if (lenis) lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// Smooth anchor scrolling handler for internal links (Header, Hero CTA, etc.)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            if (lenis) {
                lenis.scrollTo(target, { offset: -25, duration: 1.2 });
            } else {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Element Selectors
const root = document.documentElement;
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// ==========================================================================
// 2. CUSTOM CURSOR & MAGNETIC EFFECTS (Issues #1-4 fixed)
// ==========================================================================
let mouseX = 0;
let mouseY = 0;
let outlineX = 0;
let outlineY = 0;
let cursorReady = false;
let cursorVisible = true;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Show cursor on first mouse move (Issue #1 & #2)
    if (!cursorReady) {
        cursorReady = true;
        outlineX = mouseX;
        outlineY = mouseY;
        document.body.classList.add('cursor-ready');
    }
    
    // Use transform3d for GPU-accelerated positioning (Issue #4)
    if (cursorDot) cursorDot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
});

// Handle cursor leaving the window (Issue #3)
document.addEventListener('mouseleave', () => {
    cursorVisible = false;
    if (cursorReady) {
        if (cursorDot) cursorDot.style.opacity = '0';
        if (cursorOutline) cursorOutline.style.opacity = '0';
    }
    // Clear any stuck hover states
    document.body.classList.remove('cursor-hover');
});

document.addEventListener('mouseenter', () => {
    cursorVisible = true;
    if (cursorReady) {
        if (cursorDot) cursorDot.style.opacity = '1';
        if (cursorOutline) cursorOutline.style.opacity = '1';
    }
});

function animateCursor() {
    if (cursorReady) {
        let distX = mouseX - outlineX;
        let distY = mouseY - outlineY;
        
        outlineX += distX * 0.15;
        outlineY += distY * 0.15;
        
        // Use transform3d for GPU-accelerated positioning (Issue #4)
        if (cursorOutline) cursorOutline.style.transform = `translate3d(${outlineX - 20}px, ${outlineY - 20}px, 0)`;
    }
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Re-bind hover states dynamically
function bindCursorHover() {
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, textarea, .magnetic');
    
    hoverTargets.forEach(target => {
        // Remove existing to prevent duplicates if called multiple times
        target.removeEventListener('mouseenter', addHoverState);
        target.removeEventListener('mouseleave', removeHoverState);
        
        target.addEventListener('mouseenter', addHoverState);
        target.addEventListener('mouseleave', removeHoverState);
    });
}

function addHoverState() { document.body.classList.add('cursor-hover'); }
function removeHoverState() { document.body.classList.remove('cursor-hover'); }

// Magnetic Effect
document.querySelectorAll('.magnetic').forEach(magnetic => {
    magnetic.addEventListener('mousemove', (e) => {
        const bound = magnetic.getBoundingClientRect();
        const x = e.clientX - bound.left - bound.width / 2;
        const y = e.clientY - bound.top - bound.height / 2;
        
        gsap.to(magnetic, { x: x * 0.2, y: y * 0.2, duration: 0.5, ease: "power2.out" });
    });
    
    magnetic.addEventListener('mouseleave', () => {
        gsap.to(magnetic, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
});

// ==========================================================================
// 3. THEME SWITCHER (ENERGY CORE)
// ==========================================================================
function applyTheme(color) {
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(b => {
        if (b.getAttribute('data-color').toLowerCase() === color.toLowerCase()) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    root.style.setProperty('--accent', color);

    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.38)`);
    root.style.setProperty('--accent-faded', `rgba(${r}, ${g}, ${b}, 0.12)`);

    // Notify 3D AI core material if active
    if (window.updateAiCoreColor) {
        window.updateAiCoreColor(color);
    }

    // Flash background effect
    gsap.fromTo("body", 
        { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.08)` },
        { backgroundColor: "var(--bg-color)", duration: 0.8 }
    );
}

const themeBtns = document.querySelectorAll('.theme-btn');
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        applyTheme(color);
        playCyberBeep(650, 'sine', 0.06);
    });
});

document.querySelectorAll('.hud-social-btn, .hud-contact-cta, .nav-dock-item, .footer-icon-pill').forEach(btn => {
    btn.addEventListener('click', () => {
        if (typeof playCyberBeep === 'function') {
            playCyberBeep(720, 'sine', 0.05);
        }
    });
});

// Main Header HUD Capsule Scroll & Interaction Controller
function initHeaderHUD() {
    const header = document.getElementById('main-header');
    const hudBox = document.querySelector('.hud-box-container');
    if (!header || !hudBox) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 35) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}
initHeaderHUD();

// ==========================================================================
// 4. PRELOADER & BOOT SEQUENCE (Bulletproof readyState handler)
// ==========================================================================
let preloaderFinished = false;

function runPreloaderBoot() {
    if (preloaderFinished) return;
    preloaderFinished = true;

    const progress = document.querySelector('.progress');
    const loadPct = document.getElementById('load-pct');
    const loadModule = document.getElementById('load-module');
    
    const modules = ["Kernel", "Neural Net", "Physics Engine", "UI Matrix", "Canvas Context"];
    let width = 0;
    
    const interval = setInterval(() => {
        width += Math.random() * 14 + 6;
        
        if (loadModule && width % 20 < 10) {
            loadModule.textContent = `Loading ${modules[Math.floor(Math.random() * modules.length)]}...`;
        }

        if (width >= 100) {
            width = 100;
            clearInterval(interval);
            if (loadPct) loadPct.textContent = '100%';
            if (progress) progress.style.width = '100%';
            if (loadModule) loadModule.textContent = 'System Ready.';
            
            setTimeout(() => {
                document.body.classList.add('loaded');
                document.body.classList.remove('loading');
                
                // Start Lenis safely after preloader
                if (typeof lenis !== 'undefined' && lenis) {
                    lenis.start();
                }
                
                initGSAPAnimations();
                initHeroParallax();
                init3DAiCore();
                initAiDialogue();
                initAvatarToggle();
                if (typeof initTerminalWelcome === 'function' && termInput) {
                    initTerminalWelcome();
                }
            }, 600);
        } else {
            if (progress) progress.style.width = width + '%';
            if (loadPct) loadPct.textContent = Math.floor(width) + '%';
        }
    }, 70);
}

if (document.readyState === 'complete') {
    runPreloaderBoot();
} else {
    window.addEventListener('load', runPreloaderBoot);
}

// ==========================================================================
// 5. INTERACTIVE TERMINAL / CLI (Legacy Safe Handler)
// ==========================================================================
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');

const commands = {
    'help': 'Available commands: whoami, projects, skills, cpp, dsa, aiml, systemdesign, contact, date, clear',
    'whoami': 'Prateek Sharma | Software Engineer & AI Systems Specialist. Designing low-level systems (C++, DSA) with cinematic 3D web applications and neural network pipelines.',
    'projects': '1. Aether OS (Spatial Window Web OS)<br>2. Lumina Data Analytics (Real-time WebSocket Dashboard 50K+ points)<br>Type "open aether" or "open lumina" to inspect architecture.',
    'skills': '<b>Languages:</b> Modern C++ (17/20), Python, JavaScript, TypeScript, C, SQL<br><b>Core CS:</b> DSA (Graphs, DP, Trees), Concurrency, Memory Optimization<br><b>AI / ML:</b> PyTorch, Deep Learning, CNNs, Transformers, RAG, NLP<br><b>Systems & 3D:</b> System Design, WebSockets, Redis, Three.js, WebGL, Canvas API',
    'cpp': '⚡ <b>Modern C++ (17/20):</b> RAII, smart pointers (unique_ptr, shared_ptr), move semantics, custom STL allocators, template metaprogramming, and thread synchronization (mutex, atomics, condition variables).',
    'dsa': '📊 <b>Data Structures & Algorithms:</b> Graph Theory (Dijkstra, BFS/DFS, MST), Dynamic Programming (1D/2D, bitmask), Advanced Trees (Segment Trees, Fenwick, Tries, BST), Disjoint Set Union (DSU), and asymptotic Big-O runtime optimization.',
    'aiml': '🧠 <b>AI & Deep Learning:</b> PyTorch neural networks, CNNs for computer vision, Transformers & Vector Embeddings for NLP, RAG architectures, and autonomous agent orchestration.',
    'systemdesign': '🌐 <b>Distributed Systems:</b> High-concurrency WebSockets streaming, Redis distributed caching, asynchronous non-blocking event loops, and scalable REST APIs.',
    'contact': 'Direct Email: prateek.sharmaop07@gmail.com | Phone: +91 7725949690 | GitHub: https://github.com/prateeksharma07-hub',
    'clear': 'CLEAR_SIGNAL'
};

if (termInput) {
    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const val = this.value.trim().toLowerCase();
            if (val) {
                printToTerminal(`guest@digital-world:~$ ${val}`, 'cmd');
                processCommand(val);
            }
            this.value = '';
        }
    });
}

function processCommand(cmd) {
    if (cmd === 'clear') {
        if (termOutput) termOutput.innerHTML = '';
        return;
    }
    
    if (cmd === 'date') {
        printToTerminal(`System Clock: ${new Date().toUTCString()}`, 'system');
        return;
    }

    if (cmd.startsWith('open ')) {
        const project = cmd.split(' ')[1];
        if (project === 'aether' || project === 'lumina') {
            printToTerminal(`Opening project module: ${project}...`, 'success');
            setTimeout(() => openProjectModal(project), 800);
            return;
        } else {
            printToTerminal(`Error: Project module '${project}' not found.`, 'error');
            return;
        }
    }

    const response = commands[cmd];
    if (response) {
        printToTerminal(response, 'system');
    } else {
        printToTerminal(`bash: ${cmd}: command not found. Type 'help' for options.`, 'error');
    }
}

function printToTerminal(text, className) {
    if (!termOutput) return;
    const div = document.createElement('div');
    div.className = `term-line ${className}`;
    div.innerHTML = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
}

function initTerminalWelcome() {
    if (!termOutput) return;
    setTimeout(() => printToTerminal('Establishing secure connection...', 'system'), 1000);
    setTimeout(() => printToTerminal('Connection established.', 'success'), 2000);
}

// ==========================================================================
// 6. HERO CANVAS ANIMATION (Issue #5, #6, #14 fixed)
// ==========================================================================
const hCanvas = document.getElementById('hero-canvas');
const hCtx = hCanvas.getContext('2d');
let hWidth, hHeight, hNodes = [];
let heroInView = true; // Track if hero is in viewport (Issue #5)

function initHeroCanvas() {
    const dpr = window.devicePixelRatio || 1; // Issue #14: HiDPI fix
    hWidth = window.innerWidth;
    hHeight = window.innerHeight;
    hCanvas.width = hWidth * dpr;
    hCanvas.height = hHeight * dpr;
    hCanvas.style.width = hWidth + 'px';
    hCanvas.style.height = hHeight + 'px';
    hCtx.scale(dpr, dpr);
    
    hNodes = [];
    
    const count = window.innerWidth < 768 ? 60 : 150;
    
    for (let i = 0; i < count; i++) {
        hNodes.push({
            x: Math.random() * hWidth,
            y: Math.random() * hHeight,
            r: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            originalVx: 0,
            originalVy: 0
        });
        hNodes[i].originalVx = hNodes[i].vx;
        hNodes[i].originalVy = hNodes[i].vy;
    }
}

// Track hero visibility with IntersectionObserver (Issue #5)
const heroObserver = new IntersectionObserver((entries) => {
    heroInView = entries[0].isIntersecting;
}, { threshold: 0.1 });

function renderHeroCanvas() {
    hCtx.clearRect(0, 0, hWidth, hHeight);
    
    const accentColor = getComputedStyle(root).getPropertyValue('--accent').trim();
    hCtx.fillStyle = accentColor;
    
    // Get hero-local mouse coords (Issue #5)
    const heroRect = hCanvas.getBoundingClientRect();
    const localMouseX = mouseX - heroRect.left;
    const localMouseY = mouseY - heroRect.top;
    const mouseInHero = heroInView && 
        localMouseX >= 0 && localMouseX <= hWidth && 
        localMouseY >= 0 && localMouseY <= hHeight;
    
    hNodes.forEach(node => {
        if (mouseInHero) {
            // Interactive problem solver gravity
            const mdx = localMouseX - node.x;
            const mdy = localMouseY - node.y;
            const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
            
            if(mdist < 250) {
                const force = (250 - mdist) / 250;
                node.vx += (mdx / mdist) * force * 0.5;
                node.vy += (mdy / mdist) * force * 0.5;
                
                // Limit speed to prevent chaotic explosion
                const speed = Math.sqrt(node.vx*node.vx + node.vy*node.vy);
                if(speed > 5) {
                    node.vx = (node.vx/speed) * 5;
                    node.vy = (node.vy/speed) * 5;
                }
            } else {
                node.vx += (node.originalVx - node.vx) * 0.05;
                node.vy += (node.originalVy - node.vy) * 0.05;
            }
        } else {
            // Return to original speed when mouse not in hero
            node.vx += (node.originalVx - node.vx) * 0.05;
            node.vy += (node.originalVy - node.vy) * 0.05;
        }

        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > hWidth) { node.vx *= -1; node.x = Math.max(0, Math.min(node.x, hWidth)); }
        if (node.y < 0 || node.y > hHeight) { node.vy *= -1; node.y = Math.max(0, Math.min(node.y, hHeight)); }
        
        hCtx.beginPath();
        hCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        hCtx.fill();
    });
    
    // Draw connections between nodes (Issue #6: proper alpha/lineWidth reset)
    for(let i=0; i<hNodes.length; i++) {
        for(let j=i+1; j<hNodes.length; j++) {
            const dx = hNodes[i].x - hNodes[j].x;
            const dy = hNodes[i].y - hNodes[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < 120) {
                hCtx.strokeStyle = accentColor;
                hCtx.globalAlpha = 1 - (dist/120);
                hCtx.lineWidth = 0.8;
                hCtx.beginPath();
                hCtx.moveTo(hNodes[i].x, hNodes[i].y);
                hCtx.lineTo(hNodes[j].x, hNodes[j].y);
                hCtx.stroke();
            }
        }
        
        // Connect to mouse to show "solving" connections (only when mouse is in hero)
        if (mouseInHero) {
            const mdx = hNodes[i].x - localMouseX;
            const mdy = hNodes[i].y - localMouseY;
            const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
            
            if(mdist < 200) {
                hCtx.strokeStyle = '#ffffff';
                hCtx.globalAlpha = Math.pow(1 - (mdist/200), 2);
                hCtx.lineWidth = 1.5;
                hCtx.beginPath();
                hCtx.moveTo(hNodes[i].x, hNodes[i].y);
                hCtx.lineTo(localMouseX, localMouseY);
                hCtx.stroke();
            }
        }
    }
    
    // Reset alpha and lineWidth cleanly (Issue #6)
    hCtx.globalAlpha = 1;
    hCtx.lineWidth = 1;
    
    requestAnimationFrame(renderHeroCanvas);
}

window.addEventListener('resize', initHeroCanvas);
initHeroCanvas();
renderHeroCanvas();

// Start observing hero for visibility
const heroSection = document.getElementById('hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}

// ==========================================================================
// 7. COMPLEX SKILLS CANVAS (Issue #13: HiDPI fix)
// ==========================================================================
const sCanvas = document.getElementById('skills-canvas');
const sCtx = sCanvas.getContext('2d');
let sWidth, sHeight;
const skillsList = [
    "Modern C++ (17/20)", "STL & Templates", "Data Structures", "Graph Theory",
    "Dynamic Programming", "Segment Trees", "PyTorch", "Deep Learning",
    "Computer Vision", "CNNs", "Autonomous AI", "System Design",
    "WebSockets", "Redis Caching", "Three.js", "GLSL Shaders",
    "Linux / POSIX", "Multithreading", "Tries & Trees", "Big-O Analysis"
];
let orbits = [];

function initSkillsCanvas() {
    const wrapper = document.querySelector('.skills-canvas-wrapper');
    if (!wrapper || !sCanvas) return;
    const dpr = window.devicePixelRatio || 1; // Issue #13: HiDPI fix
    sWidth = wrapper.clientWidth;
    sHeight = wrapper.clientHeight;
    sCanvas.width = sWidth * dpr;
    sCanvas.height = sHeight * dpr;
    sCanvas.style.width = sWidth + 'px';
    sCanvas.style.height = sHeight + 'px';
    sCtx.scale(dpr, dpr);
    
    orbits = skillsList.map((skill, index) => {
        return {
            text: skill,
            angle: (index / skillsList.length) * Math.PI * 2,
            radius: 80 + ((index % 5) * 60) + Math.random() * 25,
            speed: (Math.random() * 0.0035) + 0.0018,
            size: Math.random() * 6 + 12
        };
    });
}

function renderSkillsCanvas() {
    if (!sCanvas || !sCtx || !sWidth || !sHeight) {
        requestAnimationFrame(renderSkillsCanvas);
        return;
    }
    sCtx.clearRect(0, 0, sWidth, sHeight);
    
    const centerX = sWidth / 2;
    const centerY = sHeight / 2;
    const accentColor = getComputedStyle(root).getPropertyValue('--accent').trim();

    // Draw Core
    sCtx.beginPath();
    sCtx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    sCtx.fillStyle = accentColor;
    sCtx.shadowBlur = 30;
    sCtx.shadowColor = accentColor;
    sCtx.fill();
    sCtx.shadowBlur = 0; // reset

    sCtx.font = "14px 'JetBrains Mono'";
    sCtx.textAlign = "center";
    sCtx.textBaseline = "middle";

    orbits.forEach(node => {
        node.angle += node.speed;
        
        // Interactive Mouse repulsion on canvas
        const canvasRect = sCanvas.getBoundingClientRect();
        const localMouseX = mouseX - canvasRect.left;
        const localMouseY = mouseY - canvasRect.top;
        
        let targetX = centerX + Math.cos(node.angle) * node.radius;
        let targetY = centerY + Math.sin(node.angle) * node.radius;
        
        const dx = targetX - localMouseX;
        const dy = targetY - localMouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 100) {
            targetX += (dx / dist) * (100 - dist) * 0.5;
            targetY += (dy / dist) * (100 - dist) * 0.5;
        }

        // Draw Line to core
        sCtx.beginPath();
        sCtx.moveTo(centerX, centerY);
        sCtx.lineTo(targetX, targetY);
        sCtx.strokeStyle = "rgba(255,255,255,0.05)";
        sCtx.stroke();

        // Draw Node
        sCtx.beginPath();
        sCtx.arc(targetX, targetY, 4, 0, Math.PI * 2);
        sCtx.fillStyle = "#fff";
        sCtx.fill();

        // Draw Text
        sCtx.fillStyle = "rgba(255,255,255,0.7)";
        sCtx.fillText(node.text, targetX, targetY - 15);
    });
    
    requestAnimationFrame(renderSkillsCanvas);
}

window.addEventListener('resize', initSkillsCanvas);
initSkillsCanvas();
renderSkillsCanvas();

// Interactive Skills Filter System
function initSkillsFilter() {
    const filterBtns = document.querySelectorAll('.skill-filter-btn');
    const cards = document.querySelectorAll('.skill-category-card');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    card.classList.remove('card-filtered-out');
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(card, 
                            { opacity: 0, y: 15, scale: 0.98 }, 
                            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }
                        );
                    }
                } else {
                    card.classList.add('card-filtered-out');
                }
            });

            // Refresh ScrollTrigger to sync accurate layout scroll positions
            if (typeof ScrollTrigger !== 'undefined') {
                setTimeout(() => ScrollTrigger.refresh(), 350);
            }

            if (typeof playCyberBeep === 'function') {
                playCyberBeep(700, 'sine', 0.05);
            }
        });
    });
}
initSkillsFilter();


// ==========================================================================
// 8. COMPLEX FORM VALIDATION & SUBMIT (Issue #8 fixed)
// ==========================================================================
const contactForm = document.getElementById('transmission-form');
const formStatusEl = document.querySelector('.form-status');
const formStatus = document.querySelector('.form-status .status-text');
const btnLoader = document.querySelector('.btn-loader');
const submitBtn = document.querySelector('.submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        const inputs = contactForm.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            const group = input.parentElement;
            if (!input.checkValidity() || input.value.trim() === '') {
                group.classList.add('error');
                isValid = false;
            } else {
                group.classList.remove('error');
            }
        });

        if (isValid) {
            // Complex submit animation
            if (submitBtn) submitBtn.style.pointerEvents = 'none';
            if (formStatus) {
                formStatus.className = 'status-text'; // Reset classes
                formStatus.textContent = 'Encrypting payload...';
            }
            
            if (btnLoader && typeof gsap !== 'undefined') {
                gsap.to(btnLoader, { width: '50%', duration: 1, ease: "power2.inOut" });
            }
            
            setTimeout(() => {
                if (formStatus) formStatus.textContent = 'Transmitting to secure server...';
                if (btnLoader && typeof gsap !== 'undefined') {
                    gsap.to(btnLoader, { width: '100%', duration: 1.5, ease: "power2.inOut" });
                }
            }, 1000);

            setTimeout(() => {
                if (formStatus) {
                    formStatus.textContent = 'Transmission Successful. System Admin notified.';
                    formStatus.className = 'status-text success';
                }
                if (btnLoader) btnLoader.style.width = '0%';
                contactForm.reset();
                if (submitBtn) submitBtn.style.pointerEvents = 'all';
            }, 3000);
        }
    });

    // Clear error on input
    contactForm.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.parentElement) input.parentElement.classList.remove('error');
        });
    });
}


// ==========================================================================
// 9. PROJECT DRAWER / MODAL LOGIC
// ==========================================================================
const modal = document.getElementById('project-modal');
const modalCloseBtn = document.querySelector('.modal-close');
const projectBtns = document.querySelectorAll('.open-project');
const gallerySlideshow = document.getElementById('gallery-slideshow');
const galleryDots = document.getElementById('gallery-dots');
const galleryCaption = document.getElementById('gallery-caption');
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');

let currentSlide = 0;
let currentImages = [];

const projectData = {
    'aether': {
        title: 'Aether OS',
        tag: '01 / Concept',
        challenge: 'Building a fully spatial, window-managed environment directly in the browser using zero dependencies. Requiring complex z-index management, drag-and-drop physics, and high-performance canvas rendering.',
        approach: 'Implemented a custom windowing engine with an event-driven architecture. Each window is an independent DOM node with its own state machine managing drag, resize, minimize, and maximize transitions. The desktop grid uses a virtual coordinate system mapped to CSS transforms for sub-pixel precision.',
        tech: ['HTML5 Canvas', 'Vanilla JS', 'Custom Physics Engine', 'CSS Variables', 'Web Workers', 'IndexedDB'],
        stats: [
            { value: '0', label: 'Dependencies' },
            { value: '60', label: 'FPS Target' },
            { value: '12K', label: 'Lines of Code' }
        ],
        features: [
            'Drag-and-drop window management with snap-to-grid',
            'Custom file system browser with virtual directories',
            'Built-in code editor with syntax highlighting',
            'Resource monitor with real-time CPU/RAM graphs',
            'Taskbar with dynamic app launcher and system tray',
            'Multi-window z-index stack management'
        ],
        images: [
            { src: './aether.jpg', caption: 'Final UI — Desktop Environment' },
            { src: './aether_wireframe.jpg', caption: 'Wireframe — System Architecture Blueprint' }
        ],
        sourceUrl: 'https://github.com/prateeksharma07-hub',
        liveUrl: '#'
    },
    'lumina': {
        title: 'Lumina Data Analytics',
        tag: '02 / Application',
        challenge: 'Handling tens of thousands of data points via live WebSockets and rendering them smoothly at 60FPS. Implementing a custom kinetic typography engine for data labeling and building a semantic dark mode system.',
        approach: 'Designed a streaming data pipeline using WebSocket connections with automatic reconnection and backpressure handling. The visualization layer uses D3.js with canvas fallback for large datasets. Implemented virtual scrolling for data tables to keep memory usage constant regardless of data volume.',
        tech: ['D3.js Core', 'WebSockets API', 'CSS Grid', 'Service Workers', 'Canvas API', 'Web Animations API'],
        stats: [
            { value: '50K', label: 'Data Points' },
            { value: '60', label: 'FPS Render' },
            { value: '<100', label: 'ms Latency' }
        ],
        features: [
            'Real-time WebSocket data streaming with auto-reconnect',
            'Interactive charts with zoom, pan, and brush selection',
            'Virtual scrolling data tables for 50K+ rows',
            'Semantic dark mode with accessible color system',
            'Custom kinetic typography for data annotations',
            'Service Worker caching for offline dashboard access'
        ],
        images: [
            { src: './lumina.jpg', caption: 'Final UI — Analytics Dashboard' },
            { src: './lumina_architecture.jpg', caption: 'Architecture — Data Pipeline Flow' }
        ],
        sourceUrl: 'https://github.com/prateeksharma07-hub',
        liveUrl: '#'
    }
};

projectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-project');
        openProjectModal(id);
    });
});

function openProjectModal(id) {
    const data = projectData[id];
    if(!data) return;

    // Populate header
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-tag').textContent = data.tag;
    
    // Populate challenge & approach
    document.getElementById('modal-challenge').textContent = data.challenge;
    document.getElementById('modal-approach').textContent = data.approach;
    
    // Populate tech grid
    const techList = document.getElementById('modal-tech-list');
    techList.innerHTML = '';
    data.tech.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        techList.appendChild(li);
    });

    // Populate features list
    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = '';
    data.features.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="feature-dot"></span>${f}`;
        featuresList.appendChild(li);
    });

    // Populate stats
    const statsContainer = document.getElementById('modal-stats');
    statsContainer.innerHTML = '';
    data.stats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'modal-stat-item';
        div.innerHTML = `
            <div class="modal-stat-value">${stat.value}</div>
            <div class="modal-stat-label">${stat.label}</div>
        `;
        statsContainer.appendChild(div);
    });

    // Populate links
    const srcLink = document.getElementById('modal-source-link');
    const lvLink = document.getElementById('modal-live-link');
    if (srcLink) {
        srcLink.href = data.sourceUrl || '#';
        srcLink.target = '_blank';
        srcLink.rel = 'noopener noreferrer';
    }
    if (lvLink) {
        lvLink.href = data.liveUrl || '#';
        lvLink.target = '_blank';
        lvLink.rel = 'noopener noreferrer';
    }

    // Build image gallery slideshow
    currentImages = data.images || [];
    currentSlide = 0;
    if (gallerySlideshow) gallerySlideshow.innerHTML = '';
    if (galleryDots) galleryDots.innerHTML = '';

    currentImages.forEach((img, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = `gallery-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `<img src="${img.src}" alt="${img.caption}" loading="lazy">`;
        if (gallerySlideshow) gallerySlideshow.appendChild(slide);

        // Create dot
        const dot = document.createElement('button');
        dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        if (galleryDots) galleryDots.appendChild(dot);
    });

    if (galleryCaption && currentImages.length > 0) {
        galleryCaption.textContent = currentImages[0].caption;
    }

    // Scroll details panel to top
    const modalDetails = document.getElementById('modal-details');
    if (modalDetails) modalDetails.scrollTop = 0;

    // Open Modal
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
    if (typeof lenis !== 'undefined' && lenis) {
        lenis.stop();
    }
    
    // Animate inner elements
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(".modal-container", {y: 50, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1});
        gsap.fromTo(".gallery-slide.active", {scale: 1.1, opacity: 0}, {scale: 1, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3});
        gsap.fromTo(".modal-stat-item", {y: 20, opacity: 0}, {y: 0, opacity: 1, stagger: 0.08, duration: 0.5, delay: 0.3});
        gsap.fromTo(".detail-section", {y: 20, opacity: 0}, {y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.4});
        gsap.fromTo(".modal-actions", {y: 10, opacity: 0}, {y: 0, opacity: 1, duration: 0.5, delay: 0.6});
    }

    // Re-bind cursor hover for new modal elements
    bindCursorHover();
}

function goToSlide(index) {
    if (!currentImages || index < 0 || index >= currentImages.length || index === currentSlide) return;
    if (!gallerySlideshow || !galleryDots) return;
    
    const slides = gallerySlideshow.querySelectorAll('.gallery-slide');
    const dots = galleryDots.querySelectorAll('.gallery-dot');
    
    if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    if (galleryCaption && currentImages[currentSlide]) {
        galleryCaption.textContent = currentImages[currentSlide].caption;
    }
}

if (galleryPrev) {
    galleryPrev.addEventListener('click', () => {
        goToSlide(currentSlide > 0 ? currentSlide - 1 : currentImages.length - 1);
    });
}

if (galleryNext) {
    galleryNext.addEventListener('click', () => {
        goToSlide(currentSlide < currentImages.length - 1 ? currentSlide + 1 : 0);
    });
}

function closeProjectModal() {
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    if (typeof lenis !== 'undefined' && lenis) {
        lenis.start();
    }
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProjectModal();
    });
}

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeProjectModal();
    if (e.key === 'ArrowLeft') goToSlide(currentSlide > 0 ? currentSlide - 1 : currentImages.length - 1);
    if (e.key === 'ArrowRight') goToSlide(currentSlide < currentImages.length - 1 ? currentSlide + 1 : 0);
});


// ==========================================================================
// 10. GSAP SCROLL CHOREOGRAPHY (Including Horizontal Scroll & Reference Stats)
// ==========================================================================
function initGSAPAnimations() {
    // 1. Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo('.hero-status-pill', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1 })
      .fromTo('.hero-greeting', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 }, "-=0.3")
      .fromTo('.hero-name-wrapper', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 }, "-=0.3")
      .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
      .fromTo('.hero-description', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
      .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
      .fromTo('.hero-image-side', { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }, "-=0.8")
      .fromTo('.hero-ticker', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
      .fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.3");

    // 2. Standard Section Fades
    const fadeUps = document.querySelectorAll('.fade-up:not(.hero *)');
    fadeUps.forEach(elem => {
        gsap.to(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // 3. Number Counter for About Reference Stats
    const refNumbers = document.querySelectorAll('.ref-stat-number, .stat-number');
    refNumbers.forEach(num => {
        const target = parseInt(num.getAttribute('data-target') || "0");
        if (target > 0) {
            gsap.to({ val: 0 }, {
                val: target,
                duration: 2.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: num,
                    start: "top 85%"
                },
                onUpdate: function() {
                    num.textContent = Math.floor(this.targets()[0].val);
                }
            });
        }
    });

    // 4. HORIZONTAL SCROLL PIN (Journey Section)
    const journeyPin = document.getElementById('journey-pin');
    const journeyTrack = document.getElementById('journey-track');

    if (journeyPin && journeyTrack) {
        function getScrollAmount() {
            let trackWidth = journeyTrack.scrollWidth;
            let amount = -(trackWidth - window.innerWidth + (window.innerWidth * 0.12));
            return Math.min(0, amount);
        }

        const tween = gsap.to(journeyTrack, {
            x: getScrollAmount,
            duration: 3,
            ease: "none"
        });

        ScrollTrigger.create({
            trigger: journeyPin,
            start: "top top",
            end: () => `+=${Math.max(0, getScrollAmount() * -1)}`,
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true,
            markers: false
        });
    }

    // 5. Scroll Indicator auto-hide
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        ScrollTrigger.create({
            trigger: '#hero',
            start: 'top top',
            end: 'bottom 80%',
            onLeave: () => scrollIndicator.classList.add('hidden'),
            onEnterBack: () => scrollIndicator.classList.remove('hidden'),
        });
    }

    bindCursorHover();
}

// ==========================================================================
// 11. HERO 3D MOUSE PARALLAX & TILT
// ==========================================================================
function initHeroParallax() {
    if (window._heroParallaxInitialized) return;
    window._heroParallaxInitialized = true;
    const heroParallax = document.getElementById('hero-parallax');
    if (!heroParallax) return;

    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;

    window.addEventListener('mousemove', (e) => {
        if (!heroInView) return;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        targetRotY = dx * 14;
        targetRotX = -dy * 10;
    });

    function renderParallax() {
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        heroParallax.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
        
        requestAnimationFrame(renderParallax);
    }
    renderParallax();
}

// ==========================================================================
// 12. 3D INTERACTIVE A.I. CORE (Three.js & WebGL Engine)
// ==========================================================================
let aiCoreScene, aiCoreCamera, aiCoreRenderer, aiCoreMesh, aiCorePoints, aiCoreParticles, aiCoreInnerSphere;
let isDraggingAi = false;
let prevAiMouseX = 0, prevAiMouseY = 0;
let aiRotSpeedX = 0.005, aiRotSpeedY = 0.008;
let aiPulseScale = 1;
let aiFpsLastTime = performance.now();
let aiFpsFrameCount = 0;

function init3DAiCore() {
    if (window._aiCoreInitialized) return;
    const canvas = document.getElementById('ai-three-canvas');
    const container = document.getElementById('ai-canvas-wrapper');
    if (!canvas || !container) return;
    window._aiCoreInitialized = true;

    if (typeof THREE === 'undefined') {
        initFallback2DAiCore(canvas, container);
        return;
    }

    try {
        const width = container.clientWidth;
        const height = container.clientHeight;

        aiCoreScene = new THREE.Scene();
        aiCoreCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        aiCoreCamera.position.z = 6.5;

        aiCoreRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        aiCoreRenderer.setSize(width, height);
        aiCoreRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const currentColor = getComputedStyle(root).getPropertyValue('--accent').trim() || '#00E5FF';

        // 1. Outer Geodesic Wireframe
        const icoGeo = new THREE.IcosahedronGeometry(2.0, 2);
        const icoMat = new THREE.MeshBasicMaterial({
            color: currentColor,
            wireframe: true,
            transparent: true,
            opacity: 0.65
        });
        aiCoreMesh = new THREE.Mesh(icoGeo, icoMat);
        aiCoreScene.add(aiCoreMesh);

        // 2. Glowing Nodes at Vertices
        const pointsMat = new THREE.PointsMaterial({
            color: currentColor,
            size: 0.08,
            transparent: true,
            opacity: 0.9
        });
        aiCorePoints = new THREE.Points(icoGeo, pointsMat);
        aiCoreScene.add(aiCorePoints);

        // 3. Inner Pulsing Core
        const innerGeo = new THREE.SphereGeometry(1.0, 16, 16);
        const innerMat = new THREE.MeshBasicMaterial({
            color: currentColor,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        aiCoreInnerSphere = new THREE.Mesh(innerGeo, innerMat);
        aiCoreScene.add(aiCoreInnerSphere);

        // 4. Orbiting Neural Particles Cloud
        const particleCount = 200;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const r = 2.4 + Math.random() * 0.8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: '#FFFFFF',
            size: 0.04,
            transparent: true,
            opacity: 0.7
        });
        aiCoreParticles = new THREE.Points(particleGeo, particleMat);
        aiCoreScene.add(aiCoreParticles);

        // Dynamic Theme Hook
        window.updateAiCoreColor = function(newHex) {
            if (aiCoreMesh && aiCoreMesh.material) aiCoreMesh.material.color.set(newHex);
            if (aiCorePoints && aiCorePoints.material) aiCorePoints.material.color.set(newHex);
            if (aiCoreInnerSphere && aiCoreInnerSphere.material) aiCoreInnerSphere.material.color.set(newHex);
        };

        // Interaction: Drag to rotate
        canvas.addEventListener('mousedown', (e) => {
            isDraggingAi = true;
            prevAiMouseX = e.clientX;
            prevAiMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => { isDraggingAi = false; });

        window.addEventListener('mousemove', (e) => {
            if (isDraggingAi && aiCoreMesh) {
                const deltaX = e.clientX - prevAiMouseX;
                const deltaY = e.clientY - prevAiMouseY;
                aiCoreMesh.rotation.y += deltaX * 0.01;
                aiCoreMesh.rotation.x += deltaY * 0.01;
                aiCorePoints.rotation.y = aiCoreMesh.rotation.y;
                aiCorePoints.rotation.x = aiCoreMesh.rotation.x;
                aiCoreInnerSphere.rotation.y -= deltaX * 0.005;
                prevAiMouseX = e.clientX;
                prevAiMouseY = e.clientY;
            } else if (!isDraggingAi && aiCoreMesh) {
                const rect = canvas.getBoundingClientRect();
                const localX = (e.clientX - rect.left) / rect.width - 0.5;
                const localY = (e.clientY - rect.top) / rect.height - 0.5;
                if (localX >= -0.7 && localX <= 0.7 && localY >= -0.7 && localY <= 0.7) {
                    aiRotSpeedY = 0.006 + localX * 0.01;
                    aiRotSpeedX = 0.004 + localY * 0.01;
                }
            }
        });

        // Touch support for mobile
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDraggingAi = true;
                prevAiMouseX = e.touches[0].clientX;
                prevAiMouseY = e.touches[0].clientY;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (isDraggingAi && e.touches.length === 1 && aiCoreMesh) {
                const deltaX = e.touches[0].clientX - prevAiMouseX;
                const deltaY = e.touches[0].clientY - prevAiMouseY;
                aiCoreMesh.rotation.y += deltaX * 0.01;
                aiCoreMesh.rotation.x += deltaY * 0.01;
                aiCorePoints.rotation.y = aiCoreMesh.rotation.y;
                aiCorePoints.rotation.x = aiCoreMesh.rotation.x;
                prevAiMouseX = e.touches[0].clientX;
                prevAiMouseY = e.touches[0].clientY;
            }
        }, { passive: true });

        canvas.addEventListener('touchend', () => { isDraggingAi = false; });

        // Click shockwave
        canvas.addEventListener('click', () => {
            triggerAiReaction("ENERGY PULSE DETECTED");
        });

        // Resize handler
        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w && h && aiCoreCamera && aiCoreRenderer) {
                aiCoreCamera.aspect = w / h;
                aiCoreCamera.updateProjectionMatrix();
                aiCoreRenderer.setSize(w, h);
            }
        });

        // Animation Loop
        function animate3DAiCore() {
            requestAnimationFrame(animate3DAiCore);

            if (!isDraggingAi && aiCoreMesh) {
                aiCoreMesh.rotation.y += aiRotSpeedY;
                aiCoreMesh.rotation.x += aiRotSpeedX;
                aiCorePoints.rotation.y = aiCoreMesh.rotation.y;
                aiCorePoints.rotation.x = aiCoreMesh.rotation.x;
            }

            if (aiCoreInnerSphere) {
                aiCoreInnerSphere.rotation.y -= 0.015;
                aiCoreInnerSphere.rotation.z += 0.008;
            }

            if (aiCoreParticles) {
                aiCoreParticles.rotation.y += 0.003;
                aiCoreParticles.rotation.x -= 0.002;
            }

            // Breathing / Pulse scale
            const time = performance.now() * 0.002;
            const pulse = 1 + Math.sin(time) * 0.04;
            const finalScale = pulse * aiPulseScale;
            if (aiCoreMesh) aiCoreMesh.scale.set(finalScale, finalScale, finalScale);
            if (aiCorePoints) aiCorePoints.scale.set(finalScale, finalScale, finalScale);

            // FPS Counter
            aiFpsFrameCount++;
            const now = performance.now();
            if (now - aiFpsLastTime >= 1000) {
                const fpsEl = document.getElementById('ai-hud-fps');
                if (fpsEl) fpsEl.textContent = Math.round((aiFpsFrameCount * 1000) / (now - aiFpsLastTime));
                aiFpsFrameCount = 0;
                aiFpsLastTime = now;
            }

            aiCoreRenderer.render(aiCoreScene, aiCoreCamera);
        }
        animate3DAiCore();

    } catch (err) {
        console.warn("Three.js init fallback:", err);
        initFallback2DAiCore(canvas, container);
    }
}

// 2D Canvas Fallback
function initFallback2DAiCore(canvas, container) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = container.clientWidth || 320;
    let height = container.clientHeight || 320;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
        if (container.clientWidth && container.clientHeight) {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }
    });

    let rotY = 0;
    let rotX = 0;

    const numPoints = 60;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const phi = Math.acos(-1 + (2 * i) / numPoints);
        const theta = Math.sqrt(numPoints * Math.PI) * phi;
        points.push({
            x: Math.cos(theta) * Math.sin(phi) * 110,
            y: Math.sin(theta) * Math.sin(phi) * 110,
            z: Math.cos(phi) * 110
        });
    }

    function render2DFallback() {
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        const color = getComputedStyle(root).getPropertyValue('--accent').trim() || '#00E5FF';

        rotY += 0.01;
        rotX += 0.005;

        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        const projected = points.map(p => {
            let x = p.x * cosY - p.z * sinY;
            let z = p.z * cosY + p.x * sinY;
            let y = p.y * cosX - z * sinX;
            z = z * cosX + p.y * sinX;
            const fov = 300 / (300 + z);
            return { x: cx + x * fov, y: cy + y * fov, scale: fov };
        });

        // Draw connections
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projected.length; i++) {
            for (let j = i + 1; j < projected.length; j++) {
                const dx = projected[i].x - projected[j].x;
                const dy = projected[i].y - projected[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 45) {
                    ctx.globalAlpha = 1 - d / 45;
                    ctx.beginPath();
                    ctx.moveTo(projected[i].x, projected[i].y);
                    ctx.lineTo(projected[j].x, projected[j].y);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = projected[i].scale;
            ctx.beginPath();
            ctx.arc(projected[i].x, projected[i].y, 2.5 * projected[i].scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(render2DFallback);
    }
    render2DFallback();
}

// ==========================================================================
// 13. AETHON CONVERSATIONAL AI & WEB AUDIO SYNTHESIZER
// ==========================================================================
let audioCtx = null;
let sfxEnabled = true;

function playCyberBeep(freq = 600, type = 'sine', duration = 0.08) {
    if (!sfxEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function triggerAiReaction(statusText) {
    aiPulseScale = 1.25;
    gsap.to({ val: 1.25 }, {
        val: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
        onUpdate: function() { aiPulseScale = this.targets()[0].val; }
    });

    const statusEl = document.getElementById('ai-hud-status');
    const modeEl = document.getElementById('ai-hud-mode');
    if (statusEl && statusText) {
        statusEl.textContent = `NEURAL: ${statusText}`;
        if (modeEl) modeEl.textContent = "ACTIVE";
        setTimeout(() => {
            if (statusEl) statusEl.textContent = "NEURAL CORE: ONLINE";
            if (modeEl) modeEl.textContent = "AWARE";
        }, 3000);
    }
    playCyberBeep(880, 'sine', 0.12);
}

// Conversational Knowledge Engine
const aiKnowledge = [
    {
        keywords: ['who', 'prateek', 'about', 'bio', 'identity', 'developer', 'engineer'],
        response: "Prateek Sharma is a Software Developer specializing in high-performance web systems, low-level C++ architectures, advanced algorithms, and autonomous AI pipelines. He bridges raw algorithmic efficiency with cinematic UI aesthetics."
    },
    {
        keywords: ['cpp', 'c++', 'pointers', 'memory', 'stl', 'concurrency', 'multithreading'],
        response: "⚡ <b>C++ & Systems Mastery:</b> Prateek specializes in Modern C++ (C++17/20), low-level memory control, and deterministic systems execution. Core proficiencies include: <b>RAII, smart pointers (unique_ptr, shared_ptr), move semantics, custom STL allocators, template metaprogramming, and thread synchronization (mutexes, atomics, condition variables)</b> with memory profiling via Valgrind and GDB.",
        action: 'scroll_skills'
    },
    {
        keywords: ['dsa', 'data structure', 'algorithm', 'graph', 'tree', 'dynamic programming', 'dp', 'complexity', 'big-o'],
        response: "📊 <b>Data Structures & Algorithms (DSA):</b> Prateek brings rigorous mathematical precision to algorithmic optimization. Core strengths include: <b>Graph Theory (Dijkstra, BFS/DFS, Bellman-Ford, Kruskal/Prim MST), Dynamic Programming (1D/2D, tabulation, memoization, bitmask DP), Advanced Trees (Segment Trees, Fenwick/BIT, Tries, BST/AVL), Disjoint Set Union (DSU)</b>, and asymptotic Big-O space/time optimization for competitive programming.",
        action: 'scroll_skills'
    },
    {
        keywords: ['ai', 'ml', 'machine learning', 'pytorch', 'deep learning', 'neural', 'cnn', 'vision', 'nlp', 'llm'],
        response: "🧠 <b>AI & Machine Learning:</b> Prateek designs deep neural architectures and autonomous AI pipelines. Stack includes: <b>PyTorch for neural network training, Convolutional Neural Networks (CNNs for Computer Vision), Transformers & Vector Embeddings for NLP, RAG architectures, and autonomous agent orchestration</b> — underpinned by solid foundations in linear algebra and vector calculus.",
        action: 'scroll_skills'
    },
    {
        keywords: ['system design', 'distributed', 'backend', 'scale', 'scaling', 'redis', 'api'],
        response: "🌐 <b>Distributed Systems & Architecture:</b> Prateek designs resilient, horizontally scalable microservice architectures. Key highlights: <b>Sub-50ms real-time WebSockets streaming, Redis in-memory caching & distributed session locks, asynchronous non-blocking I/O event loops, and rate-limited RESTful APIs</b> designed for high concurrency.",
        action: 'scroll_skills'
    },
    {
        keywords: ['project', 'aether', 'lumina', 'work', 'portfolio', 'built', 'build'],
        response: "Prateek's flagship projects include: <b>1. Aether OS</b> (a spatial window-managed web operating system built in pure Vanilla JS) and <b>2. Lumina Data Analytics</b> (a real-time WebSocket dashboard handling 50K+ live data points at 60FPS). Click 'View Architecture' in the Projects section to explore interactive wireframes!",
        action: 'scroll_projects'
    },
    {
        keywords: ['skill', 'stack', 'tech', 'languages', 'tools', 'framework'],
        response: "Primary Tech Matrix: <b>Languages & Core:</b> Modern C++ (17/20), Python, JavaScript (ES6+), SQL. <b>AI & Computational:</b> PyTorch, Deep Learning, Computer Vision, DSA (Graphs, DP, Trees). <b>Systems & 3D:</b> System Design, WebSockets, Redis, Three.js, WebGL/GLSL Shaders, Canvas API, Linux/POSIX.",
        action: 'scroll_skills'
    },
    {
        keywords: ['contact', 'hire', 'email', 'phone', 'reach', 'message', 'job'],
        response: "You can reach Prateek directly at <b>prateek.sharmaop07@gmail.com</b> or via comm line at <b>+91 7725949690</b>. Alternatively, use the encrypted transmission form at the bottom of this portfolio.",
        action: 'scroll_contact'
    },
    {
        keywords: ['coral', 'sunset', 'orange'],
        response: "Switching system energy matrix to <b>Cyber Coral (Reference Theme)</b>.",
        action: 'theme_#FF5E3A'
    },
    {
        keywords: ['cyan', 'blue'],
        response: "Switching system energy matrix to <b>Neon Cyan</b>.",
        action: 'theme_#00E5FF'
    },
    {
        keywords: ['violet', 'purple'],
        response: "Switching system energy matrix to <b>Electric Violet</b>.",
        action: 'theme_#8A2BE2'
    },
    {
        keywords: ['green', 'matrix'],
        response: "Switching system energy matrix to <b>Matrix Green</b>.",
        action: 'theme_#00FF66'
    },
    {
        keywords: ['red', 'crimson'],
        response: "Switching system energy matrix to <b>Crimson Red</b>.",
        action: 'theme_#FF3366'
    },
    {
        keywords: ['theme', 'color'],
        response: "I can reconfigure the visual energy core dynamically. Try asking: 'Switch theme to Sunset Coral', 'Switch to Cyan', 'Switch to Green', or 'Switch to Violet'!",
    },
    {
        keywords: ['resume', 'cv'],
        response: "Prateek's verified credentials and engineering trajectory are detailed in the Timeline section below (2023 to Present), or you can connect directly for the latest full PDF resume.",
        action: 'scroll_journey'
    },
    {
        keywords: ['anime', 'avatar', 'real', 'character', 'boy', 'mode switch', 'portrait'],
        response: "Toggling visual representation between <b>Cyber Anime Developer</b> and <b>Realistic Developer</b> mode.",
        action: 'toggle_avatar'
    },
    {
        keywords: ['help', 'what can you do', 'command'],
        response: "As AETHON v3.8, I can: 1. Deep-dive into Prateek's engineering background • 2. Explain technical architectures • 3. Dynamically switch themes • 4. Navigate to any section • 5. Transmit inquiries • 6. Toggle anime/realistic developer modes. Try any prompt above!"
    }
];

function initAiDialogue() {
    if (window._aiDialogueInitialized) return;
    window._aiDialogueInitialized = true;

    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-user-input');
    const chatBody = document.getElementById('ai-chat-body');
    const chips = document.querySelectorAll('.quick-chip');
    const sfxBtn = document.getElementById('sfx-toggle');
    const clearBtn = document.getElementById('clear-ai-chat');

    if (sfxBtn) {
        sfxBtn.addEventListener('click', () => {
            sfxEnabled = !sfxEnabled;
            sfxBtn.innerHTML = sfxEnabled ? '<span id="sfx-icon">🔊</span> SFX: ON' : '<span id="sfx-icon">🔇</span> SFX: OFF';
            if (sfxEnabled) playCyberBeep(700, 'sine', 0.1);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (chatBody) {
                chatBody.innerHTML = `
                    <div class="ai-msg bot">
                        <div class="msg-author">AETHON [SYSTEM]</div>
                        <div class="msg-bubble">
                            Conversation log purged. Neural buffer re-initialized. How may I assist your exploration of Prateek's work?
                        </div>
                    </div>
                `;
            }
            triggerAiReaction("BUFFER RESET");
        });
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt) handleUserQuery(prompt);
        });
    });

    if (form && input) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                handleUserQuery(text);
                input.value = '';
            }
        });
    }

    function handleUserQuery(query) {
        appendAiMessage('user', escapeHtml(query));
        playCyberBeep(520, 'sine', 0.06);

        triggerAiReaction("PROCESSING QUERY");

        setTimeout(() => {
            const result = generateAiResponse(query);
            appendAiMessage('bot', result.text);
            playCyberBeep(750, 'triangle', 0.1);

            if (result.action) {
                executeAiAction(result.action);
            }
        }, 400);
    }

    function generateAiResponse(query) {
        const lower = query.toLowerCase();

        for (const item of aiKnowledge) {
            for (const kw of item.keywords) {
                if (lower.includes(kw)) {
                    return { text: item.response, action: item.action };
                }
            }
        }

        return {
            text: `Neural analysis on "<em>${escapeHtml(query)}</em>": Query registered. Prateek specializes in full-stack architecture, high-performance canvas systems, and AI integration. Try querying his projects (Aether OS, Lumina), tech stack, or ask to switch themes!`,
            action: null
        };
    }

    function appendAiMessage(sender, htmlContent) {
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${sender}`;

        const author = sender === 'bot' ? 'AETHON [SYSTEM]' : 'USER [CLIENT]';
        msgDiv.innerHTML = `
            <div class="msg-author">${author}</div>
            <div class="msg-bubble">${htmlContent}</div>
        `;

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function executeAiAction(action) {
        function smoothScrollTo(el) {
            if (!el) return;
            if (typeof lenis !== 'undefined' && lenis) {
                lenis.scrollTo(el, { offset: -30, duration: 1.2 });
            } else {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }

        if (action.startsWith('theme_')) {
            const color = action.replace('theme_', '');
            applyTheme(color);
        } else if (action === 'scroll_projects') {
            smoothScrollTo(document.getElementById('projects'));
        } else if (action === 'scroll_skills') {
            smoothScrollTo(document.getElementById('skills'));
        } else if (action === 'scroll_contact') {
            smoothScrollTo(document.getElementById('contact'));
        } else if (action === 'scroll_journey') {
            smoothScrollTo(document.getElementById('journey-pin'));
        } else if (action === 'toggle_avatar') {
            if (typeof window.toggleAvatarMode === 'function') {
                const newMode = window.toggleAvatarMode();
                triggerAiReaction(`AVATAR: ${newMode.toUpperCase()}`);
            }
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

// ==========================================================================
// 14. DUAL AVATAR CONTROLLER (Cyber Anime Developer & Realistic Developer)
// ==========================================================================
let currentAvatarMode = 'anime';

function initAvatarToggle() {
    if (window._avatarToggleInitialized) return;
    window._avatarToggleInitialized = true;
    const btnAnime = document.getElementById('btn-avatar-anime');
    const btnReal = document.getElementById('btn-avatar-real');
    const portraitImg = document.getElementById('hero-portrait-img');
    const aiThumbImg = document.querySelector('.ai-thumb-img');

    if (!portraitImg) return;

    function applyAvatar(mode, playSound = true) {
        if (mode === currentAvatarMode && portraitImg.dataset.loadedMode === mode) return;
        currentAvatarMode = mode;
        portraitImg.dataset.loadedMode = mode;

        if (btnAnime && btnReal) {
            if (mode === 'anime') {
                btnAnime.classList.add('active');
                btnReal.classList.remove('active');
            } else {
                btnReal.classList.add('active');
                btnAnime.classList.remove('active');
            }
        }

        const targetSrc = mode === 'anime' ? './anime-boy.jpg' : './hero-portrait.jpg';
        const targetAlt = mode === 'anime' ? 'Prateek Sharma — Cyber Anime Developer' : 'Prateek Sharma — Software Developer';

        // Smooth crossfade using GSAP
        const preload = new Image();
        preload.src = targetSrc;
        preload.onload = () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(portraitImg, {
                    opacity: 0,
                    scale: 0.94,
                    filter: 'blur(8px)',
                    duration: 0.22,
                    ease: 'power2.in',
                    onComplete: () => {
                        portraitImg.src = targetSrc;
                        portraitImg.alt = targetAlt;
                        gsap.to(portraitImg, {
                            opacity: 1,
                            scale: 1,
                            filter: 'blur(0px)',
                            duration: 0.35,
                            ease: 'power2.out'
                        });
                    }
                });
            } else {
                portraitImg.src = targetSrc;
                portraitImg.alt = targetAlt;
            }
        };

        if (aiThumbImg) {
            aiThumbImg.src = targetSrc;
        }

        if (playSound) {
            if (mode === 'anime') {
                playCyberBeep(780, 'sine', 0.08);
                setTimeout(() => playCyberBeep(980, 'triangle', 0.1), 90);
            } else {
                playCyberBeep(560, 'sine', 0.08);
                setTimeout(() => playCyberBeep(680, 'sine', 0.08), 90);
            }
        }
    }

    if (btnAnime) {
        btnAnime.addEventListener('click', (e) => {
            e.stopPropagation();
            applyAvatar('anime');
        });
    }

    if (btnReal) {
        btnReal.addEventListener('click', (e) => {
            e.stopPropagation();
            applyAvatar('real');
        });
    }

    window.toggleAvatarMode = function(forcedMode) {
        const nextMode = forcedMode || (currentAvatarMode === 'anime' ? 'real' : 'anime');
        applyAvatar(nextMode, true);
        return nextMode;
    };
}

// Initial cursor bind & immediate fallbacks if preloader already finished
bindCursorHover();
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initHeroParallax();
    init3DAiCore();
    initAiDialogue();
    initAvatarToggle();
}
