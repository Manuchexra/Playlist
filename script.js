document.addEventListener("DOMContentLoaded", function () {
  // Load playlist from localStorage or initialize with default songs
  let audioFiles = JSON.parse(localStorage.getItem('musicPlaylist')) || [
    "Music/song1.mp3",
    "Music/song2.mp3",
    "Music/song3.mp3",
    "Music/song4.mp3",
    "Music/song5.mp3"
  ];

  // Load current track position from localStorage
  let currentTrack = parseInt(localStorage.getItem('currentTrack')) || 0;

  const player = document.getElementById("audioPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const playlistElement = document.getElementById("playlist");
  const fileInput = document.getElementById("fileInput");
  const progressBar = document.getElementById("progressBar");
  const visualizerBars = document.querySelectorAll('.visualizer .bar');

  // Visualizer animation control
  let visualizerAnimation;
  
  function startVisualizer() {
    visualizerBars.forEach(bar => {
      bar.style.animationPlayState = 'running';
    });
  }
  
  function stopVisualizer() {
    visualizerBars.forEach(bar => {
      bar.style.animationPlayState = 'paused';
    });
  }

  function savePlaylist() {
    localStorage.setItem('musicPlaylist', JSON.stringify(audioFiles));
    localStorage.setItem('currentTrack', currentTrack.toString());
  }

  function loadTrack(index) {
    if (audioFiles.length === 0) return;
    
    currentTrack = index;
    const track = audioFiles[currentTrack];
    
    if (typeof track === 'string') {
      player.src = track;
    } else if (track.url) {
      player.src = track.url;
    } else {
      return;
    }
    
    player.load();
    player.play()
      .then(() => {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playPauseBtn.classList.add('playing-animation');
        startVisualizer();
      })
      .catch(e => console.error("Playback failed:", e));
    
    updatePlaylistDisplay();
    savePlaylist();
  }

  function updatePlaylistDisplay() {
    playlistElement.innerHTML = '';
    
    audioFiles.forEach((file, index) => {
      const li = document.createElement('li');
      if (index === currentTrack) {
        li.classList.add('playing');
      }
      
      const fileName = typeof file === 'string' ? file.split('/').pop() : file.name;
      li.innerHTML = `
        <span>${index + 1}. ${fileName}</span>
        <button class="delete-btn" data-index="${index}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      li.addEventListener('click', () => {
        loadTrack(index);
      });
      
      playlistElement.appendChild(li);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.getAttribute('data-index'));
        deleteSong(index);
      });
    });
  }

  function deleteSong(index) {
    // Revoke object URL if it's a local file
    if (typeof audioFiles[index] !== 'string' && audioFiles[index].url) {
      URL.revokeObjectURL(audioFiles[index].url);
    }
    
    audioFiles.splice(index, 1);
    
    if (currentTrack >= index && currentTrack > 0) {
      currentTrack--;
    }
    
    if (audioFiles.length === 0) {
      player.src = '';
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      playPauseBtn.classList.remove('playing-animation');
      stopVisualizer();
    } else {
      if (index === currentTrack) {
        currentTrack = Math.min(currentTrack, audioFiles.length - 1);
        loadTrack(currentTrack);
      }
    }
    
    savePlaylist();
    updatePlaylistDisplay();
  }

  function addSongs(files) {
    if (files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const fileUrl = URL.createObjectURL(file);
      audioFiles.push({
        name: file.name,
        url: fileUrl
      });
    });
    
    savePlaylist();
    updatePlaylistDisplay();
    
    if (audioFiles.length === files.length) {
      loadTrack(0);
    }
  }

  // Update progress bar
  function updateProgress() {
    const { duration, currentTime } = player;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  // Set progress when clicked on progress bar
  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = player.duration;
    player.currentTime = (clickX / width) * duration;
  }

  // Initial setup
  loadTrack(currentTrack);

  // Player controls
  nextBtn.addEventListener("click", () => {
    if (audioFiles.length === 0) return;
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
  });

  prevBtn.addEventListener("click", () => {
    if (audioFiles.length === 0) return;
    currentTrack = (currentTrack - 1 + audioFiles.length) % audioFiles.length;
    loadTrack(currentTrack);
  });

  playPauseBtn.addEventListener("click", () => {
    if (audioFiles.length === 0) return;
    
    if (player.paused) {
      player.play()
        .then(() => {
          playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
          playPauseBtn.classList.add('playing-animation');
          startVisualizer();
        });
    } else {
      player.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      playPauseBtn.classList.remove('playing-animation');
      stopVisualizer();
    }
  });

  // Player event listeners
  player.addEventListener("timeupdate", updateProgress);
  player.addEventListener("ended", () => {
    if (audioFiles.length === 0) return;
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
  });
  player.addEventListener("play", startVisualizer);
  player.addEventListener("pause", stopVisualizer);

  // Progress bar click
  document.querySelector('.progress-container').addEventListener('click', setProgress);

  // File input
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      addSongs(e.target.files);
      fileInput.value = '';
    }
  });

  // Clean up object URLs when page is closed
  window.addEventListener('beforeunload', () => {
    audioFiles.forEach((file, index) => {
      if (typeof file !== 'string' && file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
  });
});