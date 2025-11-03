document.addEventListener('DOMContentLoaded', () => {
  // Configurar el worker para pdf.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;

  const tituloEl = document.getElementById('lector-titulo');
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageNumEl = document.getElementById('page-num');
  const pageCountEl = document.getElementById('page-count');

  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;

  // Obtener el ID del libro de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = parseInt(urlParams.get('id'), 10);

  if (!bookId) {
    tituloEl.textContent = 'Error: No se especificó un libro.';
    return;
  }

  // Cargar el libro desde localStorage
  const libros = JSON.parse(localStorage.getItem('libros')) || [];
  const libro = libros.find(l => l.id === bookId);

  if (!libro || !libro.archivo) {
    tituloEl.textContent = 'Error: Libro no encontrado o sin archivo PDF.';
    return;
  }

  tituloEl.textContent = libro.titulo;

  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = { canvasContext: ctx, viewport: viewport };
      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });
    pageNumEl.textContent = num;
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  prevPageBtn.addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  });

  nextPageBtn.addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  });

  // Cargar el PDF (maneja tanto URLs como Base64)
  let source;
  if (libro.archivo.startsWith('data:')) {
    // Es Base64
    const base64 = libro.archivo.substring(libro.archivo.indexOf(',') + 1);
    source = { data: atob(base64) };
  } else if (libro.archivo.startsWith('http')) {
    // Es una URL
    if (!libro.archivo.startsWith('https://')) {
      console.warn('Cargando un recurso no seguro (HTTP). Se recomienda usar HTTPS.');
    }
    // Habilitar CORS para poder cargar PDFs de otros dominios (si el servidor lo permite)
    source = { url: libro.archivo, withCredentials: false };
  } else {
    // Es una ruta de archivo local
    // Si no es una URL, asumimos que es un archivo local y necesita el prefijo 'libros/'
    // para funcionar correctamente, como en los libros de ejemplo.
    source = `libros/${libro.archivo}`;
  }

  const loadingTask = pdfjsLib.getDocument(source);
  loadingTask.promise.then(pdf => {
    pdfDoc = pdf;
    pageCountEl.textContent = pdfDoc.numPages;
    renderPage(pageNum);
  }).catch(err => {
    console.error('Error al cargar el PDF:', err);
    if (err.name === 'CorsNotAllowed') {
      tituloEl.textContent = 'Error: No se puede cargar el PDF desde este dominio (problema de CORS).';
      return;
    }
    tituloEl.textContent = 'Error al cargar el archivo PDF.';
  });

  // ==================== ☀️/🌙 CAMBIO DE TEMA ====================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlEl = document.documentElement;
  const savedTheme = localStorage.getItem('theme');

  // Aplicar tema guardado al cargar
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
    if (themeToggleBtn && savedTheme === 'dark') {
      themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // Evento para cambiar tema
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