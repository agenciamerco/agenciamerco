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

  // Reveal on scroll (start only after first scroll)
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealEls.length) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const startObserving = () => {
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
      };

      window.addEventListener('scroll', startObserving, { once: true, passive: true });
    }
  }

  // Services tabs
  const tabLists = Array.from(document.querySelectorAll('[data-tabs]'));
  tabLists.forEach((tabList) => {
    const tabs = Array.from(tabList.querySelectorAll('[data-tab-target]'));
    const section = tabList.closest('.services');
    const panels = section ? Array.from(section.querySelectorAll('.services-panel')) : [];
    const panelsWrap = section ? section.querySelector('.services-panels') : null;
    const rotationMs = 7000;
    const minAutoWidth = 750;
    let activeIndex = Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'));
    let timerId = null;
    let isPaused = false;
    let autoEnabled = window.innerWidth >= minAutoWidth;

    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('aria-selected') === 'true';
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    const setActiveTab = (activeTab) => {
      const targetId = activeTab.dataset.tabTarget;
      const targetPanel = section ? section.querySelector(`#${targetId}`) : null;
      activeIndex = tabs.indexOf(activeTab);

      tabs.forEach((tab) => {
        tab.classList.remove('is-active');
        tab.classList.remove('is-animating');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });

      panels.forEach((panel) => {
        panel.classList.remove('is-active');
        panel.hidden = true;
      });

      activeTab.classList.add('is-active');
      if (autoEnabled) {
        // restart progress animation
        void activeTab.offsetWidth;
        activeTab.classList.add('is-animating');
      }
      activeTab.setAttribute('aria-selected', 'true');
      activeTab.setAttribute('tabindex', '0');

      if (targetPanel) {
        targetPanel.classList.add('is-active');
        targetPanel.hidden = false;
        targetPanel.classList.add('is-visible');
      }
    };

    const setPanelsMinHeight = () => {
      if (!panelsWrap || panels.length === 0) {
        return;
      }
      let maxHeight = 0;
      panels.forEach((panel) => {
        const clone = panel.cloneNode(true);
        clone.hidden = false;
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.pointerEvents = 'none';
        clone.style.height = 'auto';
        clone.style.display = 'block';
        clone.style.width = '100%';
        panelsWrap.appendChild(clone);
        maxHeight = Math.max(maxHeight, clone.offsetHeight);
        panelsWrap.removeChild(clone);
      });
      panelsWrap.style.minHeight = `${maxHeight}px`;
    };

    const startRotation = () => {
      if (!autoEnabled) {
        return;
      }
      if (timerId) {
        clearInterval(timerId);
      }
      timerId = setInterval(() => {
        if (isPaused || tabs.length < 2) {
          return;
        }
        const nextIndex = (activeIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
      }, rotationMs);
    };

    const pauseRotation = () => {
      isPaused = true;
      if (section) {
        section.classList.add('is-paused');
      }
    };

    const resumeRotation = () => {
      isPaused = false;
      if (section) {
        section.classList.remove('is-paused');
      }
    };

    setActiveTab(tabs[activeIndex]);
    setPanelsMinHeight();
    startRotation();

    const updateAutoRotation = () => {
      const shouldEnable = window.innerWidth >= minAutoWidth;
      if (shouldEnable === autoEnabled) {
        return;
      }
      autoEnabled = shouldEnable;
      if (!autoEnabled) {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
        tabs.forEach((tab) => tab.classList.remove('is-animating'));
      } else {
        setActiveTab(tabs[activeIndex]);
        startRotation();
      }
    };

    panels.forEach((panel) => {
      panel.addEventListener('mouseenter', pauseRotation);
      panel.addEventListener('mouseleave', resumeRotation);
      panel.addEventListener('focusin', pauseRotation);
      panel.addEventListener('focusout', resumeRotation);
    });

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        setActiveTab(tab);
        startRotation();
      });
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
          return;
        }

        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        setActiveTab(tabs[nextIndex]);
        startRotation();
      });
    });

    window.addEventListener('resize', () => {
      updateAutoRotation();
      setPanelsMinHeight();
    });
  });

  // Before/after compare
  const compareWidgets = Array.from(document.querySelectorAll('[data-compare]'));
  compareWidgets.forEach((widget) => {
    const range = widget.querySelector('.compare-range');
    if (!range) {
      return;
    }

    const setPosition = (value) => {
      const clamped = Math.min(100, Math.max(0, Number(value)));
      widget.style.setProperty('--compare', `${clamped}%`);
    };

    setPosition(range.value);
    range.addEventListener('input', (event) => {
      setPosition(event.target.value);
    });
  });
})();
