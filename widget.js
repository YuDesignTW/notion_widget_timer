// ====== 極簡番茄鐘邏輯 ======
const timerDisplay = document.getElementById('timer-display');
const presetDots = document.querySelectorAll('.preset-dot');
const startPauseBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset-btn');
const subMinuteBtn = document.getElementById('sub-minute');
const addMinuteBtn = document.getElementById('add-minute');
const progressBar = document.getElementById('progress-bar');
const infoBtn = document.getElementById('info-btn');
const settingModal = document.getElementById('setting-modal');
const closeModalBtn = document.getElementById('close-modal');
const alarmSoundSelect = document.getElementById('alarm-sound');
const tickingCheckbox = document.getElementById('ticking-sound');
const colorSwatches = document.querySelectorAll('.color-swatch');
const bgColorSelect = document.getElementById('bg-color');
const widget = document.querySelector('.pomodoro-widget');
let currentTheme = 'black';

const SOUNDS = {
  bell: 'https://cdn.jsdelivr.net/gh/code-notes/assets/mixkit-bell.wav',
  chime: 'https://cdn.jsdelivr.net/gh/code-notes/assets/mixkit-chime.wav',
  tick: 'https://cdn.jsdelivr.net/gh/code-notes/assets/mixkit-tick.wav',
  ticking: 'https://cdn.jsdelivr.net/gh/code-notes/assets/mixkit-ticking-loop.wav',
};

let defaultMinutes = 25;
let timer = defaultMinutes * 60;
let totalSeconds = timer;
let timerInterval = null;
let tickingAudio = null;
let isRunning = false;

function updateDisplay() {
  const m = String(Math.floor(timer / 60)).padStart(2, '0');
  const s = String(timer % 60).padStart(2, '0');
  timerDisplay.value = `${m}:${s}`;
  updateProgressBar();
}

function parseTimeInput(val) {
  // 支援 1100 > 11:00, 900 > 9:00, 45 > 0:45, 123 > 1:23, 1:30 > 1:30
  val = val.replace(/[^0-9:]/g, "");
  if (val.includes(":")) {
    const [m, s] = val.split(":");
    return [Number(m)||0, Number(s)||0];
  }
  if (val.length <= 2) return [0, Number(val)||0];
  if (val.length === 3) return [Number(val[0]), Number(val.slice(1))];
  if (val.length === 4) return [Number(val.slice(0,2)), Number(val.slice(2))];
  return [0, 0];
}

timerDisplay.addEventListener('focus', () => {
  timerDisplay.select();
});

timerDisplay.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    timerDisplay.blur();
  }
});

timerDisplay.addEventListener('blur', () => {
  let [m, s] = parseTimeInput(timerDisplay.value);
  m = Math.max(0, Math.min(99, m));
  s = Math.max(0, Math.min(59, s));
  timer = m * 60 + s;
  totalSeconds = timer;
  updateDisplay();
  stopTimer();
});

function setTimerByPreset(minutes) {
  defaultMinutes = minutes;
  timer = defaultMinutes * 60;
  totalSeconds = timer;
  stopTimer();
  updateDisplay();
  highlightPreset(minutes);
}

function highlightPreset(minutes) {
  presetDots.forEach(dot => {
    dot.classList.toggle('active', Number(dot.dataset.minutes) === minutes);
    if (dot.classList.contains('active')) {
      dot.style.background = getComputedStyle(widget).getPropertyValue('--theme-main');
      dot.style.borderColor = getComputedStyle(widget).getPropertyValue('--theme-main-dark');
    } else {
      dot.style.background = '';
      dot.style.borderColor = 'transparent';
    }
  });
} 

presetDots.forEach(dot => {
  dot.addEventListener('click', () => {
    setTimerByPreset(Number(dot.dataset.minutes));
  });
});

subMinuteBtn.addEventListener('click', () => {
  if (timer > 5 * 60) {
    timer -= 5 * 60;
    totalSeconds = Math.max(timer, 1);
    updateDisplay();
  }
});

addMinuteBtn.addEventListener('click', () => {
  if (timer < 60 * 99) {
    timer += 5 * 60;
    totalSeconds = Math.max(timer, 1);
    updateDisplay();
  }
});

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startPauseBtn.textContent = 'Pause';
  startPauseBtn.classList.add('pause');
  if (tickingCheckbox.checked) {
    tickingAudio = new Audio(SOUNDS.ticking);
    tickingAudio.loop = true;
    tickingAudio.volume = 0.10;
    tickingAudio.play();
  }
  timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      updateDisplay();
    } else {
      stopTimer();
      playAlarm();
    }
  }, 1000);
}

function stopTimer() {
  isRunning = false;
  startPauseBtn.textContent = 'Start';
  startPauseBtn.classList.remove('pause');
  clearInterval(timerInterval);
  timerInterval = null;
  if (tickingAudio) {
    tickingAudio.pause();
    tickingAudio.currentTime = 0;
    tickingAudio = null;
  }
}

function playAlarm() {
  const selected = alarmSoundSelect.value;
  const alarm = new Audio(SOUNDS[selected] || SOUNDS.bell);
  alarm.volume = 0.7;
  alarm.play();
}

startPauseBtn.addEventListener('click', () => {
  if (isRunning) {
    stopTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener('click', () => {
  stopTimer();
  timer = defaultMinutes * 60;
  totalSeconds = timer;
  updateDisplay();
});

function updateProgressBar() {
  let percent = totalSeconds === 0 ? 0 : (1 - timer / totalSeconds);
  progressBar.style.width = `${percent * 100}%`;
  progressBar.style.background = getComputedStyle(widget).getPropertyValue('--theme-main') || '#38bdf8';
} 

// Info/設定彈窗
infoBtn.addEventListener('click', () => {
  settingModal.classList.add('show');
});
closeModalBtn.addEventListener('click', () => {
  settingModal.classList.remove('show');
});
settingModal.addEventListener('click', (e) => {
  if (e.target === settingModal) settingModal.classList.remove('show');
});

// 音效預覽
alarmSoundSelect.addEventListener('change', () => {
  const selected = alarmSoundSelect.value;
  const preview = new Audio(SOUNDS[selected] || SOUNDS.bell);
  preview.volume = 0.7;
  preview.play();
});

// 主題切換
function applyTheme(theme) {
  theme = theme || currentTheme;
  const bg = bgColorSelect.value;
  widget.classList.remove('theme-blue','theme-orange','theme-red','theme-yellow','theme-green','theme-black','bg-light','bg-dark');
  widget.classList.add(`theme-${theme}`);
  widget.classList.add(`bg-${bg}`);
  highlightPreset(defaultMinutes);
  updateProgressBar();
  colorSwatches.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.color === theme);
  });
}
colorSwatches.forEach(btn => {
  btn.addEventListener('click', () => {
    currentTheme = btn.dataset.color;
    applyTheme(currentTheme);
  });
});
bgColorSelect.addEventListener('change', () => applyTheme(currentTheme));

// 初始化
bgColorSelect.value = 'light';
applyTheme('black');
setTimerByPreset(defaultMinutes);
updateDisplay();
