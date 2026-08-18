// Dark mode toggle (persists for the session)
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

// Mobile hamburger menu
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

// Active nav: mark the current page link active across the site
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

// Scroll-spy: highlight active nav link based on section in view (home page only)
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

// Reveal-on-scroll animation
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Auto-updating copyright year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Back to top button
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Copy to clipboard
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

// Contact form (contact.html) - submits to /api/contact, a Vercel serverless
// function that sends the message via Resend. Falls back to a mailto link if
// the request fails outright (e.g. network error).
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('cf-submit');
  const statusEl = document.getElementById('cf-status');

  const setStatus = (text, type) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'form-status' + (type ? ` ${type}` : '');
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const company = document.getElementById('cf-company').value.trim(); // honeypot

    if (!name || !email || !message) {
      setStatus('Please fill in your name, email, and message.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
    setStatus('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('Thanks! Your message has been sent — I\'ll get back to you soon.', 'success');
        contactForm.reset();
      } else {
        setStatus(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      // Network-level failure — fall back to opening the user's email client.
      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      setStatus('Couldn\'t reach the server — opening your email client instead.', 'error');
      window.location.href = `mailto:wlfshubm@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    }
  });
}
