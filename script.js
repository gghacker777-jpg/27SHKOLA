const circle = document.getElementById('clickCircle');
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const shrinkScale = 0.9;
const particles = [];
const gravity = 0.35;
const lifeTime = 160;

// Получаем данные из localStorage или инициализируем
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
const purchasedThemes = new Set(JSON.parse(localStorage.getItem('purchasedThemes')) || ['images/kryg.png']);
const clickCountEl = document.getElementById('clickCount');
clickCountEl.textContent = clicks;

// Панель тем
const themeToggle = document.querySelector('.theme-toggle');
const themeList = document.querySelector('.theme-list');
const themeItems = document.querySelectorAll('.theme-item');

// Окно нехватки кликов
const notEnough = document.getElementById('notEnough');
const notEnoughClose = notEnough.querySelector('.close');
notEnoughClose.addEventListener('click', () => {
  notEnough.classList.remove('show');
});

// Текущая тема
circle.src = purchasedThemes.has('images/kryg1.png') ? 'images/kryg1.png' : 'images/kryg.png';

themeToggle.addEventListener('click', () => {
  themeList.classList.toggle('show');
});

// Изменение темы с проверкой кликов
themeItems.forEach(item => {
  item.addEventListener('click', () => {
    const imgSrc = item.getAttribute('data-img');
    const price = parseInt(item.getAttribute('data-price'));

    if (purchasedThemes.has(imgSrc)) {
      circle.src = imgSrc;
      themeList.classList.remove('show');
      return;
    }

    if (clicks >= price) {
      clicks -= price;
      clickCountEl.textContent = clicks;
      purchasedThemes.add(imgSrc);
      circle.src = imgSrc;
      themeList.classList.remove('show');
      saveProgress();

      if (imgSrc.includes('kryg1.png')) {
        playThemeSound();
      }

    } else {
      notEnough.classList.add('show');
    }
  });
});

// Сохраняем прогресс
function saveProgress() {
  localStorage.setItem('clicks', clicks);
  localStorage.setItem('purchasedThemes', JSON.stringify(Array.from(purchasedThemes)));
}

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
    if (this.y + this.size / 2 >= canvas.height - 5) {
      this.y = canvas.height - this.size / 2 - 5;
      this.vy *= -0.4;
      this.vx *= 0.7;
    }
  }

  draw() {
    const alpha = Math.max(this.life / lifeTime, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(this.img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

const klikImg = new Image();
klikImg.src = 'images/klik.png';

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.life <= 0 || p.y > canvas.height + 50) {
      particles.splice(i, 1);
    }
  }
  requestAnimationFrame(animate);
}
animate();

function spawnParticles(x, y) {
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, klikImg));
  }
}

// === 🛡️ Антиавтокликер (версия с допуском 2–3 мс) ===
let lastClickTime = 0;
let clickIntervals = [];
let warningCount = 0;

function handleAutoClickerProtection() {
  const now = Date.now();

  if (lastClickTime !== 0) {
    const interval = now - lastClickTime;
    clickIntervals.push(interval);

    if (clickIntervals.length > 15) clickIntervals.shift();

    if (clickIntervals.length >= 10) {
      // Проверяем, что все интервалы близки (разница не более 3 мс)
      const base = clickIntervals[0];
      const allClose = clickIntervals.every(i => Math.abs(i - base) <= 3);

      if (allClose) {
        warningCount++;
        clickIntervals = [];
        if (warningCount < 3) {
          alert(`⚠️ Подозрение на автокликер! (${warningCount}/3 предупреждений)`);
        } else {
          alert("❌ Обнаружен автокликер. Все клики и темы сброшены!");
          resetAll();
        }
      }
    }
  }

  lastClickTime = now;
}

// Основная логика кликов
function handlePress(e) {
  handleAutoClickerProtection();

  e.preventDefault();
  circle.style.transform = `translate(-50%, -50%) scale(${shrinkScale})`;

  let bonus = 1;
  if (circle.src.includes('kryg1.png')) {
    bonus = 2;
  }

  clicks += bonus;
  clickCountEl.textContent = clicks;
  saveProgress();

  const rect = circle.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  spawnParticles(x, y);
}

function handleRelease() {
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

// === 🔊 Настройки звука ===
const themeSound = new Audio('sounds/kryg1.mp4');
let soundDuration = 3;

function playThemeSound() {
  themeSound.currentTime = 0;
  themeSound.play();
  setTimeout(() => {
    themeSound.pause();
    themeSound.currentTime = 0;
  }, soundDuration * 1000);
}

// === 🔁 Сброс прогресса ===
const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', () => {
  const confirmReset = confirm('Ты уверен, что хочешь удалить все клики и купленные темы? 😢');
  if (!confirmReset) return;
  resetAll();
});

function resetAll() {
  localStorage.removeItem('clicks');
  localStorage.removeItem('purchasedThemes');
  clicks = 0;
  purchasedThemes.clear();
  purchasedThemes.add('images/kryg.png');
  circle.src = 'images/kryg.png';
  clickCountEl.textContent = '0';
  warningCount = 0;
  clickIntervals = [];
  alert('Прогресс сброшен! Всё начинается заново 😎');
}
