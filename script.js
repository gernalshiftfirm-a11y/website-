/* ====================================================================
   ADDICTION FITNESS FACTORY — interactions
   ==================================================================== */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1) LOADER
  ============================================================ */
  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('done'), reduced ? 200 : 1500);
    setTimeout(() => loader.remove(), reduced ? 600 : 2300);
  });

  /* ============================================================
     2) CUSTOM CURSOR (desktop, hover-capable only)
  ============================================================ */
  (() => {
    const cursor = $('#cursor');
    if (!cursor) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      cursor.remove();
      return;
    }
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tick);
    };
    tick();

    const hoverSel = 'a, button, [role="radio"], .g-item, summary, input, select, textarea, [data-tilt], .ba, .float-wa, .float-call';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) cursor.classList.remove('is-hover');
    });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  })();

  /* ============================================================
     3) STICKY NAV + MOBILE MENU
  ============================================================ */
  const nav = $('#nav');
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = $('#navToggle');
  const navLinks  = $('#navLinks');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================================
     4) SMOOTH SCROLL (with sticky-nav offset)
  ============================================================ */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.length <= 1 || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav?.offsetHeight ?? 70;
      const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ============================================================
     5) REVEAL ON SCROLL — with auto stagger
  ============================================================ */
  $$('.stagger').forEach(el => {
    const parent = el.parentElement;
    if (!parent || parent.dataset._staggered) return;
    parent.dataset._staggered = '1';
    parent.querySelectorAll(':scope > .stagger').forEach((s, idx) => {
      s.style.setProperty('--d', `${idx * 0.08}s`);
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  /* ============================================================
     6) COUNTERS
  ============================================================ */
  const counters = $$('.hero__stat strong[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const duration = reduced ? 200 : 1800;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const val = Math.floor(easeOut(p) * target);
        el.textContent = val.toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('en-IN');
      };
      requestAnimationFrame(tick);
    };
    const cIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); cIO.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => cIO.observe(c));
  }

  /* ============================================================
     7) THEME TOGGLE (dark / light) — persists in localStorage
  ============================================================ */
  (() => {
    const toggle = $('#themeToggle');
    if (!toggle) return;

    const STORAGE_KEY = 'aff-theme';
    const apply = (theme) => {
      document.documentElement.dataset.theme = theme;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0a0a');
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') apply(stored);

    toggle.addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      const next = cur === 'light' ? 'dark' : 'light';
      apply(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  })();

  /* ============================================================
     8) MOUSE-FOLLOW GLOW on cards (--mx / --my)
  ============================================================ */
  if (window.matchMedia('(hover: hover)').matches && !reduced) {
    $$('.feature, .plan, .tool').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top)  / r.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ============================================================
     9) TILT effect (subtle 3D on data-tilt cards)
  ============================================================ */
  if (window.matchMedia('(hover: hover) and (min-width: 920px)').matches && !reduced) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${-py * 4}deg) rotateY(${px * 5}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ============================================================
     10) BEFORE / AFTER SLIDER (drag + click + keyboard)
  ============================================================ */
  (() => {
    const ba = $('#baSlider');
    const after = $('#baAfter');
    const handle = $('#baHandle');
    if (!ba || !after || !handle) return;

    let dragging = false;

    const setPos = (clientX) => {
      const r = ba.getBoundingClientRect();
      let x = clientX - r.left;
      x = Math.max(0, Math.min(x, r.width));
      const pct = (x / r.width) * 100;
      after.style.width = pct + '%';
      handle.style.left = pct + '%';
      ba.setAttribute('aria-valuenow', String(Math.round(pct)));
    };

    const setPct = (pct) => {
      pct = Math.max(0, Math.min(pct, 100));
      after.style.width = pct + '%';
      handle.style.left = pct + '%';
      ba.setAttribute('aria-valuenow', String(Math.round(pct)));
    };

    const start = (e) => {
      dragging = true;
      ba.style.cursor = 'grabbing';
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };
    const end = () => { dragging = false; ba.style.cursor = ''; };

    ba.addEventListener('mousedown', start);
    ba.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    ba.addEventListener('keydown', (e) => {
      const cur = parseInt(ba.getAttribute('aria-valuenow'), 10) || 50;
      if (e.key === 'ArrowLeft')  { setPct(cur - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPct(cur + 4); e.preventDefault(); }
      if (e.key === 'Home')       { setPct(0);       e.preventDefault(); }
      if (e.key === 'End')        { setPct(100);     e.preventDefault(); }
    });

    // Wiggle once when first scrolled into view
    if ('IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const seq = [70, 30, 50];
            let i = 0;
            const step = () => {
              after.style.transition = 'width .8s cubic-bezier(.2,.9,.3,1)';
              handle.style.transition = 'left .8s cubic-bezier(.2,.9,.3,1)';
              setPct(seq[i++]);
              if (i < seq.length) setTimeout(step, 850);
              else setTimeout(() => {
                after.style.transition = '';
                handle.style.transition = '';
              }, 850);
            };
            setTimeout(step, 400);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      io.observe(ba);
    }
  })();

  /* ============================================================
     11) REVIEWS CAROUSEL — autoplay, dots, swipe
  ============================================================ */
  (() => {
    const track = $('#reviewTrack');
    const prevBtn = $('#reviewPrev');
    const nextBtn = $('#reviewNext');
    const dotsEl = $('#reviewDots');
    if (!track || !prevBtn || !nextBtn || !dotsEl) return;

    const cards = track.querySelectorAll('.r-card');

    const getPerView = () => {
      const w = window.innerWidth;
      if (w < 620) return 1;
      if (w < 980) return 2;
      return 3;
    };

    let perView = getPerView();
    let totalPages = Math.max(1, Math.ceil(cards.length / perView));
    let page = 0;
    let auto = null;

    const buildDots = () => {
      dotsEl.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Go to review page ${i + 1}`);
        if (i === page) b.classList.add('active');
        b.addEventListener('click', () => goTo(i, true));
        dotsEl.appendChild(b);
      }
    };

    const update = () => {
      const w = track.parentElement.getBoundingClientRect().width;
      track.style.transform = `translateX(-${page * w}px)`;
      dotsEl.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('active', i === page);
      });
      prevBtn.disabled = page === 0;
      nextBtn.disabled = page === totalPages - 1;
    };

    const goTo = (i, userInitiated = false) => {
      page = (i + totalPages) % totalPages;
      update();
      if (userInitiated) restartAuto();
    };

    const next = (u = false) => goTo(page + 1, u);
    const prev = (u = false) => goTo(page - 1, u);

    prevBtn.addEventListener('click', () => prev(true));
    nextBtn.addEventListener('click', () => next(true));

    // touch swipe
    let startX = 0, deltaX = 0, swiping = false;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      swiping = true;
    }, { passive: true });
    track.addEventListener('touchmove', (e) => {
      if (!swiping) return;
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      if (!swiping) return;
      if (Math.abs(deltaX) > 50) deltaX < 0 ? next(true) : prev(true);
      deltaX = 0; swiping = false;
    });

    const startAuto = () => {
      if (reduced) return;
      auto = setInterval(() => {
        if (page < totalPages - 1) next(false);
        else goTo(0, false);
      }, 6000);
    };
    const restartAuto = () => { clearInterval(auto); startAuto(); };

    const slider = track.closest('.slider');
    slider?.addEventListener('mouseenter', () => clearInterval(auto));
    slider?.addEventListener('mouseleave', startAuto);

    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        const newPv = getPerView();
        if (newPv !== perView) {
          perView = newPv;
          totalPages = Math.max(1, Math.ceil(cards.length / perView));
          page = Math.min(page, totalPages - 1);
          buildDots();
        }
        update();
      }, 120);
    });

    buildDots();
    update();
    startAuto();
  })();

  /* ============================================================
     12) LIGHTBOX GALLERY
  ============================================================ */
  (() => {
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightboxImg');
    const items = $$('[data-lightbox]');
    if (!lightbox || !lightboxImg || !items.length) return;

    let idx = 0;
    const open = (i) => {
      idx = (i + items.length) % items.length;
      lightboxImg.src = items[idx].href;
      lightboxImg.alt = items[idx].querySelector('img')?.alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
    };

    items.forEach((item, i) => {
      item.addEventListener('click', (e) => { e.preventDefault(); open(i); });
    });

    lightbox.querySelector('.lightbox__close')?.addEventListener('click', close);
    lightbox.querySelector('.lightbox__nav--prev')?.addEventListener('click', () => open(idx - 1));
    lightbox.querySelector('.lightbox__nav--next')?.addEventListener('click', () => open(idx + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape')     close();
      else if (e.key === 'ArrowRight') open(idx + 1);
      else if (e.key === 'ArrowLeft')  open(idx - 1);
    });
  })();

  /* ============================================================
     13) PLAN CTA → Plan cards now link directly to WhatsApp,
                    so no preselect logic needed.
  ============================================================ */

  /* ============================================================
     14) BMI CALCULATOR
  ============================================================ */
  (() => {
    const btn = $('#bmiCalc');
    const result = $('#bmiResult');
    const valueEl = $('#bmiValue');
    const tagEl = $('#bmiTag');
    const noteEl = $('#bmiNote');
    if (!btn) return;

    const interpret = (b) => {
      if (b < 18.5) return { tag: 'Underweight',     cls: 'is-warn', note: 'Focus on calorie surplus & strength training. Coach Anshul can build you a clean lean-bulk plan.' };
      if (b < 25)   return { tag: 'Healthy Range',   cls: 'is-good', note: 'Solid baseline. Add progressive resistance training to build lean muscle and stay sharp.' };
      if (b < 30)   return { tag: 'Overweight',      cls: 'is-warn', note: 'A structured fat-loss programme + cardio + strength = visible results in 12 weeks. We do this every day.' };
      return        { tag: 'Obese',                  cls: '',        note: 'A coach-led transformation programme is the fastest, safest path. Start with a free trial — we\'ll guide you.' };
    };

    btn.addEventListener('click', () => {
      const h = parseFloat($('#bmi-h')?.value);
      const w = parseFloat($('#bmi-w')?.value);
      if (!h || !w || h < 100 || h > 230 || w < 30 || w > 250) {
        result.hidden = false;
        valueEl.textContent = '--';
        tagEl.textContent = 'Invalid input';
        tagEl.className = 'tool__result-tag is-warn';
        noteEl.textContent = 'Enter a height between 100–230 cm and weight between 30–250 kg.';
        return;
      }
      const m = h / 100;
      const bmi = w / (m * m);
      const info = interpret(bmi);
      result.hidden = false;
      valueEl.textContent = bmi.toFixed(1);
      tagEl.textContent = info.tag;
      tagEl.className = 'tool__result-tag ' + info.cls;
      noteEl.textContent = info.note;
    });
  })();

  /* ============================================================
     15) CALORIE CALCULATOR (Mifflin–St Jeor)
  ============================================================ */
  (() => {
    const btn = $('#calCalc');
    const result = $('#calResult');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const age = parseFloat($('#cal-age')?.value);
      const sex = $('#cal-sex')?.value;
      const h   = parseFloat($('#cal-h')?.value);
      const w   = parseFloat($('#cal-w')?.value);
      const act = parseFloat($('#cal-act')?.value);

      if (!age || !h || !w || age < 13 || age > 100 || h < 100 || h > 230 || w < 30 || w > 250) {
        result.hidden = false;
        $('#calMaint').textContent = '--';
        $('#calCut').textContent = '--';
        $('#calBulk').textContent = '--';
        return;
      }

      // Mifflin-St Jeor
      let bmr = 10 * w + 6.25 * h - 5 * age;
      bmr += sex === 'm' ? 5 : -161;
      const tdee = Math.round(bmr * act);
      const cut  = Math.round(tdee * 0.8);
      const bulk = Math.round(tdee * 1.15);

      result.hidden = false;
      $('#calMaint').textContent = tdee.toLocaleString('en-IN');
      $('#calCut').textContent   = cut.toLocaleString('en-IN');
      $('#calBulk').textContent  = bulk.toLocaleString('en-IN');
    });
  })();

  /* ============================================================
     16) GOAL TRACKER
  ============================================================ */
  (() => {
    const chips = $$('.g-chip');
    const btn = $('#goalCalc');
    const result = $('#goalResult');
    if (!btn) return;

    let goal = 'lose';
    chips.forEach(c => {
      c.addEventListener('click', () => {
        chips.forEach(x => x.setAttribute('aria-checked', 'false'));
        c.setAttribute('aria-checked', 'true');
        goal = c.dataset.goal;
      });
    });

    btn.addEventListener('click', () => {
      const cur    = parseFloat($('#track-cur')?.value);
      const tgt    = parseFloat($('#track-tgt')?.value);
      const weeks  = parseFloat($('#track-weeks')?.value) || 12;
      const bar    = $('#goalBar');
      const rate   = $('#goalRate');
      const note   = $('#goalNote');

      if (!cur || !tgt || cur < 30 || cur > 250 || tgt < 30 || tgt > 250 || weeks < 1) {
        result.hidden = false;
        bar.style.width = '0%';
        rate.textContent = '—';
        note.textContent = 'Enter valid current weight, target and timeline.';
        return;
      }

      const diff = tgt - cur;
      const perWeek = diff / weeks;
      const absRate = Math.abs(perWeek);

      // Quick feasibility check
      let safety = '';
      if (goal === 'lose' && absRate > 1)    safety = ' (aggressive — aim for 0.5–1 kg/week for sustainable fat loss)';
      else if (goal === 'gain' && absRate > 0.5) safety = ' (aggressive — 0.25–0.5 kg/week is ideal for clean muscle gain)';
      else if (absRate <= 0.05)              safety = ' (recomposition focus — strength up, body comp better)';

      // progress bar logic — show how close target is to "ideal" range
      const idealCap = goal === 'lose' ? 1 : goal === 'gain' ? 0.5 : 0.3;
      const pct = Math.max(5, Math.min(100, (absRate / idealCap) * 100));

      result.hidden = false;
      bar.style.width = pct + '%';
      rate.textContent = `${perWeek > 0 ? '+' : ''}${perWeek.toFixed(2)} kg / week`;

      const direction = diff > 0 ? 'gain' : (diff < 0 ? 'lose' : 'maintain');
      note.textContent = direction === 'maintain'
        ? 'You\'re at your target — focus on body composition: lift heavy, eat clean.'
        : `To ${direction} ${Math.abs(diff).toFixed(1)} kg in ${weeks} weeks, aim for ${perWeek.toFixed(2)} kg/week${safety}.`;
    });
  })();

  /* ============================================================
     17) JOIN FORM — removed (WhatsApp-only flow now)
  ============================================================ */

  /* ============================================================
     18) NEWSLETTER
  ============================================================ */
  (() => {
    const form = $('#newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      if (!input || !btn) return;
      input.value = '';
      const original = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 3500);
    });
  })();

  /* ============================================================
     19) BACK TO TOP
  ============================================================ */
  (() => {
    const back = $('#backTop');
    if (!back) return;
    const upd = () => back.classList.toggle('visible', window.scrollY > 600);
    window.addEventListener('scroll', upd, { passive: true });
    upd();
    back.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  })();

  /* ============================================================
     20) FOOTER YEAR
  ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     21) ACTIVE SECTION HIGHLIGHT in nav
  ============================================================ */
  (() => {
    const sections = $$('section[id]');
    const links = $$('.nav__links a');
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => io.observe(s));
  })();

  /* ============================================================
     22) HERO VIDEO — fail gracefully if it can't load
  ============================================================ */
  (() => {
    const video = document.querySelector('.hero__video');
    if (!video) return;
    let loaded = false;
    video.addEventListener('loadeddata', () => { loaded = true; });
    // If video hasn't loaded after 4s on slow networks, hide it (poster image will remain via CSS)
    setTimeout(() => {
      if (!loaded) {
        video.style.opacity = '0';
        video.style.transition = 'opacity .6s ease';
      }
    }, 4500);
  })();

})();
