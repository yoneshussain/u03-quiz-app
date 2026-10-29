let currentQuestion = 0;
let quizState = "waiting";
const totalQuestions = 10;

const questionNumber = document.getElementById("question-number");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

const nextButton = document.getElementById("next-btn");
const nextButtonText = document.getElementById("next-btn-text");
const quizMessage = document.getElementById("quiz-message");

function updateProgress() {
  const displayedQuestion = currentQuestion + 1;
  const percentage = (displayedQuestion / totalQuestions) * 100;

  questionNumber.textContent = `Question ${displayedQuestion} of ${totalQuestions}`;
  progressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
}

function updateButtonState() {
  if (quizState === "waiting") {
    nextButton.disabled = true;
    nextButtonText.textContent = "Submit Answer";
    quizMessage.textContent = "Select an answer to continue.";
  } else if (quizState === "selected") {
    nextButton.disabled = false;
    nextButtonText.textContent = "Submit Answer";
    quizMessage.textContent = "Ready? Submit to check your answer.";
  } else if (quizState === "submitted") {
    nextButton.disabled = false;
    nextButtonText.textContent = "Next Question";
    quizMessage.textContent = "Take your time. Every answer is a discovery.";
  }
}

function nextQuestion() {
  if (currentQuestion < totalQuestions - 1) {
    currentQuestion++;
    updateProgress();
    quizState = "waiting";

    updateButtonState();
  }
}

updateProgress();
updateButtonState();
