document.addEventListener('DOMContentLoaded', () => {
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        const hideOnScroll = () => {
            if (window.scrollY > 0) {
                const currentOpacity = getComputedStyle(indicator).opacity;
                indicator.style.animation = 'none';
                indicator.style.opacity = currentOpacity;
                void indicator.offsetWidth;
                requestAnimationFrame(() => {
                    indicator.classList.add('is-hidden');
                });
                window.removeEventListener('scroll', hideOnScroll);
            }
        };

        window.addEventListener('scroll', hideOnScroll, { passive: true });
    }

    const revealOnScroll = (elements, options = { threshold: 0.2 }) => {
        if (!elements.length) return;

        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, options);

            elements.forEach((el) => revealObserver.observe(el));
        } else {
            elements.forEach((el) => el.classList.add('is-visible'));
        }
    };

    const aboutTeaser = document.querySelector('.about-teaser');
    if (aboutTeaser) revealOnScroll([aboutTeaser], { threshold: 0.5 });

    revealOnScroll(Array.from(document.querySelectorAll('.project-card')), {
        threshold: 0.4,
        rootMargin: '0px 0px -20% 0px',
    });

    const process = document.querySelector('.process');
    if (process) {
        const checkProcessReveal = () => {
            const rect = process.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.25 && rect.bottom > 0) {
                process.classList.add('is-visible');
                window.removeEventListener('scroll', checkProcessReveal);
            }
        };

        window.addEventListener('scroll', checkProcessReveal, { passive: true });
        checkProcessReveal();
    }

    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', () => {
            const digits = phoneField.value.replace(/\D/g, '').slice(0, 10);
            let formatted = digits;
            if (digits.length > 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            } else if (digits.length > 3) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            } else if (digits.length > 0) {
                formatted = `(${digits}`;
            }
            phoneField.value = formatted;
        });
    }

    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            fileInput.classList.toggle('has-file', fileInput.files.length > 0);
        });
    }

    const commentsField = document.getElementById('comments');
    const charCount = document.getElementById('comments-char-count');
    if (commentsField && charCount) {
        const maxLength = commentsField.maxLength;
        const updateCharCount = () => {
            charCount.textContent = `${commentsField.value.length} / ${maxLength}`;
        };
        commentsField.addEventListener('input', updateCharCount);
        updateCharCount();
    }

// hamburger / mobile slide-nav (tablet + phone)
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

    if (hamburger && mobileNav && mobileNavOverlay) {
        const closeMenu = () => {
            hamburger.classList.remove('is-open');
            mobileNav.classList.remove('is-open');
            mobileNavOverlay.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
        };

        const openMenu = () => {
            hamburger.classList.add('is-open');
            mobileNav.classList.add('is-open');
            mobileNavOverlay.classList.add('is-open');
            hamburger.setAttribute('aria-expanded', 'true');
        };

        hamburger.addEventListener('click', () => {
            if (hamburger.classList.contains('is-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        mobileNavOverlay.addEventListener('click', closeMenu);
        mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

        const mobileNavClose = mobileNav.querySelector('.mobile-nav-close');
        if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }
});

// starfield parallax //
(function () {
  var layers = Array.prototype.slice.call(document.querySelectorAll('.star-layer'));
  var ticking = false;
  var mobileQuery = window.matchMedia('(max-width: 600px)');
  var mobileFactor = 0.35;

  function update() {
    var y = window.scrollY || window.pageYOffset;
    var factor = mobileQuery.matches ? mobileFactor : 1;
    layers.forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute('data-speed')) * factor;
      layer.style.transform = 'translateY(' + (y * speed) + 'px)';
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
})();
