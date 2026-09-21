/**
 * GIRRAJ SHARMA - STUDENT DEVELOPER PORTFOLIO
 * Interactive JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initNavbar();
  initCLogicSimulator();
  initProjectFilters();
  initContactFeatures();
});

/* ===================================================================
   1. AMBIENT PARTICLE BACKGROUND (CANVAS)
   =================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.min(Math.floor(window.innerWidth / 22), 55);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.6 + 0.6,
      color: Math.random() > 0.4 ? 'rgba(34, 211, 238, ' : 'rgba(99, 102, 241, ',
      alpha: Math.random() * 0.35 + 0.15
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Connective Lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 125) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.12 * (1 - dist / 125)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ===================================================================
   2. NAVBAR SCROLL & ACTIVE LINK HIGHLIGHT
   =================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 35) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNav();
  });

  // Mobile menu toggle
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Active section indicator on scroll
  function updateActiveNav() {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });

    mobileLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  updateActiveNav();
}

/* ===================================================================
   3. INTERACTIVE C LOGIC SIMULATOR
   (Faithfully replicates cprogramming.c logic with terminal display)
   =================================================================== */
function initCLogicSimulator() {
  const inputElem = document.getElementById('c-input-number');
  const runBtn = document.getElementById('btn-run-simulation');
  const termScreen = document.getElementById('terminal-screen');
  const presetBtns = document.querySelectorAll('.btn-test-chip');

  if (!inputElem || !runBtn || !termScreen) return;

  function executeCProgram(val) {
    const a = parseInt(val, 10);

    if (isNaN(a)) {
      renderTerminal(val, 'Invalid Input: Please enter an integer', 'Error: scanf("%d") failed to parse numeric input.');
      return;
    }

    let output = '';
    let logicPath = '';

    // Replicate the exact C code:
    // if(a>=0){
    //   if(a==0){ printf("A is zero"); }
    //   else{ if((a%2)==0) printf("A is even"); else printf("A is odd"); }
    // } else { printf("A is negative"); }

    if (a >= 0) {
      if (a === 0) {
        output = 'A is zero';
        logicPath = `Branch: [a >= 0] ➔ TRUE | [a == 0] ➔ TRUE. (Executed printf("A is zero"))`;
      } else {
        if (a % 2 === 0) {
          output = 'A is even';
          logicPath = `Branch: [a >= 0] ➔ TRUE | [a == 0] ➔ FALSE | [${a} % 2 == 0] ➔ TRUE. (Executed printf("A is even"))`;
        } else {
          output = 'A is odd';
          logicPath = `Branch: [a >= 0] ➔ TRUE | [a == 0] ➔ FALSE | [${a} % 2 == 0] ➔ FALSE. (Executed printf("A is odd"))`;
        }
      }
    } else {
      output = 'A is negative';
      logicPath = `Branch: [a >= 0] ➔ FALSE. (Executed printf("A is negative"))`;
    }

    renderTerminal(a, output, logicPath);
  }

  function renderTerminal(inputVal, outputVal, logicPath) {
    termScreen.innerHTML = `
      <div class="terminal-title">TERMINAL // GCC COMPILER OUTPUT (STDOUT)</div>
      <div class="terminal-prompt">$ gcc cprogramming.c -o cprog &amp;&amp; ./cprog</div>
      <div class="terminal-prompt">Enter a : <span style="color: #22d3ee; font-weight: 600;">${inputVal}</span></div>
      <div class="terminal-result-line" style="animation: fadeIn 0.3s ease;">
        <span>Output:</span>
        <span style="color: #34d399; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px;">${outputVal}</span>
      </div>
      <div class="terminal-analysis" style="animation: fadeIn 0.4s ease;">
        ${logicPath}
      </div>
    `;
  }

  runBtn.addEventListener('click', () => {
    executeCProgram(inputElem.value);
  });

  inputElem.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeCProgram(inputElem.value);
    }
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      inputElem.value = val;
      executeCProgram(val);
    });
  });
}

/* ===================================================================
   4. PROJECT FILTER TABS
   =================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ===================================================================
   5. CONTACT INTERACTIONS (CLIPBOARD & FORM SUBMIT)
   =================================================================== */
function initContactFeatures() {
  const copyBtn = document.getElementById('btn-copy-email');
  const emailElem = document.getElementById('email-address-text');
  const contactForm = document.getElementById('contact-form');

  if (copyBtn && emailElem) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = emailElem.textContent.trim();
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Email address copied to clipboard!');
      }).catch(() => {
        // Fallback
        showToast('Email: ' + textToCopy);
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;

      showToast(`Thank you, ${name}! Your message has been sent.`);
      contactForm.reset();
    });
  }
}

/* Helper: Toast notification */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
