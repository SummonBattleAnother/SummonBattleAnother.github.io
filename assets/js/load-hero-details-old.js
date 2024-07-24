let keywords = {};
async function loadKeywords() {
    try {
        const response = await fetch('/data/keywords.json');
        keywords = await response.json();
    } catch (error) {
        console.error('Error loading keywords:', error);
    }
}
// Constants
const ROLE_COLORS = {
    '일반': { bg: 'rgba(255, 99, 132, 0.3)', border: 'rgba(255, 99, 132, 1)' },
    '소환': { bg: 'rgba(0, 99, 132, 0.3)', border: 'rgba(0, 99, 132, 1)' },
    '일격': { bg: 'rgba(54, 162, 235, 0.3)', border: 'rgba(54, 162, 235, 1)' },
    '광역': { bg: 'rgba(255, 206, 86, 0.3)', border: 'rgba(255, 206, 86, 1)' },
    '보조': { bg: 'rgba(75, 192, 192, 0.3)', border: 'rgba(75, 192, 192, 1)' }
};

// Hero class
class Hero {
    constructor(heroData) {
        this.id = heroData.id;
        this.name = heroData.name;
        this.skilltree = heroData.skilltree;
        if (this.skilltree) {
            this.info = heroData.info;
            this.selectedType = this.info[0].type;
        } else {
            this.info = [heroData];
        }
    }

    getCurrentInfo() {
        return this.skilltree 
            ? this.info.find(i => i.type === this.selectedType)
            : this.info[0];
    }

    loadDescription() {
        const heroDesc = document.getElementById('selected-hero');
        if (!heroDesc) {
            console.error('Element with id "selected-hero" not found');
            return;
        }

        const currentInfo = this.getCurrentInfo();

        heroDesc.innerHTML = `
            <a href="/heroes/${this.id}.html" class="hero-link">
                <img src="/assets/images/hero-icons/${this.id}.webp" alt="${currentInfo.job || this.name}" class="hero-icon">
            </a>
            <div>
                <h2 class="hero-title">${currentInfo.job || this.name}</h2>
                ${this.skilltree ? this.createTypeSelector() : ''}
            </div>
            <div>
                <p>${currentInfo.shortDescription}</p>
            </div>
            <div id="filters" class="filters"></div>
            <div id="hero-grid" class="hero-grid"></div>
        `;

        if (this.skilltree) {
            document.getElementById('type-selector').addEventListener('change', (e) => {
                this.selectedType = e.target.value;
                this.updateDisplay();
            });
        }
    }

    createTypeSelector() {
        return `
            <select id="type-selector">
                ${this.info.map(i => `<option value="${i.type}">${i.type}</option>`).join('')}
            </select>
        `;
    }

    loadKeywords() {
        const keywordElement = document.querySelector('.card-body .keyword-container');
        if (!keywordElement) {
            console.error('Keyword container not found');
            return;
        }
    
        keywordElement.innerHTML = this.keywords.map(keyword => {
            const keywordInfo = keywords[keyword];
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

        const data = {
            labels: Object.keys(score),
            datasets: [{
                label: currentInfo.job || this.name,
                data: Object.values(score),
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            }]
        };

        const options = {
            scale: {
                ticks: { beginAtZero: true, max: 5 }
            }
        };

        new Chart(ctx, {
            type: 'radar',
            data: data,
            options: options
        });
    }

    updateDisplay() {
        this.loadDescription();
        this.loadKeywords();
        this.loadStatus();
        this.loadScore();
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
    } catch (error) {
        console.error('Error loading hero details:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHeroDetails);
