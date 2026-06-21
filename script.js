// Kenji — Live Activity, Reviews carousel, Tilt, Reveal
(function(){
'use strict';

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Reviews data
const REVIEWS = [
  { name: 'Тимур', tag: '@timchikbs', text: 'купил впн, прыгнул с 25к до 30к за вечер. ботов реально кидает.', rank: '3 Прайм', stars: 5 },
  { name: 'Даня', tag: '@danyaplay', text: 'Pro Лига наконец без вылетов в финале. респект Kenji.', rank: 'Pro Лига', stars: 5 },
  { name: 'Артём', tag: '@artyommm', text: 'BSD+ бесплатно — окупил подписку за день. сборник топ.', rank: 'Мастер', stars: 5 },
  { name: 'Влад', tag: '@vladbs', text: 'пинг 22ms из Москвы до Франкфурта. вылетов больше нет.', rank: '3 Прайм', stars: 5 },
  { name: 'Карим', tag: '@karimwifi', text: 'оплатил звёздами. доступ дали через 4 минуты. чисто.', rank: 'Легенда', stars: 5 },
  { name: 'Никита', tag: '@nikitabss', text: 'трио с ботами это база. за неделю +6к кубков.', rank: '3 Прайм', stars: 5 },
  { name: 'Рустам', tag: '@rusbrawl', text: 'кикнул пассажиров с аккаунта по инструкции из группы.', rank: 'Мифик', stars: 5 },
  { name: 'Саша', tag: '@sashapush', text: 'фпс реально вырос. на старом телефоне 60 стабильно.', rank: 'Pro Лига', stars: 5 }
];

// Reviews carousel
const reviewsViewport = document.getElementById('reviewsViewport');
if (reviewsViewport) {
  let idx = 0;
  const render = () => {
    const a = REVIEWS[idx];
    const b = REVIEWS[(idx + 1) % REVIEWS.length];
    const c = REVIEWS[(idx + 2) % REVIEWS.length];
    reviewsViewport.innerHTML = [a, b, c].map((r, i) => `
      <article class="review-card${i === 0 ? ' review-card--lead' : ''}">
        <div class="review-head">
          <div class="review-avatar">${r.name.charAt(0)}</div>
          <div class="review-meta">
            <div class="review-name">${r.name} <span class="review-tag">${r.tag}</span></div>
            <div class="review-rank"><span class="rank-dot"></span> ${r.rank}</div>
          </div>
          <div class="review-stars">${'★'.repeat(r.stars)}</div>
        </div>
        <p class="review-text">${r.text}</p>
      </article>
    `).join('');
  };
  render();
  setInterval(() => { idx = (idx + 1) % REVIEWS.length; render(); }, 4200);
}

// Live online counter (346 ± small drift)
const liveOnlineEl = document.getElementById('liveOnline');
if (liveOnlineEl) {
  let online = 346;
  liveOnlineEl.textContent = online;
  setInterval(() => {
    const delta = Math.floor(Math.random() * 7) - 3;
    online = Math.max(330, Math.min(360, online + delta));
    liveOnlineEl.classList.add('flash');
    liveOnlineEl.textContent = online;
    setTimeout(() => liveOnlineEl.classList.remove('flash'), 400);
  }, 3800);
}

// Total counter — animate from 0 to 8420
const liveTotalEl = document.getElementById('liveTotal');
if (liveTotalEl) {
  const target = 8420;
  const t0 = performance.now();
  const dur = 1600;
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    const cur = Math.floor(eased * target);
    liveTotalEl.textContent = cur.toLocaleString('ru-RU');
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Today counter
const liveTodayEl = document.getElementById('liveToday');
if (liveTodayEl) {
  let today = 47;
  liveTodayEl.textContent = '+' + today;
  setInterval(() => {
    if (Math.random() > 0.6) {
      today += 1;
      liveTodayEl.classList.add('flash');
      liveTodayEl.textContent = '+' + today;
      setTimeout(() => liveTodayEl.classList.remove('flash'), 400);
    }
  }, 5200);
}

// Country rotator
const liveCountryEl = document.getElementById('liveCountry');
if (liveCountryEl) {
  const COUNTRIES = [
    { flag: '🇷🇺', code: 'RU' }, { flag: '🇺🇦', code: 'UA' }, { flag: '🇧🇾', code: 'BY' },
    { flag: '🇰🇿', code: 'KZ' }, { flag: '🇲🇩', code: 'MD' }, { flag: '🇺🇿', code: 'UZ' },
    { flag: '🇰🇬', code: 'KG' }, { flag: '🇦🇲', code: 'AM' }
  ];
  let ci = 0;
  const setC = () => {
    const c = COUNTRIES[ci % COUNTRIES.length];
    liveCountryEl.innerHTML = `${c.flag} <span class="country-code">${c.code}</span>`;
    ci++;
  };
  setC();
  setInterval(setC, 2600);
}

// Tilt cards (desktop only)
const tiltCards = document.querySelectorAll('[data-tilt]');
const isCoarse = window.matchMedia('(pointer: coarse)').matches;
if (!isCoarse) {
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -6;
      const ry = (px - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    });
  });
}

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

})();