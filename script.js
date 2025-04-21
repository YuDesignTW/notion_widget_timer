document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const pomodoroBtn = document.getElementById('pomodoro');
    const shortBreakBtn = document.getElementById('short-break');
    const longBreakBtn = document.getElementById('long-break');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const themeBtn = document.getElementById('theme-btn');
    
    // Timer state
    let timer = null;
    let totalSeconds = 25 * 60; // Default 25 minutes
    let currentMode = 'pomodoro';
    
    // Initialize display
    updateTimerDisplay();
    
    // Mode button click events
    pomodoroBtn.addEventListener('click', () => {
        setTimerMode('pomodoro', 25 * 60);
    });
    
    shortBreakBtn.addEventListener('click', () => {
        setTimerMode('short-break', 5 * 60);
    });
    
    longBreakBtn.addEventListener('click', () => {
        setTimerMode('long-break', 15 * 60);
    });
    
    // Start button click event
    startBtn.addEventListener('click', () => {
        startTimer();
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
    });
    
    // Pause button click event
    pauseBtn.addEventListener('click', () => {
        pauseTimer();
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    });
    
    // Reset button click event
    resetBtn.addEventListener('click', () => {
        resetTimer();
    });
    
    // Theme toggle button click event
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            themeBtn.textContent = 'Switch to Light Theme';
        } else {
            themeBtn.textContent = 'Switch to Dark Theme';
        }
    });
    
    // Set timer mode
    function setTimerMode(mode, seconds) {
        // Clear active class from all mode buttons
        [pomodoroBtn, shortBreakBtn, longBreakBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Set current mode
        currentMode = mode;
        totalSeconds = seconds;
        
        // Set active button based on mode
        if (mode === 'pomodoro') {
            pomodoroBtn.classList.add('active');
        } else if (mode === 'short-break') {
            shortBreakBtn.classList.add('active');
        } else if (mode === 'long-break') {
            longBreakBtn.classList.add('active');
        }
        
        // Reset timer
        resetTimer();
    }
    
    // Start timer
    function startTimer() {
        if (timer !== null) return;
        
        timer = setInterval(() => {
            totalSeconds--;
            
            if (totalSeconds <= 0) {
                // Time's up, trigger notification
                clearInterval(timer);
                timer = null;
                playAlarm();
                
                // Auto switch mode (optional)
                if (currentMode === 'pomodoro') {
                    // After pomodoro, switch to short break
                    setTimerMode('short-break', 5 * 60);
                } else {
                    // After break, switch to pomodoro
                    setTimerMode('pomodoro', 25 * 60);
                }
                
                pauseBtn.classList.add('hidden');
                startBtn.classList.remove('hidden');
            }
            
            updateTimerDisplay();
        }, 1000);
    }
    
    // Pause timer
    function pauseTimer() {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    }
    
    // Reset timer
    function resetTimer() {
        pauseTimer();
        
        // Reset time based on current mode
        if (currentMode === 'pomodoro') {
            totalSeconds = 25 * 60;
        } else if (currentMode === 'short-break') {
            totalSeconds = 5 * 60;
        } else if (currentMode === 'long-break') {
            totalSeconds = 15 * 60;
        }
        
        updateTimerDisplay();
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        // Update page title to show remaining time in tab
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Notion Timer`;
    }
    
    // Play alarm sound
    function playAlarm() {
        try {
            // Create a simple audio alert
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.5;
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.error('Unable to play alarm sound:', e);
        }
    }
    
    // Auto detect system dark mode and apply matching theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
        themeBtn.textContent = 'Switch to Light Theme';
    }
}); 