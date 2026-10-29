const quizScore = document.querySelector(".quiz-score");
const correctScore = document.querySelector(".correct-score");
const incorrectScore = document.querySelector(".incorrect-score");
const answeredScore = document.querySelector(".answered-score");
const homeBtn = document.querySelector(".home-button");
const restartBtn = document.querySelector(".restart-button");
const quizStarted = localStorage.getItem("quizStarted");
const quizResults = JSON.parse(localStorage.getItem("quizResults"));
const circleAnim = document.querySelector
const percentage = quizResults.percentage
const offset = 100 - percentage

homeBtn.addEventListener("click", () => {
  localStorage.setItem("quizStarted", false);
});

restartBtn.addEventListener("click", () => {
  localStorage.setItem("quizStarted", true);
  window.location.href = "../pages/quiz.html";
});

document.addEventListener("DOMContentLoaded", () => {
  correctScore.textContent = quizResults.correctAnswers;
  incorrectScore.textContent = quizResults.incorrectAnswers;
  incorrectScore.textContent = quizResults.totalQuestions;
});
