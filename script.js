// ===============================
// Smooth scrolling for in-page links
// ===============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===============================
// Sticky header shadow on scroll
// ===============================
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

// ===============================
// Fade-in reveal for sections
// ===============================
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

// ===============================
// Formspree Contact Form + Popup
// ===============================
const form = document.getElementById("contact-form");
const popup = document.getElementById("popup-overlay");
const closePopup = document.getElementById("close-popup");

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
        popup.classList.add("active");
        form.reset();
        setTimeout(() => popup.classList.remove("active"), 5000); // Auto close in 5s
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  });
}

if (closePopup) {
  closePopup.addEventListener("click", () => {
    popup.classList.remove("active");
  });
}

// ===============================
// Highlight current page in navbar
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("nav a");
  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage || (href === "index.html" && currentPage === "")) {
      link.classList.add("active");
    }
  });
});
