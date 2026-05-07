(function () {
  function setupStickyNavbar() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) {
      return;
    }

    function updateNavbarState() {
      var shouldPin = window.scrollY > 84;
      navbar.classList.toggle('navbar-scrolled', shouldPin);

      if (shouldPin) {
        document.body.style.paddingTop = (navbar.offsetHeight + 18) + 'px';
      } else {
        document.body.style.paddingTop = '';
      }
    }

    updateNavbarState();
    window.addEventListener('scroll', updateNavbarState, { passive: true });
    window.addEventListener('resize', updateNavbarState);
  }

  function setupMobileNav() {
    var navbar = document.querySelector('.navbar');
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelectorAll('.nav-links a');

    if (!navbar || !toggle) {
      return;
    }

    function setExpanded(value) {
      toggle.setAttribute('aria-expanded', value ? 'true' : 'false');
      navbar.classList.toggle('nav-open', value);
    }

    toggle.addEventListener('click', function () {
      var isOpen = navbar.classList.contains('nav-open');
      setExpanded(!isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setExpanded(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navbar.classList.contains('nav-open')) {
        setExpanded(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        setExpanded(false);
      }
    });
  }

  function setupScrollReveal() {
    var targets = document.querySelectorAll(
      '.section, .about-card, .feature, .job-card, .contact-card, .devlog-entry, .media-frame, .footer'
    );

    if (!targets.length) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach(function (item) {
        item.classList.add('reveal-visible');
      });
      return;
    }

    targets.forEach(function (item, index) {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', (index % 6) * 45 + 'ms');
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
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    targets.forEach(function (item) {
      observer.observe(item);
    });
  }

  function setupMediaLightbox() {
    var images = document.querySelectorAll('.media-frame img');
    if (!images.length) {
      return;
    }

    var lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image preview');

    lightbox.innerHTML =
      '<button class="image-lightbox-close" type="button" aria-label="Close image preview">&times;</button>' +
      '<div class="image-lightbox-content">' +
      '<img src="" alt="" />' +
      '<p class="image-lightbox-caption"></p>' +
      '</div>';

    document.body.appendChild(lightbox);

    var previewImage = lightbox.querySelector('img');
    var previewCaption = lightbox.querySelector('.image-lightbox-caption');
    var closeButton = lightbox.querySelector('.image-lightbox-close');

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      previewImage.src = '';
      previewImage.alt = '';
      previewCaption.textContent = '';
    }

    function openLightbox(image) {
      previewImage.src = image.src;
      previewImage.alt = image.alt || 'Expanded media preview';
      previewCaption.textContent = image.alt || '';
      lightbox.classList.add('open');
      document.body.classList.add('lightbox-open');
    }

    images.forEach(function (image) {
      image.classList.add('lightbox-trigger');
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', 'Open full-size image preview');

      image.addEventListener('click', function () {
        openLightbox(image);
      });

      image.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    closeButton.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  function setupDevlogFilters() {
    var filterButtons = document.querySelectorAll('[data-devlog-filter]');
    var entries = document.querySelectorAll('.devlog-entry[data-devlog-tag]');

    if (!filterButtons.length || !entries.length) {
      return;
    }

    function applyFilter(filter) {
      entries.forEach(function (entry) {
        var tag = entry.getAttribute('data-devlog-tag');
        var shouldShow = filter === 'all' || filter === tag;
        entry.classList.toggle('devlog-hidden', !shouldShow);
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

  function setupOutboundClickTracking() {
    if (typeof window.gtag !== 'function') {
      return;
    }

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target) {
        return;
      }

      var link = target.closest('a[href]');
      if (!link) {
        return;
      }

      var href = link.getAttribute('href');
      if (!href || href.indexOf('http') !== 0 || href.indexOf(window.location.hostname) !== -1) {
        return;
      }

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
    setupOutboundClickTracking();
  });
})();
