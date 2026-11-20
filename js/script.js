/* ================= EDIT THIS SECTION ================= */
const CONFIG = {
  hisName: "My Love",          // his name (shown on the birthday page)
  herName: "Swethu",           // her name (shown in the sign-off)
  musicFile: "assets/music/perfect.mp3",
  slideSeconds: 4.5,           // seconds each photo stays
  typingSpeed: 38,             // ms per letter in the message
  photos: [
    { src: "assets/photos/photo1.jpg", caption: "Home is wherever you are" },
    { src: "assets/photos/photo2.jpg", caption: "My favorite smile in the world" },
    { src: "assets/photos/photo3.jpg", caption: "Every night feels like magic with you" },
    { src: "assets/photos/photo4.jpg", caption: "You and me, always" },
    { src: "assets/photos/photo5.jpg", caption: "Still choosing you, every single day" }
  ],
  messageTitle: "To my love ❤️",
  message:
`To my love, to my everything who has been with me since we met, who has many reasons to leave but still chooses me every single time, most handsome man in the world, the hardworking one who takes care of him and his family as well, wishing you joy and happiness and everything you prayed for. Hope we celebrate our birthdays together happily ever after.

Thanks for staying ❤️‍🩹`
};
/* ===================================================== */

const $ = (id) => document.getElementById(id);
const audio = $("bgm");
audio.src = CONFIG.musicFile;
audio.volume = 0.7;

/* Preload photos while the heart screen is showing so they appear instantly */
const preloaded = CONFIG.photos.map(p => new Promise(res => {
  const img = new Image();
  img.onload = img.onerror = () => res();
  img.src = p.src;
}));
audio.load();

let rainTimer = null, slideTimer = null, typeTimer = null, confettiRAF = null;

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

/* ---------- Floating hearts ---------- */
function startHeartRain(rate = 450) {
  stopHeartRain();
  const emojis = ["❤️", "💖", "💕", "💗", "💓", "🌹"];
  rainTimer = setInterval(() => {
    const h = document.createElement("span");
    h.className = "fh";
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = 14 + Math.random() * 26 + "px";
    h.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
    h.style.setProperty("--rot", (Math.random() * 80 - 40) + "deg");
    h.style.animationDuration = 6 + Math.random() * 6 + "s";
    $("heartRain").appendChild(h);
    setTimeout(() => h.remove(), 12500);
  }, rate);
}
function stopHeartRain() { clearInterval(rainTimer); }

/* ---------- Screen 1 -> 2 ---------- */
$("bigHeart").addEventListener("click", () => {
  audio.play().catch(() => {});
  $("muteBtn").classList.remove("hidden");
  $("bigHeart").classList.add("burst");
  startHeartRain(250);
  const wait = new Promise(r => setTimeout(r, 800));
  Promise.race([Promise.all([wait, ...preloaded]), new Promise(r => setTimeout(r, 6000))])
    .then(() => { show("screen-photos"); startSlides(); });
});

/* ---------- Photo slideshow ---------- */
function startSlides() {
  const wrap = $("slides"), dots = $("dots"), cap = $("caption");
  wrap.innerHTML = ""; dots.innerHTML = "";
  $("nextPhotos").classList.add("hidden");

  CONFIG.photos.forEach((p, i) => {
    const d = document.createElement("div");
    d.className = "slide";
    d.style.backgroundImage = `url('${p.src}')`;
    wrap.appendChild(d);
    dots.appendChild(document.createElement("span"));
  });
  const slides = wrap.children, dotEls = dots.children;
  let i = 0;

  const showSlide = (n) => {
    [...slides].forEach(s => s.classList.remove("show"));
    [...dotEls].forEach(d => d.classList.remove("on"));
    slides[n].classList.remove("show"); void slides[n].offsetWidth; // restart animation
    slides[n].classList.add("show");
    dotEls[n].classList.add("on");
    cap.style.opacity = 0;
    setTimeout(() => { cap.textContent = CONFIG.photos[n].caption; cap.style.opacity = 1; }, 500);
  };

  showSlide(0);
  clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    if (i < slides.length - 1) {
      i++; showSlide(i);
      if (i === slides.length - 1) setTimeout(() => $("nextPhotos").classList.remove("hidden"), CONFIG.slideSeconds * 700);
    } else {
      i = 0; showSlide(0); // keep looping gently
    }
  }, CONFIG.slideSeconds * 1000);
}

/* ---------- Screen 2 -> 3 ---------- */
$("nextPhotos").addEventListener("click", () => {
  clearInterval(slideTimer);
  show("screen-message");
  startTyping();
});

/* ---------- Message typewriter ---------- */
function startTyping() {
  $("msgTitle").textContent = CONFIG.messageTitle;
  const el = $("msgText");
  el.textContent = ""; el.classList.remove("done");
  $("nextMessage").classList.add("hidden");
  const chars = [...CONFIG.message];
  let n = 0;
  const finish = () => {
    clearInterval(typeTimer);
    el.textContent = CONFIG.message;
    el.classList.add("done");
    $("nextMessage").classList.remove("hidden");
  };
  clearInterval(typeTimer);
  typeTimer = setInterval(() => {
    el.textContent += chars[n++];
    el.scrollIntoView({ block: "end" });
    if (n >= chars.length) finish();
  }, CONFIG.typingSpeed);
  el.onclick = finish; // tap text to show everything instantly
}

/* ---------- Screen 3 -> 4 ---------- */
$("nextMessage").addEventListener("click", () => {
  show("screen-birthday");
  $("bdayName").textContent = CONFIG.hisName;
  $("herName").textContent = CONFIG.herName;
  startHeartRain(180);
  startConfetti();
});

$("replay").addEventListener("click", () => {
  stopConfetti();
  show("screen-photos");
  startSlides();
  startHeartRain(250);
});

/* ---------- Mute ---------- */
$("muteBtn").addEventListener("click", () => {
  audio.muted = !audio.muted;
  $("muteBtn").textContent = audio.muted ? "🔇" : "🔊";
});

/* ---------- Confetti & fireworks ---------- */
function startConfetti() {
  const c = $("confetti"), ctx = c.getContext("2d");
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize(); addEventListener("resize", resize);
  const colors = ["#ff4d79", "#ffc2d4", "#f6c177", "#ffffff", "#ff8fab"];
  let parts = [];

  const burst = (x, y) => {
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 90 + Math.random() * 40,
        r: 2 + Math.random() * 3, col: colors[Math.floor(Math.random() * colors.length)], g: .06 });
    }
  };
  const rain = () => {
    for (let i = 0; i < 4; i++) {
      parts.push({ x: Math.random() * c.width, y: -10, vx: Math.random() * 2 - 1, vy: 1.5 + Math.random() * 3,
        life: 400, r: 3 + Math.random() * 4, col: colors[Math.floor(Math.random() * colors.length)], g: 0.01, rect: true });
    }
  };

  let t = 0;
  const loop = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    t++;
    if (t % 45 === 0) burst(Math.random() * c.width, Math.random() * c.height * .5);
    if (t % 3 === 0) rain();
    parts = parts.filter(p => p.life > 0);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--;
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.col;
      if (p.rect) ctx.fillRect(p.x, p.y, p.r * 1.6, p.r);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
    });
    confettiRAF = requestAnimationFrame(loop);
  };
  burst(c.width / 2, c.height / 3);
  cancelAnimationFrame(confettiRAF);
  loop();
}
function stopConfetti() { cancelAnimationFrame(confettiRAF); }
