
const track = document.querySelector('.carousel-track');
const items = document.querySelectorAll('.carousel-item');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let index = 0;

function updateCarousel() {
    track.style.transform = `translateX(-${index * 320}px)`;
}

prevBtn.addEventListener('click', () => {
    if (index > 0) index--;
    updateCarousel();
});

nextBtn.addEventListener('click', () => {
    if (index < items.length - 1) index++;
    updateCarousel();
});
