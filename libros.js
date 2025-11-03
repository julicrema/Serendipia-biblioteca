// ==================== 📚 INICIALIZAR LIBROS BASE ====================
let libros = JSON.parse(localStorage.getItem("libros"));
if (!libros || libros.length === 0) {
  libros = [
    { 
      id: 1,
      titulo: "Tan poca vida", 
      autor: "Hanya Yanagihara", 
      descripcion: "Una novela épica sobre la amistad, el amor y la supervivencia que sigue la vida de cuatro amigos desde la universidad hasta la madurez.",
      archivo: "libros/vida.pdf", 
      portada: "libros/vida.jpg",
      genero: "Ficción Literaria",
      año: 2015,
      idioma: "Español",
      etiquetas: ["drama", "amistad", "trauma", "supervivencia"],
      calificacionPromedio: 4.5,
      numeroResenas: 23,
      likes: 156,
      fechaSubida: "2024-01-15",
      permisos: "publico",
      comentarios: []
    },
    { 
      id: 2, 
      titulo: "Alas de Sangre", 
      autor: "Rebecca Yarros", 
      descripcion: "La historia sigue a Violet Sorrengail, una joven de veinte años que planeaba una vida tranquila en el Cuadrante de los Escribas. Sin embargo, su madre, la temida Comandante General, le ordena unirse al Cuadrante de Jinetes de Dragón en el brutal Colegio de Guerra de Basgiath.",
      archivo: "libros/asangre.pdf", 
      portada: "libros/asangre.jpg",
      genero: "Fantasía",
      año: 2023,
      idioma: "Español",
      etiquetas: ["Fantasia", "Romance"],
      calificacionPromedio: 4.2,
      numeroResenas: 18,
      likes: 89,
      fechaSubida: "2024-02-10",
      permisos: "publico",
      comentarios: []
    },
    {
      id: 3,
      titulo: "El túnel",
      autor: "Ernesto Sábato",
      descripcion: "Una obra maestra de la literatura argentina que explora la psicología humana a través de la historia de un pintor obsesionado con una mujer.",
      archivo: "libros/etunel.pdf",
      portada: "libros/etunel.jpg",
      genero: "Ficción Literaria",
      año: 1948,
      idioma: "Español",
      etiquetas: ["psicología", "obsesión", "arte"],
      calificacionPromedio: 4.3,
      numeroResenas: 15,
      likes: 67,
      fechaSubida: "2024-01-20",
      permisos: "publico",
      comentarios: []
    },
    {
      id: 4,
      titulo: "Orgullo y Prejuicio",
      autor: "Jane Austen",
      descripcion: "Una de las novelas más famosas de la literatura inglesa que narra la historia de Elizabeth Bennet y Mr. Darcy en la Inglaterra del siglo XIX.",
      archivo: "libros/Orgullo_y_prejuicio.pdf",
      portada: "libros/Orgullo_y_prejuicio.jpg",
      genero: "Romántico",
      año: 1813,
      idioma: "Español",
      etiquetas: ["romance", "clásico", "sociedad"],
      calificacionPromedio: 4.7,
      numeroResenas: 45,
      likes: 234,
      fechaSubida: "2024-01-25",
      permisos: "publico",
      comentarios: []
    },
    {
      id: 5,
      titulo: "El señor de los anillos",
      autor: "J.R.R. Tolkien",
      descripcion: "La épica aventura de Frodo Bolsón y la Comunidad del Anillo en su misión para destruir el Anillo Único.",
      archivo: "libros/gerals.pdf", // Asumiendo que este es el PDF correcto
      portada: "libros/gerals.jpg",
      genero: "Fantasía",
      año: 1954,
      idioma: "Español",
      etiquetas: ["aventura", "magia", "épico"],
      calificacionPromedio: 4.8,
      numeroResenas: 89,
      likes: 456,
      fechaSubida: "2024-02-01",
      permisos: "publico",
      comentarios: []
    }
  ];
  localStorage.setItem("libros", JSON.stringify(libros));
}

// ==================== 🧰 VARIABLES GLOBALES ====================
const catalogo = document.getElementById("catalogo");
const paginacion = document.getElementById("paginacion");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const filterGenero = document.getElementById("filterGenero");
const clearFilters = document.getElementById("clearFilters");

let paginaActual = 1; 
const librosPorPagina = 6;

// ==================== ⭐ UTILIDADES ====================
function generarEstrellas(calificacion) {
  const llenas = Math.floor(calificacion);
  const media = calificacion % 1 >= 0.5;
  let s = "★".repeat(llenas);
  if (media) s += "☆";
  s += "☆".repeat(5 - llenas - (media ? 1 : 0));
  return s;
}

// ==================== 🔎 FILTROS Y CATALOGO ====================
function obtenerValoresFiltros() {
  return {
    genero: filterGenero ? filterGenero.value : "",
    calificacion: document.getElementById('filterCalificacion')?.value || "",
    anoMin: document.getElementById('filterAnoMin')?.value || "",
    anoMax: document.getElementById('filterAnoMax')?.value || ""
  };
}

function renderCatalogo(genero = "", calificacion = "", anoMin = "", anoMax = "") {
  // si la página no tiene un contenedor de catálogo, salir (evita errores en admin.html u otras páginas)
  if (!catalogo) return;

  const libros = getLibros();
  const filtrados = libros.filter(l => {
    // Filtro por género
    const coincideGenero = !genero || l.genero === genero;
    // Filtro por calificación
    const coincideCalificacion = !calificacion || l.calificacionPromedio >= parseFloat(calificacion);
    // Filtro por año
    const coincideAno = (!anoMin || l.año >= parseInt(anoMin)) && (!anoMax || l.año <= parseInt(anoMax));

    return coincideGenero && coincideCalificacion && coincideAno;
  });

  const totalPaginas = Math.ceil(filtrados.length / librosPorPagina);
  if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;
  const inicio = (paginaActual - 1) * librosPorPagina;
  const paginaLibros = filtrados.slice(inicio, inicio + librosPorPagina);

  // Obtener biblioteca del usuario actual (por-usuario)
  const user = JSON.parse(localStorage.getItem('usuarioActual'));
  const bibliotecaAll = JSON.parse(localStorage.getItem('biblioteca')) || {};
  const userKey = user ? user.username : null;
  const libraryBooks = userKey ? (bibliotecaAll[userKey] || []) : [];

  catalogo.innerHTML = paginaLibros.map(l => {
    const inLibrary = libraryBooks.some(b => b.id === l.id);
    const addBtnHtml = inLibrary
      ? `<button class="btn-primary" disabled>✅ En Biblioteca</button>`
      : `<button class="btn-primary" onclick="addCatalogBookToLibrary(${l.id})">📚 Agregar</button>`;
    return `
      <article class="book-card" onclick="openBookModal(${l.id})">
        <img src="${l.portada}" alt="Portada de ${l.titulo}" class="book-cover" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIGltYWdlbjwvdGV4dD4KPC9zdmc+'">
        <div class="book-info">
          <h3>${l.titulo}</h3>
          <p class="autor">${l.autor}</p>
          <div class="book-meta">
            <span>${l.genero}</span> • <span>${l.año}</span>
          </div>
          <div class="rating">
            <span class="estrellas">${generarEstrellas(l.calificacionPromedio)}</span>
            <span class="calificacion">${l.calificacionPromedio}</span>
            <span class="resenas">(${l.numeroResenas} reseñas)</span>
          </div>
          <div class="etiquetas">
            ${l.etiquetas ? l.etiquetas.map(et => `<span class="etiqueta">${et}</span>`).join("") : ""}
          </div>
          <div class="book-actions">
            <button class="btn-leer" onclick="openBookModal(${l.id})">Leer</button>
            <button class="btn-like" onclick="toggleLike(${l.id})">❤️ ${l.likes}</button>
            <button class="btn-favorito" onclick="marcarComoFavorito(${l.id})">⭐</button>
            ${addBtnHtml}
          </div>
        </div>
      </article>`;
  }).join("");

  // paginación
  if (paginacion) {
    paginacion.innerHTML = "";
    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === paginaActual) btn.classList.add("activo");
      btn.addEventListener("click", () => {
        paginaActual = i;
        const { genero, calificacion, anoMin, anoMax } = obtenerValoresFiltros();
        renderCatalogo(genero, calificacion, anoMin, anoMax);
      });
      paginacion.appendChild(btn);
    }
  }
}

function renderGenreSections() {
  const container = document.getElementById('genreSectionsContainer');
  if (!container) return;

  const libros = getLibros();
  
  // 1. Agrupar libros por género
  const librosPorGenero = libros.reduce((acc, libro) => {
    const genre = libro.genero || 'Sin Género';
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push(libro);
    return acc;
  }, {});

  // 2. Renderizar una sección por cada género
  container.innerHTML = Object.keys(librosPorGenero).map(genre => {
    const genreBooks = librosPorGenero[genre];
    // No mostrar la sección si no hay libros
    if (genreBooks.length === 0) return '';

    return `
      <section class="genre-section">
        <h2 class="section-title">${genre}</h2>
        <div class="catalogo">
          ${genreBooks.map(libro => `
            <article class="book-card" onclick="openBookModal(${libro.id})">
              <img src="${libro.portada}" alt="Portada de ${libro.titulo}" class="book-cover" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaGyPSJtaWRkbGUiPk5vIGltYWdlbjwvdGV4dD4KPC9zdmc+'">
              <div class="book-info">
                <h3>${libro.titulo}</h3>
                <p class="autor">${libro.autor}</p>
                <div class="book-meta">
                  <span>${libro.año}</span>
                </div>
                <div class="rating">
                  <span class="estrellas">${generarEstrellas(libro.calificacionPromedio)}</span>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function openBookModal(id) {
  const libros = getLibros();
  const libro = libros.find(l => l.id === id);
  if (!libro) return;

  const modal = document.getElementById('bookDetailModal');
  if (!modal) return;

  document.getElementById('modalBookTitle').textContent = libro.titulo;
  document.getElementById('modalBookAuthor').textContent = libro.autor;
  document.getElementById('modalBookGenre').textContent = libro.genero;
  document.getElementById('modalBookDescription').textContent = libro.descripcion || 'Sin descripción disponible';
  document.getElementById('modalBookCover').src = libro.portada;

  // Renderizar reseñas y formulario
  renderReviews(libro);
  setupReviewForm(libro.id);

  const readBtn = document.getElementById('modalReadPdf');
  if (readBtn) {
    readBtn.href = `lector.html?id=${libro.id}`;
    readBtn.style.display = 'inline-block';
  } else {
    readBtn.style.display = 'none';
  }

  const reportBtn = document.getElementById('modalReportBtn');
  if (reportBtn) {
    // Asignamos el evento para reportar el libro actual
    reportBtn.onclick = () => reportBook(libro.id);
  }

  const addBtn = document.getElementById('modalAddToLibrary');

  // comprobar biblioteca por-usuario (misma estructura que addCatalogBookToLibrary)
  const user = JSON.parse(localStorage.getItem('usuarioActual')); 
  const bibliotecaAll = JSON.parse(localStorage.getItem('biblioteca')) || {};
  const userKey = user ? user.username : null;
  const userLib = userKey ? (bibliotecaAll[userKey] || []) : [];
  const exists = userLib.some(b => b.id === libro.id);

  if (addBtn) {
    if (exists) {
      addBtn.textContent = '✅ En Biblioteca';
      addBtn.disabled = true;
    } else {
      addBtn.textContent = '📚 Agregar a Biblioteca';
      addBtn.disabled = false;
      // Asignar el evento onclick para llamar a la función que agrega el libro
      addBtn.onclick = () => {
        addCatalogBookToLibrary(libro.id);
        // Actualizar el botón inmediatamente después de agregarlo
        addBtn.textContent = '✅ En Biblioteca';
        addBtn.disabled = true;
      };
    }
  }

  modal.classList.add('show');
}

// Event listeners para modal
document.addEventListener('DOMContentLoaded', () => {
  const closeModal = document.getElementById('closeBookModal');
  const modal = document.getElementById('bookDetailModal');
  
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      if (modal) modal.classList.remove('show');
    });
  }

  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }
});

function renderReviews(libro) {
  const reviewsList = document.getElementById('modalBookReviewsList');
  const reviewFormContainer = document.getElementById('reviewFormContainer');
  const user = JSON.parse(localStorage.getItem('usuarioActual'));

  if (!reviewsList) return;

  // Mostrar reseñas existentes
  if (libro.comentarios && libro.comentarios.length > 0) {
    reviewsList.innerHTML = libro.comentarios.map(review => `
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">${review.username}</span>
          <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
        </div>
        <div class="rating">
          <span class="estrellas">${generarEstrellas(review.rating)}</span>
        </div>
        <p class="review-body">${review.comment}</p>
      </div>
    `).join('');
  } else {
    reviewsList.innerHTML = '<p style="color:var(--muted);text-align:center;">Este libro aún no tiene reseñas. ¡Sé el primero!</p>';
  }

  // Controlar visibilidad del formulario de reseña
  if (user) {
    const hasReviewed = libro.comentarios.some(r => r.username === user.username);
    reviewFormContainer.style.display = hasReviewed ? 'none' : 'block';
    if (hasReviewed) {
        reviewsList.insertAdjacentHTML('beforebegin', '<p style="color:var(--muted);text-align:center;">Ya has dejado una reseña para este libro.</p>');
    }
  } else {
    reviewFormContainer.style.display = 'none';
  }
}

function setupReviewForm(bookId) {
  const form = document.getElementById('reviewForm');
  const starsContainer = form.querySelector('.stars');
  const stars = starsContainer.querySelectorAll('i');

  // Lógica para seleccionar estrellas
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const value = star.dataset.value;
      stars.forEach(s => s.classList.toggle('hover', s.dataset.value <= value));
    });
    star.addEventListener('mouseout', () => stars.forEach(s => s.classList.remove('hover')));
    star.addEventListener('click', () => {
      const value = star.dataset.value;
      starsContainer.dataset.rating = value;
      stars.forEach(s => s.classList.toggle('active', s.dataset.value <= value));
    });
  });

  // Enviar formulario
  form.onsubmit = (e) => {
    e.preventDefault();
    const rating = parseInt(starsContainer.dataset.rating, 10);
    const comment = document.getElementById('reviewComment').value.trim();

    if (rating === 0) {
      safeNotify('Por favor, selecciona una calificación de estrellas.', 'error');
      return;
    }
    if (!comment) {
      safeNotify('Por favor, escribe un comentario.', 'error');
      return;
    }

    submitReview(bookId, rating, comment);
    form.reset();
    stars.forEach(s => s.classList.remove('active'));
    starsContainer.dataset.rating = 0;
  };
}

function submitReview(bookId, rating, comment) {
  const user = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!user) return;

  const libros = getLibros();
  const libroIndex = libros.findIndex(l => l.id === bookId);
  if (libroIndex === -1) return;

  const newReview = { username: user.username, rating, comment, date: new Date().toISOString() };
  libros[libroIndex].comentarios.push(newReview);

  // Recalcular promedio
  const totalRating = libros[libroIndex].comentarios.reduce((sum, r) => sum + r.rating, 0);
  libros[libroIndex].numeroResenas = libros[libroIndex].comentarios.length;
  libros[libroIndex].calificacionPromedio = (totalRating / libros[libroIndex].numeroResenas).toFixed(1);

  saveLibros(libros);
  safeNotify('¡Gracias por tu reseña!');
  openBookModal(bookId); // Refrescar el modal para mostrar la nueva reseña y ocultar el form
}

// ==================== ❤️ FUNCIONES DE INTERACCIÓN ====================
function toggleLike(id) {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  if (!user) return alert("Debes iniciar sesión para dar like");
  const libros = getLibros();
  const libro = libros.find(l => l.id === id);
  if (!libro) return;
  libro.likes += 1;
  saveLibros(libros);
  const { genero, calificacion, anoMin, anoMax } = obtenerValoresFiltros();
  renderCatalogo(genero, calificacion, anoMin, anoMax);
  safeNotify('Gracias por tu like');
}

function marcarComoFavorito(id) {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  if (!user) {
    safeNotify("Debes iniciar sesión para marcar un libro como favorito");
    return;
  }

  const bibliotecaAll = JSON.parse(localStorage.getItem('biblioteca')) || {};
  const userKey = user.username;
  if (!bibliotecaAll[userKey]) bibliotecaAll[userKey] = [];

  const libroIndex = bibliotecaAll[userKey].findIndex(b => b.id === id);

  if (libroIndex !== -1) {
    // Si el libro ya está en la biblioteca, actualiza su estado
    bibliotecaAll[userKey][libroIndex].status = 'favorito';
    localStorage.setItem('biblioteca', JSON.stringify(bibliotecaAll));
    safeNotify("Libro marcado como favorito");
  } else {
    // Si no está, primero hay que agregarlo
    safeNotify("Primero agrega el libro a tu biblioteca para marcarlo como favorito");
  }
}

/**
 * Permite a un usuario reportar un libro.
 * @param {number} bookId - El ID del libro a reportar.
 */
function reportBook(bookId) {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  if (!user) {
    safeNotify("Debes iniciar sesión para reportar un libro", "error");
    return;
  }

  const reason = prompt("Por favor, describe brevemente el problema con este libro (ej: contenido inapropiado, error en el archivo, etc.):");

  if (reason && reason.trim() !== "") {
    const reports = JSON.parse(localStorage.getItem('bookReports')) || [];
    const libro = getLibros().find(l => l.id === bookId);

    const newReport = {
      reportId: Date.now(),
      bookId: bookId,
      bookTitle: libro ? libro.titulo : 'Desconocido',
      reportedBy: user.username,
      reason: reason.trim(),
      date: new Date().toISOString()
    };
    reports.push(newReport);
    localStorage.setItem('bookReports', JSON.stringify(reports));
    safeNotify("Reporte enviado. Gracias por tu colaboración.");
  }
}
/* ======= agregar a biblioteca: guardar por usuario ======= */
function addCatalogBookToLibrary(id) {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  if (!user) return alert("Debes iniciar sesión");
  const libro = getLibros().find(l => l.id === id);
  if (!libro) return;

  const biblioteca = JSON.parse(localStorage.getItem('biblioteca')) || {};
  const userKey = user.username;
  if (!biblioteca[userKey]) biblioteca[userKey] = [];

  if (!biblioteca[userKey].some(b => b.id === id)) {
    biblioteca[userKey].push({
      id: id,
      title: libro.titulo,
      author: libro.autor,
      genre: libro.genero,
      status: 'por-leer',
      cover: libro.portada,
      pdf: libro.archivo || null,
      addedDate: new Date().toISOString(), 
      note: ''
    });
    localStorage.setItem('biblioteca', JSON.stringify(biblioteca));
    safeNotify('¡Libro agregado a tu biblioteca!');
  } else {
    safeNotify('Ya tienes este libro en tu biblioteca');
  }

  const { genero, calificacion, anoMin, anoMax } = obtenerValoresFiltros();
  renderCatalogo(genero, calificacion, anoMin, anoMax);
}
// Hacemos la función global para que perfil.js pueda usarla
window.addCatalogBookToLibrary = addCatalogBookToLibrary;


document.addEventListener("DOMContentLoaded", () => {
  renderCatalogo();
  renderGenreSections();

  // Event listeners para filtros
  const applyFilters = () => {
    paginaActual = 1;
    const { genero, calificacion, anoMin, anoMax } = obtenerValoresFiltros();
    renderCatalogo(genero, calificacion, anoMin, anoMax);
  };
  if (filterGenero) filterGenero.addEventListener("change", applyFilters);
  const filterCalificacion = document.getElementById('filterCalificacion');
  if (filterCalificacion) filterCalificacion.addEventListener('change', applyFilters);
  const filterAnoMin = document.getElementById('filterAnoMin');
  if (filterAnoMin) filterAnoMin.addEventListener('change', applyFilters);
  const filterAnoMax = document.getElementById('filterAnoMax');
  if (filterAnoMax) filterAnoMax.addEventListener('change', applyFilters);
  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      if (filterGenero) filterGenero.value = "";
      if (filterCalificacion) filterCalificacion.value = "";
      if (filterAnoMin) filterAnoMin.value = "";
      if (filterAnoMax) filterAnoMax.value = "";
      paginaActual = 1;
      renderCatalogo();
    });
  }

  // Modal de Búsqueda
  const searchToggleBtn = document.getElementById('searchToggleBtn');
  const searchModal = document.getElementById('searchModal');
  if (searchToggleBtn && searchModal) {
    const closeSearchModal = document.getElementById('closeSearchModal');
    const modalSearchInput = document.getElementById('modalSearchInput');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const openSearch = () => { searchModal.classList.add('show'); modalSearchInput.focus(); };
    const closeSearch = () => {
      searchModal.classList.remove('show');
      modalSearchInput.value = '';
      searchResultsContainer.innerHTML = '<p class="search-placeholder">Escribe para encontrar libros.</p>';
    };
    searchToggleBtn.addEventListener('click', openSearch);
    closeSearchModal.addEventListener('click', closeSearch);
    searchModal.addEventListener('click', (e) => { if (e.target === searchModal) closeSearch(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && searchModal.classList.contains('show')) closeSearch(); });
    modalSearchInput.addEventListener('input', () => {
      const query = modalSearchInput.value.toLowerCase().trim();
      if (query.length < 2) {
        searchResultsContainer.innerHTML = '<p class="search-placeholder">Escribe al menos 2 letras...</p>';
        return;
      }
      const resultados = getLibros().filter(l => l.titulo.toLowerCase().includes(query) || l.autor.toLowerCase().includes(query));
      searchResultsContainer.innerHTML = resultados.length
        ? resultados.map(l => `<a href="#" class="search-result-item" onclick="openBookModal(${l.id}); closeSearch(); return false;"><strong>${l.titulo}</strong> - <span>${l.autor}</span></a>`).join('')
        : '<p class="search-placeholder">No se encontraron libros.</p>';
    });
  }
});

window.addEventListener('libros-actualizados', () => {
  renderCatalogo();
  renderGenreSections();
});