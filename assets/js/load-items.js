let items = [];
let filteredItems = [];
let selectedShop = 'all';
let selectedType = 'all';
let selectedItemId = null;
let searchTerm = '';
let initialItemId = null;  // Store the initial item id

const TYPE_COLORS = {
    '소모품': '#008DFF',
    '보조도구': '#7F8C8D',
    '장비-일반': '#7F8C8D',
    '장비-레어': '#0071FF',
    '장비-보물': '#CD9031',
    '장비-유니크': '#4500C7',
    '한정': '#36CD31',
    '조합': '#F91212',
};

const SHOP_COLORS = {
    '소모품': '#008DFF',
    '보조도구': '#7F8C8D',
    '장비-일반': '#7F8C8D',
    '장비-레어': '#0071FF',
    '장비-보물': '#CD9031',
    '장비-유니크': '#4500C7',
    '한정': '#36CD31',
    '조합': '#F91212',
};

async function loadItems() {
    try {
        const response = await fetch('/data/items.json');
        const data = await response.json();

        // 모든 상점의 아이템을 로드하고 items에 저장
        items = data.items.reduce((acc, shop) => {
            Object.entries(shop).forEach(([shopName, shopItems]) => {
                acc[shopName] = shopItems.map(item => ({
                    ...item,             // 기존 아이템 정보 유지
                    shopname: shopName       // "상점" 정보 추가
                }));
            });
            return acc;
        }, {});

        // 모든 상점의 아이템을 평탄화하여 초기 filteredItems 설정
        filteredItems = Object.values(items).flat();
        renderItems();
        setupFilters();
        setupItemInfoClose();
        setupSearch();

        // After items are loaded, check if there was an initial itemid and show its info
        if (initialItemId) {
            showItemInfo(initialItemId);
        }
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
        itemCard.addEventListener('click', showItemInfoEvent);
        itemGrid.appendChild(itemCard);
    });
}

function showItemInfoEvent(e){
    const itemId = e.target.dataset.itemId;
    showItemInfo(itemId);
}

function showItemInfo(itemId) {
    const item = filteredItems.find(item => item.id === itemId);

    if (item) {
        const description = item.desc;
        const newdescription = description.replaceAll("|n", "<br>").replaceAll("o", "-");
        const itemInfo = document.getElementById('item-info');
        const color = TYPE_COLORS[item.type];
        console.log("color :", color)
        itemInfo.innerHTML = `
            <p><h4>${item.name}</h4></p>
            <h5>가격: 🪙<span style="color:#b8860b">${item.gold} 골드</span> , 🪵<span style="color:#0B6623">${item.wood} 목재</span></h5>
            <p>타입: <span style=color:${color}>${item.type}</span>
            <br>상점: ${item.shopname}</p>
            <p>${newdescription}</p>
        `;
        itemInfo.style.display = 'block';
        selectedItemId = itemId;
        highlightSelectedItem();
        itemInfo.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    }, '상점 선택');

    const typeSelect = createSelect(types, selectedType, (value) => {
        selectedType = value;
        filterItems();
    }, '아이템 타입 선택');

    filtersContainer.innerHTML = ''; // Clear existing content
    const shopFilterContainer = document.createElement('div');
    shopFilterContainer.className = 'filter-container';
    shopFilterContainer.appendChild(shopSelect);

    const typeFilterContainer = document.createElement('div');
    typeFilterContainer.className = 'filter-container';
    typeFilterContainer.appendChild(typeSelect);

    filtersContainer.appendChild(shopFilterContainer);
    filtersContainer.appendChild(typeFilterContainer);
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
    label.textContent = `${labelText}: `;
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
        <input class="item-search" type="text" id="search-input" placeholder="아이템 검색" />
    `;
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        filterItems();
    });
}

document.addEventListener('DOMContentLoaded', loadItems);

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemid = urlParams.get('itemid');
    if (itemid) {
        initialItemId = itemid;  // Store the item id temporarily
        showItemInfo(initialItemId);
    }
}