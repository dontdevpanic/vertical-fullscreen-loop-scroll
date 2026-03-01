const palettes = [
    [
        { bg: "#e76f51", color: "#fff" },
        { bg: "#2a9d8f", color: "#fff" },
        { bg: "#e9c46a", color: "#222" },
        { bg: "#264653", color: "#fff" },
        { bg: "#f4a261", color: "#222" },
    ],
    [
        { bg: "#8ecae6", color: "#023047" },
        { bg: "#219ebc", color: "#fff" },
        { bg: "#023047", color: "#8ecae6" },
        { bg: "#ffb703", color: "#222" },
        { bg: "#fb8500", color: "#fff" },
    ],
    [
        { bg: "#d4e09b", color: "#333" },
        { bg: "#f6f4d2", color: "#333" },
        { bg: "#cbdfbd", color: "#333" },
        { bg: "#f19c79", color: "#fff" },
        { bg: "#a44a3f", color: "#fff" },
    ],
];
let loopCount = 0;

const track = document.getElementById("track");
const spyNav = document.getElementById("spy-nav");
const dotNav = document.getElementById("dot-nav");
const navLinks = Array.from(spyNav.querySelectorAll("a"));

// ── Duplikate automatisch erzeugen ──
const originals = Array.from(track.children);
originals.forEach(slide => {
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
});

const slideHeight = window.innerHeight;
const slideCount = originals.length;

let currentIndex = 0;
let isAnimating = false;
let lastWheelTime = 0;
const WHEEL_COOLDOWN = 800;

track.style.transform = `translateY(0px)`;

// ── Dot-Navigation aufbauen ──
originals.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.setAttribute("aria-label", `Slide ${i + 1}`);
    btn.addEventListener("click", () => goToSlide(i));
    dotNav.appendChild(btn);
});

const dots = Array.from(dotNav.querySelectorAll("button"));

// ── ScrollSpy updaten ──
function updateSpy(index) {
    const realIndex = ((index % slideCount) + slideCount) % slideCount;

    navLinks.forEach((a, i) => a.classList.toggle("active", i === realIndex));
    dots.forEach((d, i) => d.classList.toggle("active", i === realIndex));
}

updateSpy(0);

// ── Navbar-Klick → Slide anspringen ──
navLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
        e.preventDefault();
        goToSlide(i);
    });
});

// ── Wheel ──
window.addEventListener("wheel", (e) => {
    e.preventDefault();
    const now = Date.now();
    if (isAnimating || (now - lastWheelTime) < WHEEL_COOLDOWN) return;
    lastWheelTime = now;

    if (e.deltaY > 0) {
        currentIndex++;
    } else {
        currentIndex--;
    }

    animateToIndex(currentIndex);
}, { passive: false });

// ── Zu bestimmter Slide springen ──
function goToSlide(targetIndex) {
    if (isAnimating) return;

    // kürzesten Weg finden (vorwärts oder rückwärts)
    const diff = targetIndex - (((currentIndex % slideCount) + slideCount) % slideCount);
    if (diff === 0) return;

    currentIndex = currentIndex + diff;
    animateToIndex(currentIndex);
}

// ── Animation ──
function animateToIndex(index) {
    isAnimating = true;
    updateSpy(index);

    const fromY = getCurrentTranslateY();
    const toY = -(index * slideHeight);
    const distance = toY - fromY;
    const duration = 700;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        track.style.transform = `translateY(${fromY + distance * eased}px)`;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            loopReset();
            isAnimating = false;
            lastWheelTime = Date.now();
        }
    }

    requestAnimationFrame(step);
}

function loopReset() {
    if (currentIndex >= slideCount) {
        currentIndex -= slideCount;
        track.style.transform = `translateY(${-(currentIndex * slideHeight)}px)`;
    }
    if (currentIndex < 0) {
        currentIndex += slideCount;
        track.style.transform = `translateY(${-(currentIndex * slideHeight)}px)`;
    }
}

function getCurrentTranslateY() {
    const matrix = new DOMMatrix(window.getComputedStyle(track).transform);
    return matrix.m42;
}

function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Hamburger
function openNav() {
    document.getElementById("myNav").classList.add("is-open");
}

function closeNav() {
    document.getElementById("myNav").classList.remove("is-open");
}

const overlayLinks = Array.from(document.querySelectorAll("#myNav a[data-slide]"));

overlayLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
        e.preventDefault();
        goToSlide(i);
        closeNav();
    });
});