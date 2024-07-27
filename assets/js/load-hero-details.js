let keywordProperty = {};
async function loadKeywords() {
    try {
        const response = await fetch('/data/keywords.json');
        keywordProperty = await response.json();
        console.log("키워드 정보 로딩", keywordProperty)
    } catch (error) {
        console.error('Error loading keywords:', error);
    }
}
const ROLE_COLORS = {
    '일반': { bg: 'rgba(170, 170, 170, 0.3)', border: 'rgba(170, 170, 170, ,1)' },
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
        console.log("현재영웅정보", currentInfo);
        heroDesc.innerHTML = `
            <div class="hero-desc">
                
                <div class="hero-right">
                    <div class="hero-top">
                    <div>
                        <img src="/assets/images/hero-icons/${this.id}.webp" alt="${currentInfo.job || this.name}" class="hero-desc-icon">
                            <span class="hero-desc-name">${this.name} - ${currentInfo.job || ' '}</span>
                        </div>
                        ${this.createTypeSelector()}
                    </div>
                    <div class="hero-bottom">
                        <p class="hero-description">${currentInfo.shortDescription}</p>
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
        return `
            <div class="hero-skill-tree-new">
                스킬트리 선택: <select id="type-selector">
                    ${this.info.map(i => `<option value="${i.type || ''}" ${i.type === this.selectedType ? 'selected' : ''}>${i.type ? `${i.type}(${i.role})` : `기본(${i.role})`}</option>`).join('')}
                </select>
            </div>
        `;
    }

    loadKeywords() {
        const keywordElement = document.querySelector('.card-body .keyword-container');
        if (!keywordElement) {
            console.error('Keyword container not found');
            return;
        }
    
        const currentInfo = this.getCurrentInfo();
        const keywords = currentInfo.keywords;
        console.log("keywords", keywords);
        if (!keywords || keywords.length === 0) {
            keywordElement.innerHTML = '키워드 정보가 없습니다.';
            return;
        }

        keywordElement.innerHTML = keywords.map(keyword => {
            const keywordInfo = keywordProperty[keyword];
            console.log("foreach", keywordInfo)
            return `
            <span class="keyword" style="background-color: ${keywordInfo.color}" data-description="${keywordInfo.description}">
                ${keyword}
            </span>
        `;
        }).join('');
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
    
        for (const [key, skill] of Object.entries({ ...skills, ...commonSkills })) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <th scope="row">${key}</th>
            <td>${skill.name}</td>
            <td>${skill.description}</td>
          `;
          skillTable.appendChild(row);
        }
      }

    updateDisplay() {
        this.loadDescription();
        this.loadKeywords();
        this.loadStatus();
        this.loadScore();
        this.loadSkills();  // 새로 추가
    }
}

async function loadHeroDetails() {
    await loadKeywords();
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
    } catch (error) {
        console.error('Error loading hero details:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHeroDetails);