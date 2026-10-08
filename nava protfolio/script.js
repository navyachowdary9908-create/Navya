const header = document.querySelector('.site-header');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
header.classList.toggle('scrolled', window.scrollY > 10);
const h = document.documentElement.scrollHeight - innerHeight;
progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
}, { passive: true });
toggle.addEventListener('click', () => {
const open = links.classList.toggle('open');
toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
links.addEventListener('click', (e) => { if (e.target.tagName === 'A') links.classList.remove('open'); });
const io = new IntersectionObserver((entries) => {
entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
const cio = new IntersectionObserver((entries) => {
entries.forEach((en) => {
if (!en.isIntersecting) return;
const el = en.target; cio.unobserve(el);
const target = parseFloat(el.dataset.count);
const dec = parseInt(el.dataset.decimals || '0', 10);
const suffix = el.dataset.suffix || (dec ? '+' : '+');
const dur = 1300; const t0 = performance.now();
const tick = (t) => {
const p = Math.min(1, (t - t0) / dur);
const e = 1 - Math.pow(1 - p, 3);
el.textContent = (target * e).toFixed(dec) + suffix;
if (p < 1) requestAnimationFrame(tick);
};
requestAnimationFrame(tick);
});
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));
const sections = [...document.querySelectorAll('main section[id]')];
const navA = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sio = new IntersectionObserver((entries) => {
entries.forEach((en) => {
if (en.isIntersecting) navA.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
});
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach((s) => sio.observe(s));
document.querySelectorAll('.acc-head').forEach((btn) => {
btn.addEventListener('click', () => {
const item = btn.parentElement;
const open = item.classList.contains('open');
document.querySelectorAll('.acc-item.open').forEach((o) => { o.classList.remove('open'); o.querySelector('.acc-head span').textContent = '+'; });
if (!open) { item.classList.add('open'); btn.querySelector('span').textContent = '-'; }
btn.setAttribute('aria-expanded', String(!open));
});
});
document.querySelectorAll('.chip[data-filter]').forEach((chip) => {
chip.addEventListener('click', () => {
document.querySelectorAll('.chip[data-filter]').forEach((c) => c.classList.remove('active'));
chip.classList.add('active');
const f = chip.dataset.filter;
document.querySelectorAll('.skill-card').forEach((card) => {
card.style.display = (f === 'all' || card.dataset.cat === f) ? '' : 'none';
});
});
});
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
const themeBtn = document.getElementById('themeToggle');
const saved = localStorage.getItem('nk-theme');
if (saved) document.documentElement.setAttribute('data-theme', saved);
function syncIcon() {
const dark = document.documentElement.getAttribute('data-theme') === 'dark';
themeBtn.innerHTML = dark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}
syncIcon();
themeBtn.addEventListener('click', () => {
const dark = document.documentElement.getAttribute('data-theme') === 'dark';
document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
localStorage.setItem('nk-theme', dark ? 'light' : 'dark');
syncIcon();
});
document.getElementById('contactForm').addEventListener('submit', (e) => {
e.preventDefault();
const n = document.getElementById('cfName').value.trim();
const em = document.getElementById('cfEmail').value.trim();
const m = document.getElementById('cfMsg').value.trim();
const subject = encodeURIComponent('SAP Basis opportunity for Navateja Kakani - from ' + n);
const body = encodeURIComponent('Name: ' + n + '\nEmail: ' + em + '\n\n' + m);
location.href = 'mailto:Navatejakakani@gmail.com?subject=' + subject + '&body=' + body;
});
document.getElementById('year').textContent = new Date().getFullYear();
