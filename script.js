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
        const mainImage = document.getElementById(`${galleryName}-main-image`);
        const gallery = thumbnail.closest(".project-gallery");

        if (!imageSource) {
            return;
        }

        if (gallery?.querySelector(".project-thumbnails")?.dataset.galleryMode === "lightbox") {
            const thumbnailImage = thumbnail.querySelector("img");

            if (thumbnailImage) {
                openLightbox(thumbnailImage, imageSource);
            }
        } else {
            if (!mainImage) {
                return;
            }

            // Update main image
            mainImage.src = imageSource;
            if (imageAlt) {
                mainImage.alt = imageAlt;
            }

            // Update the lightbox button
            const mainImageButton = gallery?.querySelector(".main-image-button");

            if (mainImageButton) {
                mainImageButton.dataset.image =
                    imageSource;
                mainImageButton.dataset.alt =
                    imageAlt || mainImage.alt;
            }
        }

        // Update active thumbnail
        const projectThumbnails = document.querySelectorAll(`.thumbnail[data-gallery="${galleryName}"]`);

        projectThumbnails.forEach((item) => {
            item.classList.remove("active");
            item.setAttribute(
                "aria-current",
                "false"
            );
            if (item.hasAttribute("aria-pressed")) {
                item.setAttribute("aria-pressed", "false");
            }
        });

        thumbnail.classList.add("active");
        thumbnail.setAttribute(
            "aria-current",
            "true"
        );
        if (thumbnail.hasAttribute("aria-pressed")) {
            thumbnail.setAttribute("aria-pressed", "true");
        }
    });
});

/* =========================================
   PROJECT IMAGE LIGHTBOX
========================================= */
const lightbox = document.getElementById("image-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxCounter = document.getElementById("lightbox-counter");
const mainProjectImages = document.querySelectorAll(".project-main-image img");

let currentGallery = [];
let currentImageIndex = 0;

/* =========================================
   BUILD GALLERY
========================================= */
function getProjectGallery(image) {
    const projectGallery = image.closest(".project-card") ?.querySelector(".project-thumbnails");

    if (!projectGallery) {
        return [];
    }

    const thumbnailElements = projectGallery.querySelectorAll(".thumbnail");

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

    const currentImage = currentGallery[currentImageIndex];
    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.alt || "Project screenshot";

    if (lightboxCounter) {
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentGallery.length}`;
    }

    if (lightboxPrev) {
        lightboxPrev.hidden = currentGallery.length <= 1;
    }

    if (lightboxNext) {
        lightboxNext.hidden = currentGallery.length <= 1;
    }
}

/* =========================================
   OPEN LIGHTBOX
========================================= */
function openLightbox(image, selectedSource) {
    if (
        !lightbox || !lightboxImage
    ) {
        return;
    }

    currentGallery = image.dataset.lightboxSingle === "true"
        ? []
        : getProjectGallery(image);

    if (currentGallery.length === 0) {
        currentGallery = [
            {
                src: image.src,
                alt: image.alt
            }
        ];
    }

    const currentSrc = selectedSource || image.getAttribute("src");
    const matchingIndex = currentGallery.findIndex(
        (item) => item.src === currentSrc
    );

    currentImageIndex = matchingIndex >= 0 ? matchingIndex : 0;

    updateLightboxImage();
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

    if (lightboxCounter) {
        lightboxCounter.textContent = "";
    }

    currentGallery = [];
    currentImageIndex = 0;
    document.body.style.overflow = "";
}

/* =========================================
   NEXT IMAGE
========================================= */
function showNextImage() {
    if (currentGallery.length <= 1) {
        return;
    }

    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    updateLightboxImage();
}

/* =========================================
   PREVIOUS IMAGE
========================================= */
function showPreviousImage() {
    if (currentGallery.length <= 1) {
        return;
    }

    currentImageIndex = (
        currentImageIndex - 1 + currentGallery.length
    ) % currentGallery.length;
    updateLightboxImage();
}

/* =========================================
   CLICK MAIN PROJECT IMAGE
========================================= */
mainProjectImages.forEach((image) => {
    image.addEventListener(
        "click", () => {
            openLightbox(image);
        }
    );
});

/* =========================================
   NEXT BUTTON
========================================= */
if (lightboxNext) {
    lightboxNext.addEventListener(
        "click", (event) => {
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
        "click", (event) => {
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
        "click", (event) => {
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
        "click", (event) => {
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
    "keydown", (event) => {
        if (
            !lightbox || lightbox.hidden
        ) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            showNextImage();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            showPreviousImage();
        }
    }
);

/* =========================================
   PROJECT FILTERING + PAGINATION
========================================= */
const projectsGrid = document.getElementById("projects-grid");
const projectsPagination = document.getElementById("projects-pagination");
const projectsPrev = document.getElementById("projects-prev");
const projectsNext = document.getElementById("projects-next");
const projectsPageNumbers = document.getElementById("projects-page-numbers");
const projectFilters = document.querySelectorAll(".project-filter");
const PROJECTS_PER_PAGE = 4;

let currentProjectsPage = 1;
let currentProjectFilter = "all";

if (
    projectsGrid &&
    projectsPagination &&
    projectsPrev &&
    projectsNext &&
    projectsPageNumbers
) {

    const projectCards = Array.from(
        projectsGrid.querySelectorAll(".project-card")
    );

    /* =========================================
       GET FILTERED PROJECTS
    ========================================= */
    function getFilteredProjects() {
        if (currentProjectFilter === "all") {
            return projectCards;
        }
        return projectCards.filter((card) => {
            const languages =
                card.dataset.languages
                    ?.split(",")
                    .map((language) => language.trim()) || [];
            return languages.includes(
                currentProjectFilter
            );
        });
    }

    /* =========================================
       SHOW PROJECT PAGE
    ========================================= */
    function showProjectsPage(page, shouldScroll = true) {
        const filteredProjects = getFilteredProjects();
        const totalProjects = filteredProjects.length;
        const totalPages = Math.ceil(
            totalProjects /
            PROJECTS_PER_PAGE
        );

        if (totalProjects === 0) {
            projectCards.forEach((card) => {
                card.hidden = true;
            });
            projectsPagination.hidden = true;
            return;
        }

        currentProjectsPage = Math.max(
            1, Math.min(
                page, 
                totalPages
            )
        );

        const startIndex = (currentProjectsPage - 1) * PROJECTS_PER_PAGE;
        const endIndex = startIndex + PROJECTS_PER_PAGE;

        projectCards.forEach((card) => {
            card.hidden = true;
        });

        filteredProjects.forEach(
            (card, index) => {
                const shouldShow = index >= startIndex && index < endIndex;
                if (shouldShow) {
                    card.hidden = false;
                    card.style.animation = "none";
                    void card.offsetWidth;
                    card.style.animation = "fadeUp 0.6s ease both";
                }
            }
        );
        updatePagination(totalPages);
        if (shouldScroll) {
            const projectsSection = document.getElementById("projects");
            if (projectsSection) {
                projectsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    }

    /* =========================================
       UPDATE PAGINATION
    ========================================= */
    function updatePagination(totalPages) {
        projectsPageNumbers.innerHTML = "";
        if (totalPages <= 1) {
            projectsPagination.hidden = true;
            return;
        }

        projectsPagination.hidden = false;
        projectsPrev.disabled = currentProjectsPage === 1;
        projectsNext.disabled = currentProjectsPage === totalPages;

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "pagination-page";
            button.textContent = page;
            button.setAttribute(
                "aria-label",
                `Go to projects page ${page}`
            );
            if (
                page ===
                currentProjectsPage
            ) {
                button.classList.add("active");
                button.setAttribute(
                    "aria-current",
                    "page"
                );
            }
            button.addEventListener(
                "click", () => {
                    showProjectsPage(page);
                }
            );
            projectsPageNumbers.appendChild(
                button
            );
        }
    }

    /* =========================================
       FILTER PROJECTS
    ========================================= */
    projectFilters.forEach((filterButton) => {
        filterButton.addEventListener(
            "click", () => {
                currentProjectFilter = filterButton.dataset.filter || "all";
                currentProjectsPage = 1;
                projectFilters.forEach(
                    (button) => {
                        const isActive = button === filterButton;
                        button.classList.toggle(
                            "active",
                            isActive
                        );
                        button.setAttribute(
                            "aria-pressed",
                            String(isActive)
                        );
                    }
                );
                showProjectsPage(1);
            }
        );
    });

    /* =========================================
       PREVIOUS PAGE
    ========================================= */
    projectsPrev.addEventListener(
        "click", () => {
            if (
                currentProjectsPage > 1
            ) {
                showProjectsPage(
                    currentProjectsPage - 1
                );
            }
        }
    );

    /* =========================================
       NEXT PAGE
    ========================================= */
    projectsNext.addEventListener(
        "click", () => {
            const filteredProjects = getFilteredProjects();
            const totalPages = Math.ceil(
                filteredProjects.length /
                PROJECTS_PER_PAGE
            );

            if (
                currentProjectsPage <
                totalPages
            ) {
                showProjectsPage(
                    currentProjectsPage + 1
                );
            }
        }
    );

    /* =========================================
       INITIALIZE
    ========================================= */
    showProjectsPage(
        1,
        false
    );
}