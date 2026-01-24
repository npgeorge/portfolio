// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Header shadow on scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        header.style.boxShadow = '0 1px 20px rgba(0,0,0,0.05)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// Image carousel functionality
document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('[data-prev]');
    const nextBtn = carousel.querySelector('[data-next]');
    let currentIndex = 0;

    function updateCarousel() {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === slides.length - 1;
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    updateCarousel();
});

// Manual click to toggle individual sections
document.querySelectorAll('.project-header').forEach(header => {
    header.addEventListener('click', () => {
        const projectItem = header.parentElement;
        projectItem.classList.toggle('expanded');
    });
});

// Auto-expand on scroll using Intersection Observer
const projectItems = document.querySelectorAll('.project-item');

const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when item is in the upper-middle portion of viewport
    threshold: 0
};

const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const projectItem = entry.target;

            // Only expand if not already expanded - don't close others
            if (!projectItem.classList.contains('expanded')) {
                projectItem.classList.add('expanded');
            }
        }
    });
}, observerOptions);

// Observe all project items
projectItems.forEach(item => {
    projectObserver.observe(item);
});

// Ratchet wrench scroll progress
const wrenchFill = document.getElementById('wrenchFill');
const wrenchHeadFill = document.getElementById('wrenchHeadFill');
const gearInner = document.getElementById('gearInner');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;

    if (wrenchFill) {
        // Fill wrench from bottom to top
        const fillPercent = 100 - (scrollPercent * 100);
        wrenchFill.style.clipPath = `inset(${fillPercent}% 0 0 0)`;
    }

    if (wrenchHeadFill) {
        // Light up head when scrolled past 90%
        if (scrollPercent > 0.9) {
            wrenchHeadFill.classList.add('active');
        } else {
            wrenchHeadFill.classList.remove('active');
        }
    }

    if (gearInner) {
        // Rotate gear based on scroll
        const rotation = scrollTop * 0.8;
        gearInner.style.transform = `rotate(${rotation}deg)`;
    }
});
