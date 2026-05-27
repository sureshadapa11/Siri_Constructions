/* ===========================
   PRELOADER
=========================== */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader').classList.add('hidden'), 800);
  initCinematicHero();
  animateHeroTitle();
});

/* ===========================
   CINEMATIC HERO CANVAS
   Night city timelapse feel
=========================== */
function initCinematicHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, ground;
  let buildings = [], stars = [], clouds = [], particles = [], sparks = [];
  let craneAngle = 0, craneDir = 1, loadT = 0, loadDir = 1;
  let time = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    ground = H * 0.78;
    buildScene();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Stars ---- */
  function buildStars() {
    stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.65,
      r: Math.random() * 1.3 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.05 + 0.01,
    }));
  }

  /* ---- Clouds ---- */
  function buildClouds() {
    clouds = Array.from({ length: 5 }, (_, i) => ({
      x: (i / 5) * W + Math.random() * W * 0.3,
      y: H * 0.05 + Math.random() * H * 0.18,
      w: 180 + Math.random() * 200,
      h: 40 + Math.random() * 50,
      speed: 0.12 + Math.random() * 0.18,
      alpha: 0.04 + Math.random() * 0.06,
    }));
  }

  /* ---- Buildings ---- */
  function buildScene() {
    buildStars(); buildClouds();
    buildings = [];
    const configs = [
      { rx:0.02, rw:0.055, fl:6  }, { rx:0.08, rw:0.045, fl:11 },
      { rx:0.13, rw:0.07,  fl:8  }, { rx:0.21, rw:0.045, fl:16 },
      { rx:0.26, rw:0.065, fl:12 }, { rx:0.33, rw:0.055, fl:20 },
      { rx:0.39, rw:0.08,  fl:15 }, { rx:0.48, rw:0.05,  fl:24 },
      { rx:0.54, rw:0.075, fl:18 }, { rx:0.62, rw:0.05,  fl:14 },
      { rx:0.68, rw:0.07,  fl:19 }, { rx:0.75, rw:0.055, fl:13 },
      { rx:0.81, rw:0.065, fl:10 }, { rx:0.88, rw:0.05,  fl:17 },
      { rx:0.94, rw:0.06,  fl:9  },
    ];
    const flH = Math.max(10, H * 0.022);
    configs.forEach(c => {
      const bh = c.fl * flH;
      const cols = Math.max(2, Math.floor(c.rw * W / 18));
      const rows = c.fl;
      buildings.push({
        x: c.rx * W, w: c.rw * W,
        fullH: bh, curH: 0,
        cols, rows, flH,
        windows: Array.from({ length: cols * rows }, () => ({
          on: Math.random() > 0.38,
          flicker: Math.random() < 0.04,
          phase: Math.random() * Math.PI * 2,
        })),
        hasSpire: Math.random() > 0.55,
        spireH: flH * (1.5 + Math.random() * 2),
        color: `hsl(${210 + Math.random()*30},${30+Math.random()*20}%,${12+Math.random()*8}%)`,
        edgeColor: `hsl(${200+Math.random()*40},50%,${25+Math.random()*15}%)`,
        growDelay: Math.random() * 1200,
      });
    });
    sparks = [];
    particles = Array.from({ length: 60 }, () => newParticle());
  }

  function newParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.4 + 0.05,
    };
  }

  /* ---- SKY gradient ---- */
  function drawSky() {
    const t = (Math.sin(time * 0.0003) + 1) / 2;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   `hsl(${215+t*10},${60+t*20}%,${5+t*4}%)`);
    sky.addColorStop(0.5, `hsl(${210+t*8}, ${40+t*15}%,${8+t*5}%)`);
    sky.addColorStop(1,   `hsl(205,35%,${14+t*3}%)`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---- Moon ---- */
  function drawMoon() {
    const mx = W * 0.82, my = H * 0.12, mr = Math.min(W, H) * 0.038;
    const glow = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 5);
    glow.addColorStop(0, 'rgba(255,230,150,0.12)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(mx, my, mr * 5, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2);
    const moon = ctx.createRadialGradient(mx - mr*0.3, my - mr*0.3, 0, mx, my, mr);
    moon.addColorStop(0, 'rgba(255,245,200,0.9)');
    moon.addColorStop(1, 'rgba(220,200,130,0.6)');
    ctx.fillStyle = moon; ctx.fill();
  }

  /* ---- Stars ---- */
  function drawStars() {
    stars.forEach(s => {
      s.twinkle += s.speed;
      const a = 0.3 + 0.7 * (Math.sin(s.twinkle) * 0.5 + 0.5);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,245,220,${a})`; ctx.fill();
    });
  }

  /* ---- Clouds ---- */
  function drawClouds() {
    clouds.forEach(c => {
      c.x += c.speed;
      if (c.x - c.w > W) c.x = -c.w;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w, c.h, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,200,255,${c.alpha})`; ctx.fill();
    });
  }

  /* ---- Grid (blueprint) ---- */
  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,140,60,0.03)';
    ctx.lineWidth = 1;
    const sp = 50;
    for (let x = 0; x < W; x += sp) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += sp) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  /* ---- Buildings ---- */
  let sceneStart = null;
  function drawBuildings(ts) {
    if (!sceneStart) sceneStart = ts;
    const elapsed = ts - sceneStart;

    buildings.forEach(b => {
      const t = Math.max(0, elapsed - b.growDelay);
      const prog = Math.min(t / 3000, 1);
      const ease = 1 - Math.pow(1 - prog, 4);
      b.curH = b.fullH * ease;
      if (b.curH < 2) return;

      const bx = b.x, by = ground - b.curH, bw = b.w, bh = b.curH;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.moveTo(bx, ground);
      ctx.lineTo(bx + bw, ground);
      ctx.lineTo(bx + bw + 12, ground + 10);
      ctx.lineTo(bx + 12, ground + 10);
      ctx.fill();

      // Body gradient
      const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      grad.addColorStop(0, b.edgeColor);
      grad.addColorStop(0.5, b.color);
      grad.addColorStop(1, b.edgeColor);
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, bw, bh);

      // Edge highlight
      ctx.strokeStyle = 'rgba(255,150,60,0.18)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx, by, bw, bh);

      // Horizontal floor lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let f = 1; f < b.rows; f++) {
        const fy = by + bh - f * b.flH;
        if (fy < by) break;
        ctx.beginPath(); ctx.moveTo(bx, fy); ctx.lineTo(bx + bw, fy); ctx.stroke();
      }

      // Windows
      if (prog > 0.25) {
        const colGap = bw / (b.cols + 1);
        const ww = colGap * 0.52, wh = b.flH * 0.42;
        b.windows.forEach((win, idx) => {
          const col = idx % b.cols;
          const row = Math.floor(idx / b.cols);
          const wx = bx + colGap * (col + 0.74);
          const wy = by + bh - (row + 1) * b.flH + b.flH * 0.29;
          if (wy < by) return;
          let alpha = win.on ? 0.75 : 0.05;
          if (win.flicker) alpha *= (0.5 + 0.5 * Math.sin(time * 0.008 + win.phase));
          const hue = win.on ? (Math.random() > 0.15 ? 45 : 200) : 220;
          ctx.fillStyle = `hsla(${hue},90%,75%,${alpha})`;
          ctx.fillRect(wx, wy, ww, wh);
          if (win.on && alpha > 0.4) {
            ctx.shadowBlur = 6; ctx.shadowColor = `hsla(${hue},100%,75%,0.4)`;
            ctx.fillRect(wx, wy, ww, wh);
            ctx.shadowBlur = 0;
          }
        });
      }

      // Rooftop detail
      if (b.hasSpire && prog > 0.8) {
        const spireAlpha = (prog - 0.8) / 0.2;
        ctx.strokeStyle = `rgba(255,120,50,${0.5 * spireAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, by);
        ctx.lineTo(bx + bw / 2, by - b.spireH * spireAlpha);
        ctx.stroke();
        // Blinking light
        const blink = Math.sin(time * 0.06) > 0;
        if (blink) {
          ctx.beginPath();
          ctx.arc(bx + bw / 2, by - b.spireH * spireAlpha, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,60,60,0.9)'; ctx.fill();
          ctx.shadowBlur = 10; ctx.shadowColor = 'red';
          ctx.fill(); ctx.shadowBlur = 0;
        }
      }

      // Construction sparks on growing buildings
      if (prog < 1 && prog > 0.05 && Math.random() < 0.15) {
        for (let s = 0; s < 3; s++) {
          sparks.push({
            x: bx + Math.random() * bw,
            y: by,
            vx: (Math.random() - 0.5) * 3,
            vy: -(Math.random() * 2 + 1),
            life: 1, decay: 0.04 + Math.random() * 0.04,
            hue: 30 + Math.random() * 30,
          });
        }
      }
    });
  }

  /* ---- Sparks ---- */
  function drawSparks() {
    sparks = sparks.filter(s => s.life > 0);
    sparks.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.vy += 0.08;
      s.life -= s.decay;
      ctx.beginPath(); ctx.arc(s.x, s.y, 1.5 * s.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},100%,70%,${s.life})`; ctx.fill();
    });
  }

  /* ---- Crane ---- */
  function drawCrane() {
    const tallest = buildings.reduce((a, b) => a.curH > b.curH ? a : b, buildings[0]);
    if (!tallest || tallest.curH < 60) return;
    const cx = tallest.x + tallest.w / 2;
    const base = ground;
    const top  = base - tallest.curH - 8;
    const mastH = Math.min(tallest.curH + 40, H * 0.55);
    const mastTop = base - mastH;

    ctx.strokeStyle = 'rgba(255,120,50,0.7)';
    ctx.lineWidth = 3; ctx.lineCap = 'round';

    // Mast
    ctx.beginPath(); ctx.moveTo(cx, base); ctx.lineTo(cx, mastTop); ctx.stroke();

    // Oscillating arm
    craneAngle += 0.0018 * craneDir;
    if (Math.abs(craneAngle) > 0.3) craneDir *= -1;
    const jibLen = Math.min(W * 0.1, 100);
    const jx = cx + Math.cos(craneAngle) * jibLen;
    const jy = mastTop + Math.sin(craneAngle) * 15;

    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, mastTop); ctx.lineTo(jx, jy); ctx.stroke();
    // Counter-jib
    ctx.beginPath(); ctx.moveTo(cx, mastTop);
    ctx.lineTo(cx - Math.cos(craneAngle)*jibLen*0.45, mastTop + Math.sin(craneAngle)*7);
    ctx.stroke();

    // Pendant cable + swinging load
    loadT += 0.012 * loadDir;
    if (loadT > 1 || loadT < 0) loadDir *= -1;
    const cableLen = 20 + loadT * 35;
    const lx = jx, ly = jy + cableLen;

    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(jx, jy); ctx.lineTo(lx, ly); ctx.stroke();

    ctx.fillStyle = 'rgba(255,120,50,0.75)';
    ctx.fillRect(lx - 9, ly, 18, 12);
    ctx.strokeStyle = 'rgba(255,160,80,0.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(lx - 9, ly, 18, 12);

    // Mast glow
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(255,100,30,0.3)';
    ctx.beginPath(); ctx.moveTo(cx, mastTop + 10); ctx.lineTo(cx, base);
    ctx.strokeStyle = 'rgba(255,100,30,0.08)'; ctx.lineWidth = 8;
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  /* ---- Particles ---- */
  function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,100,40,${p.alpha})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(255,100,40,${0.07*(1-d/100)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }

  /* ---- Ground ---- */
  function drawGround() {
    // Road
    const grad = ctx.createLinearGradient(0, ground, 0, ground + H * 0.22);
    grad.addColorStop(0, 'rgba(8,20,35,1)');
    grad.addColorStop(1, 'rgba(4,10,18,1)');
    ctx.fillStyle = grad; ctx.fillRect(0, ground, W, H - ground);

    // Ground glow line
    ctx.strokeStyle = 'rgba(255,100,40,0.25)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();

    // Reflections on ground
    buildings.forEach(b => {
      if (b.curH < 10) return;
      const rg = ctx.createLinearGradient(b.x + b.w/2, ground, b.x + b.w/2, ground + 80);
      rg.addColorStop(0, 'rgba(255,200,100,0.07)'); rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg;
      ctx.fillRect(b.x, ground, b.w, 80);
    });

    // Road markings
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 2;
    ctx.setLineDash([30, 25]);
    ctx.beginPath(); ctx.moveTo(0, ground + H * 0.07); ctx.lineTo(W, ground + H * 0.07); ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ---- Moving vehicle lights ---- */
  const vehicles = Array.from({ length: 4 }, (_, i) => ({
    x: Math.random() * W, y: ground + H * 0.04,
    speed: 0.8 + Math.random() * 1.2, dir: i % 2 === 0 ? 1 : -1,
    color: i % 2 === 0 ? 'rgba(255,230,150,0.7)' : 'rgba(255,80,80,0.5)',
  }));

  function drawVehicles() {
    vehicles.forEach(v => {
      v.x += v.speed * v.dir;
      if (v.x > W + 20) v.x = -20;
      if (v.x < -20) v.x = W + 20;
      ctx.beginPath(); ctx.arc(v.x, v.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = v.color; ctx.fill();
      const glowDir = v.dir > 0 ? -1 : 1;
      const g = ctx.createLinearGradient(v.x, v.y, v.x + glowDir * 30, v.y);
      g.addColorStop(0, v.color); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(v.x + (glowDir > 0 ? 0 : -30), v.y - 1, 30, 2);
    });
  }

  /* ---- RAF Loop ---- */
  function loop(ts) {
    time = ts;
    ctx.clearRect(0, 0, W, H);
    drawSky();
    drawMoon();
    drawStars();
    drawClouds();
    drawGrid();
    drawBuildings(ts);
    drawSparks();
    drawCrane();
    drawParticles();
    drawGround();
    drawVehicles();
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
  const html = title.innerHTML;
  title.innerHTML = html.replace(/([^\s<>]+)/g, (w) =>
    w.startsWith('<') ? w : `<span class="word">${w} </span>`
  );
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
