(() => {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== REVEAL ON SCROLL =====
  const reveals = document.querySelectorAll('.reveal');
  let totalAnimated = false;
  if (reveals.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('in'));
      animateTotal();
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            if (entry.target.querySelector('#statTotal') && !totalAnimated) {
              animateTotal();
            }
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(el => io.observe(el));
    }
  }

  // ===== ONLINE COUNTER (346 ± 3 fluctuation) =====
  const statOnline = document.getElementById('statOnline');
  const heroOnline = document.getElementById('heroOnline');
  let onlineValue = 346;
  function updateOnline() {
    const delta = Math.floor(Math.random() * 7) - 3;
    onlineValue = Math.max(338, Math.min(355, onlineValue + delta));
    if (statOnline) statOnline.textContent = onlineValue;
    if (heroOnline) heroOnline.textContent = onlineValue;
  }
  if (statOnline || heroOnline) {
    function scheduleOnline() {
      const wait = 4000 + Math.random() * 3000;
      setTimeout(() => { updateOnline(); scheduleOnline(); }, wait);
    }
    scheduleOnline();
  }

  // ===== TOTAL COUNTER (0 -> 8420 animated) =====
  function animateTotal() {
    if (totalAnimated) return;
    totalAnimated = true;
    const el = document.getElementById('statTotal');
    if (!el) return;
    const target = 8420;
    if (prefersReduced) { el.textContent = target.toLocaleString('ru-RU'); return; }
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * target);
      el.textContent = value.toLocaleString('ru-RU');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ===== TODAY COUNTER (+47 with periodic increments) =====
  const statToday = document.getElementById('statToday');
  let todayValue = 47;
  if (statToday) {
    function scheduleToday() {
      const wait = 15000 + Math.random() * 10000;
      setTimeout(() => {
        todayValue += Math.random() > 0.5 ? 1 : 2;
        statToday.textContent = '+' + todayValue;
        scheduleToday();
      }, wait);
    }
    scheduleToday();
  }

  // ===== COUNTRY FLAG ROTATOR =====
  const flagEl = document.getElementById('flagRotate');
  const flagCountryEl = document.getElementById('flagCountry');
  const countries = [
    { flag: '🇷🇺', name: 'Россия' },
    { flag: '🇺🇦', name: 'Украина' },
    { flag: '🇧🇾', name: 'Беларусь' },
    { flag: '🇰🇿', name: 'Казахстан' },
    { flag: '🇲🇩', name: 'Молдова' },
    { flag: '🇦🇲', name: 'Армения' },
    { flag: '🇬🇪', name: 'Грузия' },
    { flag: '🇰🇬', name: 'Кыргызстан' },
  ];
  let flagIdx = 0;
  if (flagEl && flagCountryEl) {
    setInterval(() => {
      flagIdx = (flagIdx + 1) % countries.length;
      flagEl.style.opacity = '0';
      flagCountryEl.style.opacity = '0';
      setTimeout(() => {
        flagEl.textContent = countries[flagIdx].flag;
        flagCountryEl.textContent = countries[flagIdx].name;
        flagEl.style.opacity = '1';
        flagCountryEl.style.opacity = '1';
      }, 200);
    }, 3000);
    flagEl.style.transition = 'opacity .25s ease';
    flagCountryEl.style.transition = 'opacity .25s ease';
  }

  // ===== REVIEWS CAROUSEL =====
  const track = document.getElementById('reviewTrack');
  const viewport = document.getElementById('reviewsViewport');
  const dotsContainer = document.getElementById('reviewsDots');
  if (track && viewport) {
    const cards = Array.from(track.children);
    let currentIdx = 0;
    let isPaused = false;

    // Build dots
    if (dotsContainer) {
      cards.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'reviews-dot' + (i === 0 ? ' is-active' : '');
        dotsContainer.appendChild(dot);
      });
    }

    function goTo(idx) {
      currentIdx = ((idx % cards.length) + cards.length) % cards.length;
      const card = cards[currentIdx];
      if (!card) return;
      const cardWidth = card.offsetWidth + 14;
      track.style.transform = `translateX(-${currentIdx * cardWidth}px)`;
      if (dotsContainer) {
        const dots = dotsContainer.children;
        for (let i = 0; i < dots.length; i++) {
          dots[i].classList.toggle('is-active', i === currentIdx);
        }
      }
    }

    function advance() {
      if (isPaused) return;
      goTo(currentIdx + 1);
    }

    if (!prefersReduced) {
      setInterval(advance, 3500);
      viewport.addEventListener('mouseenter', () => { isPaused = true; });
      viewport.addEventListener('mouseleave', () => { isPaused = false; });
      window.addEventListener('resize', () => goTo(currentIdx));
    }

    let touchStartX = 0;
    let touchEndX = 0;
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? currentIdx + 1 : currentIdx - 1);
      }
    }, { passive: true });
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();