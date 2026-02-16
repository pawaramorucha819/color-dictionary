// ===== Preset Colors =====
const PRESET_COLORS = [
  { name: "Red", hex: "#FF3B30" },
  { name: "Orange", hex: "#FF9500" },
  { name: "Yellow", hex: "#FFCC00" },
  { name: "Green", hex: "#34C759" },
  { name: "Mint", hex: "#00C7BE" },
  { name: "Teal", hex: "#30B0C7" },
  { name: "Cyan", hex: "#32ADE6" },
  { name: "Blue", hex: "#007AFF" },
  { name: "Indigo", hex: "#5856D6" },
  { name: "Purple", hex: "#AF52DE" },
  { name: "Pink", hex: "#FF2D55" },
  { name: "Brown", hex: "#A2845E" },
  { name: "Coral", hex: "#FF6347" },
  { name: "Salmon", hex: "#FA8072" },
  { name: "Tomato", hex: "#FF6347" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Khaki", hex: "#F0E68C" },
  { name: "Lime", hex: "#32CD32" },
  { name: "Spring Green", hex: "#00FF7F" },
  { name: "Sea Green", hex: "#2E8B57" },
  { name: "Aqua", hex: "#00FFFF" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Dodger Blue", hex: "#1E90FF" },
  { name: "Steel Blue", hex: "#4682B4" },
  { name: "Navy", hex: "#001F3F" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Slate Blue", hex: "#6A5ACD" },
  { name: "Violet", hex: "#EE82EE" },
  { name: "Orchid", hex: "#DA70D6" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Maroon", hex: "#800000" },
  { name: "Sienna", hex: "#A0522D" },
  { name: "Chocolate", hex: "#D2691E" },
  { name: "Peru", hex: "#CD853F" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Snow", hex: "#FFFAFA" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gray", hex: "#808080" },
  { name: "Dark Gray", hex: "#A9A9A9" },
  { name: "Dim Gray", hex: "#696969" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Black", hex: "#000000" },
];

// ===== State =====
let selectedColor = null;
let history = [];
const HISTORY_KEY = "colorDictionary_history";
const MAX_HISTORY = 20;

// ===== DOM =====
const $ = (sel) => document.querySelector(sel);
const paletteGrid = $("#palette-grid");
const colorPicker = $("#color-picker");
const pickerSelectBtn = $("#picker-select-btn");
const detailPreview = $("#detail-preview");
const detailName = $("#detail-name");
const detailHex = $("#detail-hex");
const detailRgb = $("#detail-rgb");
const copyHexBtn = $("#copy-hex");
const copyRgbBtn = $("#copy-rgb");
const colorCodeInput = $("#color-code-input");
const inputPreview = $("#input-preview");
const inputHint = $("#input-hint");
const inputSelectBtn = $("#input-select-btn");
const historyContainer = $("#history");
const toastEl = $("#toast");

// ===== Helpers =====
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
}

function rgbString(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

function normalizeHex(hex) {
  return "#" + hex.replace("#", "").toUpperCase();
}

function parseColorCode(input) {
  const trimmed = input.trim();

  // HEX: #RGB or #RRGGBB (with or without #)
  const hexMatch = trimmed.match(/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/);
  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    return "#" + h.toUpperCase();
  }

  // RGB: rgb(r, g, b) or just r, g, b
  const rgbMatch = trimmed.match(
    /^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    if (r <= 255 && g <= 255 && b <= 255) {
      const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();
      return "#" + toHex(r) + toHex(g) + toHex(b);
    }
  }

  return null;
}

function findPresetName(hex) {
  const normalized = normalizeHex(hex);
  const match = PRESET_COLORS.find((c) => c.hex === normalized);
  return match ? match.name : normalized;
}

// ===== Toast =====
let toastTimer = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("toast--visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("toast--visible");
  }, 2000);
}

// ===== Copy =====
async function copyToClipboard(text, format) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${format}をコピーしました`);
    return true;
  } catch {
    showToast("コピーに失敗しました");
    return false;
  }
}

// ===== Detail Panel =====
function updateDetail(hex, name) {
  const normalized = normalizeHex(hex);
  const { r, g, b } = hexToRgb(normalized);
  const rgb = rgbString(r, g, b);

  selectedColor = { hex: normalized, name: name || findPresetName(normalized) };

  detailPreview.style.backgroundColor = normalized;
  detailName.textContent = selectedColor.name;
  detailHex.textContent = normalized;
  detailRgb.textContent = rgb;
  copyHexBtn.disabled = false;
  copyRgbBtn.disabled = false;

  // Highlight selected preset
  document.querySelectorAll(".palette-grid__item").forEach((item) => {
    item.classList.toggle(
      "palette-grid__item--selected",
      item.dataset.hex === normalized
    );
  });
}

// ===== History =====
function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    history = stored ? JSON.parse(stored) : [];
  } catch {
    history = [];
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(hex) {
  const normalized = normalizeHex(hex);
  // Remove duplicate if exists
  history = history.filter((h) => h !== normalized);
  // Prepend
  history.unshift(normalized);
  // Limit
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  saveHistory();
  renderHistory();
}

function renderHistory() {
  historyContainer.innerHTML = "";
  if (history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history__empty";
    empty.textContent = "No colors selected yet";
    historyContainer.appendChild(empty);
    return;
  }
  history.forEach((hex) => {
    const item = document.createElement("div");
    item.className = "history__item";
    item.style.backgroundColor = hex;
    item.title = hex;
    item.addEventListener("click", () => selectColor(hex));
    historyContainer.appendChild(item);
  });
}

// ===== Select Color =====
function selectColor(hex, name) {
  const normalized = normalizeHex(hex);
  updateDetail(normalized, name);
  addToHistory(normalized);
}

// ===== Palette Grid =====
function renderPalette() {
  paletteGrid.innerHTML = "";
  PRESET_COLORS.forEach((color) => {
    const item = document.createElement("div");
    item.className = "palette-grid__item";
    item.style.backgroundColor = color.hex;
    item.dataset.hex = color.hex;
    item.title = color.name;

    const nameLabel = document.createElement("span");
    nameLabel.className = "palette-grid__item__name";
    nameLabel.textContent = color.name;
    item.appendChild(nameLabel);

    item.addEventListener("click", () => selectColor(color.hex, color.name));
    paletteGrid.appendChild(item);
  });
}

// ===== Tabs =====
function initTabs() {
  document.querySelectorAll(".tabs__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Toggle active btn
      document
        .querySelectorAll(".tabs__btn")
        .forEach((b) => b.classList.remove("tabs__btn--active"));
      btn.classList.add("tabs__btn--active");

      // Toggle tab content
      const target = btn.dataset.tab;
      document.querySelectorAll(".tab-content").forEach((tc) => {
        tc.classList.toggle("tab-content--hidden", tc.id !== `tab-${target}`);
      });
    });
  });
}

// ===== Color Picker =====
function initPicker() {
  // Live preview while picking
  colorPicker.addEventListener("input", () => {
    const hex = normalizeHex(colorPicker.value);
    updateDetail(hex);
  });

  // Select button commits to history
  pickerSelectBtn.addEventListener("click", () => {
    const hex = normalizeHex(colorPicker.value);
    selectColor(hex);
  });
}

// ===== Code Input =====
function initCodeInput() {
  const DEFAULT_HINT = "HEX (#RGB, #RRGGBB) or RGB (rgb(r, g, b)) format";

  colorCodeInput.addEventListener("input", () => {
    const value = colorCodeInput.value;
    if (value.trim() === "") {
      inputPreview.style.backgroundColor = "#e5e5ea";
      inputPreview.classList.remove("input-area__preview--valid");
      colorCodeInput.classList.remove("input-area__input--invalid");
      inputHint.textContent = DEFAULT_HINT;
      inputHint.classList.remove("input-area__hint--error");
      inputSelectBtn.disabled = true;
      return;
    }

    const parsed = parseColorCode(value);
    if (parsed) {
      inputPreview.style.backgroundColor = parsed;
      inputPreview.classList.add("input-area__preview--valid");
      colorCodeInput.classList.remove("input-area__input--invalid");
      inputHint.textContent = DEFAULT_HINT;
      inputHint.classList.remove("input-area__hint--error");
      inputSelectBtn.disabled = false;
      updateDetail(parsed);
    } else {
      inputPreview.style.backgroundColor = "#e5e5ea";
      inputPreview.classList.remove("input-area__preview--valid");
      colorCodeInput.classList.add("input-area__input--invalid");
      inputHint.textContent = "Invalid format";
      inputHint.classList.add("input-area__hint--error");
      inputSelectBtn.disabled = true;
    }
  });

  inputSelectBtn.addEventListener("click", () => {
    const parsed = parseColorCode(colorCodeInput.value);
    if (parsed) {
      selectColor(parsed);
    }
  });

  colorCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const parsed = parseColorCode(colorCodeInput.value);
      if (parsed) {
        selectColor(parsed);
      }
    }
  });
}

// ===== Copy Buttons =====
function initCopyButtons() {
  copyHexBtn.addEventListener("click", async () => {
    if (!selectedColor) return;
    const ok = await copyToClipboard(selectedColor.hex, "HEX");
    if (ok) {
      copyHexBtn.textContent = "Copied!";
      copyHexBtn.classList.add("copy-btn--copied");
      setTimeout(() => {
        copyHexBtn.textContent = "Copy HEX";
        copyHexBtn.classList.remove("copy-btn--copied");
      }, 1500);
    }
  });

  copyRgbBtn.addEventListener("click", async () => {
    if (!selectedColor) return;
    const { r, g, b } = hexToRgb(selectedColor.hex);
    const rgb = rgbString(r, g, b);
    const ok = await copyToClipboard(rgb, "RGB");
    if (ok) {
      copyRgbBtn.textContent = "Copied!";
      copyRgbBtn.classList.add("copy-btn--copied");
      setTimeout(() => {
        copyRgbBtn.textContent = "Copy RGB";
        copyRgbBtn.classList.remove("copy-btn--copied");
      }, 1500);
    }
  });
}

// ===== Init =====
function init() {
  loadHistory();
  renderPalette();
  renderHistory();
  initTabs();
  initPicker();
  initCodeInput();
  initCopyButtons();
}

init();
