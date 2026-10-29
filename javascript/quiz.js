
const STORAGE_KEY = "quizState";
const RESULTS_KEY = "quizResults";
const POINTS_PER_QUESTION = 10;

let questions = [];
let currentQuestionIndex = 0;
let quizState = "waiting";

const timeLimit = 30;
let timeLeft = timeLimit;
let timerInterval = null;
let questionTimers = {};
let pausedTimers = {};

// Stores answers by question ID
let savedAnswers = {};

// DOM Elements
const questionTitle = document.querySelector(".question-title");
const questionNumber = document.getElementById("question-number");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

const timerDisplay = document.getElementById("timer-display");

const answerOptions = document.querySelectorAll(".answer-option");

const nextButton = document.getElementById("next-btn");
const nextButtonText = document.getElementById("next-btn-text");
const quizMessage = document.getElementById("quiz-message");

const answerFeedback = document.querySelector(".answer-feedback");
const feedbackTitle = document.querySelector(".feedback-title");
const feedbackExplanation = document.querySelector(".feedback-explanation");

// Create Previous Question button
const previousButton = document.createElement("button");

previousButton.id = "previous-btn";
previousButton.type = "button";
previousButton.disabled = true;

const previousIcon = document.createElement("img");
previousIcon.src = "../assets/arrow-left.svg";
previousIcon.alt = "";

const previousText = document.createElement("span");
previousText.textContent = "Previous Question";

previousButton.append(previousIcon, previousText);

// Basic styling without changing team CSS
Object.assign(previousButton.style, {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  height: "52px",
  fontFamily: `"Inter", sans-serif`,
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-white)",
  color: "inherit",
  cursor: "pointer",
});

const navigation = document.querySelector(".quiz-navigation");

navigation.insertBefore(previousButton, nextButton);

// Load questions
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

    const storedState = loadQuizState();

    if (storedState) {
      // Restore the original shuffled question order
      const questionMap = new Map(
        data.quiz.map((question) => [question.id, question]),
      );

      const restoredQuestions = storedState.questionOrder.map((id) =>
        questionMap.get(id),
      );

      const validOrder =
        restoredQuestions.length === data.quiz.length &&
        restoredQuestions.every(Boolean) &&
        new Set(storedState.questionOrder).size === data.quiz.length;

      if (validOrder) {
        questions = restoredQuestions;

        currentQuestionIndex = Math.min(
          Math.max(0, storedState.currentQuestionIndex),
          questions.length - 1,
        );

        savedAnswers = storedState.savedAnswers;
        questionTimers = storedState.questionTimers || {};
        pausedTimers = storedState.pausedTimers || {};

        console.log("Quiz progress restored.");
      } else {
        startNewQuiz(data.quiz);
      }
    } else {
      startNewQuiz(data.quiz);
    }

    displayQuestion();
  } catch (error) {
    console.error("Error loading questions:", error);

    questionTitle.textContent = "Unable to load quiz.";
    quizMessage.textContent = "Please refresh and try again.";

    nextButton.disabled = true;
    previousButton.disabled = true;
  }
}

// Fisher-Yates shuffle
function shuffleQuestions(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }

  return array;
}

// Start a new quiz
function startNewQuiz(quizData) {
  questions = shuffleQuestions([...quizData]);

  currentQuestionIndex = 0;
  quizState = "waiting";
  savedAnswers = {};
  questionTimers = {};
  pausedTimers = {};

  localStorage.removeItem(RESULTS_KEY);

  saveQuizState();
}

// Save entire quiz state
function saveQuizState() {
  const state = {
    questionOrder: questions.map((question) => question.id),
    currentQuestionIndex: currentQuestionIndex,
    savedAnswers: savedAnswers,
    questionTimers: questionTimers,
    pausedTimers: pausedTimers,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Read saved quiz state
function loadQuizState() {
  const storedData = localStorage.getItem(STORAGE_KEY);

  if (!storedData) return null;

  try {
    const state = JSON.parse(storedData);

    if (
      !Array.isArray(state.questionOrder) ||
      !Number.isInteger(state.currentQuestionIndex) ||
      !state.savedAnswers ||
      typeof state.savedAnswers !== "object" ||
      Array.isArray(state.savedAnswers)
    ) {
      return null;
    }

    return state;
  } catch (error) {
    console.error("Invalid saved quiz state:", error);
    return null;
  }
}

// Get the current question's saved answer
function getCurrentAnswer() {
  const currentQuestion = questions[currentQuestionIndex];

  return savedAnswers[currentQuestion.id] || null;
}

// Calculate score from submitted answers
function calculateScore() {
  let correct = 0;
  let incorrect = 0;

  questions.forEach((question) => {
    const record = savedAnswers[question.id];

    if (!record || !record.submitted) return;

    if (record.selectedAnswer === question.answer) {
      correct++;
    } else {
      incorrect++;
    }
  });

  return {
    score: correct * POINTS_PER_QUESTION,
    correctAnswers: correct,
    incorrectAnswers: incorrect,
  };
}

// Display question
function displayQuestion() {
  if (questions.length === 0) return;

  const currentQuestion = questions[currentQuestionIndex];
  const record = getCurrentAnswer();

  questionTitle.textContent = currentQuestion.question;

  if (!record) {
    quizState = "waiting";
  } else if (record.submitted) {
    quizState = "submitted";
  } else {
    quizState = "selected";
  }

  displayAnswers();
  displayFeedback();
  updateProgress();
  updateButtonState();

  if (quizState === "waiting" || quizState === "selected") {
    startTimer();
  } else if (quizState === "submitted") {
    clearInterval(timerInterval);
    timerInterval = null;

    timerDisplay.textContent = "—";
  }

  previousButton.disabled = currentQuestionIndex === 0;

  saveQuizState();
}

// Display answers
function displayAnswers() {
  const currentQuestion = questions[currentQuestionIndex];
  const record = getCurrentAnswer();

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
    answerText.textContent = answers[index];

    input.checked = record?.selectedAnswer === answers[index];

    input.disabled = Boolean(record?.submitted);
  });
}

// Display feedback
function displayFeedback() {
  const currentQuestion = questions[currentQuestionIndex];
  const record = getCurrentAnswer();

  answerFeedback.hidden = true;
  answerFeedback.classList.remove("is-correct", "is-incorrect");

  if (!record || !record.submitted) return;

  const isCorrect = record.selectedAnswer === currentQuestion.answer;

  answerFeedback.hidden = false;

  if (isCorrect) {
    answerFeedback.classList.add("is-correct");

    feedbackTitle.textContent = "Correct!";
    feedbackExplanation.textContent = `Great job! You earned ${POINTS_PER_QUESTION} points.`;
  } else {
    answerFeedback.classList.add("is-incorrect");

    feedbackTitle.textContent = "Incorrect!";
    feedbackExplanation.textContent = `The correct answer is ${currentQuestion.answer}.`;
  }
}

// Update progress bar
function updateProgress() {
  const totalQuestions = questions.length;

  if (totalQuestions === 0) return;

  const displayedQuestion = currentQuestionIndex + 1;
  const percentage = (displayedQuestion / totalQuestions) * 100;

  questionNumber.textContent = `Question ${displayedQuestion} of ${totalQuestions}`;

  progressPercent.textContent = `${Math.round(percentage)}%`;

  progressFill.style.width = `${percentage}%`;
}

// Update navigation button
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

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    nextButtonText.textContent = isLastQuestion
      ? "View Results"
      : "Next Question";

    const results = calculateScore();

    quizMessage.textContent = `Your score: ${results.score} points`;
  }
}

// Handle answer selection
answerOptions.forEach((option) => {
  const input = option.querySelector("input");

  input.addEventListener("change", () => {
    if (quizState === "submitted") return;
    if (questions.length === 0) return;

    soundClick.currentTime = 0;
    soundClick.play();

    const currentQuestion = questions[currentQuestionIndex];

    savedAnswers[currentQuestion.id] = {
      selectedAnswer: input.value,
      submitted: false,
    };

    quizState = "selected";
    updateButtonState();
    saveQuizState();
  });
});

// Submit answer
function submitAnswer() {
  if (quizState !== "selected") return;

  const currentQuestion = questions[currentQuestionIndex];
  const record = getCurrentAnswer();

  if (!record || record.submitted) return;

  const validAnswers = [
    currentQuestion["alt-1"],
    currentQuestion["alt-2"],
    currentQuestion["alt-3"],
    currentQuestion["alt-4"],
  ];

  if (!validAnswers.includes(record.selectedAnswer)) return;

  record.submitted = true;
  quizState = "submitted";

  clearInterval(timerInterval);
  timerInterval = null;

  saveQuizState();

  displayQuestion();
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

// Go back to previous question
function previousQuestion() {
  if (currentQuestionIndex <= 0) return;

  if (quizState === "waiting" || quizState === "selected") {
    pauseTimer();
  }

  currentQuestionIndex--;
  displayQuestion();
}

// Finish quiz
function finishQuiz() {
  const results = calculateScore();

  const totalQuestions = questions.length;
  const maxScore = totalQuestions * POINTS_PER_QUESTION;

  const percentage = totalQuestions
    ? Math.round((results.correctAnswers / totalQuestions) * 100)
    : 0;

  const finalResults = {
    score: results.score,
    maxScore: maxScore,
    correctAnswers: results.correctAnswers,
    incorrectAnswers: results.incorrectAnswers,
    totalQuestions: totalQuestions,
    percentage: percentage,
  };

  localStorage.setItem(RESULTS_KEY, JSON.stringify(finalResults));

  saveQuizState();

  console.log("Final results:", finalResults);

  window.location.href = "./results.html";
}

// Navigation events
nextButton.addEventListener("click", () => {
  if (quizState === "selected") {
    soundClick.currentTime = 0; 
    soundClick.play();
    submitAnswer();
  } else if (quizState === "submitted") {
    soundClick.currentTime = 0;
    soundClick.play();
    nextQuestion();
  }
});

previousButton.addEventListener("click", () => {
    soundClick.currentTime = 0;
    soundClick.play();
    previousQuestion();
});
// Initialize quiz
updateButtonState();
loadQuestions();

// Timer

function pauseTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return;

  const questionId = currentQuestion.id;

  if (
    questionTimers[questionId] !== undefined &&
    pausedTimers[questionId] !== true
  ) {
    const remainingTime = Math.max(
      0,
      questionTimers[questionId] - Date.now(),
    );

    questionTimers[questionId] = remainingTime;
    pausedTimers[questionId] = true;

    saveQuizState();
  }
}

function startTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionId = currentQuestion.id;

  if (pausedTimers[questionId] === true) {
  questionTimers[questionId] = Date.now() + questionTimers[questionId];
  pausedTimers[questionId] = false;
  saveQuizState();
} else if (questionTimers[questionId] === undefined) {
  questionTimers[questionId] = Date.now() + timeLimit * 1000;
  saveQuizState();
}

  timeLeft = Math.max(
    0,
    Math.ceil((questionTimers[questionId] - Date.now()) / 1000),
  );

  timerDisplay.textContent = `${timeLeft}`;

  if (timeLeft <= 0) {
    handleTimeUp();
    return;
  }

  timerInterval = setInterval(function () {
    if (questions[currentQuestionIndex]?.id !== questionId) {
      clearInterval(timerInterval);
      timerInterval = null;
      return;
    }

    timeLeft = Math.max(
      0,
      Math.ceil((questionTimers[questionId] - Date.now()) / 1000),
    );

    timerDisplay.textContent = `${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      handleTimeUp();
    }
  }, 1000);
}

function handleTimeUp() {
  if (questions.length === 0) return;

  const currentQuestion = questions[currentQuestionIndex];

  savedAnswers[currentQuestion.id] = {
    selectedAnswer: null,
    submitted: true,
  };

  quizState = "submitted";

  displayQuestion();
}
