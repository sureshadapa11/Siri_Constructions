/* ===========================
   PRELOADER
=========================== */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader.classList.add('hidden'), 800);
  initHeroCanvas();
  animateHeroTitle();
});

/* ===========================
   HERO CANVAS ANIMATION
   Blueprint city skyline + particles + crane
=========================== */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Particles ---
  const particles = [];
  const PARTICLE_COUNT = 80;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    });
  }

  // --- Buildings ---
  const buildings = [];
  function buildSkyline() {
    buildings.length = 0;
    const w = canvas.width;
    const h = canvas.height;
    const ground = h * 0.82;
    const configs = [
      { x: 0.04, w: 0.06, floors: 8,  windows: [2, 3] },
      { x: 0.11, w: 0.05, floors: 14, windows: [2, 2] },
      { x: 0.17, w: 0.08, floors: 10, windows: [3, 3] },
      { x: 0.26, w: 0.05, floors: 18, windows: [2, 2] },
      { x: 0.32, w: 0.07, floors: 12, windows: [3, 3] },
      { x: 0.40, w: 0.06, floors: 22, windows: [2, 3] },
      { x: 0.47, w: 0.09, floors: 16, windows: [4, 3] },
      { x: 0.57, w: 0.05, floors: 20, windows: [2, 2] },
      { x: 0.63, w: 0.08, floors: 13, windows: [3, 3] },
      { x: 0.72, w: 0.06, floors: 18, windows: [2, 3] },
      { x: 0.79, w: 0.07, floors: 10, windows: [3, 3] },
      { x: 0.87, w: 0.05, floors: 15, windows: [2, 2] },
      { x: 0.93, w: 0.07, floors: 9,  windows: [3, 3] },
    ];
    configs.forEach(c => {
      const floorH = 14;
      const bh = c.floors * floorH;
      buildings.push({
        x: c.x * w,
        y: ground - bh,
        w: c.w * w,
        h: bh,
        targetH: bh,
        currentH: 0,
        ground,
        floorsX: c.windows[0],
        floorsY: c.windows[1],
        floorH,
        lit: Array.from({ length: c.floors * c.windows[0] * c.windows[1] }, () => Math.random() > 0.4),
      });
    });
  }
  buildSkyline();
  window.addEventListener('resize', buildSkyline);

  // --- Crane ---
  const crane = {
    x: 0.46,
    armAngle: 0,
    armDir: 1,
    load: 0,
    loadDir: 1,
  };

  // --- Grid (blueprint lines) ---
  function drawGrid() {
    const w = canvas.width, h = canvas.height;
    ctx.strokeStyle = 'rgba(255,107,53,0.04)';
    ctx.lineWidth = 1;
    const spacing = 60;
    for (let x = 0; x < w; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  // --- Particles connections ---
  function drawParticles() {
    const w = canvas.width, h = canvas.height;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,107,53,${p.alpha})`;
      ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,107,53,${0.08 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // --- Draw Buildings ---
  let growStart = null;
  const GROW_DURATION = 3200;

  function drawBuildings(timestamp) {
    if (!growStart) growStart = timestamp;
    const elapsed = timestamp - growStart;
    const progress = Math.min(elapsed / GROW_DURATION, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    buildings.forEach(b => {
      b.currentH = b.targetH * ease;
      const bx = b.x, by = b.ground - b.currentH, bw = b.w, bh = b.currentH;

      // Building body
      const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
      grad.addColorStop(0, 'rgba(20,50,80,0.85)');
      grad.addColorStop(1, 'rgba(10,30,55,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, bw, bh);

      // Outline
      ctx.strokeStyle = 'rgba(255,107,53,0.2)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx, by, bw, bh);

      // Windows
      if (progress > 0.3) {
        const winW = bw / (b.floorsX + 1) * 0.55;
        const winH = b.floorH * 0.45;
        const colGap = bw / (b.floorsX + 1);
        const rowGap = b.floorH;
        let winIdx = 0;
        for (let row = 0; row < b.floorsY; row++) {
          for (let col = 0; col < b.floorsX; col++) {
            const wx = bx + colGap * (col + 0.7);
            const wy = by + rowGap * (row + 0.4);
            if (wy + winH > b.ground) continue;
            const lit = b.lit[winIdx % b.lit.length];
            ctx.fillStyle = lit
              ? `rgba(255,220,100,${0.6 + Math.random() * 0.05})`
              : 'rgba(10,20,35,0.8)';
            ctx.fillRect(wx, wy, winW, winH);
            winIdx++;
          }
        }
      }
    });
  }

  // --- Draw Crane ---
  function drawCrane(timestamp) {
    if (!buildings.length) return;
    const tallest = buildings.reduce((a, b) => a.currentH > b.currentH ? a : b);
    const cx = crane.x * canvas.width;
    const cy = tallest.ground - tallest.currentH - 10;
    const mh = Math.min(tallest.currentH, 200);
    if (mh < 40) return;

    ctx.strokeStyle = 'rgba(255,107,53,0.55)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Mast
    ctx.beginPath();
    ctx.moveTo(cx, tallest.ground); ctx.lineTo(cx, cy);
    ctx.stroke();

    // Oscillating jib
    crane.armAngle += 0.002 * crane.armDir;
    if (Math.abs(crane.armAngle) > 0.25) crane.armDir *= -1;
    const jibLen = 90;
    const jibEndX = cx + Math.cos(crane.armAngle) * jibLen;
    const jibEndY = cy + Math.sin(crane.armAngle) * 12;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(jibEndX, jibEndY); ctx.stroke();

    // Counter-jib
    const cjLen = 45;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx - Math.cos(crane.armAngle) * cjLen, cy + Math.sin(crane.armAngle) * 6);
    ctx.stroke();

    // Cable + load oscillation
    crane.load += 0.008 * crane.loadDir;
    if (crane.load > 1 || crane.load < 0) crane.loadDir *= -1;
    const loadY = jibEndY + 20 + crane.load * 30;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(jibEndX, jibEndY); ctx.lineTo(jibEndX, loadY); ctx.stroke();
    ctx.fillStyle = 'rgba(255,107,53,0.6)';
    ctx.fillRect(jibEndX - 8, loadY, 16, 10);
  }

  // --- Ground line ---
  function drawGround() {
    if (!buildings.length) return;
    const ground = buildings[0].ground;
    const w = canvas.width;
    const grad = ctx.createLinearGradient(0, ground, 0, ground + 30);
    grad.addColorStop(0, 'rgba(255,107,53,0.2)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, ground, w, 30);
    ctx.strokeStyle = 'rgba(255,107,53,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(w, ground); ctx.stroke();
  }

  // --- Moon / ambient glow ---
  function drawAmbient() {
    const w = canvas.width;
    ctx.beginPath();
    const grd = ctx.createRadialGradient(w * 0.8, 80, 0, w * 0.8, 80, 160);
    grd.addColorStop(0, 'rgba(255,200,100,0.07)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.arc(w * 0.8, 80, 160, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- RAF Loop ---
  function loop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAmbient();
    drawGrid();
    drawBuildings(timestamp);
    drawCrane(timestamp);
    drawParticles();
    drawGround();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ===========================
   HERO TITLE WORD ANIMATION
=========================== */
function animateHeroTitle() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  title.innerHTML = title.innerHTML.replace(/(\S+)/g, (w, word) =>
    `<span class="word">${word}&nbsp;</span>`
  );
  title.querySelectorAll('.word').forEach((el, i) => {
    el.style.animationDelay = `${0.8 + i * 0.12}s`;
  });
}

/* ===========================
   NAVBAR SCROLL
=========================== */
const navbar = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  handleParallax();
  highlightNav();
});

/* ===========================
   PARALLAX ON SECTIONS
=========================== */
function handleParallax() {
  document.querySelectorAll('.parallax-layer').forEach(el => {
    const rect = el.closest('section').getBoundingClientRect();
    const speed = parseFloat(el.dataset.speed || 0.15);
    const offset = rect.top * speed;
    el.style.transform = `translateY(${offset}px)`;
  });
}

/* ===========================
   MOBILE HAMBURGER
=========================== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ===========================
   SCROLL TO TOP
=========================== */
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===========================
   ANIMATED COUNTERS
=========================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2200;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ===========================
   SCROLL REVEAL (FADE + SLIDE)
=========================== */
const revealEls = [
  { selector: '.service-card', cls: 'fade-in' },
  { selector: '.project-card', cls: 'fade-in' },
  { selector: '.why-item',     cls: 'fade-in' },
  { selector: '.step',         cls: 'fade-in' },
  { selector: '.info-card',    cls: 'fade-in' },
  { selector: '.about-visual', cls: 'slide-left' },
  { selector: '.about-content',cls: 'slide-right' },
];
revealEls.forEach(({ selector, cls }) => {
  document.querySelectorAll(selector).forEach(el => el.classList.add(cls));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 90);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in, .slide-left, .slide-right').forEach(el => revealObserver.observe(el));

/* ===========================
   PROJECT FILTER
=========================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => {
        card.classList.toggle('hidden', !show);
        if (show) {
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        }
      }, 150);
    });
  });
});
document.querySelectorAll('.project-card').forEach(c => {
  c.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
});

/* ===========================
   TESTIMONIALS SLIDER
=========================== */
const track = document.getElementById('testimonialTrack');
const cards = track.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentSlide = 0;
let slidesPerView = getSlidesPerView();
let totalSlides = Math.ceil(cards.length / slidesPerView);
let autoSlideTimer;

function getSlidesPerView() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function buildDots() {
  dotsContainer.innerHTML = '';
  totalSlides = Math.ceil(cards.length / slidesPerView);
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === currentSlide ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function goToSlide(index) {
  currentSlide = (index + totalSlides) % totalSlides;
  const cardWidth = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${currentSlide * slidesPerView * cardWidth}px)`;
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoSlide(); });
nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoSlide(); });

function startAutoSlide() { autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 4000); }
function resetAutoSlide() { clearInterval(autoSlideTimer); startAutoSlide(); }

buildDots();
startAutoSlide();

window.addEventListener('resize', () => {
  const newSpv = getSlidesPerView();
  if (newSpv !== slidesPerView) {
    slidesPerView = newSpv;
    currentSlide = 0;
    buildDots();
    goToSlide(0);
  }
});

/* ===========================
   CONTACT FORM
=========================== */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const service = document.getElementById('service').value;
  const msg = document.getElementById('formMsg');

  if (!name || !phone || !service) {
    msg.textContent = 'Please fill in all required fields.';
    msg.className = 'form-message error';
    return;
  }

  const btn = this.querySelector('button[type="submit"]');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  setTimeout(() => {
    msg.textContent = 'Thank you! We will contact you within 24 hours.';
    msg.className = 'form-message success';
    this.reset();
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    btn.disabled = false;
  }, 1500);
});

/* ===========================
   SMOOTH SCROLL
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===========================
   ACTIVE NAV ON SCROLL
=========================== */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
function highlightNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}
