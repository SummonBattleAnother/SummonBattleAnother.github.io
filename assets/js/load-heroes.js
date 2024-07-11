async function loadHeroes() {
    try {
      const response = await fetch('/data/heroes.json');
      const data = await response.json();
      const heroList = document.getElementById('hero-list');
      
      let heroGrid = '<div class="hero-grid">';
      data.heroes.forEach(hero => {
        heroGrid += `
          <div class="hero-item">
            <a href="${hero.id}.html">
              <img src="${hero.icon}" alt="${hero.name}" class="hero-icon">
              <p>${hero.name}</p>
            </a>
          </div>
        `;
      });
      heroGrid += '</div>';
      
      heroList.innerHTML = `<h2>영웅 목록</h2>${heroGrid}`;
    } catch (error) {
      console.error('Error loading heroes:', error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadHeroes);