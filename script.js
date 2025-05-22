// API URL – passe dies auf deine Live-URL an!
const API_URL = "https://mein-backend.onrender.com "; // Ändere dies später!

let teachers = [];
let currentTeacher = null;

function averageRating(ratings) {
  if (!ratings.length) return 0;
  const total = ratings.reduce((sum, r) => sum + r.stars, 0);
  return (total / ratings.length).toFixed(1);
}

function renderStars(stars) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span>${i <= stars ? '★' : '☆'}</span>`;
  }
  return html;
}

async function loadTeachersFromServer() {
  try {
    const res = await fetch(`${API_URL}/teachers`);
    teachers = await res.json();
    showHomePage();
  } catch (err) {
    document.getElementById("app").innerHTML = `
      <div style="text-align:center; padding: 40px;">
        <h2>Fehler beim Laden</h2>
        <p>Die Lehrer konnten nicht geladen werden.</p>
        <button onclick="loadTeachersFromServer()" class="btn-primary">Erneut versuchen</button>
      </div>
    `;
    console.error("Fehler beim Laden:", err);
  }
}

async function submitRatingToServer(teacherId, ratingData) {
  try {
    const res = await fetch(`${API_URL}/teachers/${teacherId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ratingData)
    });
    if (!res.ok) throw new Error("Fehler beim Speichern");
    const updatedTeacher = await res.json();
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) teachers[index] = updatedTeacher;
  } catch (err) {
    alert("Fehler beim Speichern der Bewertung.");
    console.error("Speicherfehler:", err);
  }
}

function showHomePage() {
  document.getElementById("app").innerHTML = `
    <div class="teacher-grid">
      ${teachers.map(teacher => `
        <div class="teacher-card">
          <img src="${teacher.image}" alt="${teacher.name}">
          <h3>${teacher.name}</h3>
          <p>${teacher.subject}</p>
          <div class="rating">${renderStars(parseInt(averageRating(teacher.ratings)))} (${averageRating(teacher.ratings)})</div>
          <div class="buttons">
            <button onclick="showTeacherDetails(${teacher.id})" class="btn-secondary">Mehr Info</button>
            <button onclick="showRatingForm(${teacher.id})" class="btn-primary">Bewerten</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showTeacherDetails(id) {
  const teacher = teachers.find(t => t.id === id);
  if (!teacher) return;

  currentTeacher = teacher;

  document.getElementById("app").innerHTML = `
    <div style="max-width:700px;margin:auto;padding:40px;text-align:center">
      <img src="${teacher.image}" alt="${teacher.name}" style="width:100px;height:100px;border-radius:50%;margin-bottom:20px;" />
      <h2>${teacher.name}</h2>
      <p>${teacher.subject}</p>
      <div class="rating-info">
        ${renderStars(parseInt(averageRating(teacher.ratings)))}
        <span class="count">(${averageRating(teacher.ratings)})</span>
      </div>
      <p style="margin-top:20px;">${teacher.description}</p>
      <button onclick="showRatingForm(${teacher.id})" class="btn-primary" style="margin-top:25px;display:block;margin:auto;">
        Jetzt bewerten
      </button>
    </div>
  `;
}

function showRatingForm(id) {
  const teacher = teachers.find(t => t.id === id);
  if (!teacher) return;

  currentTeacher = teacher;

  document.getElementById("app").innerHTML = `
    <div style="max-width:500px;margin:auto;padding:40px;background:white;margin-top:40px;border-radius:16px;">
      <h2>Lehrer bewerten</h2>
      
      <label for="teacher">Lehrer</label>
      <input type="text" value="${teacher.name}" readonly style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:10px;" />

      <label for="stars">Sternebewertung</label>
      <div class="star-buttons" id="star-buttons" style="display:flex;justify-content:center;gap:8px;font-size:2rem;"></div>

      <label for="comment">Kommentar (optional)</label>
      <textarea id="comment" rows="4" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:10px;"></textarea>

      <button type="button" onclick="submitRating()" class="btn-primary" style="display:block;margin:auto;padding:10px 20px;">
        Absenden
      </button>
    </div>
  `;

  const starsContainer = document.getElementById("star-buttons");

  let selectedStars = 0;

  function updateStarButtons() {
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const active = i <= selectedStars ? '★' : '☆';
      starsContainer.innerHTML += `<button type="button" data-star="${i}" style="background:none;border:none;font-size:2rem;">${active}</button>`;
    }

    starsContainer.querySelectorAll("button").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        selectedStars = index + 1;
        updateStarButtons();
      });

      btn.addEventListener("mouseover", () => {
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const active = i <= selectedStars ? '★' : '☆';
          starsContainer.innerHTML += `<button type="button" data-star="${i}" style="background:none;border:none;font-size:2rem;">${i <= selectedStars ? '★' : '☆'}</button>`;
        }
      });

      btn.addEventListener("mouseout", () => {
        updateStarButtons();
      });
    });
  }

  updateStarButtons();

  window.selectedStars = selectedStars;
}

function submitRating() {
  const comment = document.getElementById("comment").value;
  const rating = window.selectedStars || 5;
  const newRating = { stars: rating, comment };

  document.getElementById("app").innerHTML = `
    <div style="text-align:center; padding:40px;">
      <h2>Daten werden gesendet...</h2>
    </div>
  `;

  submitRatingToServer(currentTeacher.id, newRating).then(() => {
    document.getElementById("app").innerHTML = `
      <div style="text-align:center; padding:40px;">
        <h2>Danke für deine Bewertung!</h2>
        <p>Deine Bewertung wurde gespeichert.</p>
        <button onclick="showHomePage()" class="btn-primary" style="padding:10px 20px;">Zur Startseite</button>
      </div>
    `;
  }).catch(() => {
    document.getElementById("app").innerHTML = `
      <div style="text-align:center; padding:40px;">
        <h2>Fehler</h2>
        <p>Beim Speichern gab es ein Problem. Versuche es später erneut.</p>
        <button onclick="showRatingForm(${currentTeacher.id})" class="btn-primary" style="padding:10px 20px;">Nochmal versuchen</button>
      </div>
    `;
  });
}

document.getElementById("home-link").addEventListener("click", e => {
  e.preventDefault();
  showHomePage();
});

document.getElementById("about-link").addEventListener("click", e => {
  e.preventDefault();
  alert("Diese Seite dient der anonymen Bewertung von Lehrern der AHS Rahlgasse.");
});

loadTeachersFromServer();