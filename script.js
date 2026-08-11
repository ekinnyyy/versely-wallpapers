document.getElementById("year").textContent = new Date().getFullYear();

const grid = document.getElementById("wallpaper-grid");
const dialog = document.getElementById("preview-dialog");
const preview = document.getElementById("preview-image");

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function getImages(wallpaper) {
  // New stable format: image_1 ... image_5
  const newImages = [
    wallpaper.image_1,
    wallpaper.image_2,
    wallpaper.image_3,
    wallpaper.image_4,
    wallpaper.image_5
  ].filter(Boolean);

  if (newImages.length) {
    return newImages;
  }

  // Compatibility with your older carousel entries
  if (Array.isArray(wallpaper.images) && wallpaper.images.length) {
    return wallpaper.images.filter(Boolean).slice(0, 5);
  }

  // Compatibility with oldest single-image entries
  if (wallpaper.image) {
    return [wallpaper.image];
  }

  return [];
}

function cardTemplate(wallpaper, cardIndex) {
  const images = getImages(wallpaper);

  if (!images.length) return "";

  const title = esc(wallpaper.title || "Versely Wallpaper");
  const category = esc(wallpaper.category || "");
  const creditName = esc(wallpaper.credit_name || "");
  const creditUrl = wallpaper.credit_url || "";

  const slides = images.map((image, imageIndex) => `
    <div class="carousel-slide">
      <button
        class="image-button"
        type="button"
        data-full="${esc(image)}"
        aria-label="Preview ${title}, version ${imageIndex + 1}">
        <img
          class="wallpaper-image"
          src="${esc(image)}"
          alt="${title} — version ${imageIndex + 1}"
          loading="lazy">
      </button>
    </div>
  `).join("");

  const hasMultiple = images.length > 1;

  const dots = hasMultiple
    ? `
      <div class="carousel-dots">
        ${images.map((_, i) => `
          <button
            type="button"
            class="carousel-dot ${i === 0 ? "active" : ""}"
            data-index="${i}"
            aria-label="Show version ${i + 1}">
          </button>
        `).join("")}
      </div>
    `
    : "";

  const arrows = hasMultiple
    ? `
      <button type="button" class="carousel-arrow prev" aria-label="Previous version">‹</button>
      <button type="button" class="carousel-arrow next" aria-label="Next version">›</button>
    `
    : "";

  const counter = hasMultiple
    ? `<span class="variant-counter"><span class="counter-current">1</span>/${images.length}</span>`
    : "";

  const credit = creditName
    ? `
      <p class="credit">
        Credit:
        ${creditUrl
          ? `<a href="${creditUrl}" target="_blank" rel="noopener noreferrer">${creditName} ↗</a>`
          : creditName}
      </p>
    `
    : "";

  return `
    <article class="wallpaper-card" data-card-index="${cardIndex}">
      <div class="carousel" data-index="0" data-count="${images.length}">
        <div class="carousel-track">
          ${slides}
        </div>

        ${arrows}
        ${dots}
        ${counter}
      </div>

      <div class="card-body">
        <div>
          <h3>${title}</h3>
          ${category ? `<p class="category">${category}</p>` : ""}
          ${credit}
        </div>

        <div class="card-actions">
          ${hasMultiple
            ? `<span class="current-variant">Version <span class="version-number">1</span></span>`
            : ""}

          <a
            class="download-button"
            href="${esc(images[0])}"
            download>
            Download HD
          </a>
        </div>
      </div>
    </article>
  `;
}

function setCarouselIndex(carousel, newIndex) {
  const count = Number(carousel.dataset.count || 1);
  const index = ((newIndex % count) + count) % count;

  carousel.dataset.index = String(index);

  const track = carousel.querySelector(".carousel-track");
  track.style.transform = `translateX(-${index * 100}%)`;

  carousel.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
  });

  const currentCounter = carousel.querySelector(".counter-current");
  if (currentCounter) {
    currentCounter.textContent = String(index + 1);
  }

  const card = carousel.closest(".wallpaper-card");
  const versionNumber = card.querySelector(".version-number");

  if (versionNumber) {
    versionNumber.textContent = String(index + 1);
  }

  const activeImage =
    carousel.querySelectorAll(".image-button")[index]?.dataset.full;

  const downloadButton = card.querySelector(".download-button");

  if (activeImage && downloadButton) {
    downloadButton.href = activeImage;
  }
}

function initializeCarousel(carousel) {
  const prevButton = carousel.querySelector(".prev");
  const nextButton = carousel.querySelector(".next");

  prevButton?.addEventListener("click", () => {
    setCarouselIndex(
      carousel,
      Number(carousel.dataset.index) - 1
    );
  });

  nextButton?.addEventListener("click", () => {
    setCarouselIndex(
      carousel,
      Number(carousel.dataset.index) + 1
    );
  });

  carousel.querySelectorAll(".carousel-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      setCarouselIndex(
        carousel,
        Number(dot.dataset.index)
      );
    });
  });

  let startX = null;

  carousel.addEventListener("touchstart", (event) => {
    startX = event.touches[0]?.clientX ?? null;
  }, { passive: true });

  carousel.addEventListener("touchend", (event) => {
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const difference = endX - startX;

    if (Math.abs(difference) > 40) {
      const current = Number(carousel.dataset.index);

      setCarouselIndex(
        carousel,
        difference < 0 ? current + 1 : current - 1
      );
    }

    startX = null;
  }, { passive: true });
}

fetch("/data/wallpapers.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not load wallpapers.json");
    }

    return response.json();
  })

  .then((data) => {
    const items = (data.wallpapers || []).slice().reverse();

    grid.innerHTML = items
      .map((wallpaper, index) => cardTemplate(wallpaper, index))
      .join("");

    document
      .querySelectorAll(".carousel")
      .forEach(initializeCarousel);

    document
      .querySelectorAll(".image-button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          preview.src = button.dataset.full;
          dialog.showModal();
        });
      });
  })

  .catch((error) => {
    console.error(error);

    grid.innerHTML =
      `<p style="color:#756f67">Wallpapers could not be loaded.</p>`;
  });

document
  .getElementById("close-preview")
  .addEventListener("click", () => {
    dialog.close();
  });

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});
