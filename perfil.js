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

// Función para convertir un archivo a Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ==================== 👤 AUTENTICACIÓN ====================
function verificarAutenticacion() {
  currentUser = safeGet('usuarioActual');
  
  if (!currentUser) {
    safeNotify('Debes iniciar sesión para acceder a tu perfil', 'error');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 2000);
    return false;
  }
  
  return true;
}

function cerrarSesion() {
  localStorage.removeItem('usuarioActual');
  safeNotify('Sesión cerrada correctamente');
  setTimeout(() => {
    window.location.href = 'auth.html';
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
  renderizarGraficoGeneros(); // <-- Llamamos a la nueva función
}

function actualizarEstadisticas() {
  const totalLibros = userLibrary.length;
  const librosLeidos = userLibrary.filter(libro => libro.status === 'leido').length;
  const librosLeyendo = userLibrary.filter(libro => libro.status === 'leyendo').length;
  
  if(document.getElementById('totalLibraryBooks')) document.getElementById('totalLibraryBooks').textContent = totalLibros;
  if(document.getElementById('totalReadBooks')) document.getElementById('totalReadBooks').textContent = librosLeidos;
  if(document.getElementById('currentlyReading')) document.getElementById('currentlyReading').textContent = librosLeyendo;
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
          ${libro.pdf ? `<a href="lector.html?id=${libro.id}" target="_blank" class="btn-primary btn-small">
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
  safeNotify(`Estado actualizado: ${getStatusText(nuevoEstado)}`);
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
  safeNotify('Libro eliminado de tu biblioteca');
}

// ==================== 📊 GRÁFICO DE GÉNEROS ====================
let genreChartInstance = null; // Guardar la instancia para destruirla antes de re-renderizar

function renderizarGraficoGeneros() {
  const genreChartContainer = document.getElementById('genreChart');
  const ctx = document.getElementById('genreChartCanvas')?.getContext('2d');
  if (!genreChartContainer || !ctx) return;

  // 1. Contar géneros en la biblioteca
  const genreCounts = userLibrary.reduce((acc, libro) => {
    const genre = libro.genre || 'Sin Género';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  // 2. Si no hay libros, mostrar mensaje
  if (Object.keys(genreCounts).length === 0) {
    genreChartContainer.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px;">Agrega libros a tu biblioteca para ver tus géneros preferidos.</p>';
    return;
  } else {
    // Asegurarse de que el canvas esté visible si antes no había libros
    genreChartContainer.innerHTML = '<canvas id="genreChartCanvas" style="max-height: 300px;"></canvas>';
    const newCtx = document.getElementById('genreChartCanvas').getContext('2d');

    // 3. Preparar datos para Chart.js
    const labels = Object.keys(genreCounts);
    const data = Object.values(genreCounts);
    
    // Paleta de colores que combina con el tema
    const chartColors = [
      '#c9a227', '#2196f3', '#4caf50', '#e91e63', 
      '#ff9800', '#9c27b0', '#00bcd4', '#f44336'
    ];

    // Destruir gráfico anterior si existe para evitar solapamientos
    if (genreChartInstance) {
      genreChartInstance.destroy();
    }

    // 4. Crear el nuevo gráfico
    genreChartInstance = new Chart(newCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Libros por Género',
          data: data,
          backgroundColor: chartColors,
          borderColor: 'var(--card)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { color: 'var(--text)' } },
          title: { display: false }
        }
      }
    });
  }
}

// ==================== ✨ RECOMENDACIONES ====================
function renderizarRecomendaciones() {
  const recommendedGrid = document.getElementById('recommendedBooksGrid');
  if (!recommendedGrid) return;

  // 1. Obtener todos los libros del catálogo y la biblioteca del usuario
  const todosLosLibros = safeGet('libros') || [];
  const userLibraryIds = new Set(userLibrary.map(libro => libro.id));

  // 2. Contar la frecuencia de géneros en la biblioteca del usuario
  const genreCounts = userLibrary.reduce((acc, libro) => {
    acc[libro.genre] = (acc[libro.genre] || 0) + 1;
    return acc;
  }, {});

  // 3. Ordenar géneros por frecuencia para encontrar el preferido
  const favoriteGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);

  let recommendations = [];

  // 4. Si el usuario tiene géneros preferidos, buscar libros de esos géneros
  if (favoriteGenres.length > 0) {
    const topGenre = favoriteGenres[0];
    recommendations = todosLosLibros.filter(libro => 
      libro.genero === topGenre && !userLibraryIds.has(libro.id)
    );
  }

  // 5. Si no hay recomendaciones (o biblioteca vacía), usar los más populares como fallback
  if (recommendations.length < 4) {
    const popularFallback = todosLosLibros
      .filter(libro => !userLibraryIds.has(libro.id)) // que no estén en la biblioteca
      .sort((a, b) => b.likes - a.likes); // ordenados por likes
    
    // Añadir libros populares hasta tener suficientes recomendaciones
    for (const book of popularFallback) {
      if (recommendations.length >= 4) break;
      if (!recommendations.some(r => r.id === book.id)) {
        recommendations.push(book);
      }
    }
  }

  // 6. Ordenar las recomendaciones finales por popularidad y tomar las 4 primeras
  const finalRecommendations = recommendations
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4);

  // 7. Renderizar el HTML
  if (finalRecommendations.length > 0) {
    recommendedGrid.innerHTML = finalRecommendations.map(libro => `
      <div class="library-book-card">
        <div class="book-cover-container">
          <img src="${libro.portada}" alt="Portada de ${libro.titulo}" class="book-cover" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIGltYWdlbjwvdGV4dD4KPC9zdmc+'">
        </div>
        <div class="book-info">
          <h4>${libro.titulo}</h4>
          <p class="book-author">${libro.autor}</p>
          <div class="book-actions" style="margin-top: auto;">
            <button class="btn-primary btn-small" onclick="addRecommendedToLibrary(${libro.id})"><i class="fas fa-plus"></i> Agregar</button>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    recommendedGrid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px;grid-column: 1 / -1;">¡Explora el catálogo para que podamos darte mejores recomendaciones!</p>';
  }
}

function addRecommendedToLibrary(bookId) {
  // Reutilizamos la función global de libros.js para añadir al catálogo
  if (typeof addCatalogBookToLibrary === 'function') {
    addCatalogBookToLibrary(bookId);
    // Opcional: refrescar recomendaciones o simplemente mostrar notificación
    safeNotify('Libro agregado a tu biblioteca');
    renderizarRecomendaciones(); // Volver a calcular para que no aparezca de nuevo
    cargarBibliotecaPersonal(); // Actualizar la biblioteca principal
  }
}

// ==================== 👤 EDICIÓN DE PERFIL ====================
function openEditModal() {
  const modal = document.getElementById('editProfileModal');
  if (!modal) return;
  
  // Cargar datos actuales en el modal
  document.getElementById('userName').value = currentUser.nombre || '';
  document.getElementById('userEmail').value = currentUser.email || '';
  document.getElementById('userBio').value = currentUser.bio || 'Amante de la literatura...';
  // Mostrar la imagen de perfil actual en la vista previa
  document.getElementById('previewImage').src = currentUser.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHZpZXdCb3g9IjAgMCA4OCA4OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDQiIGN5PSI0NCIgcj0iNDQiIGZpbGw9IiNjOWEyMjciLz4KPGNpcmNsZSBjeD0iNDQiIGN5PSIzMyIgcj0iMTMiIGZpbGw9IiMwZjExMTMiLz4KPHBhdGggZD0iTTIyIDcyQzIyIDYwIDMzIDU1IDQ0IDU1UzY2IDYwIDY2IDcyIiBzdHJva2U9IiMwZjExMTMiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';

  modal.style.display = 'flex';
}

function closeEditModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function saveProfile() {
  const nombre = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const bio = document.getElementById('userBio').value.trim();
  const profileImageFile = document.getElementById('profileImage').files[0];

  if (!nombre || !email) {
    safeNotify('Por favor completa los campos obligatorios', 'error');
    return;
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    safeNotify('Por favor ingresa un email válido', 'error');
    return;
  }
  
  // Actualizar usuario actual
  currentUser.nombre = nombre;
  currentUser.email = email;
  currentUser.bio = bio;

  // Si se seleccionó una nueva imagen, convertirla a Base64 y guardarla
  if (profileImageFile) {
    try {
      currentUser.avatar = await fileToBase64(profileImageFile);
    } catch (error) {
      console.error("Error al convertir la imagen:", error);
      safeNotify('Hubo un error al guardar la imagen', 'error');
    }
  }

  // Guardar en localStorage
  safeSet('usuarioActual', currentUser);
  
  // Actualizar en la lista de usuarios
  const usuarios = safeGet('usuarios') || [];
  const usuarioIndex = usuarios.findIndex(u => u.username === currentUser.username);
  if (usuarioIndex !== -1) {
    usuarios[usuarioIndex] = { ...usuarios[usuarioIndex], ...currentUser };
    safeSet('usuarios', usuarios);
  }
  
  // Actualizar interfaz
  actualizarPerfil();
  closeEditModal();
  safeNotify('Perfil actualizado correctamente');
}

function actualizarPerfil() {
  document.getElementById('profileName').textContent = currentUser.nombre || 'Usuario';
  document.getElementById('profileEmail').textContent = currentUser.email || '';
  document.getElementById('profileBio').textContent = currentUser.bio || 'Amante de la literatura...';

  // Actualizar la imagen de perfil principal
  const profileAvatarImg = document.getElementById('profileAvatarImg');
  if (currentUser.avatar) {
    profileAvatarImg.src = currentUser.avatar;
  }
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
  
  // Renderizar recomendaciones
  renderizarRecomendaciones();

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