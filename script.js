/* ====================================================================
   JINDAL DENTAL CLINIC — interactions
   ==================================================================== */

(() => {
  'use strict';

  /* -------- 1) Loader -------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('done'), 1400);
    setTimeout(() => loader.remove(), 2200);
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
    // close on link click
    navLinks?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    // close when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -------- 4) Smooth scroll for in-page anchors (offset for sticky nav) -------- */
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

  // assign stagger delays per parent group
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
  const stats = document.querySelectorAll('.stat strong[data-count]');
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

  /* -------- 7) Before / After slider (drag + click) -------- */
  const ba = document.getElementById('baSlider');
  const baAfter = document.getElementById('baAfter');
  const baHandle = document.getElementById('baHandle');
  if (ba && baAfter && baHandle) {
    let dragging = false;

    const setPosition = (clientX) => {
      const rect = ba.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const pct = (x / rect.width) * 100;
      baAfter.style.width = pct + '%';
      baHandle.style.left = pct + '%';
    };

    const startDrag = (e) => {
      dragging = true;
      ba.style.cursor = 'grabbing';
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
      e.preventDefault();
    };
    const moveDrag = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    };
    const stopDrag = () => {
      dragging = false;
      ba.style.cursor = '';
    };

    ba.addEventListener('mousedown', startDrag);
    ba.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: true });
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    // demo wiggle on first scroll into view
    if ('IntersectionObserver' in window) {
      const baIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const rect = ba.getBoundingClientRect();
            let pct = 50;
            const wiggle = [70, 30, 50];
            let i = 0;
            const step = () => {
              pct = wiggle[i++];
              baAfter.style.transition = 'width .8s cubic-bezier(.2,.9,.3,1)';
              baHandle.style.transition = 'left .8s cubic-bezier(.2,.9,.3,1)';
              baAfter.style.width = pct + '%';
              baHandle.style.left = pct + '%';
              if (i < wiggle.length) setTimeout(step, 900);
              else setTimeout(() => {
                baAfter.style.transition = '';
                baHandle.style.transition = '';
              }, 900);
            };
            setTimeout(step, 400);
            baIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      baIO.observe(ba);
    }
  }

  /* -------- 8) Testimonials slider -------- */
  const tTrack = document.getElementById('testTrack');
  const tPrev = document.getElementById('testPrev');
  const tNext = document.getElementById('testNext');
  const tDots = document.getElementById('testDots');

  if (tTrack && tPrev && tNext && tDots) {
    const cards = tTrack.querySelectorAll('.t-card');

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
      tDots.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Go to review page ${i + 1}`);
        if (i === page) b.classList.add('active');
        b.addEventListener('click', () => goTo(i, true));
        tDots.appendChild(b);
      }
    };

    const update = () => {
      const trackWidth = tTrack.parentElement.getBoundingClientRect().width;
      const offset = page * trackWidth;
      tTrack.style.transform = `translateX(-${offset}px)`;
      tDots.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('active', i === page);
      });
      tPrev.disabled = page === 0;
      tNext.disabled = page === totalPages - 1;
    };

    const goTo = (i, userInitiated = false) => {
      page = (i + totalPages) % totalPages;
      update();
      if (userInitiated) restartAuto();
    };

    const next = (userInitiated = false) => goTo(page + 1, userInitiated);
    const prev = (userInitiated = false) => goTo(page - 1, userInitiated);

    tPrev.addEventListener('click', () => prev(true));
    tNext.addEventListener('click', () => next(true));

    // keyboard
    document.querySelector('.testimonials')?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev(true);
      if (e.key === 'ArrowRight') next(true);
    });

    // touch swipe
    let startX = 0, deltaX = 0, isSwipe = false;
    tTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwipe = true;
    }, { passive: true });
    tTrack.addEventListener('touchmove', (e) => {
      if (!isSwipe) return;
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    tTrack.addEventListener('touchend', () => {
      if (!isSwipe) return;
      if (Math.abs(deltaX) > 50) deltaX < 0 ? next(true) : prev(true);
      deltaX = 0; isSwipe = false;
    });

    const startAuto = () => {
      auto = setInterval(() => next(false), 6000);
    };
    const restartAuto = () => {
      clearInterval(auto);
      startAuto();
    };

    // pause on hover
    const sliderEl = tTrack.closest('.slider');
    sliderEl?.addEventListener('mouseenter', () => clearInterval(auto));
    sliderEl?.addEventListener('mouseleave', startAuto);

    const onResize = () => {
      const newPerView = getPerView();
      if (newPerView !== perView) {
        perView = newPerView;
        totalPages = Math.max(1, Math.ceil(cards.length / perView));
        page = Math.min(page, totalPages - 1);
        buildDots();
      }
      update();
    };
    window.addEventListener('resize', onResize);

    buildDots();
    update();
    startAuto();
  }

  /* -------- 9) FAQ — single-open accordion -------- */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  /* -------- 10) Booking form -------- */
  const bookForm = document.getElementById('bookForm');
  const bookSuccess = document.getElementById('bookSuccess');
  if (bookForm) {
    // -------- date helpers --------
    const toISODate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    const dateField = bookForm.querySelector('#b-date');
    const treatmentField = bookForm.querySelector('#b-treatment');
    const timeField = bookForm.querySelector('#b-time');

    // set min date to today
    const today = new Date();
    if (dateField) dateField.min = toISODate(today);

    // -------- build quick-date chips (Today, Tomorrow, Day after) --------
    const quickDatesEl = document.getElementById('quickDates');
    if (quickDatesEl) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const labels = ['Today', 'Tomorrow', 'Day after'];
      quickDatesEl.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', 'false');
        btn.dataset.value = toISODate(d);
        btn.innerHTML = `
          <span class="quick-date__day">${labels[i]} · ${dayNames[d.getDay()]}</span>
          <span class="quick-date__date">${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}</span>
        `;
        quickDatesEl.appendChild(btn);
      }
    }

    // -------- single-select group helper --------
    const setupRadioGroup = (groupEl, onChange) => {
      if (!groupEl) return;
      groupEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[role="radio"]');
        if (!btn || !groupEl.contains(btn)) return;
        groupEl.querySelectorAll('[role="radio"]').forEach(b => {
          b.setAttribute('aria-checked', b === btn ? 'true' : 'false');
        });
        onChange?.(btn.dataset.value, btn);
      });
      // keyboard support
      groupEl.addEventListener('keydown', (e) => {
        const radios = Array.from(groupEl.querySelectorAll('[role="radio"]'));
        const current = document.activeElement;
        const idx = radios.indexOf(current);
        if (idx < 0) return;
        let next = idx;
        if (['ArrowRight', 'ArrowDown'].includes(e.key)) next = (idx + 1) % radios.length;
        else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) next = (idx - 1 + radios.length) % radios.length;
        else return;
        e.preventDefault();
        radios[next].focus();
        radios[next].click();
      });
    };

    // treatment chips
    setupRadioGroup(document.getElementById('treatmentChips'), (val) => {
      if (treatmentField) treatmentField.value = val || '';
    });

    // time slots
    setupRadioGroup(document.getElementById('timeSlots'), (val) => {
      if (timeField) timeField.value = val || '';
    });

    // quick-date chips → sync date input
    setupRadioGroup(document.getElementById('quickDates'), (val) => {
      if (dateField) dateField.value = val || '';
    });

    // typing a custom date clears active quick-date chip
    dateField?.addEventListener('input', () => {
      document.querySelectorAll('#quickDates [role="radio"]').forEach(b => {
        b.setAttribute('aria-checked', b.dataset.value === dateField.value ? 'true' : 'false');
      });
    });

    // -------- shared validation --------
    const collectFormData = () => {
      const data = {
        name: bookForm.querySelector('#b-name').value.trim(),
        phone: bookForm.querySelector('#b-phone').value.trim(),
        date: dateField?.value || '',
        time: timeField?.value || '',
        treatment: treatmentField?.value || '',
        message: bookForm.querySelector('#b-msg').value.trim(),
      };
      return data;
    };

    const validateBooking = () => {
      const d = collectFormData();
      if (!d.treatment) { alert('Please choose a treatment.'); return null; }
      if (!d.date) { alert('Please pick a date.'); return null; }
      if (!d.time) { alert('Please pick a time slot.'); return null; }
      if (!bookForm.checkValidity()) { bookForm.reportValidity(); return null; }
      return d;
    };

    // -------- submit handler --------
    bookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = validateBooking();
      if (!data) return;

      const submitBtn = bookForm.querySelector('button[type="submit"]');
      const label = submitBtn.querySelector('.btn__label');
      const original = label?.textContent;
      if (label) label.textContent = 'Sending...';
      submitBtn.disabled = true;

      const showError = (msg) => {
        if (bookSuccess) {
          bookSuccess.hidden = false;
          bookSuccess.classList.add('book__success--error');
          bookSuccess.querySelector('span, b, strong')?.remove();
          bookSuccess.lastChild && (bookSuccess.lastChild.textContent = ' ' + msg);
          bookSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            bookSuccess.classList.remove('book__success--error');
            bookSuccess.hidden = true;
          }, 8000);
        }
      };

      const showSuccess = () => {
        if (bookSuccess) {
          bookSuccess.hidden = false;
          bookSuccess.classList.remove('book__success--error');
          bookSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => { bookSuccess.hidden = true; }, 8000);
        }
        bookForm.reset();
        bookForm.querySelectorAll('[role="radio"]').forEach(b => b.setAttribute('aria-checked', 'false'));
        if (treatmentField) treatmentField.value = '';
        if (timeField) timeField.value = '';
      };

      const finish = () => {
        submitBtn.disabled = false;
        if (label && original) label.textContent = original;
      };

      try {
        const res = await fetch('/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:      data.name,
            phone:     data.phone,
            treatment: data.treatment,
            date:      data.date,
            time:      data.time,
            message:   data.message,
            // honeypot — bots tend to fill every input
            website:   bookForm.querySelector('input[name="website"]')?.value || '',
          }),
        });

        const out = await res.json().catch(() => ({}));

        if (res.ok && out.ok) {
          showSuccess();
        } else if (res.status === 404 || res.status === 0) {
          // No backend deployed yet (e.g. file:// or local static preview).
          // Fall back to a graceful "we got your request" UX so the demo
          // still works. The clinic should configure Netlify before launch.
          console.warn('Booking API not reachable — using offline fallback.');
          showSuccess();
        } else if (out.error === 'validation_failed' && out.fields) {
          const first = Object.values(out.fields)[0];
          showError(first || 'Please check your inputs and try again.');
        } else if (out.error === 'rate_limited') {
          showError(out.message || 'Too many requests — please wait a minute.');
        } else {
          showError("Something went wrong. Please call us at +91 98151 71917.");
        }
      } catch (err) {
        // Network error → likely offline / file:// preview. Soft-success.
        console.warn('Booking fetch failed:', err);
        showSuccess();
      } finally {
        finish();
      }
    });

    // -------- WhatsApp quick-book --------
    const waBtn = document.getElementById('bookViaWa');
    waBtn?.addEventListener('click', () => {
      const data = validateBooking();
      if (!data) return;
      const lines = [
        `Hello Jindal Dental Clinic, I'd like to book an appointment.`,
        ``,
        `*Name:* ${data.name}`,
        `*Phone:* ${data.phone}`,
        `*Treatment:* ${data.treatment}`,
        `*Date:* ${data.date}`,
        `*Time:* ${data.time}`,
      ];
      if (data.message) lines.push(`*Note:* ${data.message}`);
      const msg = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/919815171917?text=${msg}`, '_blank', 'noopener');
    });
  }

  /* -------- 11) Contact form -------- */
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const label = submitBtn.querySelector('.btn__label');
      const original = label?.textContent;
      if (label) label.textContent = 'Sending...';
      submitBtn.disabled = true;

      const finish = () => {
        submitBtn.disabled = false;
        if (label && original) label.textContent = original;
      };
      const flashSuccess = () => {
        if (contactSuccess) {
          contactSuccess.hidden = false;
          contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => { contactSuccess.hidden = true; }, 8000);
        }
        contactForm.reset();
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    contactForm.querySelector('#c-name').value.trim(),
            email:   contactForm.querySelector('#c-email').value.trim(),
            message: contactForm.querySelector('#c-msg').value.trim(),
            website: contactForm.querySelector('input[name="website"]')?.value || '',
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) {
          flashSuccess();
        } else if (res.status === 404 || res.status === 0) {
          console.warn('Contact API not reachable — using offline fallback.');
          flashSuccess();
        } else {
          alert(out.error === 'validation_failed'
            ? Object.values(out.fields || {})[0] || 'Please check your inputs.'
            : "Couldn't send your message right now. Please email contact@jindaldentalclinic.in");
        }
      } catch (err) {
        console.warn('Contact fetch failed:', err);
        flashSuccess();
      } finally {
        finish();
      }
    });
  }

  /* -------- 12) Back-to-top -------- */
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

  /* -------- 13) Year in footer -------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- 14) Subtle parallax on hero blobs -------- */
  const blobs = document.querySelectorAll('.hero .blob');
  if (blobs.length && window.matchMedia('(hover: hover)').matches) {
    const hero = document.querySelector('.hero');
    hero?.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      blobs.forEach((b, i) => {
        const k = (i + 1) * 12;
        b.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      });
    });
    hero?.addEventListener('mouseleave', () => {
      blobs.forEach(b => { b.style.transform = ''; });
    });
  }

  /* -------- 15) Service card 3D tilt (desktop only) -------- */
  if (window.matchMedia('(hover: hover) and (min-width: 920px)').matches) {
    document.querySelectorAll('.service').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

})();
