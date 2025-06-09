document.addEventListener('DOMContentLoaded', () => {
  emailjs.init('V86jc0AypkEL89MwS');
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
      }
    });
  });

  const form = document.getElementById('contactForm');
  const submitButton = form.querySelector('button[type="submit"]');
  const notificationContainer = document.createElement('div');
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
    submitButton.textContent = 'Enviando...';

    emailjs.send('service_pm4rzfp', 'template_3yoltwc', {
      nome,
      email,
      assunto,
      mensagem
    })
      .then(() => {
        showNotification('Mensagem enviada com sucesso!', 'success');
        form.reset();
      })
      .catch((error) => {
        console.error('Erro ao enviar:', error);
        showNotification('Erro ao enviar o formulário. Tente novamente.', 'error');
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar';
      });
  });

  function showNotification(message, type) {
    notificationContainer.innerHTML = `
      <div class="mt-4 p-4 rounded-md text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}">
        ${message}
      </div>
    `;
    setTimeout(() => {
      notificationContainer.innerHTML = '';
    }, 5000);
  }
});