const circle = document.getElementById('clickCircle');
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const shrinkScale = 0.9;
const particles = [];
const gravity = 0.35;
const lifeTime = 160;

let clicks = 0;
const clickCountEl = document.getElementById('clickCount');
const purchasedThemes = new Set();
purchasedThemes.add('images/kryg.png'); // базовая тема куплена

// Панель тем
const themeToggle = document.querySelector('.theme-toggle');
const themeList = document.querySelector('.theme-list');
const themeItems = document.querySelectorAll('.theme-item');

// Окно недостатка кликов
const notEnough = document.getElementById('notEnough');
const notEnoughClose = notEnough.querySelector('.close');
notEnoughClose.addEventListener('click', () => {
  notEnough.classList.remove('show');
});

themeToggle.addEventListener('click', () => {
  themeList.classList.toggle('show');
});

// Изменение темы с проверкой кликов
themeItems.forEach(item => {
  item.addEventListener('click', () => {
    const imgSrc = item.getAttribute('data-img');
    const price = parseInt(item.getAttribute('data-price'));

    if(purchasedThemes.has(imgSrc)) {
      circle.src = imgSrc;
      themeList.classList.remove('show');
      return;
    }

    if(clicks >= price) {
      clicks -= price;
      clickCountEl.textContent = clicks;
      purchasedThemes.add(imgSrc);
      circle.src = imgSrc;
      themeList.classList.remove('show');
    } else {
      notEnough.classList.add('show');
    }
  });
});

// Частицы
class Particle {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = -Math.random() * 6 - 4;
    this.size = 20 + Math.random() * 10;
    this.life = lifeTime;
    this.img = img;
  }

  update() {
    this.vy += gravity * 0.4;
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.y + this.size/2 >= canvas.height - 5) {
      this.y = canvas.height - this.size/2 - 5;
      this.vy *= -0.4;
      this.vx *= 0.7;
    }
  }

  draw() {
    const alpha = Math.max(this.life / lifeTime, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(this.img, this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    ctx.restore();
  }
}

const klikImg = new Image();
klikImg.src = 'images/klik.png';

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length -1; i>=0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if(p.life <= 0 || p.y > canvas.height+50) {
      particles.splice(i,1);
    }
  }
  requestAnimationFrame(animate);
}
animate();

function spawnParticles(x, y) {
  const count = 2 + Math.floor(Math.random()*2); // строго 2 или 3
  for(let i=0;i<count;i++){
    particles.push(new Particle(x, y, klikImg));
  }
}

function handlePress(e){
  e.preventDefault();
  circle.style.transform = `translate(-50%, -50%) scale(${shrinkScale})`;

  clicks++;
  clickCountEl.textContent = clicks;

  const rect = circle.getBoundingClientRect();
  const x = rect.left + rect.width/2;
  const y = rect.top + rect.height/2;
  spawnParticles(x, y);
}

function handleRelease(){
  circle.style.transform = 'translate(-50%, -50%) scale(1)';
}

circle.addEventListener('touchstart', handlePress);
circle.addEventListener('mousedown', handlePress);
circle.addEventListener('touchend', handleRelease);
circle.addEventListener('mouseup', handleRelease);
circle.addEventListener('mouseleave', handleRelease);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
