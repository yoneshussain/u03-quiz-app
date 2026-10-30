const root = document.documentElement;
const themeToggle = document.querySelector(`.theme-toggle`);
const soundSwitchOn = document.getElementById(`switch-on`);
const soundSwitchOff = document.getElementById(`switch-off`);
const savedTheme = localStorage.getItem(`theme`);
const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`).matches;

function updateThemeToggle() {
    if (root.classList.contains(`dark`)) {
        themeToggle.classList.add(`is-dark`);
        themeToggle.setAttribute(`aria-label`, `Switch to light mode`);
    } else {
        themeToggle.classList.remove(`is-dark`);
        themeToggle.setAttribute(`aria-label`, `Switch to dark mode`);
    }
}

if (savedTheme === `dark` || (savedTheme === null && prefersDark)) {
    root.classList.add(`dark`);
}

updateThemeToggle();

themeToggle.addEventListener(`click`, () => {
    root.classList.toggle(`dark`);
    updateThemeToggle();

    if (root.classList.contains(`dark`)) {
        localStorage.setItem(`theme`, `dark`);
        soundSwitchOff.currentTime = 0.2;
        soundSwitchOff.play();
    } else {
        localStorage.setItem(`theme`, `light`);
        soundSwitchOn.currentTime = 0.2;
        soundSwitchOn.play();
    }
})
