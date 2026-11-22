const googleFormUrl = "";
const votingStarts = Date.parse("2026-12-03T00:00:00+03:00");
const votingEnds = Date.parse("2026-12-04T00:00:00+03:00");
const election = document.querySelector("#election");
const clock = document.querySelector("#clock");
const clockDigits = clock.querySelector("span");
const electionStatus = document.querySelector("#election-status");

function updateElection() {
  const now = Date.now();
  if (now >= votingStarts) {
    clock.hidden = true;
    election.classList.add("after-countdown");
    electionStatus.textContent = now < votingEnds ? "ВЫБОРЫ СЕГОДНЯ!" : "ЖДЁМ РЕЗУЛЬТАТОВ";
    electionStatus.hidden = false;
    return;
  }
  const remaining = Math.ceil((votingStarts - now) / 1000);
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor(remaining / 3600) % 24;
  const minutes = Math.floor(remaining / 60) % 60;
  const seconds = remaining % 60;
  const units = days ? [days, hours, minutes] : [hours, minutes, seconds];
  clockDigits.textContent = units.map((value) => String(value).padStart(2, "0")).join(" : ");
  clock.setAttribute("aria-label", `До выборов: ${days} дн., ${hours} ч., ${minutes} мин., ${seconds} сек.`);
}

updateElection();
window.setInterval(updateElection, 1000);

const track = document.querySelector("#reason-track");
const previous = document.querySelector('[data-step="-1"]');
const next = document.querySelector('[data-step="1"]');

function updateArrows() {
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  track.classList.toggle("has-scrolled", track.scrollLeft > 2);
}

function moveCarousel(direction) {
  const first = track.firstElementChild;
  const step = first.nextElementSibling.offsetLeft - first.offsetLeft;
  const motion = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
  track.scrollBy({ left: direction * step, behavior: motion });
}

previous.addEventListener("click", () => moveCarousel(-1));
next.addEventListener("click", () => moveCarousel(1));
track.addEventListener("scroll", updateArrows, { passive: true });
track.addEventListener("keydown", (event) => {
  if (event.target !== track || !["ArrowRight", "ArrowLeft"].includes(event.key)) return;
  event.preventDefault();
  moveCarousel(event.key === "ArrowRight" ? 1 : -1);
});
new ResizeObserver(updateArrows).observe(track);
updateArrows();

const ideaLink = document.querySelector("#idea-link");
const formStatus = document.querySelector("#form-status");
if (googleFormUrl) {
  ideaLink.href = googleFormUrl;
  ideaLink.target = "_blank";
  ideaLink.rel = "noopener noreferrer";
} else {
  ideaLink.setAttribute("aria-haspopup", "dialog");
  ideaLink.addEventListener("click", (event) => {
    event.preventDefault();
    formStatus.showModal();
  });
}
