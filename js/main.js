(() => {
  const nav = document.getElementById('primary-nav');
  const toggle = document.querySelector('.menu-toggle');

  // Mobile nav toggle
  if (nav && toggle) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    const toggleMenu = () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('nav-open', isOpen);
    };

    toggle.addEventListener('click', toggleMenu);

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960 && nav.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealEls.length) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || '0';
            el.style.setProperty('--reveal-delay', `${delay}ms`);
            el.classList.add('is-visible');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.25 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }
})();
