/* ============ CHROMA · interactions ============ */

// 1) Loader
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('done'), 1800);
});

// 2) Sticky nav transform on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// 3) Custom cursor (desktop only)
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, ringX = 0, ringY = 0;

const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (isFinePointer) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const animateCursor = () => {
    dotX += (mouseX - dotX) * 0.6;
    dotY += (mouseY - dotY) * 0.6;
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    cursor.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  document.querySelectorAll('a, button, .swatch, .cat, .drop').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
} else {
  cursor.style.display = 'none';
  cursorDot.style.display = 'none';
  document.body.style.cursor = 'auto';
}

// 4) Parallax — floating shapes follow mouse + scroll
const shapes = document.querySelectorAll('.shape');
let scrollY = window.scrollY;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  shapes.forEach(sh => {
    const speed = parseFloat(sh.dataset.speed || 0);
    sh.style.translate = `0 ${scrollY * speed}px`;
  });

  // big background CHROMA text parallax
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const s = parseFloat(el.dataset.parallax);
    el.style.transform = `translate(${-scrollY * s}px, -50%)`;
  });
}, { passive: true });

// 5) Mouse tilt on hero shapes
const hero = document.querySelector('.hero');
hero?.addEventListener('mousemove', (e) => {
  const rect = hero.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = (e.clientX - rect.left - cx) / cx;
  const dy = (e.clientY - rect.top - cy) / cy;

  shapes.forEach(sh => {
    const speed = parseFloat(sh.dataset.speed || 0);
    const move = Math.abs(speed) * 200;
    sh.style.translate = `${dx * move}px ${dy * move + scrollY * speed}px`;
  });
});

// 6) IntersectionObserver — reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// stagger setup: every .stagger sibling under same parent gets incrementing delay
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

document.querySelectorAll('.stagger').forEach((el, i, arr) => {
  // figure out index within its parent group of staggers
  const parent = el.parentElement;
  const sibs = parent.querySelectorAll(':scope > .stagger');
  sibs.forEach((s, idx) => {
    s.style.setProperty('--d', `${idx * 0.08}s`);
  });
});

// 7) Smooth scroll for anchor links (extra: account for fixed nav)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// 8) Category card 3D tilt on hover
document.querySelectorAll('.cat').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// 9) Drop card subtle tilt
document.querySelectorAll('.drop').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
