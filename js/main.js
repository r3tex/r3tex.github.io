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
      threshold: 0.2,
      rootMargin: '-30% 0px -50% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      // Find the section with the highest intersection ratio
      let bestEntry = null;
      let bestRatio = 0;
      
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestEntry = entry;
        }
      });
      
      if (bestEntry) {
        const sectionId = bestEntry.target.id;
        if (sectionId && sectionId !== currentSection) {
          updateActiveNavigation(sectionId);
          currentSection = sectionId;
          history.replaceState(null, null, `#${sectionId}`);
        }
      }
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
      
      const sections = ['about', 'chromaform', 'art', 'nerv-dynamics', 'articles', 'contact'];
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
  const criticalImages = ['./images/main/first.jpg'];
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
    
    // Load recent articles
    loadRecentArticles();
  });
  
  // Load recent articles function
  async function loadRecentArticles() {
    try {
      const response = await fetch('./data/articles.json');
      const articles = await response.json();
      
      // Sort by date (newest first) and take the latest 3
      const sortedArticles = articles
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
      
      const container = document.getElementById('recent-articles');
      if (container && sortedArticles.length > 0) {
        container.innerHTML = sortedArticles.map(article => `
          <div class="article-preview">
            <h3 class="article-preview-title">
              <a href="${article.url}">${article.title}</a>
            </h3>
            <p class="article-preview-description">${article.description}</p>
            <div class="article-preview-meta">
              <span class="article-preview-date">${formatDate(article.date)}</span>
              <span class="article-preview-category">${article.category}</span>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      // Fallback content if articles can't be loaded
      const container = document.getElementById('recent-articles');
      if (container) {
        container.innerHTML = `
          <div class="article-preview">
            <h3 class="article-preview-title">
              <a href="articles/linux-concurrency.html">Linux Concurrency Abstractions</a>
            </h3>
            <p class="article-preview-description">Understanding tasks, processes, and threads in the Linux kernel</p>
            <div class="article-preview-meta">
              <span class="article-preview-date">January 2024</span>
              <span class="article-preview-category">Technology & Computer Science</span>
            </div>
          </div>
        `;
      }
    }
  }
  
  // Format date helper
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Enhanced accessibility - removed focus outline styling
  
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