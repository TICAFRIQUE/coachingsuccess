const WA_NUMBER = "2250575751118";

function waLink(message) {
  return (
    "https://api.whatsapp.com/send?phone=" +
    WA_NUMBER +
    "&text=" +
    encodeURIComponent(message)
  );
}

// Menu hamburger
const toggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
function setMenu(open) {
  mainNav.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute(
    "aria-label",
    open ? "Fermer le menu" : "Ouvrir le menu",
  );
}
toggle.addEventListener("click", () =>
  setMenu(!mainNav.classList.contains("open")),
);
mainNav
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 800) setMenu(false);
});

// Bouton WhatsApp flottant : message adapté à la demande choisie
const needSelect = document.getElementById("need");
const waFloat = document.getElementById("wa-float");
let needChosen = false;
function updateFloat() {
  const intro = needChosen
    ? "Je suis intéressé(e) par : *" + needSelect.value + "*."
    : "Je souhaiterais avoir des informations sur vos accompagnements (coaching individuel et formations en entreprise).";
  waFloat.href = waLink(
    "Bonjour M. Doumbia,\n\n" +
      "Je vous contacte depuis le site *Coaching Succès*.\n" +
      intro +
      "\n\nPourriez-vous me donner plus d’informations ?\n\nMerci !",
  );
}
needSelect.addEventListener("change", () => {
  needChosen = true;
  updateFloat();
});
updateFloat();

document.getElementById("business-link").addEventListener("click", () => {
  needSelect.value = "Formation ou accompagnement en entreprise";
  needChosen = true;
  updateFloat();
});

// E-mails : reconstitués ici pour ne pas apparaître en clair dans le code
document.querySelectorAll(".js-mail").forEach((a) => {
  const addr = a.dataset.u + String.fromCharCode(64) + a.dataset.d;
  a.href = "mailto:" + addr;
  const value = a.querySelector(".ci-value");
  const label = a.querySelector(".ci-label");
  (value || a).textContent = addr;
  if (label) {
    a.setAttribute(
      "aria-label",
      "Écrire à " + label.textContent + " : " + addr,
    );
  }
});

// ---------- Protection anti-robots du formulaire ----------
const form = document.getElementById("contact-form");
const nameInput = document.getElementById("name");
const availInput = document.getElementById("availability");
const honeypot = document.getElementById("website");
const submitBtn = document.getElementById("submit-btn");
const feedback = document.getElementById("feedback");

const LOADED_AT = Date.now();
const MIN_FILL_MS = 3000; // un humain met plus de 3 s à remplir
const COOLDOWN_MS = 30000; // délai entre deux envois
const MAX_SENDS = 5; // envois max par session
const ALLOWED_NEEDS = Array.from(needSelect.options).map((o) => o.value);
const NAME_RE = /^[\p{L}][\p{L} '’-]{1,69}$/u;
const SPAM_RE = /(https?:|www\.|\.[a-z]{2,6}\/|<|>|@|\[url)/i;

// Interaction réelle (clavier, souris, tactile) avant l'envoi
let humanActivity = false;
["pointerdown", "keydown", "touchstart"].forEach((evt) =>
  document.addEventListener(
    evt,
    (ev) => {
      if (ev.isTrusted) humanActivity = true;
    },
    { passive: true },
  ),
);

function store(key, value) {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    sessionStorage.setItem(key, value);
  } catch (err) {
    return null;
  }
}

// Supprime caractères de contrôle/invisibles et symboles de mise en forme WhatsApp
function clean(str) {
  return str
    .normalize("NFC")
    .replace(/\p{Cf}/gu, "")
    .replace(/\p{Cc}/gu, " ")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function showError(msg, field) {
  feedback.textContent = msg;
  feedback.classList.add("is-error");
  if (field) {
    field.setAttribute("aria-invalid", "true");
    field.focus();
  }
}

function resetErrors() {
  feedback.textContent = "";
  feedback.classList.remove("is-error");
  [nameInput, needSelect, availInput].forEach((f) =>
    f.removeAttribute("aria-invalid"),
  );
}

[nameInput, availInput].forEach((f) =>
  f.addEventListener("input", () => f.removeAttribute("aria-invalid")),
);

function startCooldown(ms) {
  submitBtn.disabled = true;
  setTimeout(() => {
    submitBtn.disabled = false;
  }, ms);
}

// Formulaire : envoi des informations par WhatsApp
form.addEventListener("submit", function (e) {
    e.preventDefault();
    resetErrors();

    // 1. Soumission déclenchée par un script, sans interaction réelle
    if (!e.isTrusted || !humanActivity) return;

    // 2. Champ piège rempli : robot, on ignore en silence
    if (honeypot.value !== "") return;

    // 3. Formulaire envoyé trop vite après l'ouverture de la page
    if (Date.now() - LOADED_AT < MIN_FILL_MS) {
      showError("Merci de prendre quelques secondes pour vérifier vos informations, puis réessayez.");
      return;
    }

    // 4. Limite d'envois
    const sends = parseInt(store("cs_sends") || "0", 10);
    const last = parseInt(store("cs_last") || "0", 10);
    if (sends >= MAX_SENDS) {
      showError("Vous avez déjà envoyé plusieurs demandes. Contactez directement le cabinet par WhatsApp ou par téléphone.");
      return;
    }
    const wait = COOLDOWN_MS - (Date.now() - last);
    if (wait > 0) {
      showError("Veuillez patienter " + Math.ceil(wait / 1000) + " secondes avant un nouvel envoi.");
      startCooldown(wait);
      return;
    }

    // 5. Validation stricte des champs
    const name = clean(nameInput.value);
    if (!name) {
      showError("Indiquez votre prénom.", nameInput);
      return;
    }
    if (!NAME_RE.test(name) || SPAM_RE.test(name)) {
      showError("Votre prénom ne doit contenir que des lettres, espaces, apostrophes ou tirets (2 à 70 caractères).", nameInput);
      return;
    }

    const need = needSelect.value;
    if (!ALLOWED_NEEDS.includes(need)) {
      showError("Choisissez une demande dans la liste.", needSelect);
      return;
    }

    const availability = clean(availInput.value).slice(0, 120);
    if (SPAM_RE.test(availability)) {
      showError("La disponibilité ne doit pas contenir de lien ni d’adresse e-mail.", availInput);
      return;
    }

    store("cs_sends", String(sends + 1));
    store("cs_last", String(Date.now()));
    startCooldown(COOLDOWN_MS);

    const message = [
      "Bonjour M. Doumbia,",
      "",
      "Je vous contacte depuis le site *Coaching Succès* pour une demande de rendez-vous.",
      "",
      "*📋 MA DEMANDE*",
      "• *Prénom* : " + name,
      "• *Objet* : " + need,
      "• *Disponibilité* : " + (availability || "À convenir ensemble"),
      "",
      "Pourriez-vous me préciser les modalités (lieu, durée, tarif) et me proposer un créneau ?",
      "",
      "Merci d’avance,",
      name,
    ].join("\n");
    const url = waLink(message);
    feedback.textContent =
      "Ouverture de WhatsApp… Pensez à appuyer sur « Envoyer » dans WhatsApp. Aucun créneau n’est encore confirmé.";
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
  });

// Bouton retour en haut
const toTop = document.getElementById("to-top");
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);
const siteHeader = document.querySelector("header");
let ticking = false;
function updateToTop() {
  toTop.classList.toggle("visible", window.scrollY > 600);
  siteHeader.classList.toggle("scrolled", window.scrollY > 8);
  ticking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateToTop);
    }
  },
  { passive: true },
);
updateToTop();
toTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: reduceMotion.matches ? "auto" : "smooth",
  });
  // Remet le focus clavier en haut de page
  document.querySelector(".brand").focus({ preventScroll: true });
});

// ---------- Animations d'apparition au défilement ----------
(function () {
  const root = document.documentElement;
  if (!root.classList.contains("js-motion")) return;

  // Éléments seuls : titres et textes d'introduction
  document
    .querySelectorAll(
      ".intro > div, .intro > p, .process .eyebrow, .process h2, " +
        ".about-copy > p, .about-copy > .text-link, .enterprise, " +
        ".booking-layout > div > :not(.contact-list), #contact-form, " +
        "#questions > .eyebrow, #questions > h2",
    )
    .forEach((el) => el.setAttribute("data-reveal", ""));

  // Listes : apparition en cascade (décalage plafonné)
  [
    [".grid .card", 120],
    [".steps article", 120],
    [".contact-list li", 70],
    ["#questions details", 70],
  ].forEach(([selector, step]) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", Math.min(i * step, 420) + "ms");
    });
  });

  document
    .querySelectorAll(".nameplate")
    .forEach((el) => el.setAttribute("data-reveal", "clip"));

  // Un élément entièrement masqué par clip-path n'est jamais vu comme
  // « visible » par le navigateur : on observe alors son parent à la place.
  const revealTarget = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (revealTarget.get(entry.target) || entry.target).classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.getAttribute("data-reveal") === "clip") {
      revealTarget.set(el.parentElement, el);
      io.observe(el.parentElement);
    } else {
      io.observe(el);
    }
  });

  // Le soleil cesse de « respirer » quand il n'est plus visible
  const hero = document.querySelector(".hero");
  new IntersectionObserver(([entry]) => {
    hero.classList.toggle("is-off", !entry.isIntersecting);
  }).observe(hero);

  // Impression : tout afficher
  window.addEventListener("beforeprint", () =>
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => el.classList.add("is-in")),
  );

  window.__revealReady = true;
})();
