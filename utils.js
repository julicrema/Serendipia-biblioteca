// ==================== 🧰 UTILS.JS - FUNCIONES COMPARTIDAS ====================

function getLibros() {
  return JSON.parse(localStorage.getItem('libros')) || [];
}

function saveLibros(libros) {
  localStorage.setItem('libros', JSON.stringify(libros));
  window.dispatchEvent(new Event("libros-actualizados"));
}

function safeNotify(message, type = 'success'){
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'var(--gold)' : '#e53935'};
      color: ${type === 'success' ? '#000' : '#fff'};
      padding: 12px 20px;
      border-radius: var(--radius);
      font-weight: 600;
      z-index: 10000;
      transform: translateX(110%);
      transition: transform 0.3s ease;
    `;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Forzar reflow para que la animación de entrada funcione
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    notification.style.transform = 'translateX(110%)';
    setTimeout(() => notification.remove(), 300);
  }, 3500);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function verificarAutenticacion() {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  const perfilLink = document.getElementById("perfilLink");
  const adminLink = document.getElementById("adminLink");
  const loginLink = document.getElementById("loginLink");
  const registroLink = document.getElementById("registroLink");
  const logoutLink = document.getElementById("logoutLink");

  const mostrar = (el, show) => { if (el) el.style.display = show ? "inline" : "none"; };

  if (user) {
    mostrar(perfilLink, true);
    mostrar(adminLink, user.isAdmin);
    mostrar(loginLink, false);
    mostrar(registroLink, false);
    mostrar(logoutLink, true);
  } else {
    mostrar(perfilLink, false);
    mostrar(adminLink, false);
    mostrar(loginLink, true);
    mostrar(registroLink, true);
    mostrar(logoutLink, false);
  }
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActual");
  verificarAutenticacion();
  if (typeof renderCatalogo === 'function') renderCatalogo();
  safeNotify("Sesión cerrada correctamente");
  window.location.href = 'auth.html';
}

document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacion();

  // ==================== 🍔 MENÚ HAMBURGUESA (Lógica Unificada) ====================
  const menuToggle = document.getElementById('menuToggle');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => mainNav.classList.add('active'));
  }

  if (closeMenuBtn && mainNav) {
    closeMenuBtn.addEventListener('click', () => mainNav.classList.remove('active'));
  }

  // ==================== ☀️/🌙 CAMBIO DE TEMA ====================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlEl = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
    if (themeToggleBtn && savedTheme === 'dark') themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (htmlEl.getAttribute('data-theme') === 'dark') {
        htmlEl.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
      } else {
        htmlEl.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
      }
    });
  }
});