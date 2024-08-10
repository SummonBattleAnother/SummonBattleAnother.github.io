// hero-list.js
let heroes = [];
let filteredHeroes = [];
let selectedRole = 'all';

const colors = {
  '일반': 'rgb(0, 0, 0)',
  '소환': 'rgba(0, 188, 212, 1)' ,
  '일격': 'rgba(255, 0, 0, 1)' ,
  '광역': 'rgba(156, 39, 176, 1)' ,
  '보조': 'rgba(250, 142, 229, 1)' ,
  '선택': 'rgba(255, 121, 55, 1)'
};
async function loadHeroes() {
  try {
    const response = await fetch('/data/heroes.json');
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
    const heroCard = document.createElement('div');
    heroCard.className = 'hero-card';

    const id= parseInt(hero.id.match(/\d+/)[0], 10)

    if(id > 29){
      heroCard.innerHTML = `
      <a href="#" class="hero-link">
        <img src="/assets/images/hero-icons/${hero.id}.webp" alt="${hero.job}" class="hero-icon-notready" style="border:solid 3px ${colors[hero.role]};border-radius: 10px; clip-path: inset(1px);">
        <div class="hero-icon-name">(작성중)</div>
      </a>
    `;
    }else{
    console.log(id)

      heroCard.innerHTML = `
      <a href="/heroes/${hero.id}.html" class="hero-link">
        <img src="/assets/images/hero-icons/${hero.id}.webp" alt="${hero.job}" class="hero-icon" style="border:solid 3px ${colors[hero.role]};border-radius: 10px; clip-path: inset(1px);">
        <div class="hero-icon-name">${hero.job}</div>
      </a>
    `;
    }

    heroGrid.appendChild(heroCard);
  });
}

function setupFilters() {
  const filtersContainer = document.getElementById('filters');
  const roles = ['all', ...new Set(heroes.map(hero => hero.role))];

  const roleSelect = createSelect(roles, selectedRole, (value) => {
    selectedRole = value;
    filterHeroes();
  }, '타입 선택 ');

  filtersContainer.innerHTML = ''; // Clear existing content
  filtersContainer.appendChild(roleSelect);

}

function createSelect(options, defaultValue, onChange, labelText) {
  const select = document.createElement('select');
  select.className = 'role-select form-select-sm';
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
  label.innerHTML = `<span>${labelText}: </span>`;
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