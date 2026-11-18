// Argo Maris — interazioni del sito
(() => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // menu mobile
  const burger = document.querySelector('.burger');
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav a, .nav-cta a').forEach(a =>
    a.addEventListener('click', () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }));

  // comparsa progressiva
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        const sibs = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
        e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 5) * 90 + 'ms';
        e.target.classList.add('in'); io.unobserve(e.target);
      }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));

  // parallasse leggero sull'hero
  const hero = document.querySelector('.hero-image');
  window.addEventListener('scroll', () => {
    const y = window.scrollY; if (y < innerHeight) hero.style.translate = `0 ${y * 0.25}px`;
  }, { passive: true });

  document.getElementById('year').textContent = new Date().getFullYear();

  // modulo contatti -> email
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const to = document.querySelector('[data-fill="email"]').textContent.trim();
    const body = `Nome/azienda: ${f.get('nome')}\nEmail: ${f.get('email')}\nTelefono: ${f.get('tel')}\nAttività: ${f.get('tipo')}\n\n${f.get('msg')}`;
    location.href = `mailto:${to}?subject=${encodeURIComponent('Richiesta dal sito – ' + f.get('nome'))}&body=${encodeURIComponent(body)}`;
  });
})();
