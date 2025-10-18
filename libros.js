// ==================== 📚 INICIALIZAR LIBROS BASE ====================
let libros = JSON.parse(localStorage.getItem("libros"));
if (!libros || libros.length === 0) {
  libros = [
    { 
      id: 1,
      titulo: "Tan poca vida", 
      autor: "Hanya Yanagihara", 
      descripcion: "Una novela épica sobre la amistad, el amor y la supervivencia que sigue la vida de cuatro amigos desde la universidad hasta la madurez.",
      archivo: "libros/tan-poca-vida.pdf", 
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
      archivo: "libros/alas.pdf", 
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
      archivo: "libros/orgullo.pdf",
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
      archivo: "libros/gerals.pdf",
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
function getLibros() {
  return JSON.parse(localStorage.getItem('libros')) || [];
}

function saveLibros(libros) {
  localStorage.setItem('libros', JSON.stringify(libros));
  window.dispatchEvent(new Event("libros-actualizados"));
}

function generarEstrellas(calificacion) {
  const llenas = Math.floor(calificacion);
  const media = calificacion % 1 >= 0.5;
  let s = "★".repeat(llenas);
  if (media) s += "☆";
  s += "☆".repeat(5 - llenas - (media ? 1 : 0));
  return s;
}

function safeNotify(message){
  let el = document.getElementById('globalToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'globalToast';
    el.className = 'notification';
    el.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--gold);
      color: #000;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.transform = 'translateX(0)';
  setTimeout(() => {
    el.style.transform = 'translateX(100%)';
  }, 3000);
}

/* ======= util: convertir file -> base64 ======= */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// ==================== 🔎 FILTROS Y CATALOGO ====================
function obtenerValoresFiltros() {
  return {
    filtro: searchInput ? searchInput.value.trim() : "",
    genero: filterGenero ? filterGenero.value : ""
  };
}

/* ======= renderCatalogo: comprobar biblioteca del usuario (por-usuario) ======= */
function renderCatalogo(filtro = "", genero = "") {
  // si la página no tiene un contenedor de catálogo, salir (evita errores en admin.html u otras páginas)
  if (!catalogo) return;

  const libros = getLibros();
  const filtrados = libros.filter(l => {
    const coincideTexto = !filtro ||
      l.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      l.autor.toLowerCase().includes(filtro.toLowerCase()) ||
      (l.etiquetas && l.etiquetas.some(e => e.toLowerCase().includes(filtro.toLowerCase())));
    const coincideGenero = !genero || l.genero === genero;
    return coincideTexto && coincideGenero;
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
      <article class="book-card">
        <img src="${l.portada}" alt="Portada de ${l.titulo}" class="book-cover" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIGltYWdlbjwvdGV4dD4KPC9zdmc+'">
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
            <button class="btn-favorito" onclick="toggleFavorito(${l.id})">⭐</button>
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
        const f = obtenerValoresFiltros();
        renderCatalogo(f.filtro, f.genero);
      });
      paginacion.appendChild(btn);
    }
  }
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

  const readBtn = document.getElementById('modalReadPdf');
  if (libro.archivo) {
    readBtn.href = libro.archivo;
    readBtn.style.display = 'inline-block';
  } else {
    readBtn.style.display = 'none';
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
      addBtn.onclick = null;
    } else {
      addBtn.textContent = '📚 Agregar a Biblioteca';
      addBtn.disabled = false;
      addBtn.onclick = () => {
        addCatalogBookToLibrary(libro.id);
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

// ==================== ❤️ FUNCIONES DE INTERACCIÓN ====================
function toggleLike(id) {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  if (!user) return alert("Debes iniciar sesión para dar like");
  const libros = getLibros();
  const libro = libros.find(l => l.id === id);
  if (!libro) return;
  libro.likes += 1;
  saveLibros(libros);
  const f = obtenerValoresFiltros();
  renderCatalogo(f.filtro, f.genero);
  safeNotify('Gracias por tu like');
}

function toggleFavorito(id) {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  if (!user) return alert("Debes iniciar sesión");
  const biblioteca = JSON.parse(localStorage.getItem("biblioteca")) || {};
  const userId = user.username;
  if (!biblioteca[userId]) biblioteca[userId] = [];
  if (!biblioteca[userId].includes(id)) {
    biblioteca[userId].push(id);
    localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
    safeNotify("Libro agregado a tu biblioteca");
  } else {
    safeNotify("Ya tienes este libro en favoritos");
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

  const f = obtenerValoresFiltros();
  renderCatalogo(f.filtro, f.genero);
}

// ==================== 👤 AUTENTICACIÓN ====================
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
  renderCatalogo();
  safeNotify("Sesión cerrada correctamente");
  window.location.href = 'login.html';
}

// ==================== 🧑‍💻 CRUD ADMIN ====================
function renderAdminTable() {
  const tbody = document.getElementById('bookTableBody');
  if (!tbody) return;
  const libros = getLibros();
  
  if (libros.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-books">No hay libros en el catálogo</td></tr>';
    return;
  }

  tbody.innerHTML = libros.map(libro => `
    <tr>
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${libro.genero}</td>
      <td>${libro.año || 'N/A'}</td>
      <td>
        <button class="btn-small btn-edit" onclick="editarLibro(${libro.id})" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-small btn-delete" onclick="eliminarLibro(${libro.id})" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`).join('');
}

function agregarLibro(titulo, autor, genero, descripcion, portada, archivo, año) {
  const libros = getLibros();
  const nuevo = {
    id: Date.now(),
    titulo,
    autor,
    genero,
    descripcion,
    portada,
    archivo,
    año: año || new Date().getFullYear(),
    idioma: "Español",
    etiquetas: [],
    calificacionPromedio: 0,
    numeroResenas: 0,
    likes: 0,
    fechaSubida: new Date().toISOString(),
    permisos: "publico",
    comentarios: []
  };
  libros.push(nuevo);
  saveLibros(libros);
  renderAdminTable();
  safeNotify('Libro agregado exitosamente');
}

function editarLibro(id) {
  const libros = getLibros();
  const libro = libros.find(l => l.id === id);
  if (!libro) return;

  document.getElementById('admTitulo').value = libro.titulo;
  document.getElementById('admAutor').value = libro.autor;
  document.getElementById('admGenero').value = libro.genero;
  document.getElementById('admDescripcion').value = libro.descripcion;
  document.getElementById('admAno').value = libro.año || '';
  document.getElementById('adminAddBookForm').dataset.editingId = id;
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  document.getElementById('saveBookBtn').innerHTML = '<i class="fas fa-save"></i> Actualizar Libro';
  
  // Scroll al formulario
  document.getElementById('adminAddBookForm').scrollIntoView({ behavior: 'smooth' });
}

function eliminarLibro(id) {
  if (!confirm("¿Seguro que deseas eliminar este libro?")) return;
  let libros = getLibros();
  libros = libros.filter(l => l.id !== id);
  saveLibros(libros);
  renderAdminTable();
  safeNotify("Libro eliminado correctamente");
}

/* ======= Conectar formulario adminAddBookForm (convertir archivos y guardar) ======= */
document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacion();
  renderCatalogo();
  renderAdminTable();

  // Event listeners para búsqueda y filtros
  if (searchBtn) searchBtn.addEventListener("click", () => {
    paginaActual = 1;
    const f = obtenerValoresFiltros();
    renderCatalogo(f.filtro, f.genero);
  });
  
  if (searchInput) searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") {
      paginaActual = 1;
      const f = obtenerValoresFiltros();
      renderCatalogo(f.filtro, f.genero);
    }
  });
  
  if (filterGenero) filterGenero.addEventListener("change", () => {
    paginaActual = 1;
    const f = obtenerValoresFiltros();
    renderCatalogo(f.filtro, f.genero);
  });
  
  if (clearFilters) clearFilters.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (filterGenero) filterGenero.value = "";
    paginaActual = 1;
    renderCatalogo();
  });

  const adminForm = document.getElementById('adminAddBookForm');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editingId = adminForm.dataset.editingId;
      const titulo = document.getElementById('admTitulo').value.trim();
      const autor = document.getElementById('admAutor').value.trim();
      const genero = document.getElementById('admGenero').value.trim();
      const descripcion = document.getElementById('admDescripcion').value.trim();
      const año = document.getElementById('admAno').value;

      // portada: si suben archivo convertir a base64, si no usar valor (por si permiten URL)
      const portadaInput = document.getElementById('admPortada');
      const pdfInput = document.getElementById('admPdf');
      let portadaVal = '';
      let pdfVal = '';

      if (portadaInput && portadaInput.files && portadaInput.files[0]) {
        try {
          portadaVal = await fileToBase64(portadaInput.files[0]);
        } catch (error) {
          console.error('Error procesando portada:', error);
          alert('Error al procesar la imagen de portada');
          return;
        }
      }

      if (pdfInput && pdfInput.files && pdfInput.files[0]) {
        try {
          pdfVal = await fileToBase64(pdfInput.files[0]);
        } catch (error) {
          console.error('Error procesando PDF:', error);
          alert('Error al procesar el archivo PDF');
          return;
        }
      }

      if (!titulo || !autor || !genero) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }

      if (editingId) {
        let librosList = getLibros();
        librosList = librosList.map(l => l.id == editingId ? { 
          ...l, 
          titulo, 
          autor, 
          genero, 
          descripcion, 
          año: año || l.año,
          portada: portadaVal || l.portada, 
          archivo: pdfVal || l.archivo 
        } : l);
        saveLibros(librosList);
        adminForm.dataset.editingId = "";
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('saveBookBtn').innerHTML = '<i class="fas fa-save"></i> Guardar Libro';
        safeNotify('Libro actualizado exitosamente');
      } else {
        agregarLibro(titulo, autor, genero, descripcion, portadaVal, pdfVal, año);
      }

      adminForm.reset();
      renderAdminTable();
      renderCatalogo();
    });

    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        adminForm.reset();
        adminForm.dataset.editingId = "";
        cancelEditBtn.style.display = 'none';
        document.getElementById('saveBookBtn').innerHTML = '<i class="fas fa-save"></i> Guardar Libro';
      });
    }
  }
});

window.addEventListener('libros-actualizados', () => {
  const f = obtenerValoresFiltros();
  renderCatalogo(f.filtro, f.genero);
  renderAdminTable();
});