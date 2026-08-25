document.addEventListener('DOMContentLoaded', () => {
    // hero scroll indicator: fades out permanently on first scroll
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

    // scroll-reveal: adds is-visible to elements as they enter the viewport
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

    revealOnScroll(Array.from(document.querySelectorAll('.work-card')), {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px',
    });

    revealOnScroll(Array.from(document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')), {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
    });

    // work cards: clicking anywhere on the card follows its "View Case Study" link
    document.querySelectorAll('.work-card').forEach((card) => {
        const link = card.querySelector('.text-link');
        if (!link) return;
        card.classList.add('is-clickable');
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            link.click();
        });
    });

    // process section: separate reveal check since it needs a custom trigger point
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

    // contact form: phone number auto-formatting
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

    // contact form: file upload label state
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            fileInput.classList.toggle('has-file', fileInput.files.length > 0);
        });
    }

    // contact form: require at least one "looking for" checkbox
    const lookingForCheckboxes = document.querySelectorAll('input[name="looking_for"]');
    const lookingForAnchor = document.getElementById('looking-for-check');
    if (lookingForCheckboxes.length && lookingForAnchor) {
        const updateLookingForValidity = () => {
            const anyChecked = Array.from(lookingForCheckboxes).some((cb) => cb.checked);
            lookingForAnchor.setCustomValidity(anyChecked ? '' : 'Please select at least one option.');
        };
        lookingForCheckboxes.forEach((cb) => cb.addEventListener('change', updateLookingForValidity));
        updateLookingForValidity();
    }

    // contact form: comments character counter
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

    // contact form: submit handling + rocket launch/typing animation triggers
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            submitBtn.disabled = true;

            fetch(contactForm.action, {
                method: contactForm.method,
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' },
            })
                .then((response) => {
                    if (!response.ok) throw new Error('Submission failed');
                    submitBtn.textContent = 'Form Sent ✓';
                    Array.from(contactForm.elements).forEach((el) => {
                        el.disabled = true;
                    });

                    const rocketWrap = document.querySelector('.rocket-wrap');
                    if (rocketWrap) {
                        const isVisible = rocketWrap.offsetParent !== null;
                        if (isVisible) {
                            // desktop: it's actually laid out, so capture its
                            // real position for a seamless takeoff
                            const rect = rocketWrap.getBoundingClientRect();
                            rocketWrap.style.position = 'fixed';
                            rocketWrap.style.left = `${rect.left}px`;
                            rocketWrap.style.top = `${rect.top}px`;
                            rocketWrap.style.bottom = 'auto';
                            rocketWrap.style.margin = '0';
                            void rocketWrap.offsetHeight;
                        }
                        // tablet/phone: it's display:none at rest, so let the
                        // media-query override define its launch position instead
                        rocketWrap.classList.add('is-launching');
                    }
                })
                .catch(() => {
                    submitBtn.disabled = false;
                });
        });

        const rocket = document.querySelector('.rocket');
        if (rocket) {
            let typingTimeout;
            contactForm.addEventListener('input', () => {
                rocket.classList.add('is-typing');
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => rocket.classList.remove('is-typing'), 400);
            });
        }
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

    // hotspot dots: tap to open/close on touch devices, hover on desktop
    const hotspots = document.querySelectorAll('.hotspot');
    if (hotspots.length && window.matchMedia('(hover: none)').matches) {
        hotspots.forEach((hotspot) => {
            hotspot.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasOpen = hotspot.classList.contains('is-open');
                hotspots.forEach((h) => h.classList.remove('is-open'));
                if (!wasOpen) hotspot.classList.add('is-open');
            });
        });

        document.addEventListener('click', () => {
            hotspots.forEach((h) => h.classList.remove('is-open'));
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
