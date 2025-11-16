// ===========================
// DADOS DO CARROSSEL
// ===========================

const carouselItems = [
    {
        type: 'image',
        src: 'assets/imgs/cdj1.jpg',
        title: 'Marcos Deejay'
    },
    {
        type: 'image',
        src: 'assets/imgs/capela.jpg',
        title: 'Celebração em Estilo'
    },
    {
        type: 'image',
        src: 'assets/imgs/15 Anos Maria Clara1.jpg',
        title: '15 Anos Maria Clara'
    },
    {
        type: 'image',
        src: 'assets/imgs/15 Anos Maria Clara2.jpg',
        title: '15 Anos Maria Clara'
    },
    {
        type: 'image',
        src: 'assets/imgs/15 Anos Maria Clara3.jpg',
        title: '15 Anos Maria Clara'
    },
    {
        type: 'image',
        src: 'assets/imgs/Casamento Laryssa e Luiz Otávio1.jpg',
        title: 'Casamento Laryssa e Luiz Otávio'
    },
    {
        type: 'image',
        src: 'assets/imgs/Casamento Laryssa e Luiz Otávio2.jpg',
        title: 'Casamento Laryssa e Luiz Otávio'
    },
    {
        type: 'video',
        src: 'assets/videos/videolocal1.mp4',
        title: 'Inovve Som e Iluminação'
    },
    {
        type: 'video',
        src: 'assets/videos/videolocal2.mp4',
        title: 'Inovve Som e Iluminação'
    },
    {
        type: 'video',
        src: 'assets/videos/videolocal3.mp4',
        title: 'Inovve Som e Iluminação'
    },
    // {
    //     type: 'iframe',
    //     src: 'https://www.youtube.com/embed/aJ6AhWTEv60?autoplay=1&controls=1&mute=1',
    //     title: 'exemplo de vídeo YouTube'
    // },

];

// ===========================
// VARIÁVEIS GLOBAIS
// ===========================

let currentIndex = 0;
let autoPlayInterval = null;
let isVideoPlaying = false;
let isCarouselPaused = false;
const AUTO_PLAY_INTERVAL = 10000; // 10 segundos

// ===========================
// INICIALIZAÇÃO
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    setupEventListeners();
});

// ===========================
// FUNÇÕES DO CARROSSEL
// ===========================

function initCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    const carouselDots = document.getElementById('carouselDots');
    const totalSlides = document.getElementById('totalSlides');

    carouselInner.innerHTML = '';
    carouselDots.innerHTML = '';

    carouselItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        
        let content = '';
        
        if (item.type === 'image') {
            content = `<img src="${item.src}" alt="${item.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`;
        } 
        else if (item.type === 'iframe') {
            content =                 `<div class="iframe-container" style="width: 100%; height: 100%; position: relative;">
                    <iframe 
                        class="carousel-iframe"
                        width="100%" 
                        height="100%" 
                        src="${item.src}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        style="border: none;">
                    </iframe>
                </div>`;
        }
        else if (item.type === 'video') {
            content = `
                    <video 
                        class="carousel-video"
                        src="${item.src}"
                        muted
                        preload="auto"
                        playsinline
                        style="width: 100%; height: 100%; object-fit: cover;">
                    </video>`;
        }


        itemDiv.innerHTML =             `${content}
            <div class="carousel-item-overlay">
                <p class="carousel-item-title">${item.title}</p>
            </div>`;
        carouselInner.appendChild(itemDiv);

        const dot = document.createElement('button');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        carouselDots.appendChild(dot);
    });

    totalSlides.textContent = carouselItems.length;
    updateSlideCounter();
    setupVideoListeners(); // Essa função está preparada para vídeos <video>, se usar iframes não terá efeito
    startAutoPlay();
}

function setupVideoListeners() {
    // Esta função é para elementos <video>. Para iframes de YouTube, 
    // é mais complexo controlar play/pause/ended via JS, a menos que 
    // se use a API do YouTube Player. No seu código, ela está ineficaz 
    // para os iframes, mas foi mantida para compatibilidade com o original.
    const videos = document.querySelectorAll('.carousel-video');
    
    videos.forEach(video => {
        video.addEventListener('play', function() {
            isVideoPlaying = true;
            stopAutoPlay();
        });

        video.addEventListener('pause', function() {
            isVideoPlaying = false;
            startAutoPlay();
        });

        video.addEventListener('ended', function() {
            isVideoPlaying = false;
            setTimeout(() => {
                nextSlide();
            }, 1000);
        });
    });
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoPlay();
}

function nextSlide() {
    if (!isVideoPlaying) {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel();
        resetAutoPlay();
    }
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
    updateCarousel();
    resetAutoPlay();
}

function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });

    const currentItem = carouselItems[currentIndex];

    // Atualização para usar o 'type' em vez de 'id' para iframes
    if (currentItem.type === 'iframe') {
        const iframe = document.querySelector('.carousel-item.active .carousel-iframe');
        // Se a fonte atual está 'mute=1', troca para 'mute=0' para 'desmutar' o vídeo ativo
        if (iframe && iframe.src.includes("mute=1")) {
             iframe.src = currentItem.src.replace("mute=1", "mute=0");
        }
    }

    // Passa por todos os itens para garantir que os iframes não ativos estejam 'mutados'
    carouselItems.forEach((item, index) => {
        if (item.type === 'iframe' && index !== currentIndex) {
            const iframe = document.querySelector(`.carousel-item:nth-child(${index+1}) .carousel-iframe`);
            // Se a fonte do iframe inativo não está "mute=1", a força a ser "mute=1"
            if (iframe && !iframe.src.includes("mute=1")) {
                iframe.src = item.src.replace("mute=0", "mute=1");
            }
        }
    });

    // Controle do vídeo local
    if (currentItem.type === 'video') {
        const video = document.querySelector('.carousel-item.active .carousel-video');
        if (video) {
            video.muted = false;
            video.play().catch(() => {});
        }
    }

    // Pausar vídeos de slides inativos
    carouselItems.forEach((item, index) => {
        if (item.type === 'video' && index !== currentIndex) {
            const vid = document.querySelector(`.carousel-item:nth-child(${index+1}) .carousel-video`);
            if (vid) {
                vid.pause();
                vid.currentTime = 0;
                vid.muted = true;
            }
        }
    });


    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });

    updateSlideCounter();
}




function updateSlideCounter() {
    const currentSlide = document.getElementById('currentSlide');
    currentSlide.textContent = currentIndex + 1;
}

function startAutoPlay() {
    if (!isVideoPlaying && !isCarouselPaused && !autoPlayInterval) {
        autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    }
}

// function toggleCarouselPause() {
//     isCarouselPaused = !isCarouselPaused;
//     if (isCarouselPaused) stopAutoPlay();
//     else startAutoPlay();

//     const pauseBtn = document.getElementById('pauseBtn');
//     if (pauseBtn) {
//         pauseBtn.textContent = isCarouselPaused ? 'Retomar' : 'Pausar';
//         pauseBtn.style.opacity = isCarouselPaused ? '1' : '0.7';
//     }
// }

// function stopAutoPlay() {
//     if (autoPlayInterval) {
//         clearInterval(autoPlayInterval);
//         autoPlayInterval = null;
//     }
// }

function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carousel = document.querySelector('.carousel');

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', () => !isVideoPlaying && startAutoPlay());

    carousel.addEventListener('touchstart', stopAutoPlay);
    carousel.addEventListener('touchend', () => {
        if (!isVideoPlaying) setTimeout(startAutoPlay, 2000);
    });

    document.addEventListener('keydown', function(event) {
        const isInView = carousel.getBoundingClientRect().top < window.innerHeight &&
                         carousel.getBoundingClientRect().bottom > 0;
        if (!isInView) return;

        if (event.key === 'ArrowLeft') prevSlide();
        if (event.key === 'ArrowRight') nextSlide();
    });
}

