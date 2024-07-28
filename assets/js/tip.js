function scrollToSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

window.onload = function() {
    const canvas = document.getElementById('arrowCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.addEventListener('click', function() {
        console.log("button click")
        var overlays = document.getElementsByClassName('overlay');
        for (var i = 0; i < overlays.length; i++) {
            if (overlays[i].classList.contains('hidden')) {
                toggleButton.innerHTML  = "추가정보 숨기기";
                overlays[i].classList.remove('hidden');
            } else {
                toggleButton.innerHTML  = "추가정보 보이기";
                overlays[i].classList.add('hidden');
            }
        }
    });

    const initialArrows  = [
        { startX: width * 0.05, startY: height * 0.35, 
            endX: width * 0.3, endY: height * 0.05, currentFrame: 0 },
        { startX: width * 0.2, startY: height * 0.8, 
            endX: width * 0.5, endY: height * 0.45, currentFrame: 0 },
        { startX: width * 0.7, startY: height * 0.9, 
            endX: width * 0.95, endY: height * 0.6, currentFrame: 0 }
    ];
    const totalFrames = 100;
    const headLength = 35; 
    const lineWidth = 4;
    let currentPhase = 1;
    const pauseDuration = 1500; // 화살표가 모두 그려진 후의 지연 시간 (밀리초)
    let pauseStartTime;

    const arrows = initialArrows.map(arrow => ({
        ...arrow,
        currentFrame: 0,
        secondPhase: false
    }));

    const drawnArrows = [];

    function drawArrow(fromX, fromY, toX, toY) {
        ctx.setLineDash([10, 10]); // 점선 스타일로 설정 ([길이, 간격])
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        ctx.setLineDash([]); // 화살촉은 실선으로 설정
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        drawnArrows.forEach(arrow => {
            drawArrow(arrow.startX, arrow.startY, arrow.endX, arrow.endY);
        });

        arrows.forEach(arrow => {
            let startX, startY, endX, endY;

            if (arrow.secondPhase) {
                startX = arrow.endX;
                startY = arrow.endY;
                endX = width*0.96;
                endY = height*0.04;
            } else {
                startX = arrow.startX;
                startY = arrow.startY;
                endX = arrow.endX;
                endY = arrow.endY;
            }

            const progress = arrow.currentFrame / totalFrames;
            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;

            drawArrow(startX, startY, currentX, currentY);

            arrow.currentFrame++;
            if (arrow.currentFrame > totalFrames) {
                arrow.currentFrame = 0;
                if (!arrow.secondPhase) {
                    drawnArrows.push({ startX: arrow.startX, startY: arrow.startY, endX: arrow.endX, endY: arrow.endY });
                    arrow.secondPhase = true;
                } else {
                    //drawnArrows.push({ startX: arrow.endX, startY: arrow.endY, endX: width, endY: 0 });
                    currentPhase++;
                }
            }
        });

        // 모든 화살표가 두 단계를 마쳤을 때 지연 시간 설정
        if (currentPhase >= arrows.length) {
            if (!pauseStartTime) {
                pauseStartTime = Date.now();
            }
            if (Date.now() - pauseStartTime < pauseDuration) {
                requestAnimationFrame(animate);
            } else {
                pauseStartTime = null;
                currentPhase = 0;
                arrows.forEach(arrow => {
                    arrow.currentFrame = 0;
                    arrow.secondPhase = false;
                });
                drawnArrows.length = 0;
                ctx.clearRect(0, 0, width, height);
                requestAnimationFrame(animate);
            }
        } else {
            requestAnimationFrame(animate);
        }
    }

    animate();
}