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
  const units = [days, hours, minutes, seconds];
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


// Match the selectable DOM text to the lettering in the desktop artwork.
const desktopArtwork = matchMedia("(min-width: 761px)");
const artworkLabels = Array.from(document.querySelectorAll(".art-fit"));

function fitArtworkLabels() {
  if (!desktopArtwork.matches) return;
  const ratios = artworkLabels.map((label) => label.parentElement.clientWidth / Math.max(1, label.offsetWidth));
  artworkLabels.forEach((label, index) => label.style.setProperty("--fit", ratios[index]));
}

new ResizeObserver(fitArtworkLabels).observe(document.querySelector(".frame"));
desktopArtwork.addEventListener("change", fitArtworkLabels);
fitArtworkLabels();
if (document.fonts) document.fonts.ready.then(fitArtworkLabels);


// A mouse click still opens a link. Dragging over its lettering selects the text.
for (const link of document.querySelectorAll('a[draggable="false"]')) {
  const label = link.querySelector(".art-fit");
  const textNode = label.firstChild;
  let drag;
  let cancelClick = false;

  function textOffset(event) {
    const bounds = label.getBoundingClientRect();
    if (event.clientX <= bounds.left) return 0;
    if (event.clientX >= bounds.right) return textNode.length;
    const centerY = label.parentElement.getBoundingClientRect().top + label.parentElement.clientHeight / 2;
    const caret = document.caretPositionFromPoint?.(event.clientX, centerY);
    if (caret?.offsetNode === textNode) return caret.offset;
    const range = document.caretRangeFromPoint?.(event.clientX, centerY);
    if (range?.startContainer === textNode) return range.startOffset;
    return Math.round((event.clientX - bounds.left) / bounds.width * textNode.length);
  }

  link.addEventListener("pointerdown", (event) => {
    cancelClick = false;
    if (!desktopArtwork.matches || event.pointerType !== "mouse" || event.button !== 0 ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !label.contains(event.target)) return;
    drag = { id: event.pointerId, x: event.clientX, offset: textOffset(event) };
    event.preventDefault();
    link.setPointerCapture(event.pointerId);
  });

  link.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId || (!cancelClick && Math.abs(event.clientX - drag.x) < 4)) return;
    cancelClick = true;
    window.getSelection()?.setBaseAndExtent(textNode, drag.offset, textNode, textOffset(event));
  });

  link.addEventListener("lostpointercapture", () => { drag = undefined; });
  link.addEventListener("click", (event) => {
    if (!cancelClick || event.detail === 0) return;
    cancelClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}

for (const title of document.querySelectorAll(".reason summary")) {
  let start;
  title.addEventListener("pointerdown", (event) => {
    start = event.pointerType === "mouse" ? [event.clientX, event.clientY] : undefined;
  });
  title.addEventListener("click", (event) => {
    if (event.detail && start && Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 4) {
      event.preventDefault();
    }
    start = undefined;
  });
}
