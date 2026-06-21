// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Server profiles ----------
const SERVERS = {
  fra: { name: 'FRA-01', ping: [22, 28], jitter: [0.8, 1.6], loss: [0, 0.2], ispBase: [55, 110] },
  waw: { name: 'WAW-02', ping: [28, 36], jitter: [1.0, 2.0], loss: [0, 0.3], ispBase: [70, 130] },
  ams: { name: 'AMS-03', ping: [25, 33], jitter: [0.9, 1.8], loss: [0, 0.25], ispBase: [60, 120] },
};
let activeServer = 'fra';

// ---------- Helpers ----------
function rand(min, max, dec) {
  const v = Math.random() * (max - min) + min;
  return dec ? +v.toFixed(dec) : Math.round(v);
}

function flipUpdate(el, value) {
  el.classList.add('flip');
  setTimeout(() => {
    el.textContent = value;
    el.classList.remove('flip');
  }, 220);
}

// ---------- Sparkline generator ----------
function buildSpark(points, w=200, h=28, pad=3) {
  if (!points.length) return '';
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = (max - min) || 1;
  const step = (w - pad*2) / (points.length - 1);
  return points.map((p, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad*2) * (1 - (p - min) / range);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

// ---------- State ----------
const sparks = {
  ping:   Array.from({length: 36}, () => rand(22, 28, 1)),
  jitter: Array.from({length: 36}, () => rand(0.8, 1.6, 2)),
  loss:   Array.from({length: 36}, () => rand(0, 0.2, 2)),
};
const chart = {
  kenji: Array.from({length: 60}, () => rand(24, 30, 1)),
  isp:   Array.from({length: 60}, () => rand(55, 110, 1)),
};

const pingEl = document.getElementById('ping');
const jitterEl = document.getElementById('jitter');
const lossEl = document.getElementById('loss');
const radarLoc = document.getElementById('radarLoc');
const sparkPing = document.getElementById('sparkPing');
const sparkJit = document.getElementById('sparkJit');
const sparkLoss = document.getElementById('sparkLoss');
const lineKenji = document.getElementById('lineKenji');
const areaKenji = document.getElementById('areaKenji');
const lineIsp = document.getElementById('lineIsp');

// ---------- Big chart paths ----------
function buildChart() {
  const W = 600, H = 140, padX = 6, padY = 10;
  const stepK = (W - padX*2) / (chart.kenji.length - 1);
  const stepI = (W - padX*2) / (chart.isp.length - 1);

  const kMin = 18, kMax = 40;
  const kPts = chart.kenji.map((p, i) => {
    const x = padX + i * stepK;
    const y = padY + (H - padY*2) * (1 - (p - kMin) / (kMax - kMin));
    return [x, y];
  });
  const kPath = kPts.map((pt, i) => `${i ? 'L' : 'M'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');
  lineKenji.setAttribute('d', kPath);
  areaKenji.setAttribute('d', `${kPath} L${kPts[kPts.length-1][0].toFixed(1)},${H-padY} L${kPts[0][0].toFixed(1)},${H-padY} Z`);

  const iMin = 30, iMax = 140;
  const iPath = chart.isp.map((p, i) => {
    const x = padX + i * stepI;
    const y = padY + (H - padY*2) * (1 - (p - iMin) / (iMax - iMin));
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  lineIsp.setAttribute('d', iPath);
}

// ---------- Initial paint ----------
function repaintSparks() {
  sparkPing.setAttribute('d', buildSpark(sparks.ping));
  sparkJit.setAttribute('d',  buildSpark(sparks.jitter));
  sparkLoss.setAttribute('d', buildSpark(sparks.loss));
}
repaintSparks();
buildChart();

// ---------- Tick loop ----------
function tick() {
  const s = SERVERS[activeServer];

  const newPing   = rand(s.ping[0],   s.ping[1],   0);
  const newJitter = rand(s.jitter[0], s.jitter[1], 1);
  const newLoss   = rand(s.loss[0],   s.loss[1],   1);

  if (pingEl.textContent !== String(newPing))   flipUpdate(pingEl,   newPing);
  if (jitterEl.textContent !== String(newJitter)) flipUpdate(jitterEl, newJitter);
  if (lossEl.textContent !== String(newLoss))   flipUpdate(lossEl,   newLoss);

  sparks.ping.push(newPing);   sparks.ping.shift();
  sparks.jitter.push(newJitter); sparks.jitter.shift();
  sparks.loss.push(newLoss);   sparks.loss.shift();
  repaintSparks();

  chart.kenji.push(rand(s.ping[0] + 1, s.ping[1] + 2, 1));
  chart.kenji.shift();

  const spike = Math.random() < 0.18 ? rand(40, 70, 0) : 0;
  chart.isp.push(rand(s.ispBase[0], s.ispBase[1], 0) + spike);
  chart.isp.shift();
  buildChart();
}
setInterval(tick, 1400);

// ---------- Server tabs ----------
document.querySelectorAll('#serverTabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#serverTabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeServer = btn.dataset.server;
    radarLoc.textContent = SERVERS[activeServer].name;
    tick();
  });
});

// ---------- Orb parallax ----------
const orbs = document.querySelectorAll('.orb');
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5);
  const y = (e.clientY / window.innerHeight - 0.5);
  orbs.forEach((o, i) => {
    const k = (i + 1) * 8;
    o.style.transform = `translate(${x * k}px, ${y * k}px)`;
  });
}, { passive: true });

// ---------- 3D Tilt ----------
const tiltCards = document.querySelectorAll('[data-tilt]');
tiltCards.forEach(card => {
  let rect = null;
  card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
  card.addEventListener('mousemove', (e) => {
    if (!rect) rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -8;
    const ry = (px - 0.5) * 10;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    rect = null;
  });
});