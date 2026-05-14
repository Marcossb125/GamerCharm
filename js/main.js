/* ─── Navbar scroll effect ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 60
    ? 'rgba(10,11,20,0.98)'
    : 'rgba(10,11,20,0.85)';
});

/* ─── Mobile nav toggle ─── */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  navMenu.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => navMenu.classList.remove('open'))
  );
}

/* ─── Active nav link ─── */
const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href && currentPath.endsWith(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
    link.classList.add('active');
  }
});

/* ─── Hero particles ─── */
const canvas = document.getElementById('particles');
if (canvas) {
  const count = 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random()*3+1}px;
      height:${Math.random()*3+1}px;
      background:${Math.random()>0.5?'#7c3aed':'#06b6d4'};
      border-radius:50%;
      left:${Math.random()*100}%;
      bottom:-10px;
      opacity:0;
      animation: particle ${Math.random()*10+8}s linear ${Math.random()*5}s infinite;
    `;
    canvas.appendChild(p);
  }
}

/* ─── Intersection Observer fade-in ─── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .universe-card, .product-card, .content-block').forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(30px);transition:opacity 0.6s ease,transform 0.6s ease;';
  observer.observe(el);
});
