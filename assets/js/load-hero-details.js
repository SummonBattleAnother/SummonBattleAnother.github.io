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
    constructor(id, name, role, shortDescription, keywords, score) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.shortDescription = shortDescription;
        this.keywords = keywords;
        this.score = score;
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

    loadDescription() {
        const heroDesc = document.getElementById('selected-hero');
        if (!heroDesc) {
            console.error('Element with id "selected-hero" not found');
            return;
        }

        heroDesc.innerHTML = `
            <a href="/heroes/${this.id}.html" class="hero-link">
                <img src="/assets/images/hero-icons/${this.id}.webp" alt="${this.name}" class="hero-icon">
            </a>
            <div>
                <h2 class="hero-title">${this.name}</h2>
            </div>
            <div>
                <p>${this.shortDescription}</p>
            </div>
            <div id="filters" class="filters"></div>
            <div id="hero-grid" class="hero-grid"></div>
        `;
    }

    loadScore() {
        const ctx = document.getElementById('stats-chart');
        if (!ctx) {
            console.error('Canvas element with id "stats-chart" not found');
            return;
        }

        const { bg: backgroundColor, border: borderColor } = ROLE_COLORS[this.role] || ROLE_COLORS['일반'];

        const data = {
            labels: Object.keys(this.score).map(stat => stat.charAt(0).toUpperCase() + stat.slice(1)),
            datasets: [{
                label: this.name,
                data: Object.values(this.score),
                backgroundColor,
                borderColor,
                borderWidth: 1
            }]
        };

        const options = {
            scale: {
                ticks: { beginAtZero: true },
                r: {
                    angleLines: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 5
                }
            },
            plugins: {
                legend: {
                    labels: {}
                }
            }
        };

        new Chart(ctx, {
            type: 'radar',
            data,
            options
        });
    }
}

// Main function


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

        const hero = new Hero(
            heroData.id,
            heroData.name,
            heroData.role,
            heroData.shortDescription,
            heroData.keywords,
            heroData.score
        );

        hero.loadDescription();
        hero.loadKeywords();
        hero.loadScore();
    } catch (error) {
        console.error('Error loading hero details:', error);
    }
}


document.addEventListener('DOMContentLoaded', loadHeroDetails);