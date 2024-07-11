async function loadHeroDetails() {
    try {
        const response = await fetch('/data/heroes.json');
        const data = await response.json();
        const heroId = document.body.id; // HTML의 body 태그에 hero ID를 지정해야 합니다
        const hero = data.heroes.find(h => h.id === heroId);

        if (hero) {
            loadSkills(hero.skills);
            loadStats(hero.stats);
        } else {
            console.error('Hero not found');
        }
    } catch (error) {
        console.error('Error loading hero details:', error);
    }
}

function loadSkills(skills) {
    const skillsSection = document.getElementById('hero-skills');
    const skillsList = document.createElement('ul');

    skills.forEach(skill => {
        const skillItem = document.createElement('li');
        skillItem.innerHTML = `
            <h3>${skill.name}</h3>
            <p>${skill.description}</p>
        `;
        skillsList.appendChild(skillItem);
    });

    skillsSection.appendChild(skillsList);
}

function loadStats(stats) {
    const statsSection = document.getElementById('hero-stats');
    const statsList = document.createElement('ul');

    for (const [stat, value] of Object.entries(stats)) {
        const statItem = document.createElement('li');
        statItem.textContent = `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}`;
        statsList.appendChild(statItem);
    }

    statsSection.appendChild(statsList);
}

document.addEventListener('DOMContentLoaded', loadHeroDetails);