const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
    menuToggle.setAttribute(
      "aria-label",
      isOpen
        ? "Close navigation menu"
        : "Open navigation menu"
    );
  });


  // Close menu after clicking a navigation link

  const navigationLinks = navLinks.querySelectorAll("a");
  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    });
  });

}


/* =========================================
   DARK / LIGHT THEME
========================================= */

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  if (themeIcon) {
    themeIcon.textContent = "☀️";
  }
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      "Switch to light mode"
    );
  }
}


if (themeToggle) {

  themeToggle.addEventListener("click", () => {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(
        "portfolio-theme",
        "light"
      );
      themeIcon.textContent = "🌙";
      themeToggle.setAttribute(
        "aria-label",
        "Switch to dark mode"
      );
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        "dark"
      );
      localStorage.setItem(
        "portfolio-theme",
        "dark"
      );
      themeIcon.textContent = "☀️";
      themeToggle.setAttribute(
        "aria-label",
        "Switch to light mode"
      );
    }
  });
}

/* =========================================
   CURRENT YEAR
========================================= */

const currentYear = document.getElementById("current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* =========================================
   CONTACT FORM
========================================= */

const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    if (!name || !email || !message) {
      formMessage.textContent =
        "Please complete all fields.";
      return;
    }
    formMessage.textContent =
      `Thanks, ${name}! Your message has been received.`;
    contactForm.reset();
  });
}

/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements = document.querySelectorAll(
  ".skill-card, .certification-card, .project-card, .contact-item"
);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation =
          "fadeUp 0.6s ease both";
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1
  }
);


revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================
   PROJECT SCREENSHOT GALLERIES
========================================= */

const thumbnails = document.querySelectorAll(".thumbnail");

thumbnails.forEach((thumbnail) => {

  thumbnail.addEventListener("click", () => {

    const galleryName = thumbnail.dataset.gallery;
    const imageSource = thumbnail.dataset.image;
    const imageAlt = thumbnail.dataset.alt;

    const mainImage = document.getElementById(
      `${galleryName}-main-image`
    );

    if (!mainImage || !imageSource) {
      return;
    }


    // Update main image
    mainImage.src = imageSource;

    if (imageAlt) {
      mainImage.alt = imageAlt;
    }


    // Update the lightbox button
    const gallery =
      thumbnail.closest(".project-gallery");

    const mainImageButton =
      gallery?.querySelector(".main-image-button");

    if (mainImageButton) {
      mainImageButton.dataset.image =
        imageSource;

      mainImageButton.dataset.alt =
        imageAlt || mainImage.alt;
    }


    // Update active thumbnail
    const projectThumbnails =
      document.querySelectorAll(
        `.thumbnail[data-gallery="${galleryName}"]`
      );

    projectThumbnails.forEach((item) => {

      item.classList.remove("active");

      item.setAttribute(
        "aria-current",
        "false"
      );

    });


    thumbnail.classList.add("active");

    thumbnail.setAttribute(
      "aria-current",
      "true"
    );

  });

});


/* =========================================
   PROJECT IMAGE LIGHTBOX
========================================= */

const lightbox =
  document.getElementById("image-lightbox");

const lightboxImage =
  document.getElementById("lightbox-image");

const lightboxClose =
  document.getElementById("lightbox-close");


/* =========================================
   OPEN LIGHTBOX
========================================= */

function openLightbox(imageSource, imageAlt) {

  if (!lightbox || !lightboxImage) {
    return;
  }


  lightboxImage.src = imageSource;

  lightboxImage.alt =
    imageAlt || "Project screenshot";


  lightbox.hidden = false;

  document.body.style.overflow = "hidden";


  if (lightboxClose) {
    lightboxClose.focus();
  }

}


/* =========================================
   CLOSE LIGHTBOX
========================================= */

function closeLightbox() {

  if (!lightbox) {
    return;
  }


  lightbox.hidden = true;


  if (lightboxImage) {
    lightboxImage.src = "";
    lightboxImage.alt = "";
  }


  document.body.style.overflow = "";

}


/* =========================================
   MAIN IMAGE BUTTONS
========================================= */

const mainImageButtons =
  document.querySelectorAll(
    ".main-image-button"
  );


mainImageButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const imageSource =
      button.dataset.image;

    const imageAlt =
      button.dataset.alt;


    if (!imageSource) {
      return;
    }


    openLightbox(
      imageSource,
      imageAlt
    );

  });

});


/* =========================================
   CLOSE BUTTON
========================================= */

if (lightboxClose) {

  lightboxClose.addEventListener(
    "click",
    closeLightbox
  );

}


/* =========================================
   CLICK BACKDROP
========================================= */

if (lightbox) {

  lightbox.addEventListener(
    "click",
    (event) => {

      if (event.target === lightbox) {
        closeLightbox();
      }

    }
  );

}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      lightbox &&
      !lightbox.hidden
    ) {
      closeLightbox();
    }

  }
);