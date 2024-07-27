let items = [];
let filteredItems = [];
let selectedShop = 'all';
let selectedType = 'all';
let selectedItemId = null;
let searchTerm = '';

async function loadItems() {
    try {
        const response = await fetch('/data/items.json');
        const data = await response.json();
        items = data.items[0];
        filteredItems = Object.values(items).flat();
        renderItems();
        setupFilters();
        setupItemInfoClose();
        setupSearch();
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

function renderItems() {
    const itemList = document.getElementById('item-list');
    
    itemList.innerHTML = `
        <div id="item-grid" class="item-grid"></div>
    `;

    const itemGrid = document.getElementById('item-grid');

    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <img src="/assets/images/item-icons/${item.id}.webp" alt="${item.name}" class="item-icon" data-item-id="${item.id}">
        `;
        itemCard.addEventListener('click', showItemInfo);
        itemGrid.appendChild(itemCard);
    });
}

function showItemInfo(e) {
    const itemId = e.target.dataset.itemId;
    const item = filteredItems.find(item => item.id === itemId);

    const description = item.desc;
    const newdescription= description.replaceAll("|n", "<br>").replaceAll("o", "-");

    if (item) {
        const itemInfo = document.getElementById('item-info');
        itemInfo.innerHTML = `
            <h3>${item.name}</h3>
            <h5>가격: 🪙${item.gold}, 🪵${item.wood}</h5>
            <p>타입: ${item.type}</p>
            <p>${newdescription}</p>
        `;
        itemInfo.style.display = 'block';
        selectedItemId = itemId;
        highlightSelectedItem();
    }
}

function highlightSelectedItem() {
    const itemCards = document.querySelectorAll('.item-card');
    itemCards.forEach(card => {
        const itemId = card.querySelector('.item-icon').dataset.itemId;
        if (itemId === selectedItemId) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function setupItemInfoClose() {
    document.addEventListener('click', (e) => {
        const itemInfo = document.getElementById('item-info');
        const itemGrid = document.getElementById('item-grid');
        if (!itemInfo.contains(e.target) && !itemGrid.contains(e.target)) {
            itemInfo.style.display = 'none';
            selectedItemId = null;
            highlightSelectedItem();
        }
    });
}

function setupFilters() {
    const filtersContainer = document.getElementById('shop_filters');
    const shops = ['all', ...Object.keys(items)];
    const types = ['all', ...new Set(Object.values(items).flat().map(item => item.type))];

    const shopSelect = createSelect(shops, selectedShop, (value) => {
        selectedShop = value;
        filterItems();
    }, '상점 선택 ');

    const typeSelect = createSelect(types, selectedType, (value) => {
        selectedType = value;
        filterItems();
    }, ' 아이템 타입 선택 ');

    filtersContainer.innerHTML = ''; // Clear existing content
    filtersContainer.appendChild(shopSelect);
    filtersContainer.appendChild(typeSelect);
}

function createSelect(options, defaultValue, onChange, labelText) {
    const select = document.createElement('select');
    select.className = 'filter-select';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option === 'all' ? `모든 ${labelText.split(' ')[0]}` : option;
        if (option === defaultValue) optionElement.selected = true;
        select.appendChild(optionElement);
    });
    select.addEventListener('change', (e) => onChange(e.target.value));

    const label = document.createElement('label');
    label.className = 'filter-label';
    label.innerHTML = `<span>${labelText}:</span>`;
    label.appendChild(select);

    return label;
}

function filterItems() {
    filteredItems = Object.entries(items).flatMap(([shop, shopItems]) => {
        return shopItems.filter(item => 
            (selectedShop === 'all' || shop === selectedShop) &&
            (selectedType === 'all' || item.type === selectedType) &&
            (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });
    renderItems();
}

function setupSearch() {
    const searchContainer = document.getElementById('search-container');
    searchContainer.innerHTML = `
        <input type="text" id="search-input" placeholder="아이템 이름 검색" />
    `;
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        filterItems();
    });
}

document.addEventListener('DOMContentLoaded', loadItems);