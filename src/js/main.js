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
  const textRevealChars = document.querySelectorAll('.text-reveal');
  const textRevealWords = document.querySelectorAll('.text-reveal-word');

  // Fire immediately since hero is visible on page load
  textRevealChars.forEach((char) => {
    const delay = parseInt(char.dataset.delay) * 70;
    setTimeout(() => {
      char.classList.add('is-revealed');
    }, delay + 200);
  });

  // Reveal whole words (used for gradient text like "Francisco")
  textRevealWords.forEach((word) => {
    const delay = parseInt(word.dataset.delay) * 70;
    setTimeout(() => {
      word.classList.add('is-revealed');
    }, delay + 200);
  });

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

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function typeWriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause before deleting
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500; // Pause before typing next
    }

    setTimeout(typeWriter, typeSpeed);
  }

  // Start typewriter after text reveal
  setTimeout(typeWriter, 1500);

  // ================================================
  // SCROLL ANIMATIONS (stagger)
  // ================================================
  const animateElements = document.querySelectorAll(
    '.stack__category, .project-card, .contact__card, .contact__form-wrapper'
  );

  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Find siblings for stagger
          const parent = entry.target.parentElement;
          const siblings = Array.from(parent.children).filter((el) =>
            animateElements.length ? [...animateElements].includes(el) : false
          );

          const index = siblings.indexOf(entry.target);
          const delay = index * 100;

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
    tiltCards.forEach((card) => {
      const glare = card.querySelector('.project-card__glare');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Update glare position
        if (glare) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glare.style.setProperty('--glare-x', `${glareX}%`);
          glare.style.setProperty('--glare-y', `${glareY}%`);
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s ease-out';
        setTimeout(() => {
          card.style.transition = 'transform 0.1s linear';
        }, 500);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s linear';
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

  // Active dock item based on scroll
  const sections = document.querySelectorAll('section[id]');
  const dockItems = document.querySelectorAll('.dock__item[href^="#"]');

  const activateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          dockItems.forEach((item) => {
            item.classList.remove('dock__item--active');
            if (item.getAttribute('href') === `#${id}`) {
              item.classList.add('dock__item--active');
            }
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' }
  );

  sections.forEach((section) => {
    activateObserver.observe(section);
  });

  // ================================================
  // CONTACT FORM (EmailJS)
  // ================================================
  const form = document.getElementById('contactForm');
  const notification = document.getElementById('form-notification');
  const submitBtn = form.querySelector('button[type="submit"]');

  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `form-notification form-notification--${type}`;
    setTimeout(() => {
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

  // ================================================
  // DOCK VISIBILITY (hide when at very top, show otherwise)
  // ================================================
  const dock = document.querySelector('.dock');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll < 100) {
      dock.style.opacity = '0.5';
      dock.style.transform = 'translateX(-50%) translateY(10px)';
    } else {
      dock.style.opacity = '1';
      dock.style.transform = 'translateX(-50%) translateY(0)';
    }
    lastScroll = currentScroll;
  });

  // Initial state
  dock.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  if (window.scrollY < 100) {
    dock.style.opacity = '0.5';
    dock.style.transform = 'translateX(-50%) translateY(10px)';
  }
}); // End DOMContentLoaded
