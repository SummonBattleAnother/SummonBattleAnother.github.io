let keywordProperty = {};

async function loadKeywords() {
    try {
        const response = await fetch('/data/keywords.json');
        keywordProperty = await response.json();
        //console.log("키워드 정보 로딩", keywordProperty)
    } catch (error) {
        console.error('Error loading keywords:', error);
    }
}

let allItems = {};
async function loadAllItems() {
    try {
        const response = await fetch('/data/items.json');
        allItems = await response.json();
        //console.log("아이템 정보 로딩", allItems)
    } catch (error) {
        console.error('Error loading keywords:', error);
    }
}

function getItemById(id) {
    for (const shop of allItems.items) {
        for (const category in shop) {
            for (const item of shop[category]) {
                if (item.id === id) {
                    return item;
                }
            }
        }
    }
    return null; // id에 해당하는 아이템이 없을 경우 null 반환
}

const ROLE_COLORS = {
    '일반': { bg: 'rgba(170, 170, 170, 0.3)', border: 'rgba(255, 255, 255, ,1)' },
    '소환': { bg: 'rgba(0, 188, 212, 0.3)', border: 'rgba(0, 188, 212, 1)' },
    '일격': { bg: 'rgba(255, 0, 0, 0.3)', border: 'rgba(255, 0, 0, 1)' },
    '광역': { bg: 'rgba(156, 39, 176, 0.3)', border: 'rgba(156, 39, 176, 1)' },
    '보조': { bg: 'rgba(250, 142, 229, 0.3)', border: 'rgba(250, 142, 229, 1)' }
};

// Hero class
class Hero {
    constructor(heroData) {
        this.id = heroData.id;
        this.name = heroData.name;
        this.chart = null; // Chart를 저장할 속성 추가
        this.skilltree = heroData.skilltree;
        this.info = heroData.info;
        // 스킬트리가 있을 경우 기본 타입을 설정
        if (this.skilltree && this.info.length > 0) {
            this.selectedType = this.info[0].type;
        } else {
            this.selectedType = null;
        }
    }
    getCurrentInfo() {
        if (this.skilltree) {
            return this.info.find(i => i.type === this.selectedType) || this.info[0];
        } else {
            return this.info[0];
        }
    }

    loadDescription() {
        const heroDesc = document.getElementById('selected-hero');
        if (!heroDesc) {
            console.error('Element with id "selected-hero" not found');
            return;
        }
        
        const currentInfo = this.getCurrentInfo();
        const score = currentInfo.score;
        const currentType = currentInfo["role"];
        const jobcolor =ROLE_COLORS[currentType]["border"];

        heroDesc.innerHTML = `
            <div class="hero-desc">
            <div class="container">
                <div class="row">
                    <!-- 1. Icon Card Container -->
                    <div class="col-6 col-md-3 order-1 style="border:1px solid black;">
                        <article class="hero-icon-card-container">
                            <img class = "hero-icon" src="/assets/images/hero-icons/${this.id}.webp" alt="${currentInfo.job || this.name}">           
                            <span class="borderspan border-top"></span>
                            <span class="borderspan border-right"></span>
                            <span class="borderspan border-bottom"></span>
                            <span class="borderspan border-left"></span>
                        </article>
                    </div>
                    
                    <!-- 3. Type Selector -->
                    <div class="col-6 col-md-3 order-2 order-md-3">
                        ${this.createTypeSelector()}
                    </div>
        
                    <!-- 2. Job and Name -->
                    <div class="col-12 col-md-6 order-3 order-md-2">
                        <div style="color:${jobcolor};" class="hero-desc-job">${currentInfo.job || ' '}</div>
                        <div class="hero-desc-name">${this.name}</div>
                    </div>
        
                    <!-- 4. Bottom Description -->
                    <div class="col-12 order-4">
                        <div class="hero-bottom">
                            <p class="hero-description">${currentInfo.shortDescription}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    
        if (this.skilltree) {
            this.attachTypeSelector();
        }
    }
    
    attachTypeSelector() {
        const selector = document.getElementById('type-selector');
        if (selector) {
            // 기존의 이벤트 리스너를 제거
            selector.removeEventListener('change', this.handleTypeChange);
            
            // 새로운 이벤트 리스너를 추가
            this.handleTypeChange = (e) => {
                this.selectedType = e.target.value;
                this.updateDisplay();
            };
            selector.addEventListener('change', this.handleTypeChange);
            
            // 현재 선택된 타입으로 셀렉터 값을 설정
            selector.value = this.selectedType;
        }
    }
    
    createTypeSelector() {
        const options = this.info.map(i => 
            `<option value="${i.type || ''}" ${i.type === this.selectedType ? 'selected' : ''}>${i.type ? `${i.type}(${i.role})` : `기본(${i.role})`}</option>`
        ).join('');
        
        const isDisabled = this.info.length === 1 ? 'disabled' : ''; // 선택지가 하나일 때 disabled 추가
    
        return `
            <div class="hero-skill-tree">
                <span style="font-size:0.8em;">스킬트리</span>: 
                <select class="form-select form-select-sm type-selector" id="type-selector" ${isDisabled}>
                    ${options}
                </select>
            </div>
        `;
    }

    loadKeywords() {
        const keywordElement = document.querySelector('.card-body .keyword-table');
        if (!keywordElement) {
            console.error('Keyword container not found');
            return;
        }
        while (keywordElement.firstChild) {
            keywordElement.removeChild(keywordElement.firstChild);
        }

        const currentInfo = this.getCurrentInfo();
        const keywords = currentInfo.keywords;
        if (!keywords || keywords.length === 0) {
            keywordElement.innerHTML = '키워드 정보가 없습니다.';
            return;
        }

        for (const [key, keyword] of Object.entries({ ...keywords})) {
            const row = document.createElement('tr');
            const keywordInfo = keywordProperty[keyword];
            row.innerHTML = `
              <td><span class="keyword" style="background-color: ${keywordInfo.color};">${keyword}</span> </td>
              <td>${keywordInfo.description}</td>
            `;
            keywordElement.appendChild(row);
          }

        /*keywordElement.innerHTML = keywords.map(keyword => {
            const keywordInfo = keywordProperty[keyword];
            //console.log("foreach", keywordInfo)
            return `
            <span class="keyword" style="background-color: ${keywordInfo.color}" data-description="${keywordInfo.description}">
                ${keyword}
            </span>
        `;
        }).join('')*/
        ;
    }

    loadStatus() {
        const currentInfo = this.getCurrentInfo();
        const status = currentInfo.status;

        document.getElementById('status-strength').textContent = status.strength;
        document.getElementById('status-agility').textContent = status.agility;
        document.getElementById('status-intelligence').textContent = status.intelligence;
    }

    loadScore() {
        const ctx = document.getElementById('stats-chart');
        if (!ctx) {
            console.error('Canvas element with id "stats-chart" not found');
            return;
        }

        const currentInfo = this.getCurrentInfo();
        const score = currentInfo.score;

        const currentType = currentInfo["role"];

        const data = {
            labels: Object.keys(score),
            datasets: [{
                label: currentInfo.job || this.name,
                data: Object.values(score),
                fill: true,
                color: '#fFf',
                backgroundColor: ROLE_COLORS[currentType]["bg"],
                borderColor: ROLE_COLORS[currentType]["border"]
            }]
        };

        const options = {
            scale: {
                ticks: { beginAtZero: true, max: 5 },
                r:{
                    beginAtZero: true,
                    min:0,
                    max:5,
                    angleLines:{
                        display:false
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        // This more specific font property overrides the global property
                        font: {
                            size: 20
                        }
                    }
                }
            }
        };

        let chartStatus = Chart.getChart("stats-chart"); // <canvas> id
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        new Chart(ctx, {
            type: 'radar',
            data: data,
            options: options
        });
    }

    loadSkills() {
        const skillTable = document.querySelector('.skill-table tbody');
        if (!skillTable) {
          console.error('Skill table not found');
          return;
        }
        

        const currentInfo = this.getCurrentInfo();
        const skills = currentInfo.skills;
        const commonSkills = this.commonSkills;
    
        skillTable.innerHTML = '';
        if (Object.keys(skills).length === 0) {
            skillTable.innerHTML = '스킬 정보가 없습니다.';
            return;
        }


        for (const [key, skill] of Object.entries({ ...skills, ...commonSkills })) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><span style="font-weight:bold;">[${key}] ${skill.name}</span> 
            <br>
            ${skill.description}</td>
          `;
          skillTable.appendChild(row);
        }
    }

    loadItems() {
        const itemTable = document.querySelector('.item-table tbody');
        if (!itemTable) {
            console.error('item table not found');
            return;
        }

        const currentInfo = this.getCurrentInfo();
        const recommenditem = currentInfo.recommenditem;

        itemTable.innerHTML = '';

        for (const [key, item] of Object.entries({ ...recommenditem})) {
            const itemid = item.id;
            const itemData = getItemById(itemid);
            /* item.json에서 아이템 이름 가져오기?*/

            const tooltip = `
            <a href="/items/iteminfo.html?itemid=${itemid}">
                <img src="/assets/images/item-icons/${item.id}.webp" alt="${item.id.name}" style="width: 64px; height: 64px;">
            </a>    
            `

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>
                ${tooltip}
            </td>
            <td class="item-description">
                <h5>${itemData.name}</h5>
                ${item.description}
            </td>
            `;
            itemTable.appendChild(row);
        }
    }

    updateDisplay() {
        this.loadDescription();
        this.loadKeywords();
        this.loadStatus();
        this.loadScore();
        this.loadSkills();  // 새로 추가
        this.loadItems();  // 새로 추가
    }
}

async function loadHeroDetails() {
    await loadKeywords();
    await loadAllItems();
    try {
        const response = await fetch('/data/heroes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const heroId = document.body.id;
        const heroData = data.heroes.find(h => h.id === heroId);

        if (!heroData) {
            throw new Error('Hero not found');
        }

        const hero = new Hero(heroData);

        hero.loadDescription();
        hero.loadKeywords();
        hero.loadStatus();
        hero.loadScore();
        hero.loadSkills();
        hero.loadItems();
    } catch (error) {
        console.error('Error loading hero details:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHeroDetails);