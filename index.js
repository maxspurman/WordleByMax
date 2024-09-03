document.addEventListener("DOMContentLoaded", () => {
    let guessedWords = [[]];
    let availableSpace = 1;
    let word;
    let guessedWordCount = 0;
    const maxGuesses = 6;

    const keys = document.querySelectorAll(".keyboard-row button");
    const endGameModal = document.getElementById("endGameModal");
    const endGameMessage = document.getElementById("endGameMessage");
    const playAgainButton = document.getElementById("playAgainButton");
    const closeModalButton = document.getElementById("closeModalButton");

    function initializeGame() {
        guessedWords = [[]];
        availableSpace = 1;
        guessedWordCount = 0;

        resetBoard();
        resetKeyboard();
        getNewWord();
    }

    function getNewWord() {
        const randomIndex = Math.floor(Math.random() * dictionary.length);
        word = dictionary[randomIndex].toUpperCase();
        console.log(word); // Debugging purposes, remove for production
    }

    function resetBoard() {
        const squares = document.querySelectorAll(".square");
        squares.forEach(square => {
            square.textContent = "";
            square.style.backgroundColor = "";
            square.style.borderColor = "";
        });
    }

    function resetKeyboard() {
        keys.forEach(key => {
            key.style.backgroundColor = "";
            key.style.borderColor = "";
        });
    }

    function getCurrentWordArr() {
        return guessedWords[guessedWords.length - 1];
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArr();

        if (currentWordArr && currentWordArr.length < 5) {
            currentWordArr.push(letter);

            const availableSpaceEl = document.getElementById(String(availableSpace));
            availableSpace += 1;
            availableSpaceEl.textContent = letter;
        }
    }

    function getTileColor(letter, index) {
        const isCorrectLetter = word.includes(letter);

        if (!isCorrectLetter) {
            return "rgb(122,122,131)";
        }

        const letterInThatPosition = word.charAt(index);
        const isCorrectPosition = letter === letterInThatPosition;

        return isCorrectPosition ? "rgb(83, 141, 78)" : "rgb(181, 159, 59)";
    }

    function isWordInDictionary(word) {
        return dictionary.includes(word.toLowerCase());
    }

    function updateKeyboard(currentWordArr) {
        const letterColors = {};

        currentWordArr.forEach((letter, index) => {
            const tileColor = getTileColor(letter, index);
            if (!letterColors[letter] || letterColors[letter] !== "rgb(83, 141, 78)") {
                letterColors[letter] = tileColor;
            }
        });

        keys.forEach(key => {
            const keyLetter = key.getAttribute("data-key").toUpperCase();
            if (letterColors[keyLetter]) {
                key.style.backgroundColor = letterColors[keyLetter];
                key.style.borderColor = letterColors[keyLetter];
            }
        });
    }

    function handleSubmitWord() {
        const currentWordArr = getCurrentWordArr();

        if (currentWordArr.length !== 5) {
            window.alert("Word must be 5 letters");
            return;
        }

        const currentWord = currentWordArr.join("").toUpperCase();

        if (!isWordInDictionary(currentWord)) {
            window.alert("This word is not in the dictionary");
            return;
        }

        const firstLetterId = guessedWordCount * 5 + 1;
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
                const tileColor = getTileColor(letter, index);

                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);
                letterEl.classList.add("animate__flipInX");
                letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
            }, interval * index);
        });

        updateKeyboard(currentWordArr);
        guessedWordCount += 1;

        if (currentWord === word) {
            endGameMessage.textContent = "Congratulations! You guessed the word!";
            endGameModal.style.display = "block";
        } else if (guessedWordCount === maxGuesses) {
            endGameMessage.textContent = `Sorry, you have no more guesses! The word was ${word}.`;
            endGameModal.style.display = "block";
        } else {
            guessedWords.push([]);
        }
    }

    function handleDeleteLetter() {
        const currentWordArr = getCurrentWordArr();

        if (currentWordArr.length > 0) {
            const removedLetter = currentWordArr.pop();
            guessedWords[guessedWords.length - 1] = currentWordArr;

            const lastLetterEl = document.getElementById(String(availableSpace - 1));
            lastLetterEl.textContent = "";
            availableSpace -= 1;
        }
    }

    function createSquares() {
        const gameBoard = document.getElementById("board");

        for (let index = 0; index < 30; index++) {
            let square = document.createElement("div");
            square.classList.add("square", "animate__animated");
            square.setAttribute("id", index + 1);
            gameBoard.appendChild(square);
        }
    }

    // Initial setup
    createSquares();
    initializeGame();

    keys.forEach(key => {
        key.onclick = ({ target }) => {
            const letter = target.getAttribute("data-key").toUpperCase();

            if (letter === "ENTER") {
                handleSubmitWord();
            } else if (letter === "DEL") {
                handleDeleteLetter();
            } else {
                updateGuessedWords(letter);
            }
        };
    });

    // Modal button event listeners
    playAgainButton.onclick = () => {
        endGameModal.style.display = "none";
        initializeGame();
    };

    closeModalButton.onclick = () => {
        endGameModal.style.display = "none";
    };
});
