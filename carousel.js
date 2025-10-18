// carousel.js — compatible con tu markup original (carousel-coverflow) y con el markup "carousel"
class Carousel {
  constructor() {
    // Soportar ambos tipos de clases (la tuya y la "estándar")
    this.slideSelector = '.carousel-slide, .carousel-coverflow-slide';
    this.carouselSelector = '.carousel, .carousel-coverflow';
    this.prevBtnSelector = '.carousel-btn-prev';
    this.nextBtnSelector = '.carousel-btn-next';
    this.indicatorSelector = '.indicator';

    this.currentSlide = 0;
    this.slides = Array.from(document.querySelectorAll(this.slideSelector));
    this.indicators = Array.from(document.querySelectorAll(this.indicatorSelector));
    this.carousel = document.querySelector(this.carouselSelector);
    this.prevBtn = document.querySelector(this.prevBtnSelector);
    this.nextBtn = document.querySelector(this.nextBtnSelector);
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 4000;

    // Si no hay slides, no hacer nada (evita errores)
    if (this.totalSlides === 0) return;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateSlides(); // marca la slide inicial como active
    this.startAutoPlay();
  }

  setupEventListeners() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());

    // Indicadores (si existen)
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Pausar autoplay al hover (si existe el contenedor)
    if (this.carousel) {
      this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
  }

  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;
    this.currentSlide = index;
    this.updateSlides();
    this.resetAutoPlay();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlides();
    this.resetAutoPlay();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlides();
    this.resetAutoPlay();
  }

  updateSlides() {
    // Limpiar clases útiles para estilos (active, prev, next, center)
    this.slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'prev', 'next', 'center');
      slide.dataset.index = idx; // opcional: útil si tu CSS usa data-index
    });

    // Marca la slide actual
    const active = this.slides[this.currentSlide];
    if (active) active.classList.add('active', 'center');

    // Marca prev/next para que el CSS coverflow los estilice si lo desea
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    if (this.slides[prevIndex]) this.slides[prevIndex].classList.add('prev');
    if (this.slides[nextIndex]) this.slides[nextIndex].classList.add('next');

    // Actualizar indicadores (si hay)
    this.indicators.forEach((indicator, idx) => {
      indicator.classList.toggle('active', idx === this.currentSlide);
    });
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
  new Carousel();
});
