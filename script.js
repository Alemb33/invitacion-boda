'use strict';
// Guanajuato, México (UTC-06:00). Misa: 1:00 p. m. | Recepción: 3:00 p. m.
const WEDDING_DATE = new Date('2026-12-19T13:00:00-06:00');
const $ = (id) => document.getElementById(id);
const opening = $('opening');
const audio = $('backgroundMusic');
const musicToggle = $('musicToggle');
const musicLabel = $('musicLabel');
let opened = false;
function updateMusicButton() {
  const playing = !audio.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicLabel.textContent = playing ? 'Pausar' : 'Reproducir';
}
function launchFloatingHearts() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = $('floatingHearts');
  const colors = ['#c7a46a', '#e6c9c6', '#fff8ed', '#b58b56'];
  for (let i = 0; i < 34; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = '♥';
    heart.style.setProperty('--left', `${Math.random() * 100}%`);
    heart.style.setProperty('--size', `${12 + Math.random() * 23}px`);
    heart.style.setProperty('--drift', `${(Math.random() - .5) * 150}px`);
    heart.style.setProperty('--duration', `${3.1 + Math.random() * 1.8}s`);
    heart.style.setProperty('--delay', `${Math.random() * 1.0}s`);
    heart.style.color = colors[i % colors.length];
    layer.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
  }
}
$('openInvitation').addEventListener('click', async () => {
  if (opened) return;
  opened = true;
  opening.classList.add('is-open');
  launchFloatingHearts();
  musicToggle.hidden = false;
  // Se solicita audio directamente en el clic para respetar la política de los navegadores.
  audio.volume = 0.6;
  try {
    await audio.play();
  } catch (error) {
    console.info('No se pudo reproducir el audio. Revisa musica/cancion.mp3.', error);
  }
  updateMusicButton();
  setTimeout(() => { opening.classList.add('dismissed'); document.body.classList.remove('locked'); }, 1250);
});
musicToggle.addEventListener('click', async () => {
  if (audio.paused) { try { await audio.play(); } catch { alert('No se pudo reproducir la música. Comprueba que exista musica/cancion.mp3 y que sea un MP3 válido.'); } }
  else audio.pause();
  updateMusicButton();
});
audio.addEventListener('play', updateMusicButton);
audio.addEventListener('pause', updateMusicButton);
audio.addEventListener('error', () => { musicLabel.textContent = 'Agregar música'; });
function updateCountdown() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) {
    ['days','hours','minutes','seconds'].forEach(id => $(id).textContent = '00');
    $('countdownDone').hidden = false;
    return;
  }
  const total = Math.floor(diff / 1000);
  const parts = [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60];
  ['days','hours','minutes','seconds'].forEach((id, index) => $(id).textContent = String(parts[index]).padStart(2, '0'));
}
updateCountdown(); setInterval(updateCountdown, 1000);
// Calendario: evento de 13:00 a 14:00 hora de Guanajuato.
const cal = new URL('https://calendar.google.com/calendar/render');
cal.searchParams.set('action', 'TEMPLATE');
cal.searchParams.set('text', 'Boda de Ricardo y Ana Lilia');
cal.searchParams.set('dates', '20261219T130000/20261219T140000');
cal.searchParams.set('ctz', 'America/Mexico_City');
cal.searchParams.set('details', 'Ceremonia religiosa a la 1:00 p. m. Recepción en Hacienda San Bartolo de Berrio a partir de las 3:00 p. m.');
cal.searchParams.set('location', 'Parroquia de San Diego de Alcalá, Jaral de Berrios, Guanajuato');
$('calendarLink').href = cal.toString();
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold: .08});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
// Si aún no se suben las fotos, se muestran tarjetas decorativas.
document.querySelectorAll('.photo').forEach(button => {
  const img = button.querySelector('img');
  img.addEventListener('error', () => img.classList.add('is-missing'));
  button.addEventListener('click', () => {
    if (!img.complete || !img.naturalWidth) return;
    $('dialogImage').src = img.src;
    $('dialogImage').alt = img.alt;
    $('photoDialog').showModal();
  });
});
$('closePhoto').addEventListener('click', () => $('photoDialog').close());
$('photoDialog').addEventListener('click', event => { if (event.target === $('photoDialog')) $('photoDialog').close(); });
