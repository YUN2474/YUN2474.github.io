// MusicPlayer.js
let audio = new Audio();
audio.volume = 0.8;

// 不再在顶层获取元素，改为函数内动态获取
let playSongName, playPauseBtn, playIconSpan, progressSlider, currentTimeSpan, durationSpan, volumeSlider, volumeDisplay;
let isDraggingProgress = false;
let currentSongName = "";

export let playList = new Array;
let currentPlayListIndex;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity || seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updatePlayPauseUI() {
    if (!playIconSpan) return;
    if (audio.paused) {
        playIconSpan.src = 'src/img/Theme/1/UI/pause-icon.png';
        playIconSpan.className = 'pause-icon';
    } else {
        playIconSpan.src = 'src/img/Theme/1/UI/play-icon.png';
        playIconSpan.className = 'play-icon';
    }
}

function updateProgressAndTime() {
    if (!progressSlider || !currentTimeSpan || !durationSpan) return;
    if (isDraggingProgress) return;
    const duration = audio.duration;
    if (!isNaN(duration) && isFinite(duration) && duration > 0) {
        const percent = (audio.currentTime / duration) * 100;
        progressSlider.value = percent;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
        durationSpan.textContent = formatTime(duration);
        if (progressSlider.disabled) progressSlider.disabled = false;
    } else {
        progressSlider.value = 0;
        currentTimeSpan.textContent = '00:00';
        if (duration === Infinity || isNaN(duration)) {
            durationSpan.textContent = '00:00';
            progressSlider.disabled = true;
        } else if (duration > 0) {
            durationSpan.textContent = formatTime(duration);
        }
    }
}

function setVolume(value) {
    const vol = parseFloat(value);
    if (!isNaN(vol)) {
        audio.volume = vol;
        // 如果通过滑块调节且之前是静音状态，需取消静音
        if (audio.muted && vol > 0) {
            audio.muted = false;
        }
        volumeDisplay.textContent = `${Math.floor(audio.volume * 100)}%`
    }
}

// 初始化函数：绑定事件、获取 DOM 引用
export function init() {
    // 1. 重新获取当前页面的 DOM 元素
    playSongName = document.getElementById('playSongName');
    playPauseBtn = document.getElementById('playPauseBtn');
    playIconSpan = document.getElementById('playIcon');
    progressSlider = document.getElementById('progressSlider');
    currentTimeSpan = document.getElementById('currentTimeDisplay');
    durationSpan = document.getElementById('durationDisplay');
    volumeSlider = document.getElementById('volumeSlider');
    volumeDisplay = document.getElementById('volumeDisplay');

    if (audio != null)
    {
        volumeSlider.value = audio.volume;
        volumeDisplay.textContent = `${Math.floor(audio.volume * 100)}%`;
    }

    playSongName.textContent = `当前播放:${currentSongName}`;
    updateProgressAndTime()
    updatePlayPauseUI()

    // 创建新的事件处理函数并保存
    const handlers = {
        playPause: () => {
            if (audio.src != null)
            {
                if (audio.paused) audio.play();
                else audio.pause();
                updatePlayPauseUI();
            }
        },
        progressInput: (e) => {
            if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) return;
            isDraggingProgress = true;
            const percent = parseFloat(e.target.value);
            const newTime = (percent / 100) * audio.duration;
            if (!isNaN(newTime)) {
                audio.currentTime = newTime;
                if (currentTimeSpan) currentTimeSpan.textContent = formatTime(newTime);
            }
        },
        timeUpdate: () => {
            if (!isDraggingProgress) updateProgressAndTime();
        },
        loadedMetadata: () => {
            if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
                if (durationSpan) durationSpan.textContent = formatTime(audio.duration);
                if (progressSlider) progressSlider.disabled = false;
                if (!audio.volume && audio.volume !== 0 && volumeSlider) audio.volume = volumeSlider.value;
            } else if (audio.duration === Infinity && durationSpan) {
                durationSpan.textContent = 'live';
                if (progressSlider) progressSlider.disabled = true;
            }
            updatePlayPauseUI();
        },
        volumeSliderInput: (e) => {
            const vol = e.target.value;
            setVolume(vol);
            if (audio.muted && vol > 0) audio.muted = false;
        },
        audioEnd: () => {
            loadAndPlayTrack(currentTrackIndex + 1);
        }
    };

    window.__musicPlayerHandlers = handlers;

    // 移除旧的（如果之前绑定了匿名函数则无法移除，所以建议使用命名函数或模块级存储）
    // 为简化，我们重新绑定之前先解绑所有 click 事件（不推荐但可行）
    // 更优雅：在模块级保存事件处理函数引用
    if (window.__musicPlayerHandlers) {
        playPauseBtn.removeEventListener('click', window.__musicPlayerHandlers.playPause);
        progressSlider.removeEventListener('input', window.__musicPlayerHandlers.progressInput);
        audio.removeEventListener('timeupdate', window.__musicPlayerHandlers.timeUpdate);
        audio.removeEventListener('loadedmetadata', window.__musicPlayerHandlers.loadedMetadata);
        volumeSlider.removeEventListener('input', window.__musicPlayerHandlers.volumeSliderInput);
    }

    // 绑定事件
    playPauseBtn.addEventListener('click', handlers.playPause);
    progressSlider.addEventListener('input', handlers.progressInput);
    audio.addEventListener('timeupdate', handlers.timeUpdate);
    audio.addEventListener('loadedmetadata', handlers.loadedMetadata);
    volumeSlider.addEventListener('input', handlers.volumeSliderInput);

    // 初始化 UI
    updatePlayPauseUI();
    updateProgressAndTime();
}

// 导出加载音频的函数
export function loadAudioFromSource(src, songName) {
    if (!playSongName) {
        console.error('MusicPlayer 未初始化，请先调用 init()');
        return;
    }

    console.log(playList);
    audio.pause();
    audio.src = src;
    audio.load();
    currentSongName = songName;
    playSongName.textContent = `当前播放:${currentSongName}`;
    updateProgressAndTime();
}

// 依据播放列表播放音乐
export function loadAudioFromPlayList(index, songName) {
    if (!playSongName) {
        console.error('MusicPlayer 未初始化，请先调用 init()');
        return;
    }
    if (!playList)
    {
        console.error('播放列表存在问题');
        return;
    }

    if (index >= playList.length) {
        index = 0;
    }
    if (index < 0) {
        index = playList.length - 1;
    }

    currentPlayListIndex = index;

    audio.pause();
    audio.src = playList[currentPlayListIndex];
    audio.load();
    currentSongName = songName;
    playSongName.textContent = `当前播放:${currentSongName}`;
    updateProgressAndTime();
}

// 为了向后兼容，也可以保留默认导出
export default {
    init,
    loadAudioFromSource,
    loadAudioFromPlayList,
    playList
};