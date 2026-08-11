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

function getVariants(wallpaper) {
  const variants = [];

  for (let i = 1; i <= 5; i++) {
    const image = wallpaper[`image_${i}`];

    if (image) {
      variants.push({
        image,
        creditName: wallpaper[`credit_name_${i}`] || "",
        creditUrl: wallpaper[`credit_url_${i}`] || ""
      });
    }
  }

  // Compatibility with your older multi-image entries
  if (!variants.length && Array.isArray(wallpaper.images)) {
    wallpaper.images.slice(0, 5).forEach((image) => {
      if (image) {
        variants.push({
          image,
          creditName: wallpaper.credit_name || "",
          creditUrl: wallpaper.credit_url || ""
        });
      }
    });
  }

  // Compatibility with oldest single-image entries
  if (!variants.length && wallpaper.image) {
    variants.push({
      image: wallpaper.image,
      creditName: wallpaper.credit_name || "",
      creditUrl: wallpaper.credit_url || ""
    });
  }

  return variants;
}

function creditHtml(variant) {
  if (!variant.creditName) return "";

  if (variant.creditUrl) {
    return `
      <p class="credit">
        Credit:
        <a
          href="${esc(variant.creditUrl)}"
          target="_blank"
          rel="noopener noreferrer">
          ${esc(variant.creditName)} ↗
        </a>
      </p>
    `;
  }

  return `
    <p class="credit">
      Credit: ${esc(variant.creditName)}
    </p>
  `;
}

function cardTemplate(wallpaper, cardIndex) {
  const variants = getVariants(wallpaper);

  if (!variants.length) return "";

  const title = esc(wallpaper.title || "Versely Wallpaper");
  const category = esc(wallpaper.category || "");

  const slides = variants.map((variant, imageIndex) => `
    <div class="carousel-slide">
      <button
        class="image-button"
        type="button"
        data-full="${esc(variant.image)}"
        aria-label="Preview ${title}, version ${imageIndex + 1}">
        <img
          class="wallpaper-image"
          src="${esc(variant.image)}"
          alt="${title} — version ${imageIndex + 1}"
          loading="lazy">
      </button>
    </div>
  `).join("");

  const hasMultiple = variants.length > 1;

  const arrows = hasMultiple
    ? `
      <button type="button" class="carousel-arrow prev" aria-label="Previous version">‹</button>
      <button type="button" class="carousel-arrow next" aria-label="Next version">›</button>
    `
    : "";

  const dots = hasMultiple
    ? `
      <div class="carousel-dots">
        ${variants.map((_, i) => `
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

  const counter = hasMultiple
    ? `
      <span class="variant-counter">
        <span class="counter-current">1</span>/${variants.length}
      </span>
    `
    : "";

  return `
    <article
      class="wallpaper-card"
      data-card-index="${cardIndex}">

      <div
        class="carousel"
        data-index="0"
        data-count="${variants.length}">

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

          ${category
            ? `<p class="category">${category}</p>`
            : ""}

          <div class="dynamic-credit">
            ${creditHtml(variants[0])}
          </div>
        </div>

        <div class="card-actions">
          ${hasMultiple
            ? `
              <span class="current-variant">
                Version
                <span class="version-number">1</span>
              </span>
            `
            : ""}

          <a
            class="download-button"
            href="${esc(variants[0].image)}"
            download>
            Download HD
          </a>
        </div>
      </div>
    </article>
  `;
}

function setCarouselIndex(carousel, newIndex, variants) {
  const count = variants.length;

  const index =
    ((newIndex % count) + count) % count;

  carousel.dataset.index = String(index);

  const track =
    carousel.querySelector(".carousel-track");

  track.style.transform =
    `translateX(-${index * 100}%)`;

  carousel
    .querySelectorAll(".carousel-dot")
    .forEach((dot, dotIndex) => {
      dot.classList.toggle(
        "active",
        dotIndex === index
      );
    });

  const currentCounter =
    carousel.querySelector(".counter-current");

  if (currentCounter) {
    currentCounter.textContent =
      String(index + 1);
  }

  const card =
    carousel.closest(".wallpaper-card");

  const versionNumber =
    card.querySelector(".version-number");

  if (versionNumber) {
    versionNumber.textContent =
      String(index + 1);
  }

  const activeVariant = variants[index];

  const downloadButton =
    card.querySelector(".download-button");

  if (downloadButton) {
    downloadButton.href =
      activeVariant.image;
  }

  const creditContainer =
    card.querySelector(".dynamic-credit");

  if (creditContainer) {
    creditContainer.innerHTML =
      creditHtml(activeVariant);
  }
}

function initializeCarousel(carousel, variants) {
  const prevButton =
    carousel.querySelector(".prev");

  const nextButton =
    carousel.querySelector(".next");

  prevButton?.addEventListener("click", () => {
    setCarouselIndex(
      carousel,
      Number(carousel.dataset.index) - 1,
      variants
    );
  });

  nextButton?.addEventListener("click", () => {
    setCarouselIndex(
      carousel,
      Number(carousel.dataset.index) + 1,
      variants
    );
  });

  carousel
    .querySelectorAll(".carousel-dot")
    .forEach((dot) => {
      dot.addEventListener("click", () => {
        setCarouselIndex(
          carousel,
          Number(dot.dataset.index),
          variants
        );
      });
    });

  let startX = null;

  carousel.addEventListener(
    "touchstart",
    (event) => {
      startX =
        event.touches[0]?.clientX ?? null;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    (event) => {
      if (startX === null) return;

      const endX =
        event.changedTouches[0]?.clientX
        ?? startX;

      const difference =
        endX - startX;

      if (Math.abs(difference) > 40) {
        const current =
          Number(carousel.dataset.index);

        setCarouselIndex(
          carousel,
          difference < 0
            ? current + 1
            : current - 1,
          variants
        );
      }

      startX = null;
    },
    { passive: true }
  );
}

fetch("/data/wallpapers.json", {
  cache: "no-store"
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        "Could not load wallpapers.json"
      );
    }

    return response.json();
  })

  .then((data) => {
    const items =
      (data.wallpapers || [])
        .slice()
        .reverse();

    grid.innerHTML =
      items
        .map((wallpaper, index) =>
          cardTemplate(
            wallpaper,
            index
          )
        )
        .join("");

    const cards =
      document.querySelectorAll(
        ".wallpaper-card"
      );

    cards.forEach((card, index) => {
      const wallpaper =
        items[index];

      const variants =
        getVariants(wallpaper);

      const carousel =
        card.querySelector(
          ".carousel"
        );

      initializeCarousel(
        carousel,
        variants
      );
    });

    document
      .querySelectorAll(
        ".image-button"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            preview.src =
              button.dataset.full;

            dialog.showModal();
          }
        );
      });
  })

  .catch((error) => {
    console.error(error);

    grid.innerHTML =
      `<p style="color:#756f67">
        Wallpapers could not be loaded.
      </p>`;
  });

document
  .getElementById("close-preview")
  .addEventListener("click", () => {
    dialog.close();
  });

dialog.addEventListener(
  "click",
  (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  }
);
