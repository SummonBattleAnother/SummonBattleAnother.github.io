let heroname = ''
let herorole = ''
let shortDescription =''

async function loadHeroDetails() {
    try {
        const response = await fetch('/data/heroes.json');
        const data = await response.json();
        const heroId = document.body.id; // HTML의 body 태그에 hero ID를 지정해야 합니다
        const hero = data.heroes.find(h => h.id === heroId);
        heroname = hero.name
        herorole = hero.role
        shortDescription =hero.shortDescription

        if (hero) {
            loadDescription(hero.shortDescription);
            loadStats(hero.stats);
        } else {
            console.error('Hero not found');
        }
    } catch (error) {
        console.error('Error loading hero details:', error);
    }
}

function loadDescription(descrption){
    const heroDesc = document.getElementById('selected-hero');
    heroDesc.innerHTML = `
        <div class="hero-portrait"></div>
            <div>
                <h2 class="hero-title">${heroname}</h2>
            </div>
            <div>
                <p>${shortDescription}</p>
            </div>
      <div id="filters" class="filters"></div>
      <div id="hero-grid" class="hero-grid"></div>
    `;
}

function loadStats(stats) {
    // Radar 차트 생성
    const ctx = document.getElementById('stats-chart').getContext('2d');
    let chartBackgroundColor = ''
    let chartBorderColor = ''

    switch(herorole){
        case '일반':
            chartBackgroundColor = 'rgba(255, 99, 132, 0.3)'
            chartBorderColor = 'rgba(255, 99, 132, 1)'
            break;
        case '소환':
            chartBackgroundColor = 'rgba(0, 99, 132, 0.3)'
            chartBorderColor = 'rgba(0, 99, 132, 1)'
            break;
        case '일격':
            chartBackgroundColor = 'rgba(0, 99, 132, 0.3)'
            chartBorderColor = 'rgba(0, 99, 132, 1)'
            break;
        case '광역':
            chartBackgroundColor = 'rgba(0, 99, 132, 0.3)'
            chartBorderColor = 'rgba(0, 99, 132, 1)'
            break;
        case '보조':
            chartBackgroundColor = 'rgba(0, 99, 132, 0.3)'
            chartBorderColor = 'rgba(0, 99, 132, 1)'
            break;
    }
    
    const data = {
        labels: Object.keys(stats).map(stat => stat.charAt(0).toUpperCase() + stat.slice(1)),
        datasets: [{
            label: heroname,
            data: Object.values(stats),
            backgroundColor: chartBackgroundColor,
            borderColor: chartBorderColor,
            borderWidth: 1
        }]
    };
    
    const options = {
        scale: {
            ticks: { beginAtZero: true },
            r: {
                angleLines: {
                    display: false
                },
                suggestedMin: 0,
                suggestedMax: 5
            }
        }
        ,plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    
                }
            }
        }
    };

    new Chart(ctx, {
        type: 'radar',
        data: data,
        options: options
    });
}

document.addEventListener('DOMContentLoaded', loadHeroDetails);