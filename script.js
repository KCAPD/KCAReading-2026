const books = Array.isArray(window.BOOKS) ? window.BOOKS : [];
const years = [...new Set(books.map(book => book.year))];
let activeYear = years[0] || "";

const shelves = document.querySelector("#shelves");
const tabs = document.querySelector("#yearTabs");
const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const dialog = document.querySelector("#bookDialog");
const closeButton = dialog.querySelector(".close");

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function placeholderCover(book, index) {
  const shades = ["#34286f", "#263d77", "#5f2d6e", "#244f65", "#5b2b63", "#394070", "#234e5a", "#65324f"];
  const image = book.cover
    ? `<img class="cover-art" src="${book.cover}" alt="" loading="lazy" decoding="async">`
    : "";
  return `<div class="cover-placeholder has-cover-art" style="--cover:${shades[index % shades.length]}">
    ${image}
    <span class="cover-tint" aria-hidden="true"></span>
    ${book.wholeClass ? '<small class="whole-class-cover">Whole class</small>' : '<small class="cover-kicker" aria-hidden="true"></small>'}
    <span class="cover-title">${book.title}</span>
    <small class="cover-footer">${book.author || ''}</small>
  </div>`;
}


const VALUE_CLASSES = {
  Courage: "courage", Respect: "respect", Kindness: "kindness",
  Integrity: "integrity", Endurance: "endurance", Aspiration: "aspiration"
};

function renderValues(values = []) {
  if (!Array.isArray(values) || values.length === 0) return "";
  return `<span class="book-values" aria-label="School values: ${values.join(", ")}">${values.map(value =>
    `<span class="value-pill value-${VALUE_CLASSES[value] || "default"}">${value}</span>`
  ).join("")}</span>`;
}

function renderTabs() {
  tabs.innerHTML = years.map(year => `<button role="tab" aria-selected="${year === activeYear}" data-year="${year}">${year}</button>`).join("");
  tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    activeYear = button.dataset.year;
    searchInput.value = "";
    renderTabs();
    renderBooks();
  }));
}

function renderBooks() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = books.filter(book => query ? `${book.title} ${book.author} ${book.year}`.toLowerCase().includes(query) : book.year === activeYear);
  resultCount.textContent = query ? `${visible.length} book${visible.length === 1 ? "" : "s"} found` : `${visible.length} book${visible.length === 1 ? "" : "s"} in this year group`;

  shelves.innerHTML = `<div class="shelf-grid">${visible.map((book, index) => `
    <button class="book-card" data-book="${books.indexOf(book)}" aria-label="Open ${book.title}">
      <div class="book-cover">${placeholderCover(book, index)}</div>
      <span class="book-title">${book.title}</span>
      ${book.wholeClass ? '<span class="whole-class-label">Whole class book</span>' : ''}
      ${renderValues(book.values)}
    </button>`).join("")}</div>`;

  shelves.querySelectorAll(".book-card").forEach(card => card.addEventListener("click", () => openBook(books[Number(card.dataset.book)])));
}

function openBook(book) {
  document.querySelector("#dialogYear").textContent = book.year;
  document.querySelector("#dialogTitle").textContent = book.title;
  const author = document.querySelector("#dialogAuthor");
  if (author) author.textContent = book.author ? `by ${book.author}` : "";
  const cover = document.querySelector("#dialogCover");
  cover.innerHTML = placeholderCover(book, books.indexOf(book));
  const dialogValues = document.querySelector("#dialogValues");
  if (dialogValues) dialogValues.innerHTML = renderValues(book.values);
  const link = document.querySelector("#quizLink");
  const comingSoon = document.querySelector("#comingSoon");
  link.hidden = !book.formUrl;
  comingSoon.hidden = Boolean(book.formUrl);
  link.href = book.formUrl || "#";
  dialog.showModal();
}

closeButton.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
searchInput.addEventListener("input", renderBooks);
renderTabs();
renderBooks();
