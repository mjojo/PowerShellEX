/**
 * PowerShell EX - Landing Page Scripts
 * Created by Vitaly Golik (mjojo)
 */

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all feature cards, tool cards, and install steps
document.querySelectorAll('.feature-card, .tool-card, .install-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add visible class styles
const style = document.createElement('style');
style.textContent = `
    .feature-card.visible,
    .tool-card.visible,
    .install-step.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Stagger animation for grid items
document.querySelectorAll('.features-grid, .tools-grid').forEach(grid => {
    const items = grid.children;
    Array.from(items).forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Code window typing effect (optional enhancement)
const codeContent = document.querySelector('.code-content code');
if (codeContent) {
    const originalHTML = codeContent.innerHTML;
    
    // Add subtle glow effect on hover
    const codeWindow = document.querySelector('.code-window');
    if (codeWindow) {
        codeWindow.addEventListener('mouseenter', () => {
            codeWindow.style.boxShadow = '0 8px 60px rgba(83, 145, 254, 0.2)';
        });
        
        codeWindow.addEventListener('mouseleave', () => {
            codeWindow.style.boxShadow = '';
        });
    }
}

// Copy code functionality
document.querySelectorAll('.step-code').forEach(code => {
    code.style.cursor = 'pointer';
    code.title = 'Click to copy';
    
    code.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(code.textContent);
            
            const originalText = code.textContent;
            code.textContent = '✓ Copied!';
            code.style.color = '#00D4AA';
            
            setTimeout(() => {
                code.textContent = originalText;
                code.style.color = '';
            }, 2000);
        } catch (err) {
            console.log('Failed to copy:', err);
        }
    });
});

// Add parallax effect to hero background
window.addEventListener('scroll', () => {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        const scrolled = window.pageYOffset;
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Console easter egg
console.log('%c⚡ PowerShell EX', 'font-size: 24px; font-weight: bold; color: #5391FE;');
console.log('%cThe smartest way to write PowerShell', 'font-size: 14px; color: #a0a0b0;');
console.log('%cCreated by Vitaly Golik (mjojo)', 'font-size: 12px; color: #6b6b7b;');
