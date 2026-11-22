// Paste the public respondent URL when the Google Form is ready.
const googleFormUrl = "";
const votingStarts = Date.parse("2026-12-03T00:00:00+03:00");
const votingEnds = Date.parse("2026-12-04T00:00:00+03:00");
const clock = document.querySelector("#clock");
const electionStatus = document.querySelector("#election-status");
const counters = ["days", "hours", "minutes", "seconds"].map((id) => document.getElementById(id));

function updateElection() {
  const now = Date.now();
  if (now >= votingStarts) {
    clock.hidden = true;
    document.querySelector(".election-label").hidden = true;
    electionStatus.textContent = now < votingEnds ? "ВЫБОРЫ СЕГОДНЯ!" : "ЖДЁМ РЕЗУЛЬТАТОВ";
    electionStatus.hidden = false;
    return;
  }
  const remaining = Math.ceil((votingStarts - now) / 1000);
  const parts = [
    Math.floor(remaining / 86400),
    Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ];
  counters.forEach((counter, index) => {
    counter.textContent = String(parts[index]).padStart(2, "0");
  });
}

updateElection();
window.setInterval(updateElection, 1000);

const track = document.querySelector("#reason-track");
const previous = document.querySelector('[data-step="-1"]');
const next = document.querySelector('[data-step="1"]');

function updateArrows() {
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
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

if (googleFormUrl) {
  const link = document.querySelector("#idea-link");
  link.href = googleFormUrl;
  link.removeAttribute("aria-disabled");
  link.removeAttribute("aria-describedby");
  document.querySelector("#idea-status").hidden = true;
}
