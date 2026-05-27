const STORAGE_KEY = "helloHarveyStateV6";

function sampleImage(label, bgOne = "#FAD688", bgTwo = "#F5D6C2", accent = "#304B71") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${bgOne}"/>
          <stop offset="1" stop-color="${bgTwo}"/>
        </linearGradient>
      </defs>
      <rect width="900" height="900" rx="70" fill="url(#g)"/>
      <circle cx="180" cy="180" r="95" fill="#ffffff" opacity=".38"/>
      <circle cx="760" cy="720" r="130" fill="#ffffff" opacity=".25"/>
      <text x="450" y="395" text-anchor="middle" font-size="82" font-family="Georgia, serif" fill="${accent}" opacity=".88">✦</text>
      <text x="450" y="485" text-anchor="middle" font-size="58" font-family="Georgia, serif" fill="${accent}">${label}</text>
      <text x="450" y="550" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="${accent}" opacity=".72">demo photo card</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const defaultAlbums = [
  "Waiting on Harvey",
  "Birth Day",
  "Newborn Days",
  "1 Month Old",
  "2 Months Old",
  "Family Visits"
];

const defaultState = {
  sharedPassword: "harveyjones",
  users: [
    { username: "nat", role: "admin" },
    { username: "rosie", role: "admin" },
    { username: "grandma", role: "viewer" },
    { username: "auntie", role: "viewer" }
  ],
  albums: defaultAlbums,
  photos: [
    {
      id: crypto.randomUUID(),
      album: "Waiting on Harvey",
      caption: "January 10 — Harvey’s nursery corner is ready: tiny blankets, soft blues, and way too much love already.",
      image: sampleImage("Nursery Day", "#FAD688", "#F5D6C2"),
      comments: [
        { name: "rosie", text: "This is exactly the sweetest little corner.", date: new Date().toISOString() }
      ]
    },
    {
      id: crypto.randomUUID(),
      album: "Waiting on Harvey",
      caption: "January 15 — Hospital bag packed, car seat installed, and everyone pretending to be calm.",
      image: sampleImage("Almost Here", "#A6B2B5", "#FAD688"),
      comments: []
    },
    {
      id: crypto.randomUUID(),
      album: "Birth Day",
      caption: "January 22 — The tiniest hat, the sleepiest face, and the whole room instantly in love.",
      image: sampleImage("Hello Harvey", "#6A8AA4", "#F5D6C2", "#ffffff"),
      comments: [
        { name: "grandma", text: "I cannot wait to hold him.", date: new Date().toISOString() }
      ]
    },
    {
      id: crypto.randomUUID(),
      album: "Newborn Days",
      caption: "First week home — milk-drunk naps, curled-up fingers, and the softest little stretches.",
      image: sampleImage("First Week", "#F5D6C2", "#FAD688"),
      comments: []
    }
  ],
  updates: [
    {
      id: crypto.randomUUID(),
      title: "Nursery almost finished",
      body: "The little blue blanket is folded over the chair, the diapers are stacked, and the room finally feels like it is waiting for him instead of just waiting on a checklist.",
      date: new Date("2027-01-10T12:00:00").toISOString(),
      comments: [
        { name: "rosie", text: "The room already feels so peaceful.", date: new Date().toISOString() }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: "Counting down",
      body: "We are officially in the part where every tiny kick makes me wonder if he is getting ready. I am excited, nervous, and mostly just ready to see his face.",
      date: new Date("2027-01-18T12:00:00").toISOString(),
      comments: []
    }
  ],
  needs: [
    {
      id: crypto.randomUUID(),
      title: "Diaper pickup this week",
      category: "Errands",
      details: "If anyone is already going to Target, newborn diapers and unscented wipes would be so helpful. Text Nat before buying so we do not end up with 900 of the same size.",
      date: new Date("2027-01-24T12:00:00").toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Someone to sit with Harvey while I shower",
      category: "Baby help",
      details: "A quick 30-minute visit one afternoon would be perfect. Nothing fancy, just a clean pair of hands and a calm little baby snuggle.",
      date: new Date("2027-01-25T12:00:00").toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Easy dinner drop-off",
      category: "Food",
      details: "Something simple we can heat up later would be amazing. Soup, pasta, breakfast casserole, or anything that does not require hosting.",
      date: new Date("2027-01-26T12:00:00").toISOString()
    }
  ],
  letters: [
    {
      id: crypto.randomUUID(),
      name: "Aunt Rosie",
      body: "Dear Harvey,\n\nYou are already so loved. Before you were even here, your name was spoken with so much excitement. I cannot wait to watch you grow into your little cheeks, your little personality, and the life waiting for you.",
      date: new Date("2027-01-12T12:00:00").toISOString(),
      comments: []
    },
    {
      id: crypto.randomUUID(),
      name: "Grandma",
      body: "Dear Harvey,\n\nI hope one day you know how many people were waiting to meet you. You have a whole family ready to cheer for every tiny first and every ordinary day in between.",
      date: new Date("2027-01-14T12:00:00").toISOString(),
      comments: []
    }
  ]
};

let state = loadState();
let currentUser = null;
let pendingUser = null;
let currentAlbum = state.albums?.[0] || "Waiting on Harvey";

const pages = {
  home: document.getElementById("homePage"),
  photos: document.getElementById("photosPage"),
  nat: document.getElementById("natPage"),
  village: document.getElementById("villagePage"),
  visit: document.getElementById("visitPage"),
  letters: document.getElementById("lettersPage"),
  account: document.getElementById("accountPage")
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(saved);
    parsed.albums = parsed.albums?.length ? parsed.albums : defaultAlbums;
    return parsed;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isAdmin() {
  return currentUser?.role === "admin";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dueCountdown() {
  const now = new Date();
  const due = new Date("2027-01-22T00:00:00");
  const diff = due - now;
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  document.getElementById("daysUntilDue").textContent = days;
}

function showSite() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("siteShell").classList.remove("hidden");
  document.getElementById("accountUser").textContent = `${currentUser.username} · ${currentUser.role}`;
  document.body.classList.add("no-save");
  applyAdminVisibility();
  renderAll();
  navigate(location.hash.replace("#", "") || "home");
}

function applyAdminVisibility() {
  const adminIds = [
    "adminPhotoTools",
    "adminUpdateTools",
    "adminVillageTools",
    "adminAccessTools",
    "adminPasswordTools"
  ];

  adminIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !isAdmin());
  });

  document.querySelectorAll(".admin-nav-link").forEach(link => {
    link.classList.toggle("viewer-hidden", !isAdmin());
  });
}

function navigate(pageName) {
  if (pageName === "account" && !isAdmin()) pageName = "home";
  const safePage = pages[pageName] ? pageName : "home";
  Object.values(pages).forEach(page => page.classList.remove("active-page"));
  pages[safePage].classList.add("active-page");

  document.querySelectorAll("[data-nav]").forEach(link => {
    link.classList.toggle("active", link.dataset.nav === safePage);
  });

  document.getElementById("mainNav").classList.remove("open");
  history.replaceState(null, "", `#${safePage}`);
}

function renderAll() {
  dueCountdown();
  renderAlbumSelect();
  renderAlbums();
  renderUpdates();
  renderNeeds();
  renderLetters();
  renderUsers();
}

function renderAlbumSelect() {
  const select = document.getElementById("photoAlbum");
  if (!select) return;
  select.innerHTML = state.albums.map(album => `<option>${escapeHTML(album)}</option>`).join("");
  select.value = currentAlbum;
}

function renderAlbums() {
  const albumTabs = document.getElementById("albumTabs");
  const photoGrid = document.getElementById("photoGrid");

  albumTabs.innerHTML = state.albums.map(album => `
    <button class="${album === currentAlbum ? "active" : ""}" data-album="${escapeHTML(album)}">${escapeHTML(album)}</button>
  `).join("");

  const photos = state.photos.filter(photo => photo.album === currentAlbum);

  if (!photos.length) {
    photoGrid.innerHTML = `<div class="empty-state full-width">No photos in this album yet.</div>`;
    return;
  }

  photoGrid.innerHTML = photos.map(photo => {
    const imageHTML = photo.image
      ? `<img src="${photo.image}" alt="${escapeHTML(photo.caption || photo.album)}" draggable="false" />`
      : `<div class="placeholder-photo">${escapeHTML(photo.album)}</div>`;

    return `
      <article class="photo-card">
        ${isAdmin() ? `<button class="delete-btn" data-delete-photo="${photo.id}">Remove</button>` : ""}
        ${imageHTML}
        <div class="photo-caption">${escapeHTML(photo.caption || "")}</div>
        ${renderComments("photo", photo.id, photo.comments || [])}
      </article>
    `;
  }).join("");
}

function renderUpdates() {
  const updatesList = document.getElementById("updatesList");
  if (!state.updates.length) {
    updatesList.innerHTML = `<div class="empty-state">No updates yet.</div>`;
    return;
  }

  updatesList.innerHTML = [...state.updates].reverse().map(update => `
    <article class="journal-card">
      ${isAdmin() ? `<button class="delete-btn" data-delete-update="${update.id}">Remove</button>` : ""}
      <div class="card-date">${formatDate(update.date)}</div>
      <h2>${escapeHTML(update.title)}</h2>
      <p>${escapeHTML(update.body)}</p>
    </article>
  `).join("");
}

function renderNeeds() {
  const needsList = document.getElementById("needsList");
  if (!state.needs.length) {
    needsList.innerHTML = `<div class="empty-state">Nothing posted right now.</div>`;
    return;
  }

  needsList.innerHTML = [...state.needs].reverse().map(need => `
    <article class="need-card">
      ${isAdmin() ? `<button class="delete-btn" data-delete-need="${need.id}">Remove</button>` : ""}
      <div class="need-category">${escapeHTML(need.category)} · ${formatDate(need.date)}</div>
      <h2>${escapeHTML(need.title)}</h2>
      <p>${escapeHTML(need.details || "Text Nat privately if you can help with this.")}</p>
    </article>
  `).join("");
}

function renderLetters() {
  const lettersList = document.getElementById("lettersList");
  if (!state.letters.length) {
    lettersList.innerHTML = `<div class="empty-state">No letters yet. Be the first to write Harvey a note.</div>`;
    return;
  }

  lettersList.innerHTML = [...state.letters].reverse().map(letter => `
    <article class="letter-card">
      ${isAdmin() ? `<button class="delete-btn" data-delete-letter="${letter.id}">Remove</button>` : ""}
      <div class="letter-meta">From ${escapeHTML(letter.name)} · ${formatDate(letter.date)}</div>
      <p>${escapeHTML(letter.body)}</p>
    </article>
  `).join("");
}

function renderComments(type, id, comments) {
  return `
    <div class="comment-area" data-comment-area="${type}:${id}">
      <div class="comments-list">
        ${comments.map(comment => `
          <div class="comment"><strong>${escapeHTML(comment.name)}:</strong> ${escapeHTML(comment.text)}</div>
        `).join("")}
      </div>
      <form class="comment-form" data-comment-form="${type}:${id}">
        <input type="text" placeholder="Leave a little comment..." required />
        <button type="submit">Post</button>
      </form>
    </div>
  `;
}

function renderUsers() {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;

  usersList.innerHTML = state.users.map(user => `
    <div class="user-pill">
      <span><strong>${escapeHTML(user.username)}</strong> · ${escapeHTML(user.role)}</span>
      ${user.username === currentUser?.username ? `<span>current</span>` : `<button data-remove-user="${escapeHTML(user.username)}">Remove</button>`}
    </div>
  `).join("");
}

document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();

  const username = document.getElementById("usernameInput").value.trim().toLowerCase();
  const password = document.getElementById("passwordInput").value.trim();
  const user = state.users.find(item => item.username.toLowerCase() === username);

  if (!user || password !== state.sharedPassword) {
    document.getElementById("loginMessage").textContent = "That username or password didn’t match.";
    return;
  }

  pendingUser = user;
  const agreedKey = `helloHarveyPrivacyAgreed:${user.username}`;
  if (localStorage.getItem(agreedKey) === "yes") {
    currentUser = user;
    pendingUser = null;
    showSite();
  } else {
    document.getElementById("privacyModal").classList.remove("hidden");
  }
});


const privacyCheckbox = document.getElementById("privacyAgreeCheckbox");
const privacyButton = document.getElementById("privacyAgreeBtn");

privacyCheckbox.addEventListener("change", () => {
  privacyButton.disabled = !privacyCheckbox.checked;
});

privacyButton.addEventListener("click", () => {
  if (!pendingUser || !privacyCheckbox.checked) return;

  localStorage.setItem(`helloHarveyPrivacyAgreed:${pendingUser.username}`, "yes");
  currentUser = pendingUser;
  pendingUser = null;
  privacyCheckbox.checked = false;
  privacyButton.disabled = true;
  document.getElementById("privacyModal").classList.add("hidden");
  showSite();
});


document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-nav]");
  if (nav) {
    event.preventDefault();
    navigate(nav.dataset.nav);
  }

  const jump = event.target.closest("[data-jump]");
  if (jump) {
    navigate(jump.dataset.jump);
  }

  const album = event.target.closest("[data-album]");
  if (album) {
    currentAlbum = album.dataset.album;
    renderAlbumSelect();
    renderAlbums();
  }

  const deletePhoto = event.target.closest("[data-delete-photo]");
  if (deletePhoto && isAdmin()) {
    state.photos = state.photos.filter(photo => photo.id !== deletePhoto.dataset.deletePhoto);
    saveState();
    renderAlbums();
  }

  const deleteUpdate = event.target.closest("[data-delete-update]");
  if (deleteUpdate && isAdmin()) {
    state.updates = state.updates.filter(update => update.id !== deleteUpdate.dataset.deleteUpdate);
    saveState();
    renderUpdates();
  }

  const deleteNeed = event.target.closest("[data-delete-need]");
  if (deleteNeed && isAdmin()) {
    state.needs = state.needs.filter(need => need.id !== deleteNeed.dataset.deleteNeed);
    saveState();
    renderNeeds();
  }

  const deleteLetter = event.target.closest("[data-delete-letter]");
  if (deleteLetter && isAdmin()) {
    state.letters = state.letters.filter(letter => letter.id !== deleteLetter.dataset.deleteLetter);
    saveState();
    renderLetters();
  }

  const removeUser = event.target.closest("[data-remove-user]");
  if (removeUser && isAdmin()) {
    state.users = state.users.filter(user => user.username !== removeUser.dataset.removeUser);
    saveState();
    renderUsers();
  }
});

document.addEventListener("submit", event => {
  const commentForm = event.target.closest("[data-comment-form]");
  if (commentForm) {
    event.preventDefault();
    const [type, id] = commentForm.dataset.commentForm.split(":");
    if (type !== "photo") return;

    const input = commentForm.querySelector("input");
    const comment = {
      name: currentUser.username,
      text: input.value.trim(),
      date: new Date().toISOString()
    };

    const item = state.photos.find(entry => entry.id === id);
    if (item) {
      item.comments = item.comments || [];
      item.comments.push(comment);
      saveState();
      renderAll();
    }
  }
});

document.getElementById("photoForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!isAdmin()) return;

  const file = document.getElementById("photoFile").files[0];
  const newAlbumValue = document.getElementById("newPhotoAlbum").value.trim();
  const album = newAlbumValue || document.getElementById("photoAlbum").value;
  const caption = document.getElementById("photoCaption").value.trim();

  if (newAlbumValue && !state.albums.includes(newAlbumValue)) {
    state.albums.push(newAlbumValue);
  }

  if (!file) {
    alert("Choose a photo first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    state.photos.push({
      id: crypto.randomUUID(),
      album,
      caption,
      image: reader.result,
      comments: []
    });
    currentAlbum = album;
    saveState();
    renderAlbumSelect();
    renderAlbums();
    event.target.reset();
  };
  reader.readAsDataURL(file);
});

document.getElementById("updateForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!isAdmin()) return;

  state.updates.push({
    id: crypto.randomUUID(),
    title: document.getElementById("updateTitle").value.trim(),
    body: document.getElementById("updateBody").value.trim(),
    date: new Date().toISOString(),
    comments: []
  });
  saveState();
  renderUpdates();
  event.target.reset();
});

document.getElementById("needForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!isAdmin()) return;

  state.needs.push({
    id: crypto.randomUUID(),
    title: document.getElementById("needTitle").value.trim(),
    category: document.getElementById("needCategory").value,
    details: document.getElementById("needDetails").value.trim(),
    date: new Date().toISOString()
  });
  saveState();
  renderNeeds();
  event.target.reset();
});

document.getElementById("letterForm").addEventListener("submit", event => {
  event.preventDefault();

  state.letters.push({
    id: crypto.randomUUID(),
    name: document.getElementById("letterName").value.trim(),
    body: document.getElementById("letterBody").value.trim(),
    date: new Date().toISOString(),
    comments: []
  });
  saveState();
  renderLetters();
  event.target.reset();
});

document.getElementById("printLettersBtn").addEventListener("click", () => {
  window.print();
});

document.getElementById("exportLettersBtn").addEventListener("click", () => {
  const content = state.letters.map(letter => {
    return `From ${letter.name}\n${formatDate(letter.date)}\n\n${letter.body}\n\n------------------------------\n`;
  }).join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "letters-to-harvey.txt";
  anchor.click();
  URL.revokeObjectURL(url);
});

document.getElementById("addUserForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!isAdmin()) return;

  const username = document.getElementById("newUsername").value.trim().toLowerCase();
  const role = document.getElementById("newUserRole").value;

  if (!username || state.users.some(user => user.username === username)) return;

  state.users.push({ username, role });
  saveState();
  renderUsers();
  event.target.reset();
});

document.getElementById("passwordForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!isAdmin()) return;

  const newPassword = document.getElementById("newPassword").value.trim();
  if (!newPassword) return;

  state.sharedPassword = newPassword;
  saveState();
  document.getElementById("passwordMessage").textContent = "Shared password updated for this browser demo.";
  event.target.reset();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  document.getElementById("siteShell").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.body.classList.remove("no-save");
  document.getElementById("passwordInput").value = "";
  document.getElementById("privacyModal").classList.add("hidden");
});

document.addEventListener("contextmenu", event => {
  if (event.target.tagName === "IMG") event.preventDefault();
});

document.addEventListener("dragstart", event => {
  if (event.target.tagName === "IMG") event.preventDefault();
});

window.addEventListener("hashchange", () => {
  if (currentUser) navigate(location.hash.replace("#", "") || "home");
});

dueCountdown();
setInterval(dueCountdown, 1000 * 60 * 60);
