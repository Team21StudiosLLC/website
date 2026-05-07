(function () {
  function setupStickyNavbar() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function updateNavbarState() {
      var shouldPin = window.scrollY > 84;
      navbar.classList.toggle('navbar-scrolled', shouldPin);
      document.body.style.paddingTop = shouldPin ? (navbar.offsetHeight + 18) + 'px' : '';
    }

    updateNavbarState();
    window.addEventListener('scroll', updateNavbarState, { passive: true });
    window.addEventListener('resize', updateNavbarState);
  }

  function setupMobileNav() {
    var navbar = document.querySelector('.navbar');
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelectorAll('.nav-links a');
    if (!navbar || !toggle) return;

    function setExpanded(value) {
      toggle.setAttribute('aria-expanded', value ? 'true' : 'false');
      navbar.classList.toggle('nav-open', value);
    }

    toggle.addEventListener('click', function () {
      setExpanded(!navbar.classList.contains('nav-open'));
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () { setExpanded(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navbar.classList.contains('nav-open')) setExpanded(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) setExpanded(false);
    });
  }

  function setupScrollReveal() {
    var targets = document.querySelectorAll(
      '.section, .about-card, .feature, .job-card, .contact-card, .devlog-entry, .devlog-pinned, .media-frame, .footer'
    );
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach(function (item) { item.classList.add('reveal-visible'); });
      return;
    }

    targets.forEach(function (item, index) {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', (index % 6) * 20 + 'ms');
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
    );

    targets.forEach(function (item) { observer.observe(item); });
  }

  function setupMediaLightbox() {
    var images = Array.from(document.querySelectorAll('.media-frame img'));
    if (!images.length) return;

    var currentIndex = 0;
    var touchStartX = 0;

    var lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image preview');

    lightbox.innerHTML =
      '<button class="image-lightbox-close" type="button" aria-label="Close image preview">&times;</button>' +
      '<button class="image-lightbox-nav prev" type="button" aria-label="Previous image">&#8249;</button>' +
      '<div class="image-lightbox-content">' +
      '<img src="" alt="" />' +
      '<p class="image-lightbox-caption"></p>' +
      '</div>' +
      '<button class="image-lightbox-nav next" type="button" aria-label="Next image">&#8250;</button>';

    document.body.appendChild(lightbox);

    var previewImage = lightbox.querySelector('img');
    var previewCaption = lightbox.querySelector('.image-lightbox-caption');
    var closeButton = lightbox.querySelector('.image-lightbox-close');
    var prevButton = lightbox.querySelector('.image-lightbox-nav.prev');
    var nextButton = lightbox.querySelector('.image-lightbox-nav.next');

    function updateNavButtons() {
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === images.length - 1;
    }

    function showImage(index) {
      currentIndex = Math.max(0, Math.min(images.length - 1, index));
      var image = images[currentIndex];
      previewImage.src = image.src;
      previewImage.alt = image.alt || 'Expanded media preview';
      previewCaption.textContent = image.alt || '';
      updateNavButtons();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      previewImage.src = '';
    }

    function openLightbox(index) {
      showImage(index);
      lightbox.classList.add('open');
      document.body.classList.add('lightbox-open');
    }

    images.forEach(function (image, index) {
      image.classList.add('lightbox-trigger');
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', 'Open full-size image preview');

      image.addEventListener('click', function () { openLightbox(index); });
      image.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    closeButton.addEventListener('click', closeLightbox);
    prevButton.addEventListener('click', function () { showImage(currentIndex - 1); });
    nextButton.addEventListener('click', function () { showImage(currentIndex + 1); });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (event.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showImage(currentIndex + 1);
        else showImage(currentIndex - 1);
      }
    }, { passive: true });
  }

  function setupDevlogFilters() {
    var filterButtons = document.querySelectorAll('[data-devlog-filter]');
    var entries = document.querySelectorAll('.devlog-entry[data-devlog-tag]');
    if (!filterButtons.length || !entries.length) return;

    function applyFilter(filter) {
      entries.forEach(function (entry) {
        var tag = entry.getAttribute('data-devlog-tag');
        entry.classList.toggle('devlog-hidden', filter !== 'all' && filter !== tag);
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-devlog-filter');
        filterButtons.forEach(function (btn) {
          var isActive = btn === button;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        applyFilter(filter);
      });
    });
  }

  function setupClassCardFlip() {
    var cards = document.querySelectorAll('.class-card');
    cards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('click', function () {
        card.classList.toggle('flipped');
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });
    });
  }

  function setupParticleField() {
    var canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    var ctx = canvas.getContext('2d');
    var particles = [];
    var COUNT = 55;
    var raf;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function makeParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        alpha: Math.random() * 0.45 + 0.12,
        color: Math.random() > 0.5 ? '68,251,255' : '162,38,255'
      };
    }

    resize();
    for (var i = 0; i < COUNT; i++) particles.push(makeParticle());

    window.addEventListener('resize', resize, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    draw();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  function setupPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('http') === 0 || href.indexOf('mailto') === 0 || link.getAttribute('target') === '_blank') return;

      event.preventDefault();
      document.body.classList.add('page-exit');
      var dest = href;
      setTimeout(function () {
        window.location.href = dest;
      }, 220);
    });
  }

  function setupOutboundClickTracking() {
    if (typeof window.gtag !== 'function') return;

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.indexOf('http') !== 0 || href.indexOf(window.location.hostname) !== -1) return;
      window.gtag('event', 'click_outbound', {
        event_category: 'engagement',
        event_label: href
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupStickyNavbar();
    setupMobileNav();
    setupScrollReveal();
    setupMediaLightbox();
    setupDevlogFilters();
    setupClassCardFlip();
    setupParticleField();
    setupPageTransitions();
    setupOutboundClickTracking();
  });
})();
