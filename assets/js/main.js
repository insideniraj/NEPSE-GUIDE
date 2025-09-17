// Main JavaScript for NEPSE Guide Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize parallax effect for hero section
    initParallax();
    
    // Initialize smooth scrolling for navigation links
    initSmoothScroll();
    
    // Initialize rotating slogans carousel
    initSloganCarousel();
    
    // Initialize accordion for chapters
    initAccordion();
});

// Parallax effect for hero section
function initParallax() {
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-layer');
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            element.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for sticky header
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Rotating slogans carousel
function initSloganCarousel() {
    const slogans = document.querySelectorAll('.slogan-item');
    let currentSlogan = 0;
    
    if (slogans.length > 0) {
        // Hide all slogans except the first one
        slogans.forEach((slogan, index) => {
            if (index !== 0) {
                slogan.classList.add('hidden');
            }
        });
        
        // Rotate slogans every 5 seconds
        setInterval(() => {
            slogans[currentSlogan].classList.add('hidden');
            currentSlogan = (currentSlogan + 1) % slogans.length;
            slogans[currentSlogan].classList.remove('hidden');
            slogans[currentSlogan].classList.add('fade-in');
            
            // Remove fade-in class after animation completes
            setTimeout(() => {
                slogans[currentSlogan].classList.remove('fade-in');
            }, 1000);
        }, 5000);
    }
}

// Accordion functionality for chapters
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isOpen = this.classList.contains('active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion-header').forEach(item => {
                item.classList.remove('active');
                item.nextElementSibling.style.maxHeight = null;
            });
            
            // If the clicked item wasn't open, open it
            if (!isOpen) {
                this.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
    
    // Open the first accordion item by default
    if (accordionHeaders.length > 0) {
        accordionHeaders[0].click();
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

// Scroll to payment section
function scrollToPayment() {
    const paymentSection = document.getElementById('payment');
    window.scrollTo({
        top: paymentSection.offsetTop - 80,
        behavior: 'smooth'
    });
}

// Scroll to outline section
function scrollToOutline() {
    const outlineSection = document.getElementById('outline');
    window.scrollTo({
        top: outlineSection.offsetTop - 80,
        behavior: 'smooth'
    });
}
