// ==========================================================================
// 1. INITIALIZATION & UTILS
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Element Selectors
const root = document.documentElement;
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// ==========================================================================
// 2. CUSTOM CURSOR & MAGNETIC EFFECTS
// ==========================================================================
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let outlineX = mouseX;
let outlineY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
});

function animateCursor() {
    let distX = mouseX - outlineX;
    let distY = mouseY - outlineY;
    
    outlineX += distX * 0.15;
    outlineY += distY * 0.15;
    
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    
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
const themeBtns = document.querySelectorAll('.theme-btn');

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const color = btn.getAttribute('data-color');
        
        // Update CSS Variables
        root.style.setProperty('--accent', color);
        
        // Calculate RGB for rgba values
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.3)`);
        root.style.setProperty('--accent-faded', `rgba(${r}, ${g}, ${b}, 0.1)`);
        
        // Add subtle flash effect to body to signify change
        gsap.fromTo("body", 
            { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.05)` },
            { backgroundColor: "var(--bg-color)", duration: 1 }
        );
    });
});

// ==========================================================================
// 4. PRELOADER & BOOT SEQUENCE
// ==========================================================================
window.addEventListener('load', () => {
    const progress = document.querySelector('.progress');
    const loadPct = document.getElementById('load-pct');
    const loadModule = document.getElementById('load-module');
    
    const modules = ["Kernel", "Neural Net", "Physics Engine", "UI Matrix", "Canvas Context"];
    let width = 0;
    
    const interval = setInterval(() => {
        width += Math.random() * 12;
        
        if(width % 20 < 10) {
            loadModule.textContent = `Loading ${modules[Math.floor(Math.random() * modules.length)]}...`;
        }

        if (width >= 100) {
            width = 100;
            clearInterval(interval);
            loadPct.textContent = '100%';
            progress.style.width = '100%';
            loadModule.textContent = 'System Ready.';
            
            setTimeout(() => {
                document.body.classList.add('loaded');
                document.body.classList.remove('loading');
                initGSAPAnimations();
                initTerminalWelcome();
            }, 800);
        } else {
            progress.style.width = width + '%';
            loadPct.textContent = Math.floor(width) + '%';
        }
    }, 100);
});

// ==========================================================================
// 5. INTERACTIVE TERMINAL / CLI
// ==========================================================================
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');

const commands = {
    'help': 'Available commands: whoami, projects, skills, contact, clear, date',
    'whoami': 'Creative Developer specializing in high-performance web systems and complex UI architectures.',
    'projects': '1. Aether OS (Web OS Concept)<br>2. Lumina Data Analytics (Data Dashboard)<br>Type "open [project]" to view. (e.g., open aether)',
    'skills': 'Languages: JavaScript, HTML5, CSS3, Rust<br>Tech: WebGL, Three.js, Canvas API, GSAP, Node.js',
    'contact': 'Direct line: system.admin@digitalworld.net',
    'date': new Date().toString(),
    'clear': 'CLEAR_SIGNAL'
};

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

function processCommand(cmd) {
    if (cmd === 'clear') {
        termOutput.innerHTML = '';
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
    const div = document.createElement('div');
    div.className = `term-line ${className}`;
    div.innerHTML = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
}

function initTerminalWelcome() {
    setTimeout(() => printToTerminal('Establishing secure connection...', 'system'), 1000);
    setTimeout(() => printToTerminal('Connection established.', 'success'), 2000);
}

// ==========================================================================
// 6. HERO CANVAS ANIMATION (Nodes)
// ==========================================================================
const hCanvas = document.getElementById('hero-canvas');
const hCtx = hCanvas.getContext('2d');
let hWidth, hHeight, hNodes = [];

function initHeroCanvas() {
    hWidth = hCanvas.width = window.innerWidth;
    hHeight = hCanvas.height = window.innerHeight;
    hNodes = [];
    
    const count = window.innerWidth < 768 ? 50 : 120;
    
    for (let i = 0; i < count; i++) {
        hNodes.push({
            x: Math.random() * hWidth,
            y: Math.random() * hHeight,
            r: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8
        });
    }
}

function renderHeroCanvas() {
    hCtx.clearRect(0, 0, hWidth, hHeight);
    
    // Get current accent color from root
    const accentColor = getComputedStyle(root).getPropertyValue('--accent').trim();
    hCtx.fillStyle = accentColor;
    
    hNodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > hWidth) node.vx *= -1;
        if (node.y < 0 || node.y > hHeight) node.vy *= -1;
        
        hCtx.beginPath();
        hCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        hCtx.fill();
    });
    
    // Draw connections
    hCtx.lineWidth = 0.5;
    for(let i=0; i<hNodes.length; i++) {
        for(let j=i+1; j<hNodes.length; j++) {
            const dx = hNodes[i].x - hNodes[j].x;
            const dy = hNodes[i].y - hNodes[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < 100) {
                hCtx.strokeStyle = accentColor;
                hCtx.globalAlpha = 1 - (dist/100);
                hCtx.beginPath();
                hCtx.moveTo(hNodes[i].x, hNodes[i].y);
                hCtx.lineTo(hNodes[j].x, hNodes[j].y);
                hCtx.stroke();
                hCtx.globalAlpha = 1;
            }
        }
        
        // Mouse connection
        const mdx = hNodes[i].x - mouseX;
        const mdy = hNodes[i].y - mouseY;
        const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
        
        if(mdist < 150) {
            hCtx.strokeStyle = '#fff';
            hCtx.globalAlpha = 1 - (mdist/150);
            hCtx.beginPath();
            hCtx.moveTo(hNodes[i].x, hNodes[i].y);
            hCtx.lineTo(mouseX, mouseY);
            hCtx.stroke();
            hCtx.globalAlpha = 1;
        }
    }
    
    requestAnimationFrame(renderHeroCanvas);
}

window.addEventListener('resize', initHeroCanvas);
initHeroCanvas();
renderHeroCanvas();

// ==========================================================================
// 7. COMPLEX SKILLS CANVAS (ORBITING PHYSICS)
// ==========================================================================
const sCanvas = document.getElementById('skills-canvas');
const sCtx = sCanvas.getContext('2d');
let sWidth, sHeight;
const skillsList = ["JavaScript", "HTML5", "CSS3", "WebGL", "Three.js", "GSAP", "Rust", "Node.js", "UI/UX", "Physics"];
let orbits = [];

function initSkillsCanvas() {
    const wrapper = document.querySelector('.skills-canvas-wrapper');
    sWidth = sCanvas.width = wrapper.clientWidth;
    sHeight = sCanvas.height = wrapper.clientHeight;
    
    orbits = skillsList.map((skill, index) => {
        return {
            text: skill,
            angle: (index / skillsList.length) * Math.PI * 2,
            radius: 120 + Math.random() * 180,
            speed: (Math.random() * 0.005) + 0.002,
            size: Math.random() * 8 + 12
        };
    });
}

function renderSkillsCanvas() {
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


// ==========================================================================
// 8. COMPLEX FORM VALIDATION & SUBMIT
// ==========================================================================
const contactForm = document.getElementById('transmission-form');
const formStatus = document.querySelector('.form-status .status-text');
const btnLoader = document.querySelector('.btn-loader');
const submitBtn = document.querySelector('.submit-btn');

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
        submitBtn.style.pointerEvents = 'none';
        formStatus.className = 'status-text';
        formStatus.textContent = 'Encrypting payload...';
        
        gsap.to(btnLoader, { width: '50%', duration: 1, ease: "power2.inOut" });
        
        setTimeout(() => {
            formStatus.textContent = 'Transmitting to secure server...';
            gsap.to(btnLoader, { width: '100%', duration: 1.5, ease: "power2.inOut" });
        }, 1000);

        setTimeout(() => {
            formStatus.textContent = 'Transmission Successful. System Admin notified.';
            formStatus.className = 'status-text success';
            btnLoader.style.width = '0%';
            contactForm.reset();
            submitBtn.style.pointerEvents = 'all';
        }, 3000);
    }
});

// Clear error on input
contactForm.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => {
        input.parentElement.classList.remove('error');
    });
});


// ==========================================================================
// 9. PROJECT DRAWER / MODAL LOGIC
// ==========================================================================
const modal = document.getElementById('project-modal');
const modalCloseBtn = document.querySelector('.modal-close');
const projectBtns = document.querySelectorAll('.open-project');

const projectData = {
    'aether': {
        title: 'Aether OS',
        challenge: 'Building a fully spatial, window-managed environment directly in the browser using zero dependencies. Requiring complex z-index management, drag-and-drop physics, and high-performance canvas rendering.',
        tech: ['HTML5 Canvas', 'Vanilla JS', 'Custom Physics Engine', 'CSS Variables']
    },
    'lumina': {
        title: 'Lumina Data Analytics',
        challenge: 'Handling tens of thousands of data points via live WebSockets and rendering them smoothly at 60FPS. Implementing a custom kinetic typography engine for data labeling.',
        tech: ['D3.js Core', 'WebSockets API', 'CSS Grid', 'Service Workers']
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

    // Populate data
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-challenge').textContent = data.challenge;
    
    const techList = document.getElementById('modal-tech-list');
    techList.innerHTML = '';
    data.tech.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        techList.appendChild(li);
    });

    // Open Modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent scroll
    lenis.stop(); // stop smooth scroll
    
    // Animate inner elements
    gsap.fromTo(".modal-container", {y: 50, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1});
    gsap.fromTo(".gallery-item", {x: -20, opacity: 0}, {x: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.3});
    gsap.fromTo(".detail-section", {y: 20, opacity: 0}, {y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.4});
}

function closeProjectModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    lenis.start();
}

modalCloseBtn.addEventListener('click', closeProjectModal);
modal.addEventListener('click', (e) => {
    if(e.target === modal) closeProjectModal();
});


// ==========================================================================
// 10. GSAP SCROLL CHOREOGRAPHY (Including Horizontal Scroll)
// ==========================================================================
function initGSAPAnimations() {
    // 1. Text Reveals
    const splitTexts = document.querySelectorAll('[data-split]');
    splitTexts.forEach(title => {
        const text = title.textContent;
        title.textContent = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.opacity = '0';
            span.style.display = 'inline-block';
            span.style.transform = 'translateY(20px)';
            title.appendChild(span);
        });
    });

    const tl = gsap.timeline();
    tl.to('.hero-title span', { opacity: 1, y: 0, duration: 0.6, stagger: 0.03, ease: "power3.out" })
      .to('.hero-subtitle span', { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }, "-=0.8")
      .to('.hero-description', { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
      .to('.scroll-indicator', { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");

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

    // Number Counter for About section
    const numbers = document.querySelectorAll('.stat-number');
    numbers.forEach(num => {
        const target = parseInt(num.getAttribute('data-target') || "0");
        if(target > 0) {
            gsap.to({val: 0}, {
                val: target,
                duration: 2,
                scrollTrigger: {
                    trigger: num,
                    start: "top 80%"
                },
                onUpdate: function() {
                    num.textContent = Math.floor(this.targets()[0].val);
                }
            });
        }
    });

    // 3. HORIZONTAL SCROLL PIN (Journey Section)
    const journeyPin = document.getElementById('journey-pin');
    const journeyTrack = document.getElementById('journey-track');

    function getScrollAmount() {
        let trackWidth = journeyTrack.scrollWidth;
        return -(trackWidth - window.innerWidth + (window.innerWidth * 0.12)); // account for padding
    }

    const tween = gsap.to(journeyTrack, {
        x: getScrollAmount,
        duration: 3,
        ease: "none"
    });

    ScrollTrigger.create({
        trigger: journeyPin,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
        markers: false
    });

    // Re-bind cursor to ensure new dynamic elements have hover state
    bindCursorHover();
}

// Initial cursor bind
bindCursorHover();
