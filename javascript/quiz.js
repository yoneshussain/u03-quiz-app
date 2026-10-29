
let currentQuestionIndex = 0;
let questions = [];
let quizState = "waiting";

let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;

const pointsPerQuestion = 10;

// DOM Elements
const questionTitle = document.querySelector(".question-title");
const questionNumber = document.getElementById("question-number");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

const answerOptions = document.querySelectorAll(".answer-option");

const nextButton = document.getElementById("next-btn");
const nextButtonText = document.getElementById("next-btn-text");
const quizMessage = document.getElementById("quiz-message");

const answerFeedback = document.querySelector(".answer-feedback");
const feedbackTitle = document.querySelector(".feedback-title");
const feedbackExplanation = document.querySelector(".feedback-explanation");

// Load questions from JSON
async function loadQuestions() {
  try {
    nextButton.disabled = true;

    const response = await fetch("../data/qna.json");

    if (!response.ok) {
      throw new Error("Failed to load questions");
    }

    const data = await response.json();

    if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
      throw new Error("No questions found");
    }

    questions = shuffleQuestions([...data.quiz]);

    currentQuestionIndex = 0;
    quizState = "waiting";

    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;

    displayQuestion();
    updateButtonState();

    console.log(
      "Questions order:",
      questions.map((question) => question.id),
    );
  } catch (error) {
    console.error("Error loading questions:", error);

    questionTitle.textContent = "Unable to load quiz.";
    quizMessage.textContent = "Please refresh the page and try again.";
    nextButton.disabled = true;
  }
}

// Fisher-Yates shuffle algorithm
function shuffleQuestions(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [array[i], array[randomIndex]] = [
      array[randomIndex],
      array[i],
    ];
  }

  return array;
}

// Display the current question
function displayQuestion() {
  if (questions.length === 0) return;

  const currentQuestion = questions[currentQuestionIndex];

  questionTitle.textContent = currentQuestion.question;

  quizState = "waiting";

  answerFeedback.hidden = true;
  answerFeedback.classList.remove("is-correct", "is-incorrect");

  displayAnswers();
  updateProgress();
  updateButtonState();
}

// Display the four answers
function displayAnswers() {
  const currentQuestion = questions[currentQuestionIndex];

  const answers = [
    currentQuestion["alt-1"],
    currentQuestion["alt-2"],
    currentQuestion["alt-3"],
    currentQuestion["alt-4"],
  ];

  answerOptions.forEach((option, index) => {
    const input = option.querySelector("input");
    const answerText = option.querySelector(".answer-text");

    input.value = answers[index];
    input.checked = false;
    input.disabled = false;

    answerText.textContent = answers[index];
  });
}

// Update the progress bar
function updateProgress() {
  const totalQuestions = questions.length;

  if (totalQuestions === 0) return;

  const displayedQuestion = currentQuestionIndex + 1;
  const percentage = (displayedQuestion / totalQuestions) * 100;

  questionNumber.textContent =
    `Question ${displayedQuestion} of ${totalQuestions}`;

  progressPercent.textContent = `${Math.round(percentage)}%`;

  progressFill.style.width = `${percentage}%`;
}

// Update button depending on quiz state
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

    const isLastQuestion =
      currentQuestionIndex === questions.length - 1;

    nextButtonText.textContent = isLastQuestion
      ? "View Results"
      : "Next Question";

    quizMessage.textContent =
      `Your score: ${score} points`;
  }
}

// Detect when an answer is selected
answerOptions.forEach((option) => {
  const input = option.querySelector("input");

  input.addEventListener("change", () => {
    if (quizState === "submitted") return;

    quizState = "selected";
    updateButtonState();
  });
});

// Submit and check the selected answer
function submitAnswer() {
  if (quizState !== "selected") return;

  const selectedAnswer = document.querySelector(
    'input[name="answer"]:checked',
  );

  if (!selectedAnswer) return;

  const currentQuestion = questions[currentQuestionIndex];

  const isCorrect =
    selectedAnswer.value === currentQuestion.answer;

  if (isCorrect) {
    score += pointsPerQuestion;
    correctAnswers++;
  } else {
    incorrectAnswers++;
  }

  // Show feedback
  answerFeedback.hidden = false;
  answerFeedback.classList.remove("is-correct", "is-incorrect");

  if (isCorrect) {
    answerFeedback.classList.add("is-correct");

    feedbackTitle.textContent = "Correct!";

    feedbackExplanation.textContent =
      `Great job! You earned ${pointsPerQuestion} points.`;
  } else {
    answerFeedback.classList.add("is-incorrect");

    feedbackTitle.textContent = "Incorrect!";

    feedbackExplanation.textContent =
      `The correct answer is ${currentQuestion.answer}.`;
  }

  // Lock the answer options
  answerOptions.forEach((option) => {
    const input = option.querySelector("input");
    input.disabled = true;
  });

  quizState = "submitted";
  updateButtonState();

  console.log("Current score:", score);
}

// Move to next question
function nextQuestion() {
  if (quizState !== "submitted") return;

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;

    displayQuestion();
  } else {
    finishQuiz();
  }
}

// Finish quiz and save results
function finishQuiz() {
  const totalQuestions = questions.length;
  const maxScore = totalQuestions * pointsPerQuestion;

  const percentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const results = {
    score: score,
    maxScore: maxScore,
    correctAnswers: correctAnswers,
    incorrectAnswers: incorrectAnswers,
    totalQuestions: totalQuestions,
    percentage: percentage,
  };

  sessionStorage.setItem("quizResults", JSON.stringify(results));

  console.log("Final results:", results);

  window.location.href = "./results.html";
}

// Handle main button click
nextButton.addEventListener("click", () => {
  if (quizState === "selected") {
    submitAnswer();
  } else if (quizState === "submitted") {
    nextQuestion();
  }
});

// Initialize quiz
updateButtonState();
loadQuestions();
