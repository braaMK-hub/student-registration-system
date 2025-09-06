const form = document.getElementById("regForm");
const cards = document.getElementById("cards");
const tbody = document.querySelector("#summary tbody");
const live = document.getElementById("live");

/* 
   LocalStorage Helpers
*/
function saveProfiles(profiles) {
  localStorage.setItem("profiles", JSON.stringify(profiles));
}

function loadProfiles() {
  const data = localStorage.getItem("profiles");
  return data ? JSON.parse(data) : [];
}

/* 
   Validation
*/
function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
/*
   Form Submit Handler
*/
form.addEventListener("submit", (e) => {
  e.preventDefault();
  live.textContent = "";

  const first = form.first.value.trim();
  const last = form.last.value.trim();
  const email = form.email.value.trim();
  const prog = form.prog.value.trim();
  const year = form.year.value;
  const interests = form.interests.value.split(",").map(i => i.trim()).filter(Boolean);
  const photo = form.photo.value.trim();

  let valid = true;

  // Reset errors
  document.querySelectorAll(".error").forEach(err => err.textContent = "");

  if (!first) { document.getElementById("err-first").textContent = "First name required"; valid = false; }
  if (!last) { document.getElementById("err-last").textContent = "Last name required"; valid = false; }
  if (!email || !validateEmail(email)) { document.getElementById("err-email").textContent = "Valid email required"; valid = false; }
  if (!prog) { document.getElementById("err-prog").textContent = "Programme required"; valid = false; }
  if (!year) { document.getElementById("err-year").textContent = "Select a year"; valid = false; }

  if (!valid) {
    live.textContent = "Fix errors before submitting.";
    return;
  }

  const data = { first, last, email, prog, year, interests, photo };

  addEntry(data, true); // true = save to storage
  form.reset();
  live.textContent = "Profile added successfully.";
});

/*
   Add Entry (Card + Table + Storage)
*/
function addEntry(data, save = false) {
  const uniqueId = data.email; // use email as a unique identifier

  // Card
  const card = document.createElement("div");
  card.className = "card-person";
  card.id = `card-${uniqueId}`; // give each card an ID
  card.innerHTML = `
    <img src="${data.photo || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}" alt="">
    <div>
      <h3>${data.first} ${data.last}</h3>
      <p><span class="badge">${data.prog}</span>
         <span class="badge">Year ${data.year}</span></p>
      <p>${data.interests.join(", ") || "No interests listed"}</p>
    </div>
  `;

  // Table Row
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${data.first} ${data.last}</td>
    <td>${data.prog}</td>
    <td>${data.year}</td>
    <td>${data.interests.join(", ")}</td>
    <td><button class="remove-btn">Remove</button></td>
  `;

   // Clicking the row (not the remove button) scrolls to card
  tr.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) return; // skip remove clicks
    const cardEl = document.getElementById(`card-${uniqueId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      // highlight effect
      cardEl.style.boxShadow = "0 0 15px 3px #FFD200";
      setTimeout(() => {
        cardEl.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      }, 2000);
    }
  });

  // Remove action
  tr.querySelector(".remove-btn").addEventListener("click", () => {
    card.remove();
    tr.remove();
    let profiles = loadProfiles();
    profiles = profiles.filter(p => p.email !== data.email);
    saveProfiles(profiles);
  });

  cards.prepend(card);
  tbody.prepend(tr);

  // Save to storage if needed
  if (save) {
    const profiles = loadProfiles();
    profiles.push(data);
    saveProfiles(profiles);
  }
}

/* 
   Restore Profiles on Page Load
*/
window.addEventListener("DOMContentLoaded", () => {
  const profiles = loadProfiles();
  profiles.forEach(p => addEntry(p, false)); // false = don’t double save
});
