(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const zoneCopy = {
    food: {
      title: 'Il Food Court supera la soglia di ritiro.',
      copy: 'Route Food Court attiva: apri una corsia extra e sposta staff verso i vendor più richiesti.'
    },
    vip: {
      title: 'Area VIP attiva con flusso riservato.',
      copy: 'Route VIP attiva: mantieni il percorso separato e velocizza il servizio premium.'
    },
    bar: {
      title: 'Il Bar mostra pressione in aumento.',
      copy: 'Route Bar attiva: bilancia la domanda tra banco principale e punto drink secondario.'
    },
    hospitality: {
      title: 'Hospitality attiva per ospiti premium.',
      copy: 'Route Hospitality attiva: guida ospiti e staff verso il punto servizio dedicato.'
    },
    merch: {
      title: 'Merch attivo durante la finestra di picco.',
      copy: 'Route Merch attiva: separa il traffico shop dal food and beverage e riduci incroci di fila.'
    },
    pickup: {
      title: 'Pickup attivo per ordini pronti.',
      copy: 'Route Pickup attiva: porta il pubblico al punto ritiro corretto con codice e tempo stimato.'
    }
  };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.body.classList.add('loaded');
    prepareTextReveal();
    setupHeaderState();
    setupMobileNav();
    setupReveal();
    setupCounts();
    setupCursor();
    setupParallax();
    setupMagneticButtons();
    setupMapDemo();
    setupForm();
    setupYear();
  });


  function prepareTextReveal() {
    const selectors = [
      '[data-split]',
      'main h1',
      'main h2',
      'main h3',
      'main h4',
      'main p',
      'main li',
      'main .eyebrow',
      'main .section-copy',
      'main .hero-copy',
      '.demo-form label',
      '.site-footer p',
      '.site-footer a'
    ].join(',');

    document.querySelectorAll(selectors).forEach(function (el) {
      if (shouldSkipSplit(el)) return;
      el.classList.add('reveal-text');
      el.setAttribute('data-split', '');
    });

    splitText();
  }

  function shouldSkipSplit(el) {
    if (!el || el.dataset.noSplit !== undefined) return true;
    if (el.dataset.count !== undefined || el.querySelector('[data-count]')) return true;
    if (el.closest('.no-split, .site-loader, svg, select, textarea, button, .map-canvas, .map-sidebar, .map-legend, .map-top, .zoom-ui, .hero-tab-group, .hero-mini-stats, .kpi-card, .dash-stat-grid, .analytics-kpis, .product-row')) return true;
    if (el.matches('input, select, textarea, option, button, img, svg')) return true;
    if (!el.textContent || !el.textContent.trim()) return true;
    const text = el.textContent.trim();
    if (text.length <= 1) return true;
    return false;
  }

  function splitText() {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      if (el.dataset.splitDone || shouldSkipSplit(el)) return;
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      el.setAttribute('aria-label', text);
      el.innerHTML = text.split(' ').map(function (word, index) {
        const safeIndex = Math.min(index, 42);
        return '<span class="word" style="--i:' + safeIndex + '">' + escapeHtml(word) + '</span>';
      }).join(' ');
      el.dataset.splitDone = 'true';
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupHeaderState() {
    const header = document.querySelector('[data-header]');
    const progress = document.querySelector('.progress-line');
    let ticking = false;

    function update() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = (window.scrollY / max) * 100;
      if (progress) progress.style.width = ratio + '%';
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
      ticking = false;
    }

    update();
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  function setupMobileNav() {
    const header = document.querySelector('[data-header]');
    const button = document.querySelector('.navbar-toggler');
    const menu = document.querySelector('.navbar-collapse');
    if (!button || !menu) return;

    function closeMenu() {
      menu.classList.remove('show');
      if (header) header.classList.remove('nav-open');
      button.setAttribute('aria-expanded', 'false');
    }

    button.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('show');
      if (header) header.classList.toggle('nav-open', isOpen);
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 992) closeMenu();
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992) closeMenu();
    }, { passive: true });
  }

  function setupReveal() {
    const targets = Array.from(document.querySelectorAll([
      '[data-section]', '.reveal-up', '.reveal-left', '.reveal-device', '.reveal-text',
      '.dashboard-card', '.map-app', '.analytics-board', '.info-card', '.stage-card',
      '.flow-card', '.step-card', '.small-feature', '.use-card', '.kpi-card', '.zone'
    ].join(',')));

    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.matches('[data-animate-group]')) animateGroup(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { observer.observe(el); });
    document.querySelectorAll('[data-animate-group]').forEach(function (el) { observer.observe(el); });
  }

  function animateGroup(group) {
    Array.from(group.children).forEach(function (child, index) {
      child.style.setProperty('--delay', (index * 0.08) + 's');
      child.classList.add('is-visible');
    });
  }

  function setupCounts() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      counters.forEach(countUp);
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    counters.forEach(function (counter) { observer.observe(counter); });
  }

  function countUp(el) {
    if (!el || el.dataset.done) return;
    el.dataset.done = 'true';
    const target = Number(el.dataset.count || 0);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1300;
    const start = performance.now();

    function format(value) {
      return prefix + Math.floor(value).toLocaleString('it-IT') + suffix;
    }

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = format(target);
    }

    requestAnimationFrame(tick);
  }

  function setupCursor() {
    const cursor = document.querySelector('.cursor-dot');
    if (prefersReduced || isTouchLike || !cursor) return;
    let raf = null;
    let x = -100;
    let y = -100;

    window.addEventListener('pointermove', function (event) {
      x = event.clientX;
      y = event.clientY;
      if (!raf) {
        raf = requestAnimationFrame(function () {
          cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
          raf = null;
        });
      }
    }, { passive: true });

    document.querySelectorAll('a, button, input, select, textarea').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cursor.classList.add('is-hovering'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('is-hovering'); });
    });
  }

  function setupParallax() {
    if (prefersReduced || isTouchLike) return;

    document.querySelectorAll('[data-parallax-wrap]').forEach(function (wrap) {
      wrap.addEventListener('pointermove', function (event) {
        const rect = wrap.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        wrap.querySelectorAll('[data-parallax]').forEach(function (el) {
          const depth = Number(el.dataset.parallax || 8);
          el.style.transform = 'translate3d(' + (x * depth) + 'px,' + (y * depth) + 'px,0) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
        });
      });

      wrap.addEventListener('pointerleave', function () {
        wrap.querySelectorAll('[data-parallax]').forEach(function (el) {
          el.style.transform = '';
        });
      });
    });
  }

  function setupMagneticButtons() {
    if (prefersReduced || isTouchLike) return;

    document.querySelectorAll('.magnetic').forEach(function (button) {
      button.addEventListener('pointermove', function (event) {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
        button.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });

      button.addEventListener('pointerleave', function () {
        button.style.transform = '';
      });
    });
  }

  function setupMapDemo() {
    const canvas = document.querySelector('.zones-section .map-canvas');
    const zoomLayer = document.querySelector('.zones-section .map-zoom-layer');
    const zoomLabel = document.querySelector('[data-zoom-label]');
    const buttons = Array.from(document.querySelectorAll('.zones-section [data-zone]'));
    const zoneButtons = Array.from(document.querySelectorAll('.zones-section [data-map-zone]'));
    const alertTitle = document.querySelector('[data-zone-alert-title]');
    const alertCopy = document.querySelector('[data-zone-alert-copy]');
    const zones = Object.keys(zoneCopy);
    let zoom = 1;

    if (!canvas) return;

    function setZoom(nextZoom) {
      zoom = Math.max(0.88, Math.min(1.18, nextZoom));
      canvas.style.setProperty('--map-zoom', zoom.toFixed(2));
      if (zoomLayer) zoomLayer.style.transform = 'scale(' + zoom.toFixed(2) + ')';
      if (zoomLabel) zoomLabel.textContent = Math.round(zoom * 100) + '%';
    }

    function clearPop() {
      canvas.querySelectorAll('.zone-focus-pop').forEach(function (zoneEl) {
        zoneEl.classList.remove('zone-focus-pop');
      });
      buttons.forEach(function (button) { button.classList.remove('btn-zone-pop'); });
    }

    function activate(zone, source) {
      if (zones.indexOf(zone) === -1) return;

      zones.forEach(function (name) {
        canvas.classList.remove('zone-' + name);
      });
      canvas.classList.add('zone-' + zone);

      buttons.forEach(function (button) {
        const isActive = button.dataset.zone === zone;
        button.classList.toggle('active', isActive);
        if (isActive && source === 'click') {
          button.classList.remove('btn-zone-pop');
          void button.offsetWidth;
          button.classList.add('btn-zone-pop');
        }
      });

      clearPop();
      const selected = canvas.querySelector('[data-map-zone="' + zone + '"]');
      if (selected && source === 'click') {
        selected.classList.add('zone-focus-pop');
        window.setTimeout(function () { selected.classList.remove('zone-focus-pop'); }, 720);
      }

      if (alertTitle && zoneCopy[zone]) alertTitle.textContent = zoneCopy[zone].title;
      if (alertCopy && zoneCopy[zone]) alertCopy.textContent = zoneCopy[zone].copy;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activate(button.dataset.zone, 'click');
      });
    });

    zoneButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activate(button.dataset.mapZone, 'click');
      });
    });

    document.querySelectorAll('.zones-section [data-zoom]').forEach(function (button) {
      button.addEventListener('click', function () {
        const direction = button.dataset.zoom;
        setZoom(zoom + (direction === 'in' ? 0.08 : -0.08));
      });
    });

    setZoom(1);
    activate('food', 'init');
  }

  function setupForm() {
    document.querySelectorAll('form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const status = form.querySelector('.form-status');
        if (!button) return;
        const oldText = button.textContent;
        button.disabled = true;
        button.textContent = 'Richiesta review pronta';
        if (status) {
          status.textContent = 'Grazie. Ti contatteremo per programmare una demo focalizzata sul tuo evento.';
        }
        window.setTimeout(function () {
          button.disabled = false;
          button.textContent = oldText;
        }, 2800);
      });
    });
  }

  function setupYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
