/* =========================================================
   Shubham Mane — portfolio interactions
   Core UX (theme, nav, reveal) + an advanced motion layer.
   Every advanced feature checks for prefers-reduced-motion
   and bails out cleanly on touch/coarse-pointer devices.
========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const canAnimate = !prefersReducedMotion;
const canUseCursor = canAnimate && isFinePointer;

/* ---------- Dark mode toggle (persists for the session) ---------- */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = sessionStorage.getItem('theme');
if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      sessionStorage.setItem('theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      sessionStorage.setItem('theme', 'dark');
    }
  });
}

/* ---------- Mobile hamburger menu ---------- */
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ---------- Active nav: mark current page link active across the site ---------- */
const currentPath = window.location.pathname;
const currentPage = (currentPath.split('/').pop() || 'index.html');
const inProjectSubpage = currentPath.includes('/projects/');
document.querySelectorAll('nav.tabs a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (!href.startsWith('#')) {
    const linkPage = href.split('/').pop();
    const isMatch = linkPage === currentPage || (linkPage === 'index.html' && currentPage === '');
    const isProjectsWhileInSubpage = inProjectSubpage && linkPage === 'projects.html';
    if (isMatch || isProjectsWhileInSubpage) {
      link.classList.add('active');
    }
  }
});

/* ---------- Sliding pill indicator behind the active tab ---------- */
const tabsNav = document.querySelector('nav.tabs');
let tabIndicator = null;
if (tabsNav) {
  tabIndicator = document.createElement('span');
  tabIndicator.className = 'tab-indicator';
  tabsNav.prepend(tabIndicator);

  const moveIndicator = (animate = true) => {
    const active = tabsNav.querySelector('a.active');
    if (!active) { tabIndicator.style.width = '0'; return; }
    tabIndicator.classList.toggle('tab-indicator-anim', animate);
    const navRect = tabsNav.getBoundingClientRect();
    const linkRect = active.getBoundingClientRect();
    tabIndicator.style.left = (linkRect.left - navRect.left) + 'px';
    tabIndicator.style.width = linkRect.width + 'px';
  };

  // position instantly on load (no slide-in from zero), then enable animation
  requestAnimationFrame(() => {
    moveIndicator(false);
    requestAnimationFrame(() => tabIndicator.classList.add('tab-indicator-anim'));
  });

  window.addEventListener('resize', () => moveIndicator(false));

  // watch for .active class changes caused by scroll-spy
  const indicatorObserver = new MutationObserver(() => moveIndicator(true));
  tabsNav.querySelectorAll('a').forEach(a => {
    indicatorObserver.observe(a, { attributes: true, attributeFilter: ['class'] });
  });
}

/* ---------- Scroll-spy: highlight active nav link based on section in view ---------- */
const sections = document.querySelectorAll('main section[id]');
if (sections.length) {
  const desktopLinks = document.querySelectorAll('nav.tabs a');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        [...desktopLinks, ...mobileLinks].forEach(link => {
          if ((link.getAttribute('href') || '').startsWith('#')) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach(sec => spyObserver.observe(sec));
}

/* ---------- Reveal-on-scroll animation (staggered within each section) ---------- */
const revealEls = document.querySelectorAll('.reveal');
revealEls.forEach((el, i) => {
  el.style.setProperty('--reveal-delay', Math.min(i * 0.06, 0.3) + 's');
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* also stagger the grid children inside common card containers */
document.querySelectorAll('.skills-grid, .projects-grid-full, .blog-list, .placeholder-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = Math.min(i * 0.08, 0.4) + 's';
  });
});

/* ---------- Auto-updating copyright year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Back to top button ---------- */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Copy to clipboard ---------- */
const copyToast = document.getElementById('copyToast');
let toastTimer;
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    if (copyToast) {
      copyToast.textContent = `Copied "${text}"`;
      copyToast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => copyToast.classList.remove('show'), 1800);
    }
  });
});

/* ---------- Contact form (contact.html) - builds a mailto link, no backend needed ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const subject = encodeURIComponent(`Portfolio contact from ${name || 'website visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:wlfshubm@gmail.com?subject=${subject}&body=${body}`;
  });
}

/* =========================================================
   ADVANCED MOTION LAYER
========================================================= */

/* ---------- Scroll progress bar ---------- */
(function scrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Film-grain ambient overlay ---------- */
if (canAnimate) {
  const grain = document.createElement('div');
  grain.className = 'grain-overlay';
  document.body.appendChild(grain);
}

/* ---------- Page loader ---------- */
(function pageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  const textEl = loader.querySelector('.loader-text');
  const barEl = loader.querySelector('.loader-bar span');
  const alreadyVisited = sessionStorage.getItem('siteVisited');

  if (textEl) {
    const word = textEl.textContent.trim();
    textEl.textContent = '';
    word.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'lchar';
      span.textContent = ch;
      span.style.transition = `opacity .25s ease ${i * 0.045}s`;
      textEl.appendChild(span);
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        textEl.querySelectorAll('.lchar').forEach(s => s.style.opacity = '1');
      });
    });
  }

  const minDelay = alreadyVisited ? 260 : 750;
  if (barEl) requestAnimationFrame(() => { barEl.style.width = '100%'; });

  const hide = () => {
    loader.classList.add('loader-hidden');
    sessionStorage.setItem('siteVisited', '1');
    setTimeout(() => loader.remove(), 650);
  };
  window.addEventListener('load', () => setTimeout(hide, minDelay));
  // safety net in case 'load' already fired or takes too long
  setTimeout(hide, 2500);
})();

/* ---------- Hero name scramble-decode ---------- */
(function scrambleHero() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName || !canAnimate) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*';
  const lines = heroName.innerHTML.split('<br>');
  heroName.innerHTML = '';
  lines.forEach((line, li) => {
    if (li > 0) heroName.appendChild(document.createElement('br'));
    line.split('').forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'hchar';
      span.dataset.final = ch;
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      heroName.appendChild(span);
    });
  });
  const chars = heroName.querySelectorAll('.hchar');
  chars.forEach((span, i) => {
    const final = span.dataset.final;
    if (final === ' ') return;
    let frame = 0;
    const totalFrames = 10 + Math.floor(Math.random() * 6);
    const startDelay = i * 35;
    setTimeout(() => {
      const iv = setInterval(() => {
        frame++;
        if (frame >= totalFrames) {
          span.textContent = final;
          clearInterval(iv);
        } else {
          span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }, 32);
    }, startDelay);
  });
})();

/* ---------- Custom cursor (dot + lagging ring) ---------- */
if (canUseCursor) {
  document.documentElement.classList.add('has-cursor');
  const dot = document.createElement('div');
  dot.className = 'cursor-dot cursor-hidden';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring cursor-hidden';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;
  let cursorVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    if (!cursorVisible) {
      cursorVisible = true;
      dot.classList.remove('cursor-hidden');
      ring.classList.remove('cursor-hidden');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.classList.add('cursor-hidden');
    ring.classList.add('cursor-hidden');
    cursorVisible = false;
  });

  function ringLoop() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(ringLoop);
  }
  requestAnimationFrame(ringLoop);

  const hoverTargets = 'a, button, .btn, input, textarea, .copy-btn, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.remove('cursor-hover');
  });
}

/* ---------- Magnetic pull for buttons & icon controls ---------- */
if (canAnimate && isFinePointer) {
  const magneticEls = document.querySelectorAll('.btn, .theme-toggle, .navlinks a, .back-to-top, .menu-toggle');
  magneticEls.forEach(el => {
    const strength = el.classList.contains('btn') ? 0.25 : 0.35;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ---------- Ripple effect on .btn click ---------- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

/* ---------- Tilt + spotlight on cards ---------- */
if (canAnimate && isFinePointer) {
  const tiltEls = document.querySelectorAll('.skill-card, .project-card, .blog-card, .contact-card');
  tiltEls.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = x / rect.width - 0.5;
      const cy = y / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-cy * 6).toFixed(2)}deg) rotateY(${(cx * 6).toFixed(2)}deg) translateZ(0) scale(1.015)`;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------- Ambient hero blobs (index page only) ---------- */
(function heroBlobs() {
  const hero = document.querySelector('.hero-grid');
  if (!hero || !canAnimate) return;
  const b1 = document.createElement('div');
  b1.className = 'hero-blob b1';
  const b2 = document.createElement('div');
  b2.className = 'hero-blob b2';
  hero.parentElement.insertBefore(b1, hero);
  hero.parentElement.insertBefore(b2, hero);
})();
