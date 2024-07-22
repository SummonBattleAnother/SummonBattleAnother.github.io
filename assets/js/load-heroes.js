// hero-list.js
let heroes = [];
let filteredHeroes = [];
let selectedRole = 'all';

async function loadHeroes() {
  try {
    const response = await fetch('/data/heroes-dev.json');
    const data = await response.json();
    heroes = data.heroes;
    filteredHeroes = heroes;
    renderHeroes();
    setupFilters();
  } catch (error) {
    console.error('Error loading heroes:', error);
  }
}

function renderHeroes() {
  const heroList = document.getElementById('hero-list');
  heroList.innerHTML = `
    <div id="filters" class="filters"></div>
    <div id="hero-grid" class="hero-grid"></div>
    
  `;

  const heroGrid = document.getElementById('hero-grid');

  filteredHeroes.forEach(hero => {
    console.log(hero)
    const heroCard = document.createElement('div');
    heroCard.className = 'hero-card';
    heroCard.innerHTML = `
      <a href="/heroes/${hero.id}.html" class="hero-link">
        <img src="/assets/images/hero-icons/${hero.id}.webp" alt="${hero.job}" class="hero-icon">
        <div class="hero-name">${hero.job}</div>
      </a>
    `;
    heroGrid.appendChild(heroCard);
  });
}

function setupFilters() {
  const filtersContainer = document.getElementById('filters');
  const roles = ['all', ...new Set(heroes.map(hero => hero.role))];

  const roleSelect = createSelect(roles, selectedRole, (value) => {
    selectedRole = value;
    filterHeroes();
  }, '타입 선택');

  filtersContainer.innerHTML = ''; // Clear existing content
  filtersContainer.appendChild(roleSelect);
}

function createSelect(options, defaultValue, onChange, labelText) {
  const select = document.createElement('select');
  select.className = 'role-select';
  options.forEach(option => {
    const optionElement = document.createElement('option'); 
    optionElement.value = option;
    optionElement.textContent = option === 'all' ? '모든 타입' : option;
    if (option === defaultValue) optionElement.selected = true;
    select.appendChild(optionElement);
  });
  select.addEventListener('change', (e) => onChange(e.target.value));

  const label = document.createElement('label');
  label.className = 'role-label';
  label.innerHTML = `<span>${labelText}:</span>`;
  label.appendChild(select);

  return label;
}

function filterHeroes() {
  filteredHeroes = selectedRole === 'all'
    ? heroes
    : heroes.filter(hero => hero.role === selectedRole);
  renderHeroes();
  setupFilters(); // Re-setup filters to maintain the dropdown
}

document.addEventListener('DOMContentLoaded', loadHeroes);