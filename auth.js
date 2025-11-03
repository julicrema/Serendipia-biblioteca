// ==================== 🔐 AUTH.JS - LÓGICA DE AUTENTICACIÓN ====================

/**
 * Redirige al usuario si ya tiene una sesión activa.
 */
function checkSessionAndRedirect() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
  if (usuarioActual) {
    // Si está en una página de autenticación, lo redirigimos.
    const isAuthPage = window.location.pathname.includes('auth.html') ||
                       window.location.pathname.includes('login.html') ||
                       window.location.pathname.includes('registro.html');
    if (isAuthPage) {
      window.location.href = usuarioActual.isAdmin ? 'admin.html' : 'index.html';
    }
  }
}

/**
 * Añade usuarios administradores por defecto si no existen.
 */
function seedAdmins() {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  let hasChanges = false;

  const adminsToSeed = [
    { username: 'admin', email: 'admin@admin.com', password: '123', nombre: 'Administrador' },
    { username: 'julicremita', email: 'Julitopodebiblioteca@gmail.com', password: 'Juli123', nombre: 'Julito' }
  ];

  adminsToSeed.forEach(admin => {
    if (!usuarios.some(u => u.username === admin.username)) {
      usuarios.push({
        ...admin,
        isAdmin: true,
        fechaRegistro: new Date().toISOString()
      });
      hasChanges = true;
    }
  });

  if (hasChanges) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }
}

/**
 * Maneja el inicio de sesión de un usuario.
 */
function iniciarSesion() {
  const usuarioInput = document.getElementById('usuario')?.value.trim();
  const passwordInput = document.getElementById('password')?.value;

  if (!usuarioInput || !passwordInput) {
    return alert('Por favor, completa todos los campos');
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuarioEncontrado = usuarios.find(u =>
    (u.username === usuarioInput || u.email === usuarioInput) && u.password === passwordInput
  );

  if (usuarioEncontrado) {
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
    alert('¡Bienvenido, ' + usuarioEncontrado.nombre + '!');
    window.location.href = usuarioEncontrado.isAdmin ? 'admin.html' : 'index.html';
  } else {
    alert('Usuario, email o contraseña incorrectos');
  }
}

/**
 * Maneja el registro de un nuevo usuario.
 */
function registrarUsuario() {
  const nombre = document.getElementById('nombre')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;

  if (!nombre || !email || !username || !password || !confirmPassword) return alert('Por favor, completa todos los campos');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Por favor, ingresa un email válido');
  if (password !== confirmPassword) return alert('Las contraseñas no coinciden');
  if (password.length < 5 || !/[A-Z]/.test(password)) return alert('La contraseña no cumple con los requisitos');

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  if (usuarios.some(u => u.username === username)) return alert('El nombre de usuario ya existe.');
  if (usuarios.some(u => u.email === email)) return alert('El email ya está registrado.');

  usuarios.push({ nombre, email, username, password, isAdmin: false, fechaRegistro: new Date().toISOString() });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
  // Recarga para mostrar el formulario de login en la página unificada
  if (window.location.pathname.includes('auth.html')) {
    window.location.search = '';
  } else {
    window.location.href = 'auth.html';
  }
}

/**
 * Configura el toggle para mostrar/ocultar contraseña.
 * @param {string} toggleId - ID del botón.
 * @param {string} inputId - ID del input de contraseña.
 */
function setupPasswordToggle(toggleId, inputId) {
  const button = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (button && input) {
    button.addEventListener('click', () => {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      button.querySelector('i').classList.toggle('fa-eye');
      button.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }
}


// ==================== 🚀 INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  checkSessionAndRedirect();
  seedAdmins();

  // Lógica para la página de autenticación unificada (auth.html)
  const loginBtn = document.getElementById('showLoginBtn');
  if (loginBtn) {
    const registerBtn = document.getElementById('showRegisterBtn');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');

    const toggleForms = (showLogin) => {
      loginBtn.classList.toggle('active', showLogin);
      registerBtn.classList.toggle('active', !showLogin);
      loginFormContainer.classList.toggle('active', showLogin);
      registerFormContainer.classList.toggle('active', !showLogin);
    };

    loginBtn.addEventListener('click', () => toggleForms(true));
    registerBtn.addEventListener('click', () => toggleForms(false));

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'register') {
      toggleForms(false);
    }
  }

  // Event listeners para formularios
  document.getElementById('loginForm')?.addEventListener('submit', (e) => { e.preventDefault(); iniciarSesion(); });
  document.getElementById('registroForm')?.addEventListener('submit', (e) => { e.preventDefault(); registrarUsuario(); });

  // Validar contraseña en tiempo real
  const regPasswordInput = document.getElementById('regPassword');
  if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
      document.getElementById('req-length').style.color = regPasswordInput.value.length >= 5 ? '#4a7c59' : 'var(--muted)';
      document.getElementById('req-uppercase').style.color = /[A-Z]/.test(regPasswordInput.value) ? '#4a7c59' : 'var(--muted)';
    });
  }

  // Configurar toggles de contraseña
  setupPasswordToggle('togglePassword', 'password');
  setupPasswordToggle('toggleRegPassword', 'regPassword');
  setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');
});