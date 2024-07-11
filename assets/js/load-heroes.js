// hero-list.js
let heroes = [];
let filteredHeroes = [];
let selectedRole = 'all';

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
    <h2 class="text-2xl font-bold mb-4">영웅 목록</h2>
    <div id="filters" class="mb-4"></div>
    <div id="hero-grid" class="grid grid-cols-4 gap-4"></div>
  `;

  const heroGrid = document.getElementById('hero-grid');

  filteredHeroes.forEach(hero => {
    const heroCard = document.createElement('div');
    heroCard.className = 'bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300';
    heroCard.innerHTML = `
      <a href="heroes/${hero.id}.html" class="block text-center">
        <img src="assets/images/hero-icons/${hero.icon}" alt="${hero.name}" class="w-24 h-24 mx-auto mb-2 rounded-full">
        <p class="font-semibold">${hero.name}</p>
        <p class="text-sm text-gray-600">${hero.role}</p>
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
  }, '역할 선택');

  filtersContainer.appendChild(roleSelect);
}

function createSelect(options, defaultValue, onChange, labelText) {
  const select = document.createElement('select');
  select.className = 'bg-white border border-gray-300 rounded-md px-2 py-1';
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option === 'all' ? '모든 역할' : option;
    if (option === defaultValue) optionElement.selected = true;
    select.appendChild(optionElement);
  });
  select.addEventListener('change', (e) => onChange(e.target.value));

  const label = document.createElement('label');
  label.className = 'flex items-center';
  label.innerHTML = `<span class="mr-2">${labelText}:</span>`;
  label.appendChild(select);

  return label;
}

function filterHeroes() {
  filteredHeroes = selectedRole === 'all'
    ? heroes
    : heroes.filter(hero => hero.role === selectedRole);
  renderHeroes();
}

document.addEventListener('DOMContentLoaded', loadHeroes);