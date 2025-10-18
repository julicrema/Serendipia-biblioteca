// ==================== 📚 PERFIL.JS - FUNCIONALIDAD DEL PERFIL ====================

// Variables globales
let currentUser = null;
let userLibrary = [];

// ==================== 🔧 UTILIDADES ====================
function safeGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    console.warn(`Error parsing ${key}:`, e);
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error setting ${key}:`, e);
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--gold)' : '#e53935'};
    color: ${type === 'success' ? '#000' : '#fff'};
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==================== 👤 AUTENTICACIÓN ====================
function verificarAutenticacion() {
  currentUser = safeGet('usuarioActual');
  
  if (!currentUser) {
    showNotification('Debes iniciar sesión para acceder a tu perfil', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return false;
  }
  
  return true;
}

function cerrarSesion() {
  localStorage.removeItem('usuarioActual');
  showNotification('Sesión cerrada correctamente');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// ==================== 📖 BIBLIOTECA PERSONAL ====================
function cargarBibliotecaPersonal() {
  if (!currentUser) return;
  
  const bibliotecaAll = safeGet('biblioteca') || {};
  const userKey = currentUser.username;
  userLibrary = bibliotecaAll[userKey] || [];
  
  actualizarEstadisticas();
  renderizarBiblioteca();
}

function actualizarEstadisticas() {
  const totalLibros = userLibrary.length;
  const librosLeidos = userLibrary.filter(libro => libro.status === 'leido').length;
  const librosLeyendo = userLibrary.filter(libro => libro.status === 'leyendo').length;
  
  document.getElementById('totalLibraryBooks').textContent = totalLibros;
  document.getElementById('totalReadBooks').textContent = librosLeidos;
  document.getElementById('currentlyReading').textContent = librosLeyendo;
}

function renderizarBiblioteca() {
  const libraryGrid = document.getElementById('profileLibraryGrid');
  const emptyState = document.getElementById('emptyLibraryState');
  
  if (!libraryGrid) return;
  
  if (userLibrary.length === 0) {
    libraryGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  libraryGrid.innerHTML = userLibrary.map(libro => `
    <div class="library-book-card">
      <div class="book-cover-container">
        <img src="${libro.cover || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIGltYWdlbjwvdGV4dD4KPC9zdmc+'}" 
             alt="Portada de ${libro.title}" 
             class="book-cover"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIGltYWdlbjwvdGV4dD4KPC9zdmc+'">
      </div>
      <div class="book-info">
        <h4>${libro.title}</h4>
        <p class="book-author">${libro.author}</p>
        <p class="book-genre">${libro.genre}</p>
        <div class="book-status">
          <span class="status-badge status-${libro.status}">${getStatusText(libro.status)}</span>
        </div>
        <div class="book-actions">
          ${libro.pdf ? `<a href="${libro.pdf}" target="_blank" class="btn-primary btn-small">
            <i class="fas fa-book-open"></i> Leer PDF
          </a>` : ''}
          <button class="btn-secondary btn-small" onclick="cambiarEstadoLibro(${libro.id}, '${getNextStatus(libro.status)}')">
            <i class="fas fa-edit"></i> ${getNextStatusText(libro.status)}
          </button>
          <button class="btn-danger btn-small" onclick="eliminarDeBiblioteca(${libro.id})">
            <i class="fas fa-trash"></i> Quitar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function getStatusText(status) {
  const statusMap = {
    'por-leer': 'Por leer',
    'leyendo': 'Leyendo',
    'leido': 'Leído',
    'favorito': 'Favorito'
  };
  return statusMap[status] || 'Por leer';
}

function getNextStatus(currentStatus) {
  const statusFlow = {
    'por-leer': 'leyendo',
    'leyendo': 'leido',
    'leido': 'favorito',
    'favorito': 'por-leer'
  };
  return statusFlow[currentStatus] || 'leyendo';
}

function getNextStatusText(currentStatus) {
  const nextStatusMap = {
    'por-leer': 'Comenzar a leer',
    'leyendo': 'Marcar como leído',
    'leido': 'Marcar como favorito',
    'favorito': 'Quitar de favoritos'
  };
  return nextStatusMap[currentStatus] || 'Comenzar a leer';
}

function cambiarEstadoLibro(libroId, nuevoEstado) {
  const libroIndex = userLibrary.findIndex(libro => libro.id === libroId);
  if (libroIndex === -1) return;
  
  userLibrary[libroIndex].status = nuevoEstado;
  userLibrary[libroIndex].lastUpdated = new Date().toISOString();
  
  // Guardar en localStorage
  const bibliotecaAll = safeGet('biblioteca') || {};
  bibliotecaAll[currentUser.username] = userLibrary;
  safeSet('biblioteca', bibliotecaAll);
  
  actualizarEstadisticas();
  renderizarBiblioteca();
  showNotification(`Estado actualizado: ${getStatusText(nuevoEstado)}`);
}

function eliminarDeBiblioteca(libroId) {
  if (!confirm('¿Estás seguro de que quieres quitar este libro de tu biblioteca?')) {
    return;
  }
  
  userLibrary = userLibrary.filter(libro => libro.id !== libroId);
  
  // Guardar en localStorage
  const bibliotecaAll = safeGet('biblioteca') || {};
  bibliotecaAll[currentUser.username] = userLibrary;
  safeSet('biblioteca', bibliotecaAll);
  
  actualizarEstadisticas();
  renderizarBiblioteca();
  showNotification('Libro eliminado de tu biblioteca');
}

// ==================== 👤 EDICIÓN DE PERFIL ====================
function openEditModal() {
  const modal = document.getElementById('editProfileModal');
  if (!modal) return;
  
  // Cargar datos actuales
  document.getElementById('userName').value = currentUser.nombre || '';
  document.getElementById('userEmail').value = currentUser.email || '';
  document.getElementById('userBio').value = currentUser.bio || 'Amante de la literatura...';
  
  modal.style.display = 'flex';
}

function closeEditModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveProfile() {
  const nombre = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const bio = document.getElementById('userBio').value.trim();
  
  if (!nombre || !email) {
    showNotification('Por favor completa los campos obligatorios', 'error');
    return;
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('Por favor ingresa un email válido', 'error');
    return;
  }
  
  // Actualizar usuario actual
  currentUser.nombre = nombre;
  currentUser.email = email;
  currentUser.bio = bio;
  
  // Guardar en localStorage
  safeSet('usuarioActual', currentUser);
  
  // Actualizar en la lista de usuarios
  const usuarios = safeGet('usuarios') || [];
  const usuarioIndex = usuarios.findIndex(u => u.username === currentUser.username);
  if (usuarioIndex !== -1) {
    usuarios[usuarioIndex] = { ...usuarios[usuarioIndex], nombre, email, bio };
    safeSet('usuarios', usuarios);
  }
  
  // Actualizar interfaz
  actualizarPerfil();
  closeEditModal();
  showNotification('Perfil actualizado correctamente');
}

function actualizarPerfil() {
  document.getElementById('profileName').textContent = currentUser.nombre || 'Usuario';
  document.getElementById('profileEmail').textContent = currentUser.email || '';
  document.getElementById('profileBio').textContent = currentUser.bio || 'Amante de la literatura...';
}

// ==================== 📊 TABS ====================
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Remover clase active de todos los botones y paneles
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Agregar clase active al botón y panel seleccionado
      button.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

// ==================== 🚀 INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }
  
  // Actualizar perfil
  actualizarPerfil();
  
  // Cargar biblioteca
  cargarBibliotecaPersonal();
  
  // Inicializar tabs
  initTabs();
  
  // Event listeners para modal de edición
  const editForm = document.getElementById('editProfileForm');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelEditBtn = document.getElementById('cancelEdit');
  
  if (editForm) {
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProfile();
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeEditModal);
  }
  
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditModal);
  }
  
  // Cerrar modal al hacer clic fuera
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeEditModal();
      }
    });
  }
  
  // Preview de imagen de perfil
  const profileImageInput = document.getElementById('profileImage');
  const previewImage = document.getElementById('previewImage');
  
  if (profileImageInput && previewImage) {
    profileImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// ==================== 📱 RESPONSIVE Y ESTILOS ====================
// Agregar estilos dinámicos para mejorar la experiencia
const style = document.createElement('style');
style.textContent = `
  .library-book-card {
    background: var(--card);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .library-book-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  }
  
  .book-cover-container {
    text-align: center;
    margin-bottom: 12px;
  }
  
  .book-cover {
    width: 120px;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  .book-info h4 {
    color: var(--gold);
    margin: 0 0 8px 0;
    font-size: 16px;
  }
  
  .book-author {
    color: var(--muted);
    margin: 0 0 4px 0;
    font-size: 14px;
  }
  
  .book-genre {
    color: var(--text);
    margin: 0 0 12px 0;
    font-size: 12px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-por-leer {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }
  
  .status-leyendo {
    background: rgba(33, 150, 243, 0.2);
    color: #2196f3;
  }
  
  .status-leido {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }
  
  .status-favorito {
    background: rgba(233, 30, 99, 0.2);
    color: #e91e63;
  }
  
  .book-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  
  .btn-small {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 6px;
  }
  
  .grid-books {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }
  
  .loading-library {
    text-align: center;
    color: var(--muted);
    padding: 40px;
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 20px;
  }
  
  .tab-btn {
    background: none;
    border: none;
    color: var(--muted);
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }
  
  .tab-btn:hover {
    color: var(--text);
  }
  
  .tab-btn.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }
  
  .tab-pane {
    display: none;
  }
  
  .tab-pane.active {
    display: block;
  }
  
  .edit-profile-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .close-modal-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--muted);
  }
  
  .close-modal-btn:hover {
    color: var(--text);
  }
  
  @media (max-width: 768px) {
    .grid-books {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    
    .book-cover {
      width: 100px;
      height: 150px;
    }
    
    .tabs {
      overflow-x: auto;
    }
    
    .tab-btn {
      white-space: nowrap;
    }
  }
`;
document.head.appendChild(style);