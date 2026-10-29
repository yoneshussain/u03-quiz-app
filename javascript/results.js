const quizScore = document.querySelector(".quiz-score");
const homeBtn = document.querySelector(".home-button");
const restartBtn = document.querySelector(".restart-button");
const quizStarted = localStorage.getItem("quizStarted");

homeBtn.addEventListener("click", () => {
  localStorage.setItem("quizStarted", false);
});

restartBtn.addEventListener("click", () => {
  localStorage.setItem("quizStarted", true);
  window.location.href = "../pages/quiz.html"
});

document.addEventListener("DOMContentLoaded", () => {});
