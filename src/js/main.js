/**
 * Portfolio - Main JavaScript
 * João Francisco da Silva
 * Features: Text reveal, typewriter, 3D tilt cards, floating dock, scroll animations, contact form
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================================================
  // EMAIL JS INIT
  // ================================================
  emailjs.init('V86jc0AypkEL89MwS');

  // ================================================
  // TEXT REVEAL ANIMATION
  // ================================================
  // Single rAF pass instead of one timer per element. Targets are sorted by
  // their scheduled time so the loop only walks forward through the list.
  const revealTargets = [...document.querySelectorAll('.text-reveal, .text-reveal-word')]
    .map((el) => ({ el, at: parseInt(el.dataset.delay, 10) * 70 + 200 }))
    .sort((a, b) => a.at - b.at);

  // The accent word ("Francisco") paints its gradient per letter, because a
  // background-clip: text ancestor breaks once a descendant is transformed.
  // Each letter therefore needs to know how wide the whole word is and where it
  // sits inside it, or every letter would run the full gradient on its own.
  const accentWord = document.querySelector('.hero__title-line--accent');
  const accentLetters = accentWord ? accentWord.querySelectorAll('.text-reveal') : [];

  function syncAccentGradient() {
    if (!accentLetters.length) return;

    // Measured against the line box, not the glyphs: the line is display:block,
    // so the original gradient ran across the full container width and the text
    // only sampled part of it. Keeping that geometry keeps the colours identical.
    // Read every rect first, then write — never interleave the two. The reveal
    // only moves letters vertically, so horizontal measurements stay valid even
    // while the animation is running.
    const lineRect = accentWord.getBoundingClientRect();
    const rects = [...accentLetters].map((el) => el.getBoundingClientRect());

    accentWord.style.setProperty('--accent-gradient-width', `${lineRect.width}px`);
    accentLetters.forEach((el, i) => {
      el.style.setProperty(
        '--accent-gradient-offset',
        `${rects[i].left - lineRect.left}px`
      );
    });
  }

  // The title uses a fluid clamp() font size, so the slices need remeasuring.
  let accentFrame = 0;
  window.addEventListener(
    'resize',
    () => {
      if (!accentFrame) {
        accentFrame = requestAnimationFrame(() => {
          accentFrame = 0;
          syncAccentGradient();
        });
      }
    },
    { passive: true }
  );

  function runTextReveal() {
    syncAccentGradient();

    const start = performance.now();
    let next = 0;

    function step(now) {
      const elapsed = now - start;
      while (next < revealTargets.length && revealTargets[next].at <= elapsed) {
        revealTargets[next].el.classList.add('is-revealed');
        next++;
      }
      if (next < revealTargets.length) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Wait for the webfonts so a late FOUT doesn't reflow mid-reveal, but never
  // hold the hero back for more than 300ms.
  if (document.fonts && document.fonts.ready) {
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]).then(runTextReveal);
  } else {
    runTextReveal();
  }

  // ================================================
  // TYPEWRITER EFFECT
  // ================================================
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'Engenheiro Backend',
    'Java & Spring Boot',
    'APIs escaláveis e robustas',
    'TypeScript & React',
    'Sistemas em tempo real',
  ];

  const TYPE_SPEED = 80;
  const DELETE_SPEED = 40;
  const PAUSE_AFTER_PHRASE = 2000;
  const PAUSE_BEFORE_PHRASE = 500;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let nextCharAt = 0;
  let typewriterFrame = 0;

  function typeWriter(now) {
    typewriterFrame = requestAnimationFrame(typeWriter);
    if (now < nextCharAt) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      typewriterEl.textContent = currentPhrase.substring(0, charIndex);
      nextCharAt = now + DELETE_SPEED;
    } else {
      charIndex++;
      typewriterEl.textContent = currentPhrase.substring(0, charIndex);
      nextCharAt = now + TYPE_SPEED;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      nextCharAt = now + PAUSE_AFTER_PHRASE;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      nextCharAt = now + PAUSE_BEFORE_PHRASE;
    }
  }

  // The typewriter only runs while the hero is on screen and the tab is
  // visible — otherwise it keeps laying out the hero line for nothing.
  let typewriterUnlocked = false;
  let heroInView = true;

  function syncTypewriter() {
    const shouldRun = typewriterUnlocked && heroInView && !document.hidden;

    if (shouldRun && !typewriterFrame) {
      nextCharAt = 0;
      typewriterFrame = requestAnimationFrame(typeWriter);
    } else if (!shouldRun && typewriterFrame) {
      cancelAnimationFrame(typewriterFrame);
      typewriterFrame = 0;
    }
  }

  // Start typewriter after text reveal
  setTimeout(() => {
    typewriterUnlocked = true;
    syncTypewriter();
  }, 1500);

  document.addEventListener('visibilitychange', syncTypewriter);

  // ================================================
  // HERO AMBIENT ANIMATIONS (pause when off screen)
  // ================================================
  // Rotating photo arcs, floating badges and the badge dot are infinite CSS
  // animations; pause them once the hero scrolls away.
  const heroSection = document.getElementById('hero');

  const heroObserver = new IntersectionObserver(
    (entries) => {
      heroInView = entries[0].isIntersecting;
      heroSection.classList.toggle('hero--paused', !heroInView);
      syncTypewriter();
    },
    { threshold: 0 }
  );

  heroObserver.observe(heroSection);

  // ================================================
  // SCROLL ANIMATIONS (stagger)
  // ================================================
  const animateElements = document.querySelectorAll(
    '.stack__category, .project-card, .contact__card, .contact__form-wrapper'
  );

  // Stagger position is fixed by the markup, so resolve it once up front
  // instead of rebuilding the sibling list inside the observer callback.
  const animateSet = new Set(animateElements);
  const staggerIndex = new Map();

  animateElements.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((child) =>
      animateSet.has(child)
    );
    staggerIndex.set(el, siblings.indexOf(el));
  });

  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = staggerIndex.get(entry.target) * 100;

          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);

          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  animateElements.forEach((el) => {
    el.classList.add('animate-on-scroll');
    scrollObserver.observe(el);
  });

  // Section titles animation
  const sectionTitles = document.querySelectorAll('.section__title, .section__subtitle');
  const titleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          titleObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  sectionTitles.forEach((el) => {
    el.classList.add('animate-on-scroll');
    titleObserver.observe(el);
  });


  // ================================================
  // 3D TILT CARDS (cursor tracking)
  // ================================================
  const tiltCards = document.querySelectorAll('[data-tilt]');
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (!isTouchDevice) {
    // Card geometry is read once per hover, not once per mousemove. Scrolling
    // or resizing moves the card, so mark the cached rects dirty when it happens.
    let rectsStale = false;
    const invalidateTiltRects = () => {
      rectsStale = true;
    };

    window.addEventListener('scroll', invalidateTiltRects, { passive: true });
    window.addEventListener('resize', invalidateTiltRects, { passive: true });

    tiltCards.forEach((card) => {
      const glare = card.querySelector('.project-card__glare');

      let rect = null;
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      function render() {
        frame = 0;

        if (!rect || rectsStale) {
          rect = card.getBoundingClientRect();
          rectsStale = false;
        }

        const x = pointerX - rect.left;
        const y = pointerY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Update glare position
        if (glare) {
          glare.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
          glare.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
        }
      }

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        card.classList.add('project-card--tilting');
      });

      card.addEventListener('mousemove', (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        // Coalesce to one write per frame; mousemove can fire far more often.
        if (!frame) frame = requestAnimationFrame(render);
      });

      card.addEventListener('mouseleave', () => {
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        rect = null;
        // Dropping the class re-enables the CSS ease-out back to rest.
        card.classList.remove('project-card--tilting');
        card.style.transform = '';
      });
    });
  }

  // ================================================
  // FLOATING DOCK - SMOOTH SCROLL NAVIGATION
  // ================================================
  const dockLinks = document.querySelectorAll('.dock__item[href^="#"]');

  dockLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ================================================
  // FLOATING DOCK - VISIBILITY + ACTIVE STATE
  // ================================================
  const dock = document.querySelector('.dock');
  const sections = document.querySelectorAll('section[id]');
  const dockItems = document.querySelectorAll('.dock__item[href^="#"]');

  let dockFrame = 0;
  let activeHref = null;

  function updateDock() {
    dockFrame = 0;

    dock.classList.toggle('dock--at-top', window.scrollY < 100);

    // The active section is the one crossing a reference line at 35% of the
    // viewport. Using a line instead of an intersection ratio means full-height
    // sections like the hero can't fall below the threshold and lose the state.
    const line = window.innerHeight * 0.35;
    let currentHref = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line && rect.bottom > line) {
        currentHref = `#${section.getAttribute('id')}`;
      }
    });

    if (currentHref && currentHref !== activeHref) {
      activeHref = currentHref;
      dockItems.forEach((item) => {
        item.classList.toggle(
          'dock__item--active',
          item.getAttribute('href') === activeHref
        );
      });
    }
  }

  function requestDockUpdate() {
    if (!dockFrame) dockFrame = requestAnimationFrame(updateDock);
  }

  window.addEventListener('scroll', requestDockUpdate, { passive: true });
  window.addEventListener('resize', requestDockUpdate, { passive: true });

  // Initial state
  updateDock();

  // ================================================
  // CONTACT FORM (EmailJS)
  // ================================================
  const form = document.getElementById('contactForm');
  const notification = document.getElementById('form-notification');
  const submitBtn = form.querySelector('button[type="submit"]');

  let notificationTimer = 0;

  function showNotification(message, type) {
    // Reset the pending timer, otherwise an older one clears a newer message.
    clearTimeout(notificationTimer);

    notification.textContent = message;
    notification.className = `form-notification form-notification--${type}`;

    notificationTimer = setTimeout(() => {
      notification.textContent = '';
      notification.className = 'form-notification';
    }, 5000);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const assunto = document.getElementById('subject').value.trim();
    const mensagem = document.getElementById('message').value.trim();

    if (!nome || !email || !assunto || !mensagem) {
      showNotification('Por favor, preencha todos os campos.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotification('Por favor, insira um e-mail válido.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    emailjs
      .send('service_pm4rzfp', 'template_3yoltwc', {
        nome,
        email,
        assunto,
        mensagem,
      })
      .then(() => {
        showNotification('Mensagem enviada com sucesso! Entrarei em contato em breve.', 'success');
        form.reset();
      })
      .catch((error) => {
        console.error('Erro ao enviar:', error);
        showNotification('Erro ao enviar. Tente novamente ou entre em contato diretamente.', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
      });
  });
}); // End DOMContentLoaded
