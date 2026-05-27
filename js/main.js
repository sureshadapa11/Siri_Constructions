
/* ===========================
   PRELOADER
=========================== */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader').classList.add('hidden'), 800);
  initParticleCanvas();
  initRotatingText();
});

/* ===========================
   ROTATING HERO TEXT
=========================== */
function initRotatingText() {
  const el = document.getElementById('heroRotating');
  if (!el) return;
  const words = ['Dream Home', 'Office Complex', 'Dream Villa', 'Future', 'Legacy'];
  let i = 0;
  setInterval(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px)';
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }, 400);
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  }, 2800);
}

/* ===========================
   PARTICLE OVERLAY (on top of video)
=========================== */
function initParticleCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Floating particles + connecting lines overlay on top of video */
  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * (W || 1000), y: Math.random() * (H || 600),
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.35 + 0.08,
  }));

  function loop() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,120,50,${p.a})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(255,120,50,${0.08*(1-d/110)})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ===========================
   HERO TITLE WORD REVEAL
=========================== */
function animateHeroTitle() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  // Walk only text nodes so HTML tags (<span>, <br>) are never touched
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  textNodes.forEach(tn => {
    const frag = document.createDocumentFragment();
    tn.textContent.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else if (part) {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = part;
        frag.appendChild(span);
      }
    });
    tn.parentNode.replaceChild(frag, tn);
  });
  title.querySelectorAll('.word').forEach((el, i) => {
    el.style.animationDelay = `${0.9 + i * 0.13}s`;
  });
}

/* ===========================
   NAVBAR + SCROLL
=========================== */
const navbar = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  highlightNav();
});

/* ===========================
   MOBILE HAMBURGER
=========================== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===========================
   SCROLL TO TOP
=========================== */
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===========================
   COUNTER ANIMATION
=========================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target), dur = 2200;
  let cur = 0, step = target / (dur / 16);
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = Math.floor(cur);
  }, 16);
}
new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); e.target._obs.unobserve(e.target); }});
}, { threshold: 0.5 }).observe;

const cObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => cObs.observe(el));

/* ===========================
   SCROLL REVEAL
=========================== */
const revealMap = [
  ['.service-card', 'fade-in'], ['.project-card', 'fade-in'],
  ['.why-item',     'fade-in'], ['.step',         'fade-in'],
  ['.info-card',    'fade-in'], ['.testimonial-card','fade-in'],
  ['.about-visual', 'slide-left'], ['.about-content','slide-right'],
];
revealMap.forEach(([sel, cls]) => document.querySelectorAll(sel).forEach(el => el.classList.add(cls)));

const revObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.fade-in, .slide-left, .slide-right').forEach(el => revObs.observe(el));

/* ===========================
   PROJECT FILTER
=========================== */
document.querySelectorAll('.project-card').forEach(c => {
  c.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4,0,0.2,1)';
});
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.opacity = '0'; card.style.transform = 'scale(0.92)';
      setTimeout(() => {
        card.classList.toggle('hidden', !show);
        if (show) requestAnimationFrame(() => { card.style.opacity='1'; card.style.transform='scale(1)'; });
      }, 200);
    });
  });
});

/* ===========================
   TESTIMONIALS SLIDER
=========================== */
const track  = document.getElementById('testimonialTrack');
const cards  = track ? track.querySelectorAll('.testimonial-card') : [];
const dotsEl = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let cur = 0, spv = getSpv(), total = Math.ceil(cards.length / spv), timer;

function getSpv() { return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3; }
function buildDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = ''; total = Math.ceil(cards.length / spv);
  for (let i = 0; i < total; i++) {
    const d = document.createElement('span'); d.className = 'dot' + (i===cur?' active':'');
    d.addEventListener('click', () => goTo(i)); dotsEl.appendChild(d);
  }
}
function goTo(idx) {
  cur = (idx + total) % total;
  const w = cards[0] ? cards[0].offsetWidth + 24 : 0;
  track.style.transform = `translateX(-${cur * spv * w}px)`;
  dotsEl && dotsEl.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i===cur));
}
if (prevBtn) prevBtn.addEventListener('click', () => { goTo(cur-1); reset(); });
if (nextBtn) nextBtn.addEventListener('click', () => { goTo(cur+1); reset(); });
function start() { timer = setInterval(() => goTo(cur+1), 4000); }
function reset() { clearInterval(timer); start(); }
buildDots(); start();
window.addEventListener('resize', () => { const n=getSpv(); if(n!==spv){spv=n;cur=0;buildDots();goTo(0);} });

/* ===========================
   CONTACT FORM
=========================== */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name=document.getElementById('name').value.trim();
  const phone=document.getElementById('phone').value.trim();
  const svc=document.getElementById('service').value;
  const msg=document.getElementById('formMsg');
  if (!name||!phone||!svc) { msg.textContent='Please fill in all required fields.'; msg.className='form-message error'; return; }
  const btn=this.querySelector('button[type="submit"]');
  btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sending...'; btn.disabled=true;
  setTimeout(() => {
    msg.textContent='Thank you! We will contact you within 24 hours.'; msg.className='form-message success';
    this.reset(); btn.innerHTML='<i class="fas fa-paper-plane"></i> Send Message'; btn.disabled=false;
  }, 1500);
});

/* ===========================
   SMOOTH SCROLL
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});

/* ===========================
   ACTIVE NAV
=========================== */
const secs = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');
function highlightNav() {
  const y = window.scrollY + 100;
  secs.forEach(s => {
    if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
      navAs.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${s.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}
