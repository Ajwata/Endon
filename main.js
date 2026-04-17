/* ── Entry animations ────────────────────────────────── */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  function triggerAnim(el) {
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('anim-in'), delay);
  }

  // Animate everything visible on load
  document.querySelectorAll('[data-anim]').forEach(triggerAnim);

  /* ── Counter final value ────────────────────────────── */
  document.querySelectorAll('.counter').forEach(el => {
    el.textContent = el.dataset.target;
  });

  /* ── Smooth hash navigation ─────────────────────────── */
  const navBar = document.querySelector('.nav-bar');
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  function setMenuState(isOpen) {
    if (!navBar || !navToggle || !siteNav) {
      return;
    }

    navBar.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  }

  function getNavOffset() {
    return (navBar?.offsetHeight || 0) + 28;
  }

  function smoothScrollToHash(hash, updateHistory = true) {
    if (!hash || !hash.startsWith('#')) {
      return;
    }

    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    const targetTop = window.scrollY + target.getBoundingClientRect().top - getNavOffset();
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: reduceMotion ? 'auto' : 'smooth' });

    if (updateHistory) {
      window.history.replaceState(null, '', hash);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');

      if (!hash || hash === '#') {
        return;
      }

      const target = document.querySelector(hash);
      if (!target) {
        return;
      }

      event.preventDefault();
      setMenuState(false);
      smoothScrollToHash(hash);
    });
  });

  navToggle?.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  document.addEventListener('click', event => {
    if (!navBar || !navBar.classList.contains('is-open')) {
      return;
    }

    if (!navBar.contains(event.target)) {
      setMenuState(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) {
      setMenuState(false);
    }
  });

  if (window.location.hash) {
    window.addEventListener('load', () => smoothScrollToHash(window.location.hash, false), { once: true });
  }

  /* ── Scroll-triggered animations ────────────────────── */
  // (for future sections below the fold)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            triggerAnim(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-anim]:not(.anim-in)').forEach(el => io.observe(el));
  }

  /* ── Feature section slide-in animations ────────────── */
  if ('IntersectionObserver' in window) {
    const pfIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            // Stagger: text slightly before visual
            const delay = e.target.classList.contains('pf-text') ? 0 : 120;
            setTimeout(() => e.target.classList.add('is-visible'), delay);
            pfIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.pf-anim').forEach(el => pfIO.observe(el));
  }

  // Scrolly FEATURES was replaced with a static 3-card layout.

  /* ── FAQ accordion ───────────────────────────────────── */
  function closeFaq(answer) {
    answer.classList.add('is-closing');
    const currentHeight = answer.scrollHeight;
    answer.style.height = `${currentHeight}px`;
    answer.classList.remove('is-open');

    requestAnimationFrame(() => {
      answer.style.height = '0px';
    });

    const handleClose = () => {
      answer.hidden = true;
      answer.style.height = '';
      answer.classList.remove('is-closing');
      answer.removeEventListener('transitionend', handleClose);
    };

    answer.addEventListener('transitionend', handleClose);
  }

  function openFaq(answer) {
    answer.classList.remove('is-closing');
    answer.hidden = false;
    answer.style.height = '0px';

    requestAnimationFrame(() => {
      answer.classList.add('is-open');
      answer.style.height = `${answer.scrollHeight}px`;
    });

    const handleOpen = () => {
      answer.style.height = 'auto';
      answer.removeEventListener('transitionend', handleOpen);
    };

    answer.addEventListener('transitionend', handleOpen);
  }

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';
      const answer = this.nextElementSibling;

      // Close all others
      document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(other => {
        if (other !== this) {
          other.setAttribute('aria-expanded', 'false');
          closeFaq(other.nextElementSibling);
        }
      });

      // Toggle current
      this.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        closeFaq(answer);
      } else {
        openFaq(answer);
      }
    });
  });

  /* ── Scroll progress line ────────────────────────────── */
  if (!reduceMotion) {
    const setScrollProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
    };

    setScrollProgress();
    window.addEventListener('scroll', setScrollProgress, { passive: true });
    window.addEventListener('resize', setScrollProgress);
  }

  /* ── Cinematic section reveals ───────────────────────── */
  const revealTargets = document.querySelectorAll(
    '.why-endon, .team-section, .waitlist-block, .legal-links, .site-footer'
  );

  revealTargets.forEach(el => el.classList.add('reveal-on-scroll'));

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -60px 0px' }
    );

    revealTargets.forEach(el => revealIO.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('reveal-visible'));
  }

  /* ── FAQ item stagger in ─────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const faqIO = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Array.from(faqItems).indexOf(entry.target);
            const delay = Math.max(0, idx) * 60;
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            faqIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    faqItems.forEach(item => faqIO.observe(item));
  } else {
    faqItems.forEach(item => item.classList.add('is-visible'));
  }

  /* ── Pointer glow on CTA buttons ─────────────────────── */
  if (!reduceMotion && finePointer) {
    document.querySelectorAll('.cta-button, .waitlist-button').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--mx', `${x}px`);
        btn.style.setProperty('--my', `${y}px`);
      });
    });
  }

  /* ── 3D tilt for visuals/cards ───────────────────────── */
  if (!reduceMotion && finePointer) {
    const tiltTargets = document.querySelectorAll('.pf-img, .team-card');

    tiltTargets.forEach(el => {
      el.classList.add('tilt-surface');

      el.addEventListener('pointermove', e => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 8;
        const ry = (px - 0.5) * 10;

        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      });

      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }
})();
