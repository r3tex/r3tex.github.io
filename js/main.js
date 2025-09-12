// Navigation and Smooth Scrolling
document.addEventListener('DOMContentLoaded', function() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');
  const rightColumn = document.querySelector('.right-column');
  
  // Current active section
  let currentSection = 'about';
  
  // Navigation click handlers - smooth scroll to sections
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetSection = this.dataset.section;
      if (targetSection) {
        scrollToSection(targetSection);
      }
    });
  });
  
  // Smooth scroll to section function
  function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      // Calculate the position relative to the viewport
      const elementRect = targetElement.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2) + (targetElement.offsetHeight / 2);
      
      window.scrollTo({
        top: middle,
        behavior: 'smooth'
      });
      
      updateActiveNavigation(sectionId);
      currentSection = sectionId;
      
      // Update URL hash without additional scroll
      history.replaceState(null, null, `#${sectionId}`);
    }
  }
  
  // Update active navigation indicator
  function updateActiveNavigation(activeId) {
    navItems.forEach(item => {
      if (item.dataset.section === activeId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // Intersection Observer for scroll-based navigation highlighting
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null, // Use viewport as root
      threshold: 0.3,
      rootMargin: '-40% 0px -40% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId && sectionId !== currentSection) {
            updateActiveNavigation(sectionId);
            currentSection = sectionId;
            history.replaceState(null, null, `#${sectionId}`);
          }
        }
      });
    }, observerOptions);
    
    // Observe all content sections
    contentSections.forEach(section => {
      observer.observe(section);
    });
  }
  
  // Handle direct hash navigation on page load
  function handleInitialHash() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
      // Small delay to ensure layout is ready
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    } else {
      updateActiveNavigation('about');
    }
  }
  
  // Handle hash changes (back/forward button)
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
      scrollToSection(hash);
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      const sections = ['about', 'nerv-dynamics', 'art', 'chromaform', 'articles', 'contact'];
      const currentIndex = sections.indexOf(currentSection);
      
      let newIndex;
      if (e.key === 'ArrowDown') {
        newIndex = (currentIndex + 1) % sections.length;
      } else {
        newIndex = (currentIndex - 1 + sections.length) % sections.length;
      }
      
      scrollToSection(sections[newIndex]);
    }
  });
  
  // Enhanced focus management for navigation items
  navItems.forEach((item, index) => {
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  // Handle external section links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link && !link.classList.contains('nav-item')) {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      if (document.getElementById(targetId)) {
        scrollToSection(targetId);
      }
    }
  });
  
  // Preload critical resources
  const criticalImages = ['./images/first.jpg'];
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
  // Add loading state management
  document.body.style.opacity = '0';
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.3s ease-in';
    document.body.style.opacity = '1';
    
    // Handle initial hash after page load
    handleInitialHash();
  });
  
  // Enhanced accessibility
  document.querySelectorAll('a, button, [tabindex]').forEach(element => {
    element.addEventListener('focus', function() {
      this.style.outline = '2px solid white';
      this.style.outlineOffset = '3px';
    });
    
    element.addEventListener('blur', function() {
      this.style.outline = '';
      this.style.outlineOffset = '';
    });
  });
  
  // Smooth scrolling fallback for browsers without smooth scroll support
  if (!CSS.supports('scroll-behavior', 'smooth')) {
    // Polyfill for smooth scrolling
    function smoothScrollTo(element, to, duration) {
      const start = element.scrollTop;
      const change = to - start;
      const startDate = +new Date();
      
      const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };
      
      const animateScroll = () => {
        const currentDate = +new Date();
        const currentTime = currentDate - startDate;
        element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration));
        
        if (currentTime < duration) {
          requestAnimationFrame(animateScroll);
        } else {
          element.scrollTop = to;
        }
      };
      
      animateScroll();
    }
    
    // Override the scrollToSection function for browsers without native smooth scroll
    const originalScrollToSection = scrollToSection;
    scrollToSection = function(sectionId) {
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        const elementRect = targetElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2) + (targetElement.offsetHeight / 2);
        
        smoothScrollTo(document.documentElement, middle, 800);
        
        updateActiveNavigation(sectionId);
        currentSection = sectionId;
        history.replaceState(null, null, `#${sectionId}`);
      }
    };
  }
  
  console.log('🚀 Smooth scrolling navigation system initialized!');
});