document.addEventListener("DOMContentLoaded", function () {
  const audioFiles = [
    "Music/song1.mp3",
    "Music/song2.mp3",
    "Music/song3.mp3",
    "Music/song4.mp3",
    "Music/song5.mp3"
  ];

  let currentTrack = 0;
  const player = document.getElementById("audioPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const playlistElement = document.getElementById("playlist");
  const addSongBtn = document.getElementById("addSongBtn");
  const fileInput = document.getElementById("fileInput");

  function loadTrack(index) {
    if (audioFiles.length === 0) return;
    
    currentTrack = index;
    player.src = audioFiles[currentTrack];
    player.load();
    player.play();
    playPauseBtn.textContent = "⏸️ Pause";
    updatePlaylistDisplay();
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
        <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
      `;
      
      li.addEventListener('click', () => {
        loadTrack(index);
      });
      
      playlistElement.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.getAttribute('data-index'));
        deleteSong(index);
      });
    });
  }

  function deleteSong(index) {
    audioFiles.splice(index, 1);
    
    // Adjust current track if needed
    if (currentTrack >= index && currentTrack > 0) {
      currentTrack--;
    }
    
    // If playlist is empty
    if (audioFiles.length === 0) {
      player.src = '';
      playPauseBtn.textContent = "▶️ Play";
    } else {
      // If we deleted the currently playing song
      if (index === currentTrack) {
        currentTrack = Math.min(currentTrack, audioFiles.length - 1);
        loadTrack(currentTrack);
      }
    }
    
    updatePlaylistDisplay();
  }

  function addSongs(files) {
    if (files.length === 0) return;
    
    // Convert FileList to array and add to audioFiles
    Array.from(files).forEach(file => {
      // Create object URL for local files
      const fileUrl = URL.createObjectURL(file);
      audioFiles.push({
        name: file.name,
        url: fileUrl
      });
    });
    
    updatePlaylistDisplay();
    
    // If this is the first song added, play it
    if (audioFiles.length === files.length) {
      loadTrack(0);
    }
  }

  // Modify loadTrack to handle both string URLs and File objects
  function loadTrack(index) {
    if (audioFiles.length === 0) return;
    
    currentTrack = index;
    const track = audioFiles[currentTrack];
    player.src = typeof track === 'string' ? track : track.url;
    player.load();
    player.play();
    playPauseBtn.textContent = "⏸️ Pause";
    updatePlaylistDisplay();
  }

  // Initial setup
  loadTrack(currentTrack);

  // Next button
  nextBtn.addEventListener("click", () => {
    if (audioFiles.length === 0) return;
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
  });

  // Previous button
  prevBtn.addEventListener("click", () => {
    if (audioFiles.length === 0) return;
    currentTrack = (currentTrack - 1 + audioFiles.length) % audioFiles.length;
    loadTrack(currentTrack);
  });

  // Play/pause button
  playPauseBtn.addEventListener("click", () => {
    if (audioFiles.length === 0) return;
    
    if (player.paused) {
      player.play();
      playPauseBtn.textContent = "⏸️ Pause";
    } else {
      player.pause();
      playPauseBtn.textContent = "▶️ Play";
    }
  });

  // Auto-play next when song ends
  player.addEventListener("ended", () => {
    if (audioFiles.length === 0) return;
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
  });

  // Add song button triggers file input
  addSongBtn.addEventListener("click", () => {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      addSongs(e.target.files);
      // Reset input to allow selecting same files again
      fileInput.value = '';
    }
  });
});