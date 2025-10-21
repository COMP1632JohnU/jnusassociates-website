// Smooth scrolling for in-page links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Sticky header shadow on scroll
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

// Fade-in reveal for sections
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('section').forEach(section => observer.observe(section));

// ✅ Add this Formspree code BELOW the existing code
const form = document.querySelector("form");
const successMsg = document.querySelector(".form-success");
const errorMsg = document.querySelector(".form-error");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        successMsg.style.display = "block";
        form.reset();
      } else {
        errorMsg.style.display = "block";
      }
    } catch (err) {
      errorMsg.style.display = "block";
    }
  });
}
