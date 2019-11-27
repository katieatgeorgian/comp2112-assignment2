/*Note the SpeechRecognition functionality does work but the prompt to allow access to microphone keeps popping up
in order to use this function you have to catch it in between prompts - spoke with Albert about it already

Implemented the sound for bonus marks - when the user reaches levels 5 & 10 different music is played
(executive decision to change it to this as those are the highlighted levels).
If the user gets the answer right or wrong sounds play accordingly.*/

new Vue({
  el: "#app",
  data: {
    money: [
      { level: "15", amount: "1,000,000" },
      { level: "14", amount: "500,000" },
      { level: "13", amount: "250,000" },
      { level: "12", amount: "100,000" },
      { level: "11", amount: "50,000" },
      { level: "10", amount: "25,000" },
      { level: "9", amount: "16,000" },
      { level: "8", amount: "8,000" },
      { level: "7", amount: "4,000" },
      { level: "6", amount: "2,000" },
      { level: "5", amount: "1,000" },
      { level: "4", amount: "500" },
      { level: "3", amount: "300" },
      { level: "2", amount: "200" },
      { level: "1", amount: "100" }
    ],
    triviaBlocks: [],
    qIndex: 0,
    question: "",
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: "",
    correctAnswer: "",
    correctLetter: "",
    music1: new Audio("./js/Round1.ogg"),
    music2: new Audio("./js/Round2.ogg"),
    music3: new Audio("./js/Round3.ogg"),
    musicRight: new Audio("./js/RightAnswerShort.ogg"),
    musicWrong: new Audio("./js/WrongAnswer.ogg"),
    host: new SpeechSynthesisUtterance(),
    selected: undefined,
    disabled: false,
    askedAudience: false,
    randomIndex: ""
  },
  watch: {
    //qIndex is variable to watch but made function
    qIndex() {
      this.askedAudience = false;
      if (this.qIndex == 4) {
        this.playRound2();
      } else if (this.qIndex == 9) {
        this.playRound3();
      } else {
        this.playRound1();
      }

      this.displayQuestion();
      this.read();
    }
  },
  methods: {
    //method to fetch questions
    async startGame() {
      this.qIndex = 0;
      this.selected = true;
      this.disabled = false;
      this.playRound1();
      const res = await fetch(
        "https://opentdb.com/api.php?amount=15&type=multiple"
      );
      const data = await res.json();
      this.triviaBlocks = data.results;
      console.log(this.triviaBlocks);
      this.displayQuestion();
      this.read();
      this.recognizeSpeech();
    },
    //methods to display the questions
    displayQuestion() {
      this.parseCurrentQuestion();
      this.shuffleAnswers();
    },
    //method to set the question and correct answer
    parseCurrentQuestion() {
      this.question = this.triviaBlocks[this.qIndex].question;
      this.correctAnswer = this.triviaBlocks[this.qIndex].correct_answer;
    },
    //method to assign possible answers, randomize them, and set them up to be displayed
    shuffleAnswers() {
      let choices = [
        this.correctAnswer,
        ...this.triviaBlocks[this.qIndex].incorrect_answers
      ];
      const randomChoices = _.shuffle(choices);
      [this.answer1, this.answer2, this.answer3, this.answer4] = randomChoices;

      this.correctLetter = randomChoices.findIndex(
        choice => choice === this.correctAnswer
      );
      console.log(this.correctAnswer);
    },
    //method to check which answer the user picks - if wrong answer displays "game over", disables the ability to click, and reappears the start button
    isAnswer(letter) {
      const dictionary = ["a", "b", "c", "d"];
      const index = dictionary.findIndex(char => char === letter);

      //if letter passed to function matches the letter of the correct answer...
      if (index === this.correctLetter) {
        this.playRightAnswerMusic();
        console.log(this.qIndex);
        if (this.qIndex === 14) {
          //if the user answers the final answer correctly, the question spot changes to winner and the answer spots go blank
          this.question = "Winner";
          this.answer1 = "";
          this.answer2 = "";
          this.answer3 = "";
          this.answer4 = "";
          this.disabled = true;
          this.askedAudience = false;
        } else {
          this.qIndex += 1;
        }
      } else {
        this.playWrongAnswerMusic();
        //disabled is to disable the user from selecting ABC or D
        this.disabled = true;
        //question spot changes and answer spots go blank
        this.question = "Game Over";
        this.answer1 = "";
        this.answer2 = "";
        this.answer3 = "";
        this.answer4 = "";
        //selected is for the startButton - making it disappear after being clicked
        this.selected = false;
        //shows link to ask audience poll
        this.askedAudience = false;
        return;
      }
    },
    //plays the various music tones
    playRound1() {
      this.music1.play();
    },
    playRound2() {
      this.music2.play();
    },
    playRound3() {
      this.music3.play();
    },
    playRightAnswerMusic() {
      this.musicRight.play();
    },
    playWrongAnswerMusic() {
      this.musicWrong.play();
    },
    //reads the questions and answers
    read() {
      //host.rate slows the speed down
      this.host.rate = 0.7;
      this.host.text = `${this.question}, A, ${this.answer1}, B, ${this.answer2}, C, ${this.answer3}, D, ${this.answer4}`;
      speechSynthesis.speak(this.host);
    },
    //allows the app to recognize when the user says ABCD Final Answer
    recognizeSpeech() {
      window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.addEventListener("result", e => {
        let transcript = e.results[0][0].transcript;

        switch (transcript) {
          case "a final answer":
          case "A final answer":
            this.isAnswer("a");
            break;
          case "b final answer":
          case "B final answer":
            this.isAnswer("b");
            break;
          case "c final answer":
          case "C final answer":
            this.isAnswer("c");
            break;
          case "d final answer":
          case "D final answer":
            this.isAnswer("d");
            break;
        }
      });
      recognition.addEventListener("end", recognition.start);
      recognition.start();
    },
    //when called shows the button link to the poll
    askAudience() {
      this.askedAudience = true;
    },
    fiftyFifty() {
      const fifty = [this.answer1, this.answer2, this.answer3, this.answer4];

      const removed1 = this.randomizeIndex(fifty);
      console.log(removed1);
      // const removed2 = this.randomizeIndex(fifty);

      [this.answer1, this.answer2, this.answer3, this.answer4] = fifty;
    },
    randomizeIndex(array) {
      //pick two random indexes from wrong and correct answers array (passed into function)
      let randomIndex1 = Math.floor(Math.random() * array.length);
      let randomIndex2 = Math.floor(Math.random() * array.length);

      // let answerIndex = array.findIndex(arr =>
      //   arr.includes(this.correctAnswer)
      // );
      // console.log(answerIndex);

      // let emptyStrings = array.includes("");
      // console.log(emptyStrings);
      // let emptyStringIndex = undefined;

      // if (emptyStrings) {
      //   emptyStringIndex = array.findIndex(arr => arr.includes(""));
      //   console.log(emptyStringIndex);
      // }

      // if first random no. doesn't match the second
      if (randomIndex1 != randomIndex2) {
        //if either random nos. don't match the correct answer index
        if (
          randomIndex1 != this.correctLetter &&
          randomIndex2 != this.correctLetter
        ) {
          /*assign passed in array to new variable and then splice out the value at the two indexes
          // and replace with blank strings*/
          let newArray = array;
          let randomWrongAnswer1 = newArray.splice(randomIndex1, 1, "");
          let randomWrongAnswer2 = newArray.splice(randomIndex2, 1, "");
          return randomWrongAnswer1 && randomWrongAnswer2;
        } else {
          //if one of the random indexes match the correct answer run function again
          this.randomizeIndex(array);
        }
      } else {
        //if the chosen indexes match, run function again
        this.randomizeIndex(array);
      }
    }
  }
});
