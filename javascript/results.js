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
const factQuestion1 = document.querySelector(".question1");
const factQuestion2 = document.querySelector(".question2");
const factAnswer1 = document.querySelector(".answer1");
const factAnswer2 = document.querySelector(".answer2");
const fact2 = document.querySelector(".fact2");
const gif = document.createElement("img");
const cheeringSound = document.querySelector("#cheering");
const clappingSound = document.querySelector("#clapping");

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
  const selectedFacts = [];

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
    clappingSound.currentTime = 0;
    clappingSound.play();
    cheeringSound.currentTime = 0;
    cheeringSound.play();
    setTimeout(() => {
      gif.remove();
    }, 4000);
  } else if (incorrectAnswers.length >= 2) {
    cheeringSound.currentTime = 0;
    cheeringSound.play();
    console.log(incorrectAnswers);

    let randomNum = Math.floor(Math.random() * incorrectAnswers.length);
    let randomNumber = Math.floor(randomNum);

    let randomNum2 = Math.floor(Math.random() * incorrectAnswers.length);
    let randomNumber2 = Math.floor(randomNum2);

    console.log(randomNumber2, randomNumber);

    while (randomNumber === randomNumber2) {
      console.log("same number, regenerating");
      randomNumber2 = Math.floor(Math.random() * incorrectAnswers.length);
    }

    console.log(randomNumber2, randomNumber);

    selectedFacts.push(
      incorrectAnswers[randomNumber],
      incorrectAnswers[randomNumber2],
    );
    let answered1 = `❌ ${selectedFacts[0].answeredAnswersJSON}`;
    let answered2 = `❌ ${selectedFacts[1].answeredAnswersJSON}`;

    if (selectedFacts[0].answeredAnswersJSON === null) {
      answered1 = `⏰ You didn't answer`;
    }
    if (selectedFacts[1].answeredAnswersJSON === null) {
      answered2 = `⏰ You didn't answer`;
    }
    if (
      selectedFacts[1].answeredAnswersJSON === null &&
      selectedFacts[0].answeredAnswersJSON === null
    ) {
      answered1 = `⏰ You didn't answer`;
      answered2 = `⏰ You didn't answer`;
    }

    factsLabel.textContent = `${selectedFacts.length} facts to take with you ✏️`;
    factQuestion1.textContent = selectedFacts[0].answeredQuestion.question;
    factAnswer1.textContent = `✅ ${selectedFacts[0].answeredQuestion.answer} | ${answered1}`;
    factQuestion2.textContent = selectedFacts[1].answeredQuestion.question;
    factAnswer2.textContent = `✅ ${selectedFacts[1].answeredQuestion.answer} | ${answered2}`;
  } else if (incorrectAnswers.length === 1) {
    cheeringSound.currentTime = 0;
    cheeringSound.play();
    console.log(incorrectAnswers);

    let randomNum = Math.floor(Math.random() * incorrectAnswers.length);
    let randomNumber = Math.floor(randomNum);

    console.log(randomNumber);

    selectedFacts.push(incorrectAnswers[randomNumber]);
    let answered1 = `❌ ${selectedFacts[0].answeredAnswersJSON}`;

    if (selectedFacts[0].answeredAnswersJSON === null) {
      answered1 = `⏰ You didn't answer`;
    }

    factsLabel.textContent = `${selectedFacts.length} fact to take with you ✏️`;
    factQuestion1.textContent = selectedFacts[0].answeredQuestion.question;
    factAnswer1.textContent = `✅ ${selectedFacts[0].answeredQuestion.answer} | ${answered1}`;

    fact2.style.display = "none";
  }
});
