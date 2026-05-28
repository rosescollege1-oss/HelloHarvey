const API_URL = "https://script.google.com/macros/s/AKfycby0hFqSCxPAK_fsKbr0Ooibt_36hUX9i5pZErFDzWZ0WqnmotU42J-Qd3DTEblI5q-v4w/exec";

let state = {
  settings: [],
  users: [],
  photos: [],
  photoComments: [],
  updates: [],
  needs: [],
  wishlist: [],
  letters: []
};

let currentUser = null;
let pendingUser = null;
let currentNatAlbum = "Waiting on Harvey";
let currentFamilyAlbum = "Family Photos";

const pages = {
  home: document.getElementById("homePage"),
  photos: document.getElementById("photosPage"),
  nat: document.getElementById("natPage"),
  village: document.getElementById("villagePage"),
  visit: document.getElementById("visitPage"),
  letters: document.getElementById("lettersPage"),
  account: document.getElementById("accountPage")
};

document.body.insertAdjacentHTML("beforeend", `
  <div id="loadingOverlay" class="loading-overlay">Loading Harvey’s little world...</div>
  <div id="toast" class="toast"></div>
`);

function setting(key, fallback = "") {
  const row = state.settings.find(item => String(item.key) === key);
  return row ? row.value : fallback;
}

function showLoading(message = "Loading...") {
  const el = document.getElementById("loadingOverlay");
  el.textContent = message;
  el.classList.add("active");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.remove("active");
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("active");
  setTimeout(() => el.classList.remove("active"), 3200);
}

async function apiGet(action = "getData") {
  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`);
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

async function apiPost(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

async function refreshData() {
  const data = await apiGet("getData");
  state = {
    settings: data.settings || [],
    users: data.users || [],
    photos: data.photos || [],
    photoComments: data.photoComments || [],
    updates: data.updates || [],
    needs: data.needs || [],
    wishlist: data.wishlist || [],
    letters: data.letters || []
  };
}

function isAdmin() {
  return String(currentUser?.role || "").toLowerCase() === "admin";
}

function cleanDate(value) {
  if (!value) return new Date();
  return new Date(value);
}

function formatDate(value) {
  return cleanDate(value).toLocaleDateString(undefined, {
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

function isTrue(value) {
  return value === true || String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes";
}

function dueCountdown() {
  const raw = setting("dueDate", "2027-01-22");
  const due = cleanDate(raw);
  const now = new Date();
  const diff = due - now;
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  document.getElementById("daysUntilDue").textContent = days;
}

function updateStaticText() {
  const siteName = setting("siteName", "Hello Harvey");
  const babyName = setting("babyName", "Harvey Jones Domangue");
  const momName = setting("momName", "Nat");
  const due = cleanDate(setting("dueDate", "2027-01-22"));
  const dueLabel = due.toLocaleDateString(undefined, { month: "long", day: "numeric" });

  document.title = siteName;
  document.querySelectorAll(".script-logo, .brand-script").forEach(el => el.textContent = siteName);

  const heroHeading = document.querySelector(".simple-hero h1");
  if (heroHeading) heroHeading.textContent = siteName;

  const heroEyebrow = document.querySelector(".simple-hero .eyebrow");
  if (heroEyebrow) heroEyebrow.textContent = `Arriving ${dueLabel}`;

  const heroCopy = document.querySelector(".simple-hero > p:not(.eyebrow)");
  if (heroCopy) heroCopy.textContent = `A private family scrapbook for photos, notes, and little ways to love on ${babyName} and ${momName}.`;

  const privacyText = document.querySelector(".privacy-modal-card p");
  if (privacyText) privacyText.textContent = setting("privacyText", privacyText.textContent);

  const wishlistTitle = document.getElementById("wishlistTitle");
  if (wishlistTitle) wishlistTitle.textContent = setting("registryEventName", "Harvey’s Wishlist");

  const registryInput = document.getElementById("registryEventNameInput");
  if (registryInput) registryInput.value = setting("registryEventName", "Harvey’s Wishlist");
}

async function showSite() {
  showLoading("Loading Harvey’s little world...");
  try {
    await refreshData();
    updateStaticText();

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("siteShell").classList.remove("hidden");
    document.getElementById("accountUser").textContent = `${currentUser.displayName || currentUser.username} · ${currentUser.role}`;
    document.body.classList.add("no-save");

    applyAdminVisibility();
    renderAll();
    navigate(location.hash.replace("#", "") || "home");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
}

function applyAdminVisibility() {
  ["adminPhotoTools", "adminUpdateTools", "adminVillageTools", "adminWishlistTools", "adminAccessTools", "adminPasswordTools"].forEach(id => {
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
  updateStaticText();
  renderAlbumSelects();
  renderPhotos("nat");
  renderPhotos("family");
  renderUpdates();
  renderNeeds();
  renderWishlist();
  renderLetters();
  renderUsers();
}

function getAlbums(photoType) {
  const defaults = photoType === "nat"
    ? ["Waiting on Harvey", "Birth Day", "Newborn Days", "1 Month Old", "2 Months Old"]
    : ["Family Photos", "Family Visits", "Baby Shower", "First Birthday"];

  const fromPhotos = state.photos
    .filter(photo => String(photo.photoType || "").toLowerCase() === photoType)
    .map(photo => photo.album)
    .filter(Boolean);

  return [...new Set([...defaults, ...fromPhotos])];
}

function renderAlbumSelects() {
  const natAlbums = getAlbums("nat");
  const familyAlbums = getAlbums("family");

  const natSelect = document.getElementById("natPhotoAlbum");
  const familySelect = document.getElementById("familyPhotoAlbum");

  if (natSelect) natSelect.innerHTML = natAlbums.map(album => `<option>${escapeHTML(album)}</option>`).join("");
  if (familySelect) familySelect.innerHTML = familyAlbums.map(album => `<option>${escapeHTML(album)}</option>`).join("");

  if (natSelect) natSelect.value = currentNatAlbum;
  if (familySelect) familySelect.value = currentFamilyAlbum;
}

function driveImageSource(photo) {
  const fileId = String(photo.fileId || "").trim();

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
  }

  return String(photo.imageUrl || "").trim();
}

function fallbackDriveImage(img, photo) {
  const fileId = String(photo.fileId || "").trim();
  const fileUrl = String(photo.fileUrl || "").trim();

  if (fileId && !img.dataset.usedAlt) {
    img.dataset.usedAlt = "true";
    img.src = `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1200`;
    return;
  }

  if (fileUrl) {
    img.outerHTML = `<a class="image-fallback-link" href="${escapeHTML(fileUrl)}" target="_blank" rel="noopener">Open photo</a>`;
    return;
  }

  img.outerHTML = `<div class="placeholder-photo">Photo</div>`;
}


function renderPhotos(photoType) {
  const isNat = photoType === "nat";
  const tabsEl = document.getElementById(isNat ? "natAlbumTabs" : "familyAlbumTabs");
  const gridEl = document.getElementById(isNat ? "natPhotoGrid" : "familyPhotoGrid");
  const currentAlbum = isNat ? currentNatAlbum : currentFamilyAlbum;
  const albums = getAlbums(photoType);

  tabsEl.innerHTML = albums.map(album => `
    <button class="${album === currentAlbum ? "active" : ""}" data-photo-type="${photoType}" data-album="${escapeHTML(album)}">${escapeHTML(album)}</button>
  `).join("");

  const photos = state.photos.filter(photo =>
    String(photo.photoType || "").toLowerCase() === photoType &&
    String(photo.album || "") === currentAlbum &&
    (photo.visible === "" || isTrue(photo.visible))
  );

  if (!photos.length) {
    gridEl.innerHTML = `<div class="empty-state full-width">No photos in this album yet.</div>`;
    return;
  }

  gridEl.innerHTML = [...photos].reverse().map(photo => {
    const imageSrc = driveImageSource(photo);
    const safePhotoJson = escapeHTML(JSON.stringify({
      fileId: photo.fileId || "",
      fileUrl: photo.fileUrl || ""
    }));

    const image = imageSrc
      ? `<img src="${escapeHTML(imageSrc)}" alt="${escapeHTML(photo.caption || photo.album)}" draggable="false" data-photo='${safePhotoJson}' onerror="fallbackDriveImage(this, JSON.parse(this.dataset.photo))" />`
      : `<div class="placeholder-photo">${escapeHTML(photo.album || "Photo")}</div>`;

    const comments = state.photoComments.filter(comment => String(comment.photoId) === String(photo.photoId));

    return `
      <article class="photo-card">
        ${image}
        <div class="photo-upload-meta">${escapeHTML(photo.uploadedBy || "")} · ${formatDate(photo.createdAt)}</div>
        <div class="photo-caption">${escapeHTML(photo.caption || "")}</div>
        ${renderPhotoComments(photo.photoId, comments)}
      </article>
    `;
  }).join("");
}

function renderPhotoComments(photoId, comments) {
  return `
    <div class="comment-area">
      <div class="comments-list">
        ${comments.map(comment => `
          <div class="comment"><strong>${escapeHTML(comment.username)}:</strong> ${escapeHTML(comment.comment)}</div>
        `).join("")}
      </div>
      <form class="comment-form" data-photo-comment="${escapeHTML(photoId)}">
        <input type="text" placeholder="Leave a little comment..." required />
        <button type="submit">Post</button>
      </form>
    </div>
  `;
}

function renderUpdates() {
  const updatesList = document.getElementById("updatesList");
  const updates = state.updates.filter(update => update.visible === "" || isTrue(update.visible));

  if (!updates.length) {
    updatesList.innerHTML = `<div class="empty-state">No updates yet.</div>`;
    return;
  }

  updatesList.innerHTML = [...updates].reverse().map(update => `
    <article class="journal-card">
      <div class="card-date">${formatDate(update.createdAt)}</div>
      <h2>${escapeHTML(update.title)}</h2>
      <p>${escapeHTML(update.body)}</p>
    </article>
  `).join("");
}

function renderNeeds() {
  const needsList = document.getElementById("needsList");
  const needs = state.needs.filter(need => need.active === "" || isTrue(need.active));

  if (!needs.length) {
    needsList.innerHTML = `<div class="empty-state">Nothing posted right now.</div>`;
    return;
  }

  needsList.innerHTML = [...needs].reverse().map(need => `
    <article class="need-card">
      <div class="need-category">${escapeHTML(need.category)} · ${formatDate(need.createdAt)}</div>
      <h2>${escapeHTML(need.title)}</h2>
      <p>${escapeHTML(need.details || "Text Nat privately if you can help with this.")}</p>
    </article>
  `).join("");
}

function renderWishlist() {
  const list = document.getElementById("wishlistList");
  const eventName = setting("registryEventName", "Harvey’s Wishlist");
  const items = state.wishlist.filter(item => String(item.eventName || eventName) === eventName);

  if (!items.length) {
    list.innerHTML = `<div class="empty-state">No wishlist items yet.</div>`;
    return;
  }

  list.innerHTML = [...items].reverse().map(item => {
    const bought = String(item.status).toLowerCase() === "bought";
    return `
      <article class="wishlist-card">
        <span class="wishlist-status ${bought ? "bought" : ""}">${escapeHTML(item.status || "Still Needed")}</span>
        <h3>${escapeHTML(item.itemName)}</h3>
        <p>${escapeHTML(item.note || "")}</p>
        <div class="wishlist-actions">
          ${item.link ? `<a href="${escapeHTML(item.link)}" target="_blank" rel="noopener">Open Link</a>` : ""}
          <button class="${bought ? "secondary-btn" : "primary-btn"}" data-toggle-wishlist="${escapeHTML(item.itemId)}">${bought ? "Mark Still Needed" : "Mark Bought"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderLetters() {
  const lettersList = document.getElementById("lettersList");
  const letters = state.letters.filter(letter => letter.visible === "" || isTrue(letter.visible));

  if (!letters.length) {
    lettersList.innerHTML = `<div class="empty-state">No letters yet. Be the first to write Harvey a note.</div>`;
    return;
  }

  lettersList.innerHTML = [...letters].reverse().map(letter => `
    <article class="letter-card">
      <div class="letter-meta">From ${escapeHTML(letter.name)} · ${formatDate(letter.createdAt)}</div>
      <p>${escapeHTML(letter.body)}</p>
    </article>
  `).join("");
}

function renderUsers() {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;

  usersList.innerHTML = state.users.map(user => `
    <div class="user-pill">
      <span><strong>${escapeHTML(user.username)}</strong> · ${escapeHTML(user.role)}</span>
      <span>${isTrue(user.active) ? "active" : "inactive"}</span>
    </div>
  `).join("");
}

async function fileToBase64(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return String(dataUrl).split(",")[1];
}

async function handlePhotoUpload(event, photoType) {
  event.preventDefault();

  const isNat = photoType === "nat";
  if (isNat && !isAdmin()) return;

  const fileInput = document.getElementById(isNat ? "natPhotoFile" : "familyPhotoFile");
  const select = document.getElementById(isNat ? "natPhotoAlbum" : "familyPhotoAlbum");
  const newAlbum = document.getElementById(isNat ? "newNatPhotoAlbum" : "newFamilyPhotoAlbum").value.trim();
  const caption = document.getElementById(isNat ? "natPhotoCaption" : "familyPhotoCaption").value.trim();
  const file = fileInput.files[0];

  if (!file) {
    toast("Choose a photo first.");
    return;
  }

  const album = newAlbum || select.value || (isNat ? "Waiting on Harvey" : "Family Photos");

  showLoading("Uploading photo...");
  try {
    const imageBase64 = await fileToBase64(file);
    await apiPost({
      action: "addPhoto",
      username: currentUser.username,
      photoType,
      album,
      caption,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
      imageBase64
    });

    if (isNat) currentNatAlbum = album;
    else currentFamilyAlbum = album;

    event.target.reset();
    await refreshData();
    renderAll();
    toast("Photo uploaded.");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
}

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const username = document.getElementById("usernameInput").value.trim().toLowerCase();
  const password = document.getElementById("passwordInput").value.trim();

  showLoading("Checking login...");
  try {
    const data = await apiPost({ action: "login", username, password });
    pendingUser = data.user;

    const agreedKey = `helloHarveyPrivacyAgreed:${pendingUser.username}`;
    if (localStorage.getItem(agreedKey) === "yes") {
      currentUser = pendingUser;
      pendingUser = null;
      await showSite();
    } else {
      document.getElementById("privacyModal").classList.remove("hidden");
    }
  } catch (err) {
    document.getElementById("loginMessage").textContent = err.message;
  } finally {
    hideLoading();
  }
});

const privacyCheckbox = document.getElementById("privacyAgreeCheckbox");
const privacyButton = document.getElementById("privacyAgreeBtn");

privacyCheckbox.addEventListener("change", () => {
  privacyButton.disabled = !privacyCheckbox.checked;
});

privacyButton.addEventListener("click", async () => {
  if (!pendingUser || !privacyCheckbox.checked) return;

  localStorage.setItem(`helloHarveyPrivacyAgreed:${pendingUser.username}`, "yes");
  currentUser = pendingUser;
  pendingUser = null;
  privacyCheckbox.checked = false;
  privacyButton.disabled = true;
  document.getElementById("privacyModal").classList.add("hidden");
  await showSite();
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});

document.addEventListener("click", async event => {
  const nav = event.target.closest("[data-nav]");
  if (nav) {
    event.preventDefault();
    navigate(nav.dataset.nav);
  }

  const jump = event.target.closest("[data-jump]");
  if (jump) navigate(jump.dataset.jump);

  const album = event.target.closest("[data-album]");
  if (album) {
    if (album.dataset.photoType === "nat") currentNatAlbum = album.dataset.album;
    if (album.dataset.photoType === "family") currentFamilyAlbum = album.dataset.album;
    renderAlbumSelects();
    renderPhotos(album.dataset.photoType);
  }

  const toggleWishlist = event.target.closest("[data-toggle-wishlist]");
  if (toggleWishlist) {
    showLoading("Updating wishlist...");
    try {
      await apiPost({
        action: "toggleWishlistStatus",
        username: currentUser.username,
        itemId: toggleWishlist.dataset.toggleWishlist
      });
      await refreshData();
      renderWishlist();
      toast("Wishlist updated.");
    } catch (err) {
      toast(err.message);
    } finally {
      hideLoading();
    }
  }
});

document.addEventListener("submit", async event => {
  const commentForm = event.target.closest("[data-photo-comment]");
  if (commentForm) {
    event.preventDefault();
    const input = commentForm.querySelector("input");
    const comment = input.value.trim();
    if (!comment) return;

    showLoading("Posting comment...");
    try {
      await apiPost({
        action: "addPhotoComment",
        username: currentUser.username,
        photoId: commentForm.dataset.photoComment,
        comment
      });
      input.value = "";
      await refreshData();
      renderPhotos("nat");
      renderPhotos("family");
      toast("Comment posted.");
    } catch (err) {
      toast(err.message);
    } finally {
      hideLoading();
    }
  }
});

document.getElementById("natPhotoForm").addEventListener("submit", event => handlePhotoUpload(event, "nat"));
document.getElementById("familyPhotoForm").addEventListener("submit", event => handlePhotoUpload(event, "family"));

document.getElementById("updateForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!isAdmin()) return;

  showLoading("Posting update...");
  try {
    await apiPost({
      action: "addUpdate",
      username: currentUser.username,
      title: document.getElementById("updateTitle").value.trim(),
      body: document.getElementById("updateBody").value.trim()
    });
    event.target.reset();
    await refreshData();
    renderUpdates();
    toast("Update posted.");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
});

document.getElementById("needForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!isAdmin()) return;

  showLoading("Posting need...");
  try {
    await apiPost({
      action: "addNeed",
      username: currentUser.username,
      title: document.getElementById("needTitle").value.trim(),
      category: document.getElementById("needCategory").value,
      details: document.getElementById("needDetails").value.trim()
    });
    event.target.reset();
    await refreshData();
    renderNeeds();
    toast("Need posted.");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
});

document.getElementById("registryEventForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!isAdmin()) return;

  showLoading("Updating registry name...");
  try {
    await apiPost({
      action: "updateSetting",
      username: currentUser.username,
      key: "registryEventName",
      value: document.getElementById("registryEventNameInput").value.trim()
    });
    await refreshData();
    renderAll();
    toast("Registry name updated.");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
});

document.getElementById("wishlistForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!isAdmin()) return;

  showLoading("Adding wishlist item...");
  try {
    await apiPost({
      action: "addWishlistItem",
      username: currentUser.username,
      eventName: setting("registryEventName", "Harvey’s Wishlist"),
      itemName: document.getElementById("wishlistItemName").value.trim(),
      link: document.getElementById("wishlistLink").value.trim(),
      note: document.getElementById("wishlistNote").value.trim()
    });
    event.target.reset();
    document.getElementById("registryEventNameInput").value = setting("registryEventName", "Harvey’s Wishlist");
    await refreshData();
    renderWishlist();
    toast("Wishlist item added.");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
});

document.getElementById("letterForm").addEventListener("submit", async event => {
  event.preventDefault();

  showLoading("Posting letter...");
  try {
    await apiPost({
      action: "addLetter",
      username: currentUser.username,
      name: document.getElementById("letterName").value.trim(),
      body: document.getElementById("letterBody").value.trim()
    });
    event.target.reset();
    await refreshData();
    renderLetters();
    toast("Letter posted.");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
});

document.getElementById("printLettersBtn").addEventListener("click", () => window.print());

document.getElementById("exportLettersBtn").addEventListener("click", () => {
  const content = state.letters.map(letter => {
    return `From ${letter.name}\n${formatDate(letter.createdAt)}\n\n${letter.body}\n\n------------------------------\n`;
  }).join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "letters-to-harvey.txt";
  anchor.click();
  URL.revokeObjectURL(url);
});

document.getElementById("addUserForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!isAdmin()) return;

  const raw = document.getElementById("newUsername").value.trim();
  const username = raw.toLowerCase().replace(/\s+/g, "");

  showLoading("Adding user...");
  try {
    await apiPost({
      action: "addUser",
      username: currentUser.username,
      displayName: raw,
      role: document.getElementById("newUserRole").value
    });
    event.target.reset();
    await refreshData();
    renderUsers();
    toast(`User added. Their username is ${username}.`);
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
});

document.getElementById("passwordForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!isAdmin()) return;

  showLoading("Updating password...");
  try {
    await apiPost({
      action: "updateSetting",
      username: currentUser.username,
      key: "sharedPassword",
      value: document.getElementById("newPassword").value.trim()
    });
    event.target.reset();
    await refreshData();
    document.getElementById("passwordMessage").textContent = "Shared password updated.";
    toast("Password updated.");
  } catch (err) {
    toast(err.message);
  } finally {
    hideLoading();
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  pendingUser = null;
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

refreshData()
  .then(() => {
    updateStaticText();
    dueCountdown();
  })
  .catch(() => dueCountdown());

setInterval(dueCountdown, 1000 * 60 * 60);
