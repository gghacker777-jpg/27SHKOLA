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
let currentTheme = localStorage.getItem('currentTheme') || 'images/kryg.png';
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
circle.src = currentTheme;

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
// Функция для обновления состояния блокировок тем
function updateThemeLocks() {
  const allThemes = document.querySelectorAll('#whiteMenu .theme-item');
  allThemes.forEach(item => {
    const order = parseInt(item.getAttribute('data-order'));
    const imgSrc = item.getAttribute('data-img');

    // Первая тема всегда разблокирована
    if (order === 1) {
      item.classList.remove('locked');
      return;
    }

    // Проверяем, куплена ли предыдущая тема
    const prevOrder = order - 1;
    const prevTheme = Array.from(allThemes).find(t => parseInt(t.getAttribute('data-order')) === prevOrder);
    const prevImgSrc = prevTheme ? prevTheme.getAttribute('data-img') : null;

    if (prevImgSrc && purchasedThemes.has(prevImgSrc) && !purchasedThemes.has(imgSrc)) {
      item.classList.remove('locked');
    } else if (!purchasedThemes.has(imgSrc)) {
      item.classList.add('locked');
    }
  });
}

menuThemeItems.forEach(item => {
  item.addEventListener('click', () => {
    const imgSrc = item.getAttribute('data-img');
    const price = parseInt(item.getAttribute('data-price'));
    const order = parseInt(item.getAttribute('data-order'));

    if (purchasedThemes.has(imgSrc)) {
      currentTheme = imgSrc;
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
      return;
    }

    // Проверяем последовательность покупки
    if (order > 1) {
      const prevOrder = order - 1;
      const prevTheme = Array.from(menuThemeItems).find(t => parseInt(t.getAttribute('data-order')) === prevOrder);
      const prevImgSrc = prevTheme ? prevTheme.getAttribute('data-img') : null;

      if (!prevImgSrc || !purchasedThemes.has(prevImgSrc)) {
        alert('Сначала купите предыдущую тему!');
        return;
      }
    }

    if (clicks >= price) {
      clicks -= price;
      clickCountEl.textContent = clicks;
      purchasedThemes.add(imgSrc);
      currentTheme = imgSrc;
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
      updateThemeLocks(); // Обновляем блокировки после покупки

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

// Обновляем блокировки при загрузке страницы
updateThemeLocks();

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
  localStorage.setItem('currentTheme', currentTheme);
  localStorage.setItem('warningCount', warningCount);
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

// === 🛡️ Система антиавтокликера ===
let clickTimes = [];
let warningCount = parseInt(localStorage.getItem('warningCount')) || 0;
const MAX_WARNINGS = 3;
const MIN_CLICKS_FOR_CHECK = 15;
const INTERVAL_TOLERANCE = 2; // ±2 мс для более точной проверки

function handleAutoClickerProtection() {
  const now = Date.now();
  clickTimes.push(now);

  // Оставляем только последние 16 кликов для проверки
  if (clickTimes.length > 16) {
    clickTimes = clickTimes.slice(-16);
  }

  // Проверяем только если накоплено достаточно кликов
  if (clickTimes.length >= MIN_CLICKS_FOR_CHECK) {
    const intervals = [];
    for (let i = 1; i < clickTimes.length; i++) {
      intervals.push(clickTimes[i] - clickTimes[i - 1]);
    }

    // Проверяем, что интервалы слишком регулярные (автокликер)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const maxDeviation = Math.max(...intervals.map(i => Math.abs(i - avgInterval)));

    // Если все интервалы одинаковые в пределах 2мс - это автокликер
    const isAutoClicker = maxDeviation <= INTERVAL_TOLERANCE;

    if (isAutoClicker) {
      warningCount++;

      if (warningCount < MAX_WARNINGS) {
        alert(`⚠️ Подозрительная активность! (${warningCount}/${MAX_WARNINGS} предупреждений)`);
        clickTimes = []; // Очищаем историю
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
  localStorage.removeItem('currentTheme');
  localStorage.removeItem('warningCount');
  clicks = 0;
  purchasedThemes.clear();
  purchasedThemes.add('images/kryg.png');
  currentTheme = 'images/kryg.png';
  circle.src = 'images/kryg.png';
  clickCountEl.textContent = '0';
  warningCount = 0;
  clickTimes = [];
  alert('Прогресс сброшен! Всё начинается заново 😎');
}

// === 🌐 Глобальный чат игроков ===
const gptBtn = document.getElementById('gptBtn');
const gptChat = document.getElementById('gptChat');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatStatus = document.getElementById('chatStatus');

// Система глобального чата
let globalChatMessages = [];
let currentPlayerName = localStorage.getItem('playerName') || generatePlayerName();
let chatServer = null;
let isConnected = false;

// Запрещенные слова
const forbiddenWords = ['Виталик', 'Витя', 'Кулич', 'Виктор'];

// Генерация случайного имени игрока
function generatePlayerName() {
  const adjectives = ['Смелый', 'Умный', 'Быстрый', 'Хитрый', 'Счастливый', 'Могучий', 'Ловкий', 'Гениальный'];
  const nouns = ['Кликер', 'Игрок', 'Воин', 'Маг', 'Герой', 'Мастер', 'Профи', 'Легенда'];
  const name = adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' + nouns[Math.floor(Math.random() * nouns.length)];
  localStorage.setItem('playerName', name);
  return name;
}

// Инициализация WebSocket сервера для глобального чата
function initGlobalChat() {
  // Для демонстрации используем локальный WebSocket сервер
  // В реальности нужен настоящий сервер

  chatStatus.textContent = '🔄 Поиск сервера чата...';

  // Имитация подключения к глобальному чату
  setTimeout(() => {
    if (Math.random() > 0.3) { // 70% шанс "подключения"
      isConnected = true;
      chatStatus.textContent = '🟢 Подключен к глобальному чату';
      chatStatus.style.background = 'rgba(34, 197, 94, 0.9)';

      // Загружаем существующие сообщения
      loadGlobalChatMessages();

      // Добавляем приветственное сообщение
      addSystemMessage(`${currentPlayerName} присоединился к чату!`);

      // Имитируем активность других игроков
      startSimulatedPlayers();
    } else {
      chatStatus.textContent = '🔴 Сервер недоступен. Режим оффлайн.';
      chatStatus.style.background = 'rgba(239, 68, 68, 0.9)';

      // В оффлайн режиме показываем локальные сообщения
      loadOfflineMessages();
    }
  }, 2000);
}

// Имитация других игроков для демонстрации
function startSimulatedPlayers() {
  const simulatedPlayers = [
    'КликМастер', 'СуперИгрок', 'ТемаХантер', 'БыстрыйКликер', 'ЗолотойИгрок'
  ];

  // Периодически добавляем сообщения от "других игроков"
  setInterval(() => {
    if (isConnected && Math.random() < 0.3) { // 30% шанс каждые 10 секунд
      const player = simulatedPlayers[Math.floor(Math.random() * simulatedPlayers.length)];
      const messages = [
        'Привет всем!',
        'Кто уже купил все темы?',
        'Кликаю как сумасшедший! 😄',
        'Нужна помощь с игрой',
        'Крутая игра!',
        'Кто онлайн?',
        'Давайте общаться!',
        'Какой у кого счёт?',
        'Рекомендую купить Морозову!',
        'Классный чат! 👍'
      ];

      const message = messages[Math.floor(Math.random() * messages.length)];
      receiveGlobalMessage(player, message);
    }
  }, 10000);
}

// Функция отправки сообщения в глобальный чат
function sendToGlobalChat(message) {
  if (!isConnected) {
    // В оффлайн режиме сохраняем локально
    saveOfflineMessage(message);
    displayMessage({
      player: currentPlayerName,
      content: message,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type: 'offline'
    });
    return;
  }

  // В онлайне отправляем на "сервер"
  const chatMessage = {
    player: currentPlayerName,
    content: message,
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    type: 'global'
  };

  // Имитируем отправку и получение своего сообщения
  receiveGlobalMessage(currentPlayerName, message);

  // В реальности здесь был бы WebSocket send
  console.log('Отправлено в глобальный чат:', chatMessage);
}

// Получение сообщения из глобального чата
function receiveGlobalMessage(player, content) {
  const messageData = {
    player: player,
    content: content,
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    type: 'global'
  };

  // Сохраняем в глобальную историю
  globalChatMessages.push(messageData);
  if (globalChatMessages.length > 100) {
    globalChatMessages = globalChatMessages.slice(-100);
  }

  // Сохраняем локально для persistence
  localStorage.setItem('globalChatMessages', JSON.stringify(globalChatMessages));

  // Отображаем сообщение
  displayMessage(messageData);

  // Звуковой сигнал для новых сообщений (если не от нас)
  if (player !== currentPlayerName) {
    playMessageSound();
  }
}

// Функция отображения сообщения
function displayMessage(msg) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${msg.type === 'system' ? 'system-message' : 'player-message'}`;

  if (msg.type === 'system') {
    messageEl.style.background = 'rgba(156, 163, 175, 0.9)';
    messageEl.style.color = 'white';
    messageEl.style.fontStyle = 'italic';
    messageEl.textContent = `${msg.timestamp} ${msg.content}`;
  } else {
    const timeEl = document.createElement('span');
    timeEl.className = 'message-time';
    timeEl.textContent = msg.timestamp;

    const playerEl = document.createElement('span');
    playerEl.className = 'message-player';
    playerEl.textContent = msg.player + ':';

    const contentEl = document.createElement('span');
    contentEl.className = 'message-content';
    contentEl.textContent = msg.content;

    messageEl.appendChild(timeEl);
    messageEl.appendChild(playerEl);
    messageEl.appendChild(contentEl);
  }

  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Добавление системного сообщения
function addSystemMessage(content) {
  displayMessage({
    player: 'Система',
    content: content,
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    type: 'system'
  });
}

// Загрузка сообщений глобального чата
function loadGlobalChatMessages() {
  chatMessages.innerHTML = '';
  globalChatMessages = JSON.parse(localStorage.getItem('globalChatMessages')) || [];

  globalChatMessages.forEach(msg => {
    displayMessage(msg);
  });
}

// Загрузка оффлайн сообщений
function loadOfflineMessages() {
  chatMessages.innerHTML = '';
  const offlineMsgs = JSON.parse(localStorage.getItem('offlineChatMessages')) || [];

  if (offlineMsgs.length === 0) {
    addSystemMessage('Чат в оффлайн режиме. Сообщения сохраняются локально.');
  } else {
    offlineMsgs.forEach(msg => {
      displayMessage({
        player: currentPlayerName,
        content: msg.content,
        timestamp: msg.timestamp,
        type: 'offline'
      });
    });
  }
}

// Сохранение оффлайн сообщения
function saveOfflineMessage(content) {
  const offlineMsgs = JSON.parse(localStorage.getItem('offlineChatMessages')) || [];
  offlineMsgs.push({
    content: content,
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  });

  if (offlineMsgs.length > 20) {
    offlineMsgs.shift();
  }

  localStorage.setItem('offlineChatMessages', JSON.stringify(offlineMsgs));
}

// Звуковой сигнал для новых сообщений
function playMessageSound() {
  // Тихий звук уведомления (можно добавить аудио файл)
  // Для демонстрации просто console.log
  console.log('🔔 Новое сообщение в чате!');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем глобальный чат
  initGlobalChat();
});

// Показать/скрыть чат
gptBtn.addEventListener('click', () => {
  gptChat.classList.toggle('show');
});

chatClose.addEventListener('click', () => {
  gptChat.classList.remove('show');
});

// Отправка сообщения в глобальный чат
function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Проверка на запрещенные слова
  if (forbiddenWords.some(word => message.toLowerCase().includes(word.toLowerCase()))) {
    alert('Это сообщение содержит запрещенные слова!');
    return;
  }

  // Отправка в глобальный чат
  sendToGlobalChat(message);
  chatInput.value = '';
}

// Обработчики
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
