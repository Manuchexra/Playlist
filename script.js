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

  function loadTrack(index) {
    player.src = audioFiles[index];
    player.load();
    player.play();
    playPauseBtn.textContent = "⏸️ Pause";
  }

  // Initial track
  loadTrack(currentTrack);

  // Next button
  nextBtn.addEventListener("click", () => {
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
  });

  // Previous button
  prevBtn.addEventListener("click", () => {
    currentTrack = (currentTrack - 1 + audioFiles.length) % audioFiles.length;
    loadTrack(currentTrack);
  });

  // Play/pause button
  playPauseBtn.addEventListener("click", () => {
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
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
  });
});
