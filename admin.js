// ==================== 🧑‍💻 ADMIN.JS - LÓGICA DEL PANEL DE ADMINISTRACIÓN ====================

// ✅ Bloque de seguridad: solo los administradores pueden estar aquí.
(function protegerRutaAdmin() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));

  // Si no hay usuario o el usuario no es admin, redirigir.
  if (!usuarioActual || !usuarioActual.isAdmin) {
    alert("Acceso denegado. Debes ser administrador para ver esta página.");
    // Redirigimos a la página principal o de login.
    window.location.href = 'index.html';
  }
})();

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

function renderUserTable() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="no-books">No hay usuarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = usuarios.map(user => `
    <tr>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${new Date(user.fechaRegistro).toLocaleDateString()}</td>
      <td>${user.isAdmin ? 'Administrador' : 'Usuario'}</td>
    </tr>`).join('');
}

function renderReportTable() {
  const tbody = document.getElementById('reportTableBody');
  if (!tbody) return;
  const reports = JSON.parse(localStorage.getItem('bookReports')) || [];

  if (reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-books">No hay reportes pendientes</td></tr>';
    return;
  }

  tbody.innerHTML = reports.map(report => `
    <tr>
      <td>${report.bookTitle} (ID: ${report.bookId})</td>
      <td>${report.reportedBy}</td>
      <td>${report.reason}</td>
      <td>${new Date(report.date).toLocaleString()}</td>
      <td>
        <button class="btn-small btn-edit" onclick="verLibroReportado(${report.bookId})" title="Ver Libro">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-small btn-delete" onclick="resolverReporte(${report.reportId})" title="Resolver Reporte">
          <i class="fas fa-check"></i>
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
  document.getElementById('admPdfFilename').value = libro.archivo || '';
  document.getElementById('adminAddBookForm').dataset.editingId = id;
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  document.getElementById('saveBookBtn').innerHTML = '<i class="fas fa-save"></i> Actualizar Libro';
  
  document.getElementById('adminAddBookForm').scrollIntoView({ behavior: 'smooth' });
}

function eliminarLibro(id) {
  if (!confirm("¿Seguro que deseas eliminar este libro?")) return;
  let libros = getLibros();
  libros = libros.filter(l => l.id !== id);
  saveLibros(libros);
  safeNotify("Libro eliminado correctamente");
}

function resolverReporte(reportId) {
  if (!confirm("¿Marcar este reporte como resuelto? Se eliminará de la lista.")) return;
  let reports = JSON.parse(localStorage.getItem('bookReports')) || [];
  reports = reports.filter(r => r.reportId !== reportId);
  localStorage.setItem('bookReports', JSON.stringify(reports));
  safeNotify("Reporte resuelto y eliminado.");
  renderReportTable(); // Volver a renderizar la tabla de reportes
}

function verLibroReportado(bookId) {
  // Reutilizamos la función global para abrir el modal de detalles
  if (typeof openBookModal === 'function') {
    openBookModal(bookId);
  } else {
    // Fallback si la función no está disponible en el contexto de admin.js
    alert(`Para ver detalles, busca el libro con ID: ${bookId}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderAdminTable();
  renderUserTable();
  renderReportTable();

  const adminForm = document.getElementById('adminAddBookForm');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editingId = adminForm.dataset.editingId;
      const titulo = document.getElementById('admTitulo').value.trim();
      const autor = document.getElementById('admAutor').value.trim();
      const genero = document.getElementById('admGenero').value.trim();
      const descripcion = document.getElementById('admDescripcion').value.trim();
      const año = document.getElementById('admAno').value.trim();
      const portadaInput = document.getElementById('admPortadaInput');
      const pdfFilename = document.getElementById('admPdfFilename').value.trim();
      const saveBtn = document.getElementById('saveBookBtn');

      if (!titulo || !autor || !genero) {
        return safeNotify("Por favor completa todos los campos obligatorios", "error");
      }

      let portadaVal = '';
      const portadaFile = portadaInput.files[0];

      try {
        if (portadaFile) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
          portadaVal = await fileToBase64(portadaFile);
        }
      } catch (error) {
        console.error("Error al procesar archivos:", error);
        return safeNotify("Hubo un error al cargar los archivos.", "error");
      } finally {
        if (portadaFile) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = editingId ? '<i class="fas fa-save"></i> Actualizar Libro' : '<i class="fas fa-save"></i> Guardar Libro';
        }
      }

      const pdfUrl = pdfFilename; // Usamos la URL directamente

      if (editingId) {
        let librosList = getLibros();
        librosList = librosList.map(l => l.id == editingId ? {
          ...l, titulo, autor, genero, descripcion,
          año: año || l.año,
          portada: portadaVal ? portadaVal : l.portada,
          archivo: pdfUrl || l.archivo // Guardamos la URL
        } : l);
        saveLibros(librosList);
        safeNotify('Libro actualizado exitosamente');
      } else {
        agregarLibro(titulo, autor, genero, descripcion, portadaVal, pdfUrl, año);
      }

      adminForm.reset();
      adminForm.dataset.editingId = "";
      document.getElementById('cancelEditBtn').style.display = 'none';
      document.getElementById('saveBookBtn').innerHTML = '<i class="fas fa-save"></i> Guardar Libro';
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