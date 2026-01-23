/**
 * Young Capital Advisory - Main JavaScript
 * Handles scroll animations, navigation, and form interactions
 */

(function() {
    'use strict';

    // ==========================================================================
    // DOM Elements
    // ==========================================================================

    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contact-form');
    const fadeElements = document.querySelectorAll('.fade-in');

    // ==========================================================================
    // Navigation
    // ==========================================================================

    /**
     * Handle navigation background on scroll
     */
    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    /**
     * Toggle mobile navigation menu
     */
    function toggleMobileNav() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    /**
     * Close mobile navigation menu
     */
    function closeMobileNav() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Smooth scroll to section
     */
    function smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const navHeight = nav.offsetHeight;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Navigation event listeners
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileNav);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                closeMobileNav();
                smoothScrollTo(href);
            }
        });
    });

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // ==========================================================================
    // Scroll Animations (Intersection Observer)
    // ==========================================================================

    /**
     * Create intersection observer for fade-in animations
     */
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Initialize on DOM load
    if (fadeElements.length > 0) {
        initScrollAnimations();
    }

    // ==========================================================================
    // Contact Form
    // ==========================================================================

    /**
     * Handle contact form submission
     */
    function handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!data.name || !data.email || !data.message) {
            showFormMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        // Simulate form submission (replace with actual endpoint)
        setTimeout(() => {
            showFormMessage('Thank you for your message. We\'ll be in touch soon.', 'success');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }, 1500);

        // For actual implementation, use fetch to send to your backend:
        /*
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            showFormMessage('Thank you for your message. We\'ll be in touch soon.', 'success');
            contactForm.reset();
        })
        .catch(error => {
            showFormMessage('Something went wrong. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
        */
    }

    /**
     * Display form message
     */
    function showFormMessage(message, type) {
        // Remove existing message if any
        const existingMessage = contactForm.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message-${type}`;
        messageEl.textContent = message;

        // Style the message
        messageEl.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 4px;
            font-size: 0.875rem;
            text-align: center;
            ${type === 'success'
                ? 'background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);'
                : 'background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);'}
        `;

        // Append to form
        contactForm.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }

    // Form event listener
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // ==========================================================================
    // Hero Animation on Load
    // ==========================================================================

    /**
     * Trigger hero animations on page load
     */
    function initHeroAnimations() {
        const heroElements = document.querySelectorAll('.hero .fade-in');

        // Small delay to ensure page is ready
        setTimeout(() => {
            heroElements.forEach(el => {
                el.classList.add('visible');
            });
        }, 100);
    }

    // Initialize hero animations
    initHeroAnimations();

    // ==========================================================================
    // Keyboard Navigation
    // ==========================================================================

    /**
     * Handle escape key for mobile menu
     */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileNav();
        }
    });

    // ==========================================================================
    // Preload & Performance
    // ==========================================================================

    /**
     * Add loaded class to body when page is ready
     */
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

})();
