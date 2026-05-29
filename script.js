/* ====================================================================
   Maths with Sahil Verma  ·  SG Coaching Centre
   Site interactions + WhatsApp form redirect
   ==================================================================== */

(() => {
  'use strict';

  /* ---- WhatsApp business number (digits only, with country code) ---- */
  const WHATSAPP_NUMBER = '917986422304';

  /* ============================================================
     1) Loader — hide once the page is ready
     ============================================================ */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('done'), 900);
    setTimeout(() => loader.remove(), 1600);
  });

  /* ============================================================
     2) Sticky nav — add scrolled state
     ============================================================ */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     3) Mobile menu
     ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('open')) {
        nav.classList.remove('open');
      }
    });
  }

  /* ============================================================
     4) Smooth-scroll with sticky-nav offset
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav?.offsetHeight ?? 76;
      const y = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ============================================================
     5) Theme toggle (light <-> dark) with localStorage
     ============================================================ */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  const applyTheme = (mode) => {
    root.setAttribute('data-theme', mode);
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = mode === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  };

  try {
    const saved = localStorage.getItem('sg-theme');
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    }
  } catch (_) { /* no-op */ }

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('sg-theme', next); } catch (_) {}
  });

  /* ============================================================
     6) Reveal-on-scroll
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ============================================================
     7) Animated counters
     ============================================================ */
  const counts = document.querySelectorAll('.count[data-target]');
  if ('IntersectionObserver' in window && counts.length) {
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const animate = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(easeOut(p) * target).toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('en-IN');
      };
      requestAnimationFrame(tick);
    };
    const cIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          cIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counts.forEach(c => cIO.observe(c));
  }

  /* ============================================================
     8) Active section highlight in nav
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const sIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach(a => {
            a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.45 });
    sections.forEach(s => sIO.observe(s));
  }

  /* ============================================================
     9) Testimonials slider
     ============================================================ */
  const testiTrack = document.getElementById('testiTrack');
  const testiPrev  = document.getElementById('testiPrev');
  const testiNext  = document.getElementById('testiNext');
  const testiDots  = document.getElementById('testiDots');

  if (testiTrack) {
    const cards = testiTrack.children;
    let visible = 3;
    let index = 0;
    let auto;

    const computeVisible = () => {
      const w = window.innerWidth;
      visible = w < 600 ? 1 : (w < 920 ? 2 : 3);
    };

    const totalPages = () => Math.max(1, Math.ceil(cards.length / visible));

    const buildDots = () => {
      if (!testiDots) return;
      testiDots.innerHTML = '';
      const pages = totalPages();
      for (let i = 0; i < pages; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        testiDots.appendChild(b);
      }
      updateDots();
    };

    const updateDots = () => {
      if (!testiDots) return;
      [...testiDots.children].forEach((d, i) => d.classList.toggle('active', i === index));
    };

    const goTo = (i) => {
      const pages = totalPages();
      index = (i + pages) % pages;
      const offsetPercent = (100 / visible) * visible * index;
      testiTrack.style.transform = `translateX(-${offsetPercent}%)`;
      updateDots();
    };

    const startAuto = () => {
      stopAuto();
      auto = setInterval(() => goTo(index + 1), 5500);
    };
    const stopAuto = () => { if (auto) clearInterval(auto); };

    const init = () => {
      computeVisible();
      buildDots();
      goTo(0);
      startAuto();
    };

    testiPrev?.addEventListener('click', () => { goTo(index - 1); startAuto(); });
    testiNext?.addEventListener('click', () => { goTo(index + 1); startAuto(); });
    testiTrack.addEventListener('mouseenter', stopAuto);
    testiTrack.addEventListener('mouseleave', startAuto);

    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(init, 200);
    });

    init();
  }

  /* ============================================================
     10) === WhatsApp redirect for the FREE DEMO form ===
         Builds a formatted WhatsApp message with all submitted
         info and opens https://wa.me/<number>?text=<message>.
     ============================================================ */
  const demoForm     = document.getElementById('demoForm');
  const demoSuccess  = document.getElementById('demoSuccess');
  const demoFallback = document.getElementById('demoFallback');

  /** Build the WhatsApp deep-link URL for a payload */
  const buildWhatsAppURL = (text) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  /** Compose the demo-class WhatsApp message */
  const buildDemoMessage = (data) => {
    const today = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    return [
      `*New Free Demo Class Request*`,
      `_via Maths with Sahil Verma website_`,
      ``,
      `*Student Name:* ${data.name || '-'}`,
      `*Class:* ${data.class || '-'}`,
      `*Phone:* ${data.phone || '-'}`,
      `*Subject / Stream:* ${data.subject || '-'}`,
      `*Preferred Timing:* ${data.timing || '-'}`,
      ``,
      `Submitted: ${today}`,
      ``,
      `Hello Sahil sir, I'd like to book my free demo class. Please confirm a slot. Thank you!`
    ].join('\n');
  };

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // HTML5 validation
      if (!demoForm.checkValidity()) {
        demoForm.reportValidity();
        return;
      }

      const data = {
        name:    demoForm.name.value.trim(),
        class:   demoForm.class.value,
        phone:   demoForm.phone.value.trim(),
        subject: demoForm.subject.value,
        timing:  demoForm.timing.value,
      };

      const url = buildWhatsAppURL(buildDemoMessage(data));

      // Open WhatsApp in a new tab. Most browsers will route to the
      // native app if installed (mobile) or web.whatsapp.com (desktop).
      const win = window.open(url, '_blank', 'noopener,noreferrer');

      // If the popup was blocked, fall back to a same-tab redirect.
      if (!win) {
        window.location.href = url;
      }

      // Show success message + give the user a manual fallback link.
      if (demoSuccess) {
        demoSuccess.hidden = false;
        if (demoFallback) {
          demoFallback.href = url;
          demoFallback.target = '_blank';
          demoFallback.rel = 'noopener';
        }
      }

      // Reset the form so it can be reused
      demoForm.reset();
    });
  }

  /* ============================================================
     11) === WhatsApp redirect for the QUICK INQUIRY form ===
     ============================================================ */
  const inquiryForm     = document.getElementById('inquiryForm');
  const inquirySuccess  = document.getElementById('inquirySuccess');
  const inquiryFallback = document.getElementById('inquiryFallback');

  const buildInquiryMessage = (data) => {
    const today = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    return [
      `*New Inquiry*`,
      `_via Maths with Sahil Verma website_`,
      ``,
      `*Name:* ${data.name || '-'}`,
      `*Phone:* ${data.phone || '-'}`,
      `*Message:* ${data.message || '(no message provided)'}`,
      ``,
      `Submitted: ${today}`,
    ].join('\n');
  };

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!inquiryForm.checkValidity()) {
        inquiryForm.reportValidity();
        return;
      }

      const data = {
        name:    inquiryForm.name.value.trim(),
        phone:   inquiryForm.phone.value.trim(),
        message: inquiryForm.message.value.trim(),
      };

      const url = buildWhatsAppURL(buildInquiryMessage(data));
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) window.location.href = url;

      if (inquirySuccess) {
        inquirySuccess.hidden = false;
        if (inquiryFallback) {
          inquiryFallback.href = url;
          inquiryFallback.target = '_blank';
          inquiryFallback.rel = 'noopener';
        }
      }

      inquiryForm.reset();
    });
  }

  /* ============================================================
     12) Back-to-top
     ============================================================ */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const update = () => backToTop.classList.toggle('visible', window.scrollY > 600);
    window.addEventListener('scroll', update, { passive: true });
    update();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     13) Footer year
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
