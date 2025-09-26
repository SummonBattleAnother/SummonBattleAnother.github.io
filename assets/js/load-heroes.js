// hero-list.js
let heroes = [];
let filteredHeroes = [];
let selectedRole = 'all';
let validHeroNo = 77; // 해당번호의 영웅까지만 작성이 되었습니다
let searchText = ''; // 검색어 상태 추가

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
    initializePage(); // 초기화 함수 호출
  } catch (error) {
    console.error('Error loading heroes:', error);
  }
}

// 페이지 레이아웃을 처음에 한 번만 설정하는 함수
function initializePage() {
  const heroList = document.getElementById('hero-list');
  // 검색창과 필터, 그리드 컨테이너를 한 번만 생성
  heroList.innerHTML = `
    <div id="filters" class="filters"></div>
    <div id="search-container" style="margin:8px 0;">
      <input type="text" id="hero-search" class="form-control form-control-sm" placeholder="영웅 이름 또는 직업으로 검색" value="${searchText}">
    </div>
    <div id="hero-grid" class="hero-grid"></div>
  `;

  // 검색 이벤트 리스너 설정
  const searchInput = document.getElementById('hero-search');
  searchInput.addEventListener('input', (e) => {
    searchText = e.target.value;
    filterHeroes();
  });
  
  // 초기 필터 설정 및 영웅 목록 렌더링
  setupFilters();
  filterHeroes(); // 초기에 전체 영웅을 보여주기 위해 호출
}

// 영웅 그리드만 다시 그리는 함수
function renderHeroGrid(heroesToRender) {
  const heroGrid = document.getElementById('hero-grid');
  heroGrid.innerHTML = ''; // 영웅 그리드만 비움

  // 랜덤 선택 카드 추가
  const randomid = Math.floor(Math.random() * validHeroNo) + 1;
  const randomCard = document.createElement('div');
  randomCard.className = 'hero-card';
  randomCard.innerHTML=`
    <a href="/heroes/hero${randomid}.html" class="hero-link">
        <img src="/assets/images/item-icons/item608.webp" alt="랜덤" class="hero-icon" style="border:solid 3px ${colors["선택"]};border-radius: 10px; clip-path: inset(1px);">
        <div class="hero-icon-name">랜덤선택</div>
    </a>
  `;
  heroGrid.appendChild(randomCard);

  // 필터링된 영웅 목록을 화면에 그림
  heroesToRender.forEach(hero => {
    const heroCard = document.createElement('div');
    heroCard.className = 'hero-card';

    const id= parseInt(hero.id.match(/\d+/)[0], 10);

    if(id > validHeroNo){ 
      heroCard.innerHTML = `
        <a href="#" class="hero-link">
          <img src="/assets/images/hero-icons/${hero.id}.webp" alt="${hero.job}" class="hero-icon-notready" style="border:solid 3px ${colors[hero.role]};border-radius: 10px; clip-path: inset(1px);">
          <div class="hero-icon-name-notready">(작성중)</div>
        </a>
      `;
    }else{
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

  filtersContainer.innerHTML = ''; // 필터 컨테이너를 비우고
  filtersContainer.appendChild(roleSelect); // 새로 생성
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
  // 1. 역할(role)에 따라 필터링
  let currentHeroes = selectedRole === 'all'
    ? heroes
    : heroes.filter(hero => hero.role === selectedRole);

  // 2. 검색어(searchText)에 따라 추가 필터링
  if (searchText.trim() !== '') {
    const lower = searchText.trim().toLowerCase();
    currentHeroes = currentHeroes.filter(hero =>
      hero.name.toLowerCase().includes(lower) ||
      hero.job.toLowerCase().includes(lower)
    );
  }

  // 3. 필터링된 결과로 그리드만 다시 렌더링
  renderHeroGrid(currentHeroes);
}

document.addEventListener('DOMContentLoaded', loadHeroes);