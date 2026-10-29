const correctScore = document.querySelector(".correct-score");
const incorrectScore = document.querySelector(".incorrect-score");
const answeredScore = document.querySelector(".answered-score");
const circleScore = document.querySelector(".quiz-score");
const circlePercent = document.querySelector(".quiz-percentage");
const homeBtn = document.querySelector(".home-button");
const logo = document.querySelector(".logo");
const restartBtn = document.querySelector(".restart-button");
const quizResults = JSON.parse(localStorage.getItem("quizResults"));
const circleAnim = document.querySelector(".progress-circle");
const quizState = JSON.parse(localStorage.getItem("quizState"));
const factsBox = document.querySelector(".facts-box");
const resultsQuote = document.querySelector(".results-quote");
const factsLabel = document.querySelector(".facts-label");
const fact = document.querySelector(".fact");
const textHolder = document.querySelector(".text-holder");
const factAnswer = document.querySelector(".fact-answer");
const gif = document.createElement("img");

gif.src = "../assets/confetti.gif";
gif.style.position = "fixed";
gif.style.inset = "0";
gif.style.zIndex = "1000";
gif.style.left = "50%";
gif.style.top = "50%";
gif.style.transform = "translate(-50%, -50%)";
gif.style.pointerEvents = "none";
async function getQuestions() {
  const response = await fetch("../data/qna.json");
  const data = await response.json();

  return data;
}

homeBtn.addEventListener("click", () => {
  localStorage.setItem("quizStarted", false);
  localStorage.removeItem("quizResults");
  localStorage.removeItem("quizState");
});

logo.addEventListener("click", () => {
  localStorage.setItem("quizStarted", false);
  localStorage.removeItem("quizResults");
  localStorage.removeItem("quizState");
});

restartBtn.addEventListener("click", () => {
  localStorage.setItem("quizStarted", true);
  localStorage.removeItem("quizResults");
  localStorage.removeItem("quizState");
  window.location.href = "../pages/quiz.html";
});

if (!quizResults) {
  window.location.replace("../index.html");
} else {
  const percentage = quizResults.percentage;
  const offset = 100 - percentage;

  correctScore.textContent = quizResults.correctAnswers;
  incorrectScore.textContent = quizResults.incorrectAnswers;
  answeredScore.textContent =
    quizResults.correctAnswers + quizResults.incorrectAnswers;
  circleAnim.style.setProperty("--target-offset", offset);
  circleScore.textContent = `${quizResults.correctAnswers}/${quizResults.totalQuestions}`;
  circlePercent.textContent = `${quizResults.percentage}% correct`;
}

getQuestions().then((data) => {
  const answers = data.quiz;
  const answeredQuestions = quizState.savedAnswers;
  console.log(answers);
  console.log(answeredQuestions);
  const incorrectAnswers = [];
  const selectedFacts = []

  for (let i = 0; i < answers.length; i++) {
    const correctAnswers = answers[i].answer;
    const answeredQuestion = answers[i];
    const answeredAnswersJSON = answeredQuestions[answers[i].id].selectedAnswer;

    if (correctAnswers !== answeredAnswersJSON) {
      incorrectAnswers.push({ answeredQuestion, answeredAnswersJSON });
    }
  }

  if (incorrectAnswers.length === 0) {
    console.log("no incorrect answeres");
    factsBox.style.display = "none";
    resultsQuote.textContent = "Well done! You got all questions correct 🎉";
    document.body.append(gif);
    setTimeout(() => {
      gif.remove();
    }, 4000);
  }
  console.log(incorrectAnswers);

  const randomNum = Math.floor(Math.random() * incorrectAnswers.length);
  console.log(Math.floor(randomNum));

  const selectedFact = incorrectAnswers.splice(randomNum)
  selectedFact.push(selectedFacts)  

  console.log(selectedFacts);
});
