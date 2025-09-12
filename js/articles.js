// Articles page functionality
document.addEventListener('DOMContentLoaded', function() {
  loadArticlesByCategory();
});

// Category descriptions
const categoryDescriptions = {
  'Technology & Computer Science': 'In-depth articles on computer science topics, neuromorphic computing, and emerging technologies that shape our digital future.',
  'Music & Creativity': 'Explorations of musical theory, jazz-fusion techniques, and the creative process in artistic endeavors.',
  'Entrepreneurship': 'Insights from my entrepreneurial journey, lessons learned from building technology companies, and thoughts on innovation.',
  'Neuromorphic Computing': 'Deep dives into neuromorphic computing principles, applications, and the future of brain-inspired computing architectures.',
  'Philosophy & Zen': 'Reflections on mindfulness, philosophy, and the intersection of technology with human consciousness.',
  'Health & Fitness': 'Thoughts on olympic weightlifting, nutrition, veganism, and maintaining physical and mental well-being.',
  'General': 'Miscellaneous thoughts and observations on life, culture, and everything in between.'
};

async function loadArticlesByCategory() {
  try {
    const response = await fetch('../data/articles.json');
    const articles = await response.json();
    
    // Group articles by category
    const articlesByCategory = articles.reduce((acc, article) => {
      const category = article.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(article);
      return acc;
    }, {});
    
    // Sort articles within each category by date (newest first)
    Object.keys(articlesByCategory).forEach(category => {
      articlesByCategory[category].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    const container = document.getElementById('articles-container');
    if (container) {
      // Render each category
      const categoryOrder = [
        'Technology & Computer Science',
        'Neuromorphic Computing',
        'Music & Creativity',
        'Entrepreneurship',
        'Philosophy & Zen',
        'Health & Fitness',
        'General'
      ];
      
      container.innerHTML = categoryOrder
        .filter(category => articlesByCategory[category] && articlesByCategory[category].length > 0)
        .map(category => `
          <section class="content-section">
            <h2>${category}</h2>
            <p>${categoryDescriptions[category] || ''}</p>
            <div class="article-list">
              ${articlesByCategory[category].map(article => `
                <a href="../${article.url}" class="article-item">
                  <h3>${article.title}</h3>
                  <p>${article.description}</p>
                  <div class="article-meta">
                    <span class="article-date">${formatDate(article.date)}</span>
                    ${article.featured ? '<span class="article-featured">Featured</span>' : ''}
                  </div>
                </a>
              `).join('')}
            </div>
          </section>
        `).join('');
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    // Fallback to show at least one article
    const container = document.getElementById('articles-container');
    if (container) {
      container.innerHTML = `
        <section class="content-section">
          <h2>Technology & Computer Science</h2>
          <p>In-depth articles on computer science topics, neuromorphic computing, and emerging technologies that shape our digital future.</p>
          <div class="article-list">
            <a href="../articles/linux-concurrency.html" class="article-item">
              <h3>Linux Concurrency Abstractions</h3>
              <p>Understanding tasks, processes, and threads in the Linux kernel</p>
              <div class="article-meta">
                <span class="article-date">January 15, 2024</span>
              </div>
            </a>
          </div>
        </section>
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