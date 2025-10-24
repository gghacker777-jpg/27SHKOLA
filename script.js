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

// Сбрасываем предупреждения при загрузке страницы
localStorage.removeItem('warningCount');

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
circle.src = purchasedThemes.has('images/morozova.png') ? 'images/morozova.png' : 'images/kryg1.png';

// Белое меню
const whiteMenu = document.getElementById('whiteMenu');
const menuClose = document.getElementById('menuClose');
const backgroundLayer = document.getElementById('backgroundLayer');

themeToggle.addEventListener('click', () => {
  // Включаем блюр и показываем меню только один раз
  if (!backgroundLayer.classList.contains('blurred')) {
    backgroundLayer.classList.add('blurred');
    whiteMenu.classList.add('show');
    
    // Блокируем только фоновые элементы, а не все body
    const clickCircle = document.getElementById('clickCircle');
    const resetBtn = document.getElementById('resetBtn');
    const clickCounter = document.querySelector('.click-counter');
    
    if (clickCircle) clickCircle.style.pointerEvents = 'none';
    if (resetBtn) resetBtn.style.pointerEvents = 'none';
    if (clickCounter) clickCounter.style.pointerEvents = 'none';
    
    themeToggle.style.pointerEvents = 'none'; // Блокируем саму кнопку
  }
  // Повторное нажатие ничего не делает
});

// Закрытие меню
menuClose.addEventListener('click', () => {
  whiteMenu.classList.remove('show');
  backgroundLayer.classList.remove('blurred');
  
  // Разблокируем фоновые элементы
  const clickCircle = document.getElementById('clickCircle');
  const resetBtn = document.getElementById('resetBtn');
  const clickCounter = document.querySelector('.click-counter');
  
  if (clickCircle) clickCircle.style.pointerEvents = 'auto';
  if (resetBtn) resetBtn.style.pointerEvents = 'auto';
  if (clickCounter) clickCounter.style.pointerEvents = 'auto';
  
  themeToggle.style.pointerEvents = 'auto'; // Разблокируем кнопку
});

// Выбор темы в белом меню (используем существующую логику)
const menuThemeItems = document.querySelectorAll('#whiteMenu .theme-item');
console.log('Найдено элементов тем в меню:', menuThemeItems.length);
menuThemeItems.forEach(item => {
  item.addEventListener('click', () => {
    const imgSrc = item.getAttribute('data-img');
    const price = parseInt(item.getAttribute('data-price'));

    if (purchasedThemes.has(imgSrc)) {
      circle.src = imgSrc;
      whiteMenu.classList.remove('show');
      backgroundLayer.classList.remove('blurred');
      
      // Разблокируем фоновые элементы
      const clickCircle = document.getElementById('clickCircle');
      const resetBtn = document.getElementById('resetBtn');
      const clickCounter = document.querySelector('.click-counter');
      
      if (clickCircle) clickCircle.style.pointerEvents = 'auto';
      if (resetBtn) resetBtn.style.pointerEvents = 'auto';
      if (clickCounter) clickCounter.style.pointerEvents = 'auto';
      
      themeToggle.style.pointerEvents = 'auto';
      return;
    }

    if (clicks >= price) {
      clicks -= price;
      clickCountEl.textContent = clicks;
      purchasedThemes.add(imgSrc);
      circle.src = imgSrc;
      whiteMenu.classList.remove('show');
      backgroundLayer.classList.remove('blurred');
      
      // Разблокируем фоновые элементы
      const clickCircle = document.getElementById('clickCircle');
      const resetBtn = document.getElementById('resetBtn');
      const clickCounter = document.querySelector('.click-counter');
      
      if (clickCircle) clickCircle.style.pointerEvents = 'auto';
      if (resetBtn) resetBtn.style.pointerEvents = 'auto';
      if (clickCounter) clickCounter.style.pointerEvents = 'auto';
      
      themeToggle.style.pointerEvents = 'auto';
      saveProgress();

      if (imgSrc.includes('kryg1.png')) {
        playThemeSound();
      }
      
      if (imgSrc.includes('morozova.png')) {
        playMorozSound();
      }

    } else {
      notEnough.classList.add('show');
    }
  });
});

// Изменение темы с проверкой кликов - ЗАКОММЕНТИРОВАНО
/*
themeItems.forEach(item => {
  item.addEventListener('click', () => {
    const imgSrc = item.getAttribute('data-img');
    const price = parseInt(item.getAttribute('data-price'));

    if (purchasedThemes.has(imgSrc)) {
      circle.src = imgSrc;
      themeList.classList.remove('show');
      document.body.classList.remove('blurred');
      return;
    }

    if (clicks >= price) {
      clicks -= price;
      clickCountEl.textContent = clicks;
      purchasedThemes.add(imgSrc);
      circle.src = imgSrc;
      themeList.classList.remove('show');
      document.body.classList.remove('blurred');
      saveProgress();

      if (imgSrc.includes('kryg1.png')) {
        playThemeSound();
      }
      
      if (imgSrc.includes('morozova.png')) {
        playMorozSound();
      }

    } else {
      notEnough.classList.add('show');
      document.body.classList.remove('blurred');
    }
  });
});
*/

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

// === 🛡️ Минимальная система антиавтокликера ===
let clickTimes = [];
let warningCount = 0;
const MAX_WARNINGS = 3;
const MAX_CLICKS_PER_SECOND = 100; // Увеличиваем до 100 кликов в секунду
const CHECK_WINDOW = 10000; // Проверяем за последние 10 секунд
const MIN_CLICK_INTERVAL = 2; // Уменьшаем до 2мс (только машинные клики)
const REGULARITY_THRESHOLD = 1; // Уменьшаем порог до 1мс
const MIN_FAST_CLICKS = 20; // Увеличиваем до 20 быстрых кликов подряд

function handleAutoClickerProtection() {
  const now = Date.now();
  
  // Проверяем на слишком быстрые клики подряд (только если их много)
  if (clickTimes.length > 0) {
    const lastClick = clickTimes[clickTimes.length - 1];
    const interval = now - lastClick;
    
    // Проверяем только если уже много быстрых кликов подряд
    if (interval < MIN_CLICK_INTERVAL && clickTimes.length >= MIN_FAST_CLICKS) {
      // Считаем сколько быстрых кликов подряд
      let fastClicksInRow = 0;
      for (let i = clickTimes.length - 1; i >= 0; i--) {
        if (i === 0) break;
        const prevInterval = clickTimes[i] - clickTimes[i-1];
        if (prevInterval < MIN_CLICK_INTERVAL) {
          fastClicksInRow++;
        } else {
          break;
        }
      }
      
      // Предупреждаем только если 8+ быстрых кликов подряд
      if (fastClicksInRow >= MIN_FAST_CLICKS) {
        warningCount++;
        
        if (warningCount < MAX_WARNINGS) {
          alert(`⚠️ Слишком быстрые клики! (${warningCount}/${MAX_WARNINGS} предупреждений)`);
          clickTimes = [];
          return;
        } else {
          alert("❌ Обнаружен автокликер. Все клики и темы сброшены!");
          resetAll();
          return;
        }
      }
    }
  }
  
  clickTimes.push(now);
  
  // Удаляем старые клики (старше 2 секунд)
  clickTimes = clickTimes.filter(time => now - time <= CHECK_WINDOW);
  
  // Проверяем количество кликов за последние 2 секунды
  if (clickTimes.length > MAX_CLICKS_PER_SECOND) {
    warningCount++;
    
    if (warningCount < MAX_WARNINGS) {
      alert(`⚠️ Слишком много кликов! (${warningCount}/${MAX_WARNINGS} предупреждений)`);
      // Очищаем историю после предупреждения
      clickTimes = [];
    } else {
      alert("❌ Обнаружен автокликер. Все клики и темы сброшеныimage.png");
      resetAll();
    }
  }
  
  // Дополнительная проверка на регулярность (только для самых очевидных автокликеров)
  if (clickTimes.length >= 50) {
    const intervals = [];
    for (let i = 1; i < clickTimes.length; i++) {
      intervals.push(clickTimes[i] - clickTimes[i-1]);
    }
    
    // Берем только последние 30 интервалов для анализа
    const recentIntervals = intervals.slice(-30);
    const avgInterval = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;
    
    // Проверяем, что интервалы ОЧЕНЬ одинаковые (разница меньше 1мс)
    const isTooRegular = recentIntervals.every(interval => Math.abs(interval - avgInterval) < REGULARITY_THRESHOLD);
    
    // И средний интервал должен быть подозрительно быстрым (1-10мс)
    if (isTooRegular && avgInterval < 10 && avgInterval > 1) {
      warningCount++;
      
      if (warningCount < MAX_WARNINGS) {
        alert(`⚠️ Подозрительно регулярные клики! (${warningCount}/${MAX_WARNINGS} предупреждений)`);
        clickTimes = [];
      } else {
        alert("❌ Обнаружен автокликер. Все клики и темы сброшены!");
        resetAll();
      }
    }
  }
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
  if (circle.src.includes('morozova.png')) {
    bonus = 3;
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
const morozSound = new Audio('sounds/moroz.mp4');
let soundDuration = 3;
let morozSoundDuration = 3.5;

function playThemeSound() {
  themeSound.currentTime = 0;
  themeSound.play();
  setTimeout(() => {
    themeSound.pause();
    themeSound.currentTime = 0;
  }, soundDuration * 1000);
}

function playMorozSound() {
  morozSound.currentTime = 0;
  morozSound.play();
  setTimeout(() => {
    morozSound.pause();
    morozSound.currentTime = 0;
  }, morozSoundDuration * 1000);
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
  localStorage.removeItem('warningCount');
  clicks = 0;
  purchasedThemes.clear();
  purchasedThemes.add('images/kryg.png');
  circle.src = 'images/kryg.png';
  clickCountEl.textContent = '0';
  warningCount = 0;
  clickTimes = [];
  alert('Прогресс сброшен! Всё начинается заново 😎');
}
