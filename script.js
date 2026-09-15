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

// Apply saved light theme
if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    if (themeIcon) {
        themeIcon.textContent = "🌙";
    }

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );
    }
}

// Dark mode is the default
else {
    document.documentElement.removeAttribute("data-theme");
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
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        if (isLight) {
            // Switch to dark mode
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem(
                "portfolio-theme",
                "dark"
            );

            themeIcon.textContent = "☀️";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );
        } else {
            // Switch to light mode
            document.documentElement.setAttribute(
                "data-theme",
                "light"
            );
            localStorage.setItem(
                "portfolio-theme",
                "light"
            );
            themeIcon.textContent = "🌙";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
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

// The backend is a separate Flask API (see the
// p10-portfolio-contact-api project). When running the portfolio
// locally, requests go to the local Flask dev server. Once the API
// is deployed (e.g. on Render), replace PRODUCTION_API_URL below
// with that deployed URL.
const PRODUCTION_API_URL = "https://p10-portfolio-contact-api.onrender.com/api/contact";

const isLocalHost = ["localhost", "127.0.0.1", ""].includes(
    window.location.hostname
);

const CONTACT_API_URL = isLocalHost
    ? "http://127.0.0.1:5000/api/contact"
    : PRODUCTION_API_URL;

const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");

if (contactForm && formMessage) {
    const submitButton = contactForm.querySelector(
        'button[type="submit"]'
    );
    const defaultButtonText = submitButton
        ? submitButton.textContent
        : "Send Message";

    const setFormMessage = (text, status) => {
        formMessage.textContent = text;
        formMessage.classList.remove("is-success", "is-error");
        if (status === "success") {
            formMessage.classList.add("is-success");
        } else if (status === "error") {
            formMessage.classList.add("is-error");
        }
    };

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const messageInput = document.getElementById("message");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !email || !message) {
            setFormMessage("Please complete all fields.", "error");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
        }
        setFormMessage("Sending your message...", null);

        try {
            const response = await fetch(CONTACT_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, message })
            });

            let data = {};
            try {
                data = await response.json();
            } catch (parseError) {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to send your message right now. Please try again later."
                );
            }

            setFormMessage(
                data.message || `Thanks, ${name}! Your message has been sent.`,
                "success"
            );
            contactForm.reset();

        } catch (error) {
            setFormMessage(
                error.message ||
                "Something went wrong. Please try again later, or email me directly.",
                "error"
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = defaultButtonText;
            }
        }
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

const lightboxPrev =
  document.getElementById("lightbox-prev");

const lightboxNext =
  document.getElementById("lightbox-next");

const lightboxCounter =
  document.getElementById("lightbox-counter");


/*
 * All main project images.
 *
 * The images remain clickable even though
 * they are not wrapped in another element.
 */

const mainProjectImages =
  document.querySelectorAll(
    ".project-main-image img"
  );


/*
 * These variables keep track of the
 * currently opened project's screenshots.
 */

let currentGallery = [];

let currentImageIndex = 0;


/* =========================================
   BUILD GALLERY
========================================= */

function getProjectGallery(image) {

  const projectGallery =
    image.closest(".project-card")
      ?.querySelector(".project-thumbnails");

  if (!projectGallery) {
    return [];
  }


  const thumbnailElements =
    projectGallery.querySelectorAll(".thumbnail");


  return Array.from(thumbnailElements).map(
    (thumbnail) => ({
      src: thumbnail.dataset.image,
      alt: thumbnail.dataset.alt || ""
    })
  );
}


/* =========================================
   UPDATE LIGHTBOX IMAGE
========================================= */

function updateLightboxImage() {

  if (
    !lightboxImage ||
    currentGallery.length === 0
  ) {
    return;
  }


  const currentImage =
    currentGallery[currentImageIndex];


  lightboxImage.src =
    currentImage.src;


  lightboxImage.alt =
    currentImage.alt ||
    "Project screenshot";


  /*
   * Update screenshot counter.
   *
   * Example:
   * 1 / 5
   */

  if (lightboxCounter) {

    lightboxCounter.textContent =
      `${currentImageIndex + 1} / ${currentGallery.length}`;

  }


  /*
   * Hide arrows when there is only one
   * screenshot.
   */

  if (lightboxPrev) {

    lightboxPrev.hidden =
      currentGallery.length <= 1;

  }


  if (lightboxNext) {

    lightboxNext.hidden =
      currentGallery.length <= 1;

  }

}


/* =========================================
   OPEN LIGHTBOX
========================================= */

function openLightbox(image) {

  if (
    !lightbox ||
    !lightboxImage
  ) {
    return;
  }


  /*
   * Get every screenshot belonging to
   * the project that was clicked.
   */

  currentGallery =
    getProjectGallery(image);


  /*
   * If the project has no thumbnails,
   * fall back to the image that was clicked.
   */

  if (currentGallery.length === 0) {

    currentGallery = [
      {
        src: image.src,
        alt: image.alt
      }
    ];

  }


  /*
   * Find which screenshot is currently
   * being displayed.
   */

  const currentSrc =
    image.getAttribute("src");


  const matchingIndex =
    currentGallery.findIndex(
      (item) =>
        item.src === currentSrc
    );


  currentImageIndex =
    matchingIndex >= 0
      ? matchingIndex
      : 0;


  updateLightboxImage();


  /*
   * Show lightbox.
   */

  lightbox.hidden = false;


  /*
   * Prevent the page behind the lightbox
   * from scrolling.
   */

  document.body.style.overflow = "hidden";


  /*
   * Focus the close button for
   * keyboard accessibility.
   */

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


  if (lightboxCounter) {
    lightboxCounter.textContent = "";
  }


  /*
   * Reset gallery state.
   */

  currentGallery = [];

  currentImageIndex = 0;


  /*
   * Restore page scrolling.
   */

  document.body.style.overflow = "";

}


/* =========================================
   NEXT IMAGE
========================================= */

function showNextImage() {

  if (currentGallery.length <= 1) {
    return;
  }


  /*
   * Move to the next image.
   *
   * The modulo operator makes the gallery
   * loop back to the first screenshot.
   */

  currentImageIndex =
    (currentImageIndex + 1) %
    currentGallery.length;


  updateLightboxImage();

}


/* =========================================
   PREVIOUS IMAGE
========================================= */

function showPreviousImage() {

  if (currentGallery.length <= 1) {
    return;
  }


  /*
   * Move to the previous image.
   *
   * If we're at the first image,
   * go back to the last image.
   */

  currentImageIndex =
    (
      currentImageIndex -
      1 +
      currentGallery.length
    ) %
    currentGallery.length;


  updateLightboxImage();

}


/* =========================================
   CLICK MAIN PROJECT IMAGE
========================================= */

mainProjectImages.forEach((image) => {

  image.addEventListener(
    "click",
    () => {

      openLightbox(image);

    }
  );

});


/* =========================================
   NEXT BUTTON
========================================= */

if (lightboxNext) {

  lightboxNext.addEventListener(
    "click",
    (event) => {

      /*
       * Prevent the click from reaching
       * the lightbox backdrop.
       */

      event.stopPropagation();

      showNextImage();

    }
  );

}


/* =========================================
   PREVIOUS BUTTON
========================================= */

if (lightboxPrev) {

  lightboxPrev.addEventListener(
    "click",
    (event) => {

      /*
       * Prevent the click from reaching
       * the lightbox backdrop.
       */

      event.stopPropagation();

      showPreviousImage();

    }
  );

}


/* =========================================
   CLOSE BUTTON
========================================= */

if (lightboxClose) {

  lightboxClose.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      closeLightbox();

    }
  );

}


/* =========================================
   CLICK BACKDROP
========================================= */

if (lightbox) {

  lightbox.addEventListener(
    "click",
    (event) => {

      /*
       * Close only when clicking the dark
       * background itself.
       */

      if (event.target === lightbox) {

        closeLightbox();

      }

    }
  );

}


/* =========================================
   KEYBOARD NAVIGATION
========================================= */

document.addEventListener(
  "keydown",
  (event) => {

    /*
     * Don't do anything if the lightbox
     * isn't open.
     */

    if (
      !lightbox ||
      lightbox.hidden
    ) {
      return;
    }


    /* Escape = close */

    if (event.key === "Escape") {

      closeLightbox();

      return;

    }


    /* ArrowRight = next */

    if (event.key === "ArrowRight") {

      event.preventDefault();

      showNextImage();

      return;

    }


    /* ArrowLeft = previous */

    if (event.key === "ArrowLeft") {

      event.preventDefault();

      showPreviousImage();

    }

  }
);