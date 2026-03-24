document.addEventListener('DOMContentLoaded', () => {
  emailjs.init('V86jc0AypkEL89MwS');
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
        
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('block')) {
          mobileMenu.classList.remove('block');
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('block');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('block');
      }
    });
  }

  // Scroll to top button
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.remove('opacity-0', 'invisible');
      scrollToTopBtn.classList.add('opacity-100', 'visible');
    } else {
      scrollToTopBtn.classList.add('opacity-0', 'invisible');
      scrollToTopBtn.classList.remove('opacity-100', 'visible');
    }
  });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    section.classList.add('animate-section');
    observer.observe(section);
  });

  const form = document.getElementById('contactForm');
  const submitButton = form.querySelector('button[type="submit"]');
  const notificationContainer = document.createElement('div');
  notificationContainer.className = 'mt-4';
  form.appendChild(notificationContainer);

  form.addEventListener('submit', function (e) {
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

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

    emailjs.send('service_pm4rzfp', 'template_3yoltwc', {
      nome,
      email,
      assunto,
      mensagem
    })
      .then(() => {
        showNotification('Mensagem enviada com sucesso! Entrarei em contato em breve.', 'success');
        form.reset();
      })
      .catch((error) => {
        console.error('Erro ao enviar:', error);
        showNotification('Erro ao enviar o formulário. Tente novamente ou entre em contato diretamente.', 'error');
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Mensagem';
      });
  });

  function showNotification(message, type) {
    notificationContainer.innerHTML = `
      <div class="p-4 rounded-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} shadow-lg transform transition-all duration-300 animate-slide-in">
        <div class="flex items-center">
          <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3"></i>
          <span>${message}</span>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      const notification = notificationContainer.querySelector('div');
      if (notification) {
        notification.classList.add('animate-slide-out');
        setTimeout(() => {
          notificationContainer.innerHTML = '';
        }, 300);
      }
    }, 5000);
  }

  const titleElement = document.querySelector('#sobre h1 span:last-child');
  if (titleElement) {
    const text = titleElement.textContent;
    titleElement.textContent = '';
    titleElement.style.borderRight = '2px solid #f97316';
    
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        titleElement.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      } else {
        titleElement.style.borderRight = 'none';
      }
    };
    
    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeWriter();
          titleObserver.unobserve(entry.target);
        }
      });
    });
    
    titleObserver.observe(titleElement);
  }

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('#sobre');
    if (hero && scrolled < 500) {
      const rate = scrolled * -0.3;
      hero.style.transform = `translateY(${rate}px)`;
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
    
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
    
    .animate-slide-out {
      animation: slideOut 0.3s ease-out forwards;
    }
    
    .hover-lift {
      transition: transform 0.3s ease;
    }
    
    .hover-lift:hover {
      transform: translateY(-5px);
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.bg-neutral-800.rounded-lg').forEach(card => {
    card.classList.add('hover-lift');
  });

  document.querySelectorAll('.bg-neutral-800.p-6.rounded-lg').forEach(card => {
    card.classList.add('hover-lift');
  });
});