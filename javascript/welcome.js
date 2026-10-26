const startQuizButton = document.getElementById(`start-quiz`);
const quizStarted = localStorage.getItem(`quizStarted`);

if (quizStarted === `true`) {
    startQuizButton.textContent = `Continue Quiz`;
}

startQuizButton.addEventListener(`click`, () => {
    localStorage.setItem(`quizStarted`, `true`);
    window.location.href = `./pages/quiz.html`;
})