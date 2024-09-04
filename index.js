document.addEventListener("DOMContentLoaded", () => {
    let guessedWords = [[]];
    let availableSpace = 1;
    let word;
    let guessedWordCount = 0;
    const maxGuesses = 6;
    let gameOver = false; // Flag to check if the game is over

    const keys = document.querySelectorAll(".keyboard-row button");
    const statsModal = document.getElementById("statsModal");
    const gamesPlayedEl = document.getElementById("gamesPlayed");
    const gamesWonEl = document.getElementById("gamesWon");
    const winPercentageEl = document.getElementById("winPercentage");
    const currentStreakEl = document.getElementById("currentStreak");
    const maxStreakEl = document.getElementById("maxStreak");
    const playAgainButton = document.getElementById("playAgainButton");
    const closeStatsButton = document.getElementById("closeStatsButton");
    const statsIcon = document.getElementById("statsIcon");
    const resetStatsButton = document.getElementById("resetStatsButton");

    let stats = JSON.parse(localStorage.getItem("wordGameStats")) || {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
    };

    function initializeGame() {
        // Check if there's an ongoing game
        const savedGame = JSON.parse(localStorage.getItem("ongoingGame"));

        if (savedGame) {
            guessedWords = savedGame.guessedWords;
            availableSpace = savedGame.availableSpace;
            guessedWordCount = savedGame.guessedWordCount;
            word = savedGame.word;
            gameOver = savedGame.gameOver;

            // Restore the board
            guessedWords.forEach((wordArr, rowIndex) => {
                wordArr.forEach((letter, letterIndex) => {
                    const letterId = rowIndex * 5 + letterIndex + 1;
                    const letterEl = document.getElementById(letterId);
                    letterEl.textContent = letter;
                });
            });
        } else {
            guessedWords = [[]];
            availableSpace = 1;
            guessedWordCount = 0;
            gameOver = false; // Reset the game over flag

            resetBoard();
            resetKeyboard();
            getNewWord();
        }
    }


    function getNewWord() {
        const randomIndex = Math.floor(Math.random() * dictionary.length);
        word = dictionary[randomIndex].toUpperCase();
        console.log(word);
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
        if (gameOver) return; // Block input if the game is over

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
        if (gameOver) return; // Block input if the game is over

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

        if (currentWord === word || guessedWordCount === maxGuesses) {
            gameOver = true; // Mark the game as over
            updateStats(currentWord === word);
            setTimeout(showStatsModal, interval * 5); // Show stats after animations
        } else {
            guessedWords.push([]);
        }
    }

    function handleDeleteLetter() {
        if (gameOver) return; // Block input if the game is over

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

    function showStatsModal() {
        const winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100) || 0;
        const averageGuesses = stats.gamesWon > 0 ? (stats.totalGuesses / stats.gamesWon).toFixed(2) : 0;

        // Update Text
        document.getElementById("gamesPlayedText").textContent = stats.gamesPlayed;
        document.getElementById("gamesWonText").textContent = stats.gamesWon;
        document.getElementById("currentStreakText").textContent = stats.currentStreak;
        document.getElementById("maxStreakText").textContent = stats.maxStreak;
        document.getElementById("winPercentageText").textContent = `${winPercentage}%`;
        document.getElementById("averageGuessesText").textContent = averageGuesses;

        // Update Circle
        document.getElementById("winPercentageCircle").style.background = `conic-gradient(#4CAF50 0% ${winPercentage}%, #ddd ${winPercentage}% 100%)`;

        statsModal.style.display = "flex";
    }

    function updateStats(isWin) {
        stats.gamesPlayed += 1;

        if (isWin) {
            stats.gamesWon += 1;
            stats.currentStreak += 1;
            if (stats.currentStreak > stats.maxStreak) {
                stats.maxStreak = stats.currentStreak;
            }
            stats.totalGuesses += guessedWordCount;
        } else {
            stats.currentStreak = 0;
        }

        localStorage.setItem("wordGameStats", JSON.stringify(stats));
    }

    function resetStats() {
        stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            totalGuesses: 0,
        };
        localStorage.setItem("wordGameStats", JSON.stringify(stats));

        // Update the modal with reset values
        showStatsModal();
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

    // Adding keydown event listener for normal keyboard input
    document.addEventListener("keydown", (event) => {
        if (gameOver) return; // Block input if the game is over

        const key = event.key.toUpperCase();

        if (key === "ENTER") {
            handleSubmitWord();
        } else if (key === "BACKSPACE") {
            handleDeleteLetter();
        } else if (/^[A-Z]$/.test(key)) {  // Check if key is a letter
            updateGuessedWords(key);
        }
    });

    // Modal button event listeners
    playAgainButton.onclick = () => {
        statsModal.style.display = "none";
        initializeGame();
    };

    closeStatsButton.onclick = () => {
        statsModal.style.display = "none";
    };

    if (statsIcon) {
        statsIcon.onclick = () => {
            showStatsModal();
        };
    }
    resetStatsButton.onclick = () => {
        resetStats();
    };

});
