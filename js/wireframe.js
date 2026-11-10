/* ==========================================================
   EduGrant - Working Wireframe behavior
   - Switches between the six "pages" (sections) without reloading
   - Filters the sample scholarships
   - Opens a details page for the chosen scholarship
   - Saves scholarships to the dashboard (in memory only)
   ========================================================== */

(function () {
  "use strict";

  var PAGE_IDS = ["home", "search", "details", "dashboard", "guide", "about"];
  var pages = document.querySelectorAll(".page");
  var navLinks = document.querySelectorAll(".nav-link");

  var savedScholarships = [];
  var currentScholarship = "";

  /* ---------- Page switching ---------- */
  function showPage(id, options) {
    if (PAGE_IDS.indexOf(id) === -1) { id = "home"; }
    // Details needs a chosen scholarship, so send people to the list first.
    if (id === "details" && !currentScholarship) { id = "search"; }
    options = options || {};

    pages.forEach(function (page) {
      page.classList.toggle("active", page.id === id);
    });

    // The details page belongs to the Scholarships menu item.
    var navId = id === "details" ? "search" : id;
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("data-page") === navId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (!options.skipHash && window.location.hash !== "#" + id) {
      window.location.hash = id;
    }

    window.scrollTo(0, 0);

    // Move keyboard focus to the new page heading for screen reader users.
    var heading = document.querySelector("#" + id + " h1");
    if (heading && !options.skipFocus) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  // Any element with data-page navigates (menu, logo, Login, View all, etc.)
  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-page]");
    if (!trigger) { return; }
    event.preventDefault();
    showPage(trigger.getAttribute("data-page"));
  });

  // Browser back / forward and typed #hash
  window.addEventListener("hashchange", function () {
    var id = window.location.hash.replace("#", "");
    showPage(id, { skipHash: true, skipFocus: true });
  });

  /* ---------- Search and filters ---------- */
  var searchInput = document.getElementById("searchInput");
  var levelFilter = document.getElementById("levelFilter");
  var typeFilter = document.getElementById("typeFilter");
  var cards = document.querySelectorAll("#scholarshipList .scholarship");
  var resultCount = document.getElementById("resultCount");
  var noResults = document.getElementById("noResults");

  function applyFilters() {
    var query = searchInput.value.trim().toLowerCase();
    var level = levelFilter.value;
    var type = typeFilter.value;
    var shown = 0;

    cards.forEach(function (card) {
      var name = card.getAttribute("data-name").toLowerCase();
      var matches =
        (query === "" || name.indexOf(query) !== -1) &&
        (level === "" || card.getAttribute("data-level") === level) &&
        (type === "" || card.getAttribute("data-type") === type);

      card.classList.toggle("hidden", !matches);
      if (matches) { shown += 1; }
    });

    noResults.classList.toggle("hidden", shown !== 0);

    if (query === "" && level === "" && type === "") {
      resultCount.textContent = "Showing all sample scholarships";
    } else {
      resultCount.textContent =
        "Showing " + shown + " of " + cards.length + " sample scholarships";
    }
  }

  document.getElementById("filterBtn").addEventListener("click", applyFilters);
  searchInput.addEventListener("input", applyFilters);
  levelFilter.addEventListener("change", applyFilters);
  typeFilter.addEventListener("change", applyFilters);

  // Pressing Enter in the keyword box also searches.
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") { event.preventDefault(); applyFilters(); }
  });

  /* ---------- Home page search -> Find Scholarships ---------- */
  var homeSearch = document.getElementById("homeSearch");

  function searchFromHome() {
    searchInput.value = homeSearch.value;
    levelFilter.value = "";
    typeFilter.value = "";
    applyFilters();
    showPage("search");
  }

  document.getElementById("homeSearchBtn").addEventListener("click", searchFromHome);
  homeSearch.addEventListener("keydown", function (event) {
    if (event.key === "Enter") { event.preventDefault(); searchFromHome(); }
  });

  /* ---------- View details ---------- */
  var detailTitle = document.getElementById("detailTitle");
  var saveMessage = document.getElementById("saveMessage");
  var applyMessage = document.getElementById("applyMessage");

  document.querySelectorAll(".details-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      currentScholarship = button.getAttribute("data-name");
      detailTitle.textContent = currentScholarship;
      saveMessage.textContent = "";
      applyMessage.textContent = "";
      showPage("details");
    });
  });

  /* ---------- Save scholarship -> Dashboard ---------- */
  var savedCount = document.getElementById("savedCount");
  var savedList = document.getElementById("savedList");

  function renderSaved() {
    savedCount.textContent = String(savedScholarships.length);
    savedList.innerHTML = "";

    if (savedScholarships.length === 0) {
      var empty = document.createElement("li");
      empty.textContent = "[ No saved scholarships yet ]";
      savedList.appendChild(empty);
      return;
    }

    savedScholarships.forEach(function (name) {
      var item = document.createElement("li");
      item.textContent = name;
      savedList.appendChild(item);
    });
  }

  document.getElementById("saveScholarship").addEventListener("click", function () {
    if (!currentScholarship) {
      saveMessage.textContent = " Choose a scholarship first.";
      return;
    }
    if (savedScholarships.indexOf(currentScholarship) !== -1) {
      saveMessage.textContent = " Already saved.";
      return;
    }
    savedScholarships.push(currentScholarship);
    renderSaved();
    saveMessage.textContent = " Saved! See it on your Dashboard.";
  });

  /* ---------- Application reminder ---------- */
  document.getElementById("applyInfo").addEventListener("click", function () {
    applyMessage.textContent =
      "Reminder: check the provider's official website for the current requirements and deadline.";
  });

  /* ---------- Start ---------- */
  renderSaved();
  var startId = window.location.hash.replace("#", "");
  showPage(startId || "home", { skipFocus: true, skipHash: true });
})();
