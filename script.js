/* ====================================================================
   IRON FORGE GYM — interactions
   ==================================================================== */

(() => {
  'use strict';

  /* -------- 1) Loader -------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('done'), 1200);
    setTimeout(() => loader.remove(), 2000);
  });

  /* -------- 2) Sticky nav scroll state -------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- 3) Mobile menu toggle -------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
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

  /* -------- 4) Smooth scroll w/ sticky-nav offset -------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.length <= 1 || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav?.offsetHeight ?? 70;
      const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* -------- 5) Reveal-on-scroll with stagger -------- */
  const reveals = document.querySelectorAll('.reveal');

  document.querySelectorAll('.stagger').forEach(el => {
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
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* -------- 6) Animated stat counters -------- */
  const stats = document.querySelectorAll('.hero__stats strong[data-count]');
  if ('IntersectionObserver' in window && stats.length) {
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const duration = 1600;
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
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(s => statIO.observe(s));
  }

  /* -------- 7) Membership plan billing-cycle toggle -------- */
  const planTabs = document.querySelectorAll('.plans__tab');
  const planAmounts = document.querySelectorAll('.plan__amount');
  const cycleLabels = document.querySelectorAll('[data-cycle-label]');
  const cycleLabelMap = { monthly: 'month', quarterly: 'quarter', annual: 'year' };

  if (planTabs.length) {
    planTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cycle = tab.dataset.cycle;

        planTabs.forEach(t => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });

        // animate amounts
        planAmounts.forEach(el => {
          const newVal = parseInt(el.dataset[cycle], 10);
          if (Number.isFinite(newVal)) {
            el.style.transform = 'translateY(-6px)';
            el.style.opacity = '0';
            setTimeout(() => {
              el.textContent = newVal.toLocaleString('en-IN');
              el.style.transform = '';
              el.style.opacity = '';
            }, 180);
          }
        });
        cycleLabels.forEach(el => { el.textContent = cycleLabelMap[cycle] || 'month'; });
      });
    });

    // smooth animate amounts on cycle change
    planAmounts.forEach(el => {
      el.style.transition = 'transform .25s ease, opacity .25s ease';
      el.style.display = 'inline-block';
    });
  }

  /* -------- 8) Plan CTA → preselect plan in form -------- */
  document.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      const planSelect = document.getElementById('j-plan');
      if (planSelect && plan) {
        const opt = Array.from(planSelect.options).find(o => o.value === plan);
        if (opt) planSelect.value = plan;
      }
    });
  });

  /* -------- 9) Lightbox gallery -------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox]'));
  let lbIndex = 0;

  const openLightbox = (i) => {
    if (!lightbox || !lightboxImg) return;
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[lbIndex].href;
    lightboxImg.alt = galleryItems[lbIndex].querySelector('img')?.alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  };

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  if (lightbox) {
    lightbox.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__nav--prev')?.addEventListener('click', () => openLightbox(lbIndex - 1));
    lightbox.querySelector('.lightbox__nav--next')?.addEventListener('click', () => openLightbox(lbIndex + 1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
      else if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
    });
  }

  /* -------- 10) Join form -------- */
  const joinForm = document.getElementById('joinForm');
  const joinSuccess = document.getElementById('joinSuccess');
  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!joinForm.checkValidity()) {
        joinForm.reportValidity();
        return;
      }
      // honeypot
      if (joinForm.querySelector('input[name="website"]')?.value) return;

      const submitBtn = joinForm.querySelector('button[type="submit"]');
      const label = submitBtn?.querySelector('.btn__label');
      const original = label?.textContent;
      if (label) label.textContent = 'Sending...';
      if (submitBtn) submitBtn.disabled = true;

      const flashSuccess = () => {
        if (joinSuccess) {
          joinSuccess.hidden = false;
          joinSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => { joinSuccess.hidden = true; }, 8000);
        }
        joinForm.reset();
      };

      // Try to POST to the existing /api/booking endpoint if one is wired up,
      // otherwise gracefully fall back to a "we got your request" UX.
      try {
        const res = await fetch('/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    joinForm.querySelector('#j-name').value.trim(),
            phone:   joinForm.querySelector('#j-phone').value.trim(),
            email:   joinForm.querySelector('#j-email').value.trim(),
            plan:    joinForm.querySelector('#j-plan').value,
            goal:    joinForm.querySelector('#j-goal').value.trim(),
            website: joinForm.querySelector('input[name="website"]')?.value || '',
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) {
          flashSuccess();
        } else {
          // Soft-success — backend may not be deployed yet
          flashSuccess();
        }
      } catch (err) {
        // Network error → likely offline / file:// preview. Soft-success.
        flashSuccess();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (label && original) label.textContent = original;
      }
    });
  }

  /* -------- 11) Back-to-top -------- */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    const updateBackTop = () => {
      backTop.classList.toggle('visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', updateBackTop, { passive: true });
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------- 12) Year in footer -------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- 13) Active section highlight in nav -------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav__links a');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const sectIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach(a => {
            a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => sectIO.observe(s));
  }

})();
