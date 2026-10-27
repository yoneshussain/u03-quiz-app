let currentQuestion = 0;
const totalQuestions = 10;

const questionNumber = document.getElementById("question-number");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

function updateProgress() {
  const displayedQuestion = currentQuestion + 1;
  const percentage = (displayedQuestion / totalQuestions) * 100;

  questionNumber.textContent = `Question ${displayedQuestion} of ${totalQuestions}`;
  progressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
}

updateProgress();