let quadegories = []; // Initialize as empty array
let temp = -1, n = 0, p = 0, points = 0, counter = 0;
let startTime = 0, elapsedTime = 0, clueState = 3; // Starting at state 3 (showing all clues)
let wordGame = null; // Reference to the instance of WordGuessingGame
let attempts = 0; // Track number of attempts
let incorrectGuessCount = 0; // Track number of incorrect guesses for hint progression
let wordNumber = 4;
let startOfGame = true;
let numberofWords = 1;
let originalBlurredContent = ""; // Store the original content

// jQuery elements
let $feedbackContainer, $feedbackText;
const $scoreBox = $("#message");
const $clueBox = [$("#box1 > .hintContainer p"), $("#box2 > .hintContainer p"), $("#box3 > .hintContainer p"), $("#box4 > .hintContainer p")];

fetch('quadegories.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    console.log("got JSON data");
    return response.json();
  })
  .then(data => {
    if (!data || !data.quadegories || !Array.isArray(data.quadegories)) {
      throw new Error('Invalid JSON data format');
    }
    quadegories = data.quadegories; // Assign the data to quadegories
    console.log('The name of the first quadegory is:', quadegories[0].name);
    // Initialize the game with a random quadegory
    n = Math.floor(Math.random() * quadegories.length);
    setGame(n);
  })
  .catch(error => {
    console.error('Error loading JSON:', error);
    // Display error to user
    alert('Failed to load game data. Please refresh the page and try again.');
  });

// jQuery Vars
const $forwardButton = $("#forwardButton");
const $nextWordButton = $("#nextWordButton");
const $nextClueButton = $("#nextClueButton");
const $questionMark = $("#questionMarkImg");
const $blurredAnswer = $("#blurredAnswer");
const $guessButton = $("#guessButton");
const $quadegoryNumberOfWords = $("#quadegoryNumberOfWords");
const $blurredAnswerContainer = $("#blurredAnswerContainer");
const $howToPlayWrapper = $("#howToPlayWrapper");
const $howToPlay = $("#howToPlay");
const $box1 = $("#box1");
const $box2 = $("#box2");
const $box3 = $("#box3");
const $box4 = $("#box4");
const $funFact = $("#funFact");
const $imStuckPopup = $("#imStuckPopup");

$(document).ready(function(){
    // Initialize feedback container
    $feedbackContainer = $('<div>').addClass('feedback-container')
        .css({
            'position': 'fixed',
            'bottom': '20px',
            'left': '50%',
            'transform': 'translateX(-50%)',
            'background-color': 'rgba(0, 0, 0, 0.8)',
            'color': 'white',
            'padding': '10px 20px',
            'border-radius': '5px',
            'z-index': '1000',
            'display': 'none'
        })
        .appendTo('body');
    
    $feedbackText = $('<p>').css('margin', '0').appendTo($feedbackContainer);

    // Ensure all boxes have the d-flex class instead of toggling it
    if (!$box3.hasClass("d-flex")) {
        $box3.addClass("d-flex");
    }
    $box3.show();
    
    if (!$box2.hasClass("d-flex")) {
        $box2.addClass("d-flex");
    }
    $box2.show();
    
    if (!$box1.hasClass("d-flex")) {
        $box1.addClass("d-flex");
    }
    $box1.show();
    
    $forwardButton.toggleClass("disabled");
    
    // Set Guess button to purple
    $guessButton.removeClass("btn-success").addClass("btn-purple");
    
    // Hide the original blurred answer box
    $blurredAnswer.hide();
    
    // Initialize blurred answer
    updateBlurredAnswer();
    
    // see if it's a new user
    if (!localStorage.getItem('isReturningVisitor')) {
        $questionMark.css("opacity", 1);
        localStorage.setItem('isReturningVisitor', 'true');
    } else {
        $questionMark.removeClass("pulsing-border");
        console.log('Welcome back, returning visitor!');
    }    

    // Reset game state
    $blurredAnswer.attr("data-placeholder", "Type your answer here...");
    $blurredAnswer.text("");
    originalBlurredContent = "";
    
    // Enable buttons
    $nextClueButton.removeClass("disabled");
    $guessButton.removeClass("disabled");
    
    // Reset "I'm Stuck" button
    $forwardButton.text("I'm Stuck!");
    $forwardButton.removeClass("btn-success").removeClass("btn-dark").addClass("btn-danger");
    $forwardButton.addClass("disabled");
    
    // Set the clues
    setClues(n);
    
    // Set fun fact
    $("#funFact p").html(quadegories[n].funFact);
    
    // Set the "I'm Stuck" popup content
    $("#imStuckPopup p").html("The quadegory was <b>" + quadegories[n].name + "</b>!");
    
    // Reset the clue button style
    resetClueButton();
    
    // Reset the word number of words
    numberofWords = quadegories[n].name.split(" ").length;
    $("#numberOfWordsText").text(numberofWords);
    if (numberofWords === 1) {
        $("#sOrNot").text("word");
    } else {
        $("#sOrNot").text("words");
    }
    
    // Initialize the word guessing game with the new phrase
    initWordGuessingGame(quadegories[n].name);
});
$(document).on("keydown", function(event){
    if (event.key === "Tab"){
        event.preventDefault(); // Prevent tabbing to next element
        if (!$nextClueButton.hasClass("disabled")) {
            clueState++;
            updateClueState();
        }
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (!$guessButton.hasClass("disabled")) {
            $guessButton.click();
        }
    }
});
$questionMark.click(function(){
    $questionMark.removeClass("pulsing-border");
    $questionMark.css("opacity", 0.3);
    $howToPlayWrapper.css("display", "flex");
    $howToPlay.css("display", "block");
    $howToPlay.animate({ scrollTop: 10 }, 500);
});
$howToPlayWrapper.click(function(e){
    // Only close if clicking on the wrapper itself, not its children
    if(e.target === this){
        $howToPlayWrapper.css("display", "none");
        $howToPlay.css("display", "none");
    }
});
var firstFocus = false;
$blurredAnswer.on("focus", function(){
    if(!firstFocus){
        $quadegoryNumberOfWords.addClass("pulse");
        $quadegoryNumberOfWords.on("animationend", function () {
            $(this).removeClass("pulse");
        });
    }
    firstFocus = true;
    
    // No need to clear content with placeholder approach
    // The data-placeholder will be shown when empty
});
$blurredAnswer.on("blur", function(){
    if ($(this).text().trim() === "") {
        $(this).empty(); // Ensure it's empty to show placeholder
    }
});
$nextClueButton.click(function(){
    if(!$nextClueButton.hasClass("disabled")) {
        clueState++;
        updateClueState();
    }
});
$forwardButton.click(function() {
    // If button is disabled, do nothing
    if($forwardButton.hasClass("disabled")) {
        return;
    }
    
    let temp = n;
    // Get a new random quadegory that's different from the current one
    n = Math.floor(Math.random() * quadegories.length);
    while (n == temp && quadegories.length > 1){
        n = Math.floor(Math.random() * quadegories.length);
    }
    
    console.log("n: " + n);
    console.log("start of game: " + startOfGame);
    
    if($forwardButton.text() === "I'm Stuck!"){
        console.log("User Gave up");
        
        // Reset "I'm Stuck" button text
        $forwardButton.text("Continue");
        $forwardButton.removeClass("btn-danger").addClass("btn-success");
        
        // If we have a word game, reveal all letters
        if (wordGame) {
            // Call the markAsFailed method to properly handle the failure state
            wordGame.markAsFailed();
            
            // Show the fun fact
            $("#funFactContainer").show();
            $("#funFact p").html(quadegories[temp].funFact);
            
            // Hide other feedback elements
            $feedbackContainer.hide();
            
            // Disable the guess button
            $guessButton.addClass("disabled");
        } else {
            // Use the old flow for legacy support
            userStuck(temp, n);
        }
    }
    else if($forwardButton.text() === "Next Quadegory!"){
        console.log("Moving to next quadegory");
        setClues(n);
    }
    else if($forwardButton.text() === "Continue"){
        console.log("Continuing to next quadegory");
        setClues(n);
        
        // Reset button appearance
        $forwardButton.text("I'm Stuck!");
        $forwardButton.removeClass("btn-success").addClass("btn-danger");
        $forwardButton.addClass("disabled");
    }
});
$guessButton.click(function() {
    if (!wordGame) return;
    
    // Check if all letter inputs are filled
    let allFilled = true;
    let currentGuess = "";
    let allCorrect = true;
    let incorrectLetterCount = 0;
    
    // Build the current guess and check if all inputs are filled
    const words = wordGame.words;
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length; j++) {
            const key = `${i}-${j}`;
            const input = wordGame.inputRefs[key];
            const letterBox = document.querySelector(`.letter-box[data-key="${key}"]`);
            
            // Skip revealed letters - they are already correct
            if (letterBox.classList.contains('revealed')) {
                currentGuess += input.value;
                continue;
            }
            
            if (!input.value.trim()) {
                allFilled = false;
            } else {
                currentGuess += input.value;
                
                // Check if the letter is correct
                if (input.value !== word[j]) {
                    allCorrect = false;
                    incorrectLetterCount++;
                    
                    // Mark the letter as incorrect (but only if it's filled)
                    if (input.value.trim()) {
                        letterBox.classList.remove('correct');
                        letterBox.classList.add('incorrect');
                    }
                } else {
                    // Mark the letter as correct
                    letterBox.classList.remove('incorrect');
                    letterBox.classList.add('correct');
                }
            }
        }
    }
    
    // Get the current answer from wordGame
    const currentAnswer = wordGame.words.flat().join('');
    
    // If all inputs are filled and the guess is correct, proceed with success
    if (allFilled && allCorrect) {
        wordGame.onComplete();
        return;
    }
    
    // If all inputs are filled but the guess is wrong
    if (allFilled && !allCorrect) {
        // Provide feedback for incorrect guess
        $feedbackText.text(`Incorrect guess. ${incorrectLetterCount} letter${incorrectLetterCount !== 1 ? 's' : ''} are wrong. Try again or use hints.`);
        $feedbackContainer.show();
        setTimeout(() => {
            $feedbackContainer.hide();
        }, 3000);
        
        // After 3 incorrect guesses, advance the clue state to reveal a letter
        incorrectGuessCount++;
        if (incorrectGuessCount >= 3 && clueState < 6) {
            clueState++;
            updateClueState();
            
            // Reset the counter
            incorrectGuessCount = 0;
            
            $feedbackText.text("A new hint has been revealed!");
            $feedbackContainer.show();
            setTimeout(() => {
                $feedbackContainer.hide();
            }, 3000);
        }
    } else if (!allFilled) {
        // If not all inputs are filled, prompt the user
        $feedbackText.text("Please fill in all the letters before guessing.");
        $feedbackContainer.show();
        setTimeout(() => {
            $feedbackContainer.hide();
        }, 3000);
    }
});
$blurredAnswer.on("keydown", function(event){
    if (event.key === "Enter"){
        event.preventDefault(); // Prevent newline
        let userGuess = $(this).text().trim();
        if(userGuess !== "" && userGuess !== "Type your answer here...") {
            console.log("userGuess: " + userGuess);
            checkGuess(userGuess);
        }
    }
});
$blurredAnswerContainer.on("click", function(){
    $blurredAnswer.focus();
});
function setGame(n) {
    // Reset game state
    attempts = 0;
    clueState = 3;
    
    // Get the current quadegory data
    let currentQuadegory = quadegories[n];
    let quadegoryName = currentQuadegory.name;
    
    // Reset UI elements
    $blurredAnswer.empty();
    $blurredAnswer.attr("data-placeholder", "Type your answer here...");
    $blurredAnswer.text("");
    
    // Enable buttons
    $nextClueButton.removeClass("disabled");
    $guessButton.removeClass("disabled");
    
    // Reset "I'm Stuck" button
    $forwardButton.text("I'm Stuck!");
    $forwardButton.removeClass("btn-success").removeClass("btn-dark").addClass("btn-danger");
    $forwardButton.addClass("disabled");
    
    // Set the clues
    setClues(n);
    
    // Set fun fact
    $("#funFact p").html(quadegories[n].funFact);
    
    // Set the "I'm Stuck" popup content
    $("#imStuckPopup p").html("The quadegory was <b>" + quadegoryName + "</b>!");
    
    // Reset the clue button style
    resetClueButton();
    
    // Reset the word number of words
    numberofWords = quadegoryName.split(" ").length;
    $("#numberOfWordsText").text(numberofWords);
    if (numberofWords === 1) {
        $("#sOrNot").text("word");
    } else {
        $("#sOrNot").text("words");
    }
    
    // Initialize the word guessing game with the new phrase
    initWordGuessingGame(quadegoryName);
}
function setClues(n) {
    // Reset attempts
    attempts = 0;
    
    // Set clues
    for (let i = 3; i >= 0; i--) {
        $clueBox[i].text(quadegories[n].clues[i]);
    }
    
    // Make sure all clue boxes are visible since we start at clue state 3
    if (!$box3.is(":visible")) {
        $box3.show();
        if (!$box3.hasClass("d-flex")) {
            $box3.addClass("d-flex");
        }
    }
    
    if (!$box2.is(":visible")) {
        $box2.show();
        if (!$box2.hasClass("d-flex")) {
            $box2.addClass("d-flex");
        }
    }
    
    if (!$box1.is(":visible")) {
        $box1.show();
        if (!$box1.hasClass("d-flex")) {
            $box1.addClass("d-flex");
        }
    }
    
    // Disable the "I'm Stuck" button initially
    if (!$forwardButton.hasClass("disabled")) {
        $forwardButton.addClass("disabled");
    }
    
    // Reset the clue state to 3 (showing clue 1)
    clueState = 3;
    
    // Update the blurred answer
    updateBlurredAnswer();
    
    // Reinitialize the word guessing game with the current quadegory
    initWordGuessingGame(quadegories[n].name);
}
function revealWord(wordNumber) {
    if (wordNumber < 1 || wordNumber > 4) {
        console.log("Invalid wordNumber: " + wordNumber);
        return;
    }
    
    if(wordNumber === 3){
        if ($(window).width() >= 1200){
            $box3.show("highlight", 500);
        }
        else {
            $box3.slideDown();
        }
        if (!$box3.hasClass("d-flex")) {
            $box3.toggleClass("d-flex");
        }
    }
    else if (wordNumber === 2){
        $box2.slideDown();
        if (!$box2.hasClass("d-flex")) {
            $box2.toggleClass("d-flex");
        }
    }
    else if (wordNumber === 1){
        if ($(window).width() >= 1200){
            $box1.show("highlight", 500);
        }
        else {
            $box1.slideDown();
        }
        if (!$box1.hasClass("d-flex")) {
            $box1.toggleClass("d-flex");
        }
        
        // Disable next word button when all words are revealed
        if (!$nextWordButton.hasClass("disabled")) {
            $nextWordButton.addClass("disabled");
        }
        if ($nextWordButton.hasClass("btn-warning")) {
            $nextWordButton.removeClass("btn-warning");
        }
        if (!$nextWordButton.hasClass("btn-dark")) {
            $nextWordButton.addClass("btn-dark");
        }
        
        // Enable forward button
        if ($forwardButton.hasClass("disabled")) {
            $forwardButton.removeClass("disabled");
        }
        if ($forwardButton.hasClass("btn-dark")) {
            $forwardButton.removeClass("btn-dark");
        }
        if (!$forwardButton.hasClass("btn-danger")) {
            $forwardButton.addClass("btn-danger");
        }
    }
}
function checkGuess(userGuess) {
    console.log("Checking guess: " + userGuess);
    
    // If wordGame is active, use the guessButton handler instead
    if (wordGame) {
        // Get current guess from wordGame
        const currentAnswer = quadegories[n].name.toUpperCase();
        let currentGuess = "";
        
        // Get the current guess from the wordGame
        const words = wordGame.words;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let wordGuess = "";
            
            for (let j = 0; j < word.length; j++) {
                const key = `${i}-${j}`;
                const input = wordGame.inputRefs[key];
                wordGuess += input.value || "_";
            }
            
            if (i > 0) currentGuess += " ";
            currentGuess += wordGuess;
        }
        
        // Check if correct
        if (!currentGuess.includes("_") && currentGuess === currentAnswer) {
            setHints(n, currentGuess);
            return true;
        } else {
            // Incorrect or incomplete
            return false;
        }
    }
    
    // Original checkGuess logic for fallback
    if (userGuess.trim().toLowerCase() === quadegories[n].name.toLowerCase()) {
        console.log("Correct guess!");
        setHints(n, userGuess);
        return true;
    } else {
        console.log("Incorrect guess: " + userGuess);
        attempts++;
        
        // After the second attempt, show an additional clue
        if (attempts >= 2) {
            clueState++;
            updateClueState();
        }
        
        return false;
    }
}
function userStuck(temp, n) {
    $forwardButton.addClass("disabled");
    $nextClueButton.addClass("disabled");
    
    // Display the answer in the blurred container for backup
    $blurredAnswer.text(quadegories[n].name);
    
    // Update the word game to show the complete answer
    if (wordGame) {
        // Disable all inputs
        const inputs = document.querySelectorAll('.letter-input');
        inputs.forEach(input => {
            input.readOnly = true;
        });
        
        // Reveal all letters
        const phrase = quadegories[n].name.toUpperCase();
        const words = phrase.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.length; j++) {
                const key = `${i}-${j}`;
                const letterBox = document.querySelector(`.letter-box[data-key="${key}"]`);
                const letterDisplay = letterBox?.querySelector('.letter-display');
                const letterInput = wordGame.inputRefs[key];
                
                if (letterDisplay) {
                    letterDisplay.textContent = word[j];
                }
                
                if (letterInput) {
                    letterInput.value = word[j];
                }
                
                if (letterBox) {
                    letterBox.classList.remove('incorrect', 'correct', 'active');
                    letterBox.classList.add("revealed");
                }
            }
        }
    }
    
    // Show the popup with fun fact
    $imStuckPopup.dialog({
        modal: true,
        width: 400,
        buttons: {
            "Next Quadegory": function() {
                $(this).dialog("close");
                n = (n + 1) % quadegories.length;
                setGame(n);
            }
        }
    });
    
    $("#imStuckPopup p").html(quadegories[temp].funFact);
}
function getWords(){
    console.log("getting number of words for: " + quadegories[n].name);
    numberofWords = 1; // Reset counter
    for (let j = 0; j < quadegories[n].name.length; j++){
        if (quadegories[n].name.charAt(j) == ' '){
            numberofWords++;
        }
    };
    console.log("Number of words: " + numberofWords);
    let numberofWordsStr = numberofWords.toString();
    $("#numberOfWordsText").text(numberofWordsStr);
    if (numberofWords>1){
        $("#sOrNot").text("words");
    } else {
        $("#sOrNot").text("word");
    }
}
function setHints(n, userGuess) {
    console.log("Setting hints for quadegory: " + quadegories[n].name);
    
    // Disable buttons
    $guessButton.addClass("disabled");
    $nextClueButton.addClass("disabled");
    $forwardButton.addClass("disabled");
    
    // Mark the word game as complete and correct
    if (wordGame) {
        // Mark all letters as correct
        const words = wordGame.words;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.length; j++) {
                const key = `${i}-${j}`;
                const letterBox = document.querySelector(`.letter-box[data-key="${key}"]`);
                if (letterBox) {
                    letterBox.classList.remove("incorrect");
                    letterBox.classList.add("correct");
                }
            }
        }
        
        // Disable inputs
        const inputs = document.querySelectorAll('.letter-input');
        inputs.forEach(input => {
            input.readOnly = true;
        });
    }
    
    // Show the answer in the blurred container for backup
    $blurredAnswer.text(quadegories[n].name);
    
    // Show the fun fact popup
    $funFact.dialog({
        modal: true,
        width: 400,
        buttons: {
            "Next Quadegory": function() {
                $(this).dialog("close");
                n = (n + 1) % quadegories.length;
                setGame(n);
            }
        }
    });
    
    // Set the fun fact content
    $("#funFact p").html(quadegories[n].funFact);
    
    // Visual feedback (flash green)
    $(".hints").css("background-color", "green");
    $(".hintContainer").css("color", "white");
    setTimeout(function(){
        $(".hints").css("background-color", "lightblue");
        $(".hintContainer").css("color", "black");
    }, 1200);
}

// Function to update the clue state
function updateClueState() {
    switch(clueState) {
        case 4: // Show first letter
            updateBlurredAnswer(1);
            updateClueButtonStyle(4);
            break;
        case 5: // Show second letter
            updateBlurredAnswer(2);
            updateClueButtonStyle(5);
            break;
        case 6: // Show third letter
            updateBlurredAnswer(3);
            updateClueButtonStyle(6);
            // Disable the button after all clues are shown
            $nextClueButton.addClass("disabled");
            // Enable forward button if it's disabled
            if ($forwardButton.hasClass("disabled")) {
                $forwardButton.removeClass("disabled");
            }
            if ($forwardButton.hasClass("btn-dark")) {
                $forwardButton.removeClass("btn-dark");
            }
            if (!$forwardButton.hasClass("btn-danger")) {
                $forwardButton.addClass("btn-danger");
            }
            break;
        default:
            console.log("Invalid clue state: " + clueState);
    }
    
    // If word game exists, update its hint level
    if (wordGame && clueState > 3) {
        const hintLevel = clueState - 3; // Convert clue state to hint level
        
        // Ensure the hint level isn't higher than the maximum allowed
        if (hintLevel <= 3 && hintLevel > wordGame.hintLevel) {
            // Apply hints up to the current hint level
            // We directly set the hint level to ensure correct operation
            while (wordGame.hintLevel < hintLevel) {
                wordGame.getNextHint();
            }
            
            // Preserve the correct/incorrect state of user-entered letters
            preserveLetterStates();
        }
    }
}

// Function to preserve letter states after hint updates
function preserveLetterStates() {
    if (!wordGame) return;
    
    const words = wordGame.words;
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length; j++) {
            const key = `${i}-${j}`;
            const letterBox = document.querySelector(`.letter-box[data-key="${key}"]`);
            const input = wordGame.inputRefs[key];
            
            // If this letter wasn't revealed by a hint but was entered by the user
            if (letterBox && !letterBox.classList.contains('revealed') && input.value) {
                // Check if it's correct or incorrect
                if (input.value === word[j]) {
                    letterBox.classList.remove('incorrect');
                    letterBox.classList.add('correct');
                } else {
                    letterBox.classList.remove('correct');
                    letterBox.classList.add('incorrect');
                }
            }
        }
    }
}

// Function to reveal a specific clue box
function revealClue(clueNumber) {
    if (clueNumber === 3) {
        if (!$box3.hasClass("d-flex")) {
            $box3.addClass("d-flex");
        }
        $box3.show();
        $box3.addClass("reveal-clue");
        setTimeout(function() {
            $box3.removeClass("reveal-clue");
        }, 600);
    } else if (clueNumber === 2) {
        if (!$box2.hasClass("d-flex")) {
            $box2.addClass("d-flex");
        }
        $box2.show();
        $box2.addClass("reveal-clue");
        setTimeout(function() {
            $box2.removeClass("reveal-clue");
        }, 600);
    } else if (clueNumber === 1) {
        if (!$box1.hasClass("d-flex")) {
            $box1.addClass("d-flex");
        }
        $box1.show();
        $box1.addClass("reveal-clue");
        setTimeout(function() {
            $box1.removeClass("reveal-clue");
        }, 600);
    }
}

// Function to update the blurred answer display
function updateBlurredAnswer(lettersToShow = 0) {
    if (!quadegories || !quadegories[n]) {
        return;
    }
    
    let quadegoryName = quadegories[n].name;
    let words = quadegoryName.split(" ");
    let displayText = "";
    
    for (let i = 0; i < words.length; i++) {
        if (i > 0) {
            displayText += " ";
        }
        
        let word = words[i];
        
        for (let j = 0; j < word.length; j++) {
            if (j < lettersToShow) {
                // No HTML tags in placeholder - just show the letter
                displayText += word[j];
            } else {
                displayText += "_";
            }
        }
    }
    
    // Set the data-placeholder attribute with plain text only
    $blurredAnswer.attr("data-placeholder", displayText);
    originalBlurredContent = displayText;
    
    // Clear the actual content if empty
    if ($blurredAnswer.text().trim() === "") {
        $blurredAnswer.empty();
    }
    
    // Add animation by highlighting the container
    $blurredAnswerContainer.addClass("highlight-answer");
    setTimeout(function() {
        $blurredAnswerContainer.removeClass("highlight-answer");
    }, 500);
    
    // If we've just revealed a letter, add a brief flash animation to the container
    if (lettersToShow > 0) {
        $blurredAnswerContainer.addClass("reveal-letter-flash");
        setTimeout(function() {
            $blurredAnswerContainer.removeClass("reveal-letter-flash");
        }, 500);
    }
}

// Function to update the clue button style based on state
function updateClueButtonStyle(state) {
    $nextClueButton.removeClass("btn-success btn-clue-1 btn-clue-2 btn-clue-3 btn-clue-4 btn-clue-5 btn-clue-6");
    
    switch(state) {
        case 1:
            $nextClueButton.addClass("btn-clue-1");
            break;
        case 2:
            $nextClueButton.addClass("btn-clue-2");
            break;
        case 3:
            $nextClueButton.addClass("btn-clue-3");
            break;
        case 4:
            $nextClueButton.addClass("btn-clue-4");
            break;
        case 5:
            $nextClueButton.addClass("btn-clue-5");
            break;
        case 6:
            $nextClueButton.addClass("btn-clue-6");
            $nextClueButton.text("No More Letters!");
            break;
        default:
            $nextClueButton.addClass("btn-success");
    }
}

// Function to reset the clue button
function resetClueButton() {
    $nextClueButton.removeClass("btn-clue-4 btn-clue-5 btn-clue-6 disabled");
    $nextClueButton.text("Reveal a Letter");
    $nextClueButton.addClass("btn-success");
    // Update clue button style to match the current state
    updateClueButtonStyle(clueState);
}

// Handle input in the editable container
$blurredAnswer.on("input", function(event) {
    // No special handling needed - the CSS handles showing/hiding placeholder
});

// Initialize the word guessing game with a phrase
function initWordGuessingGame(phrase) {
    // Hide the original blurred answer element
    $blurredAnswer.hide();
    
    // Clear any existing word game
    if (wordGame) {
        const wordGameContainer = document.querySelector('#wordGuessingGameContainer');
        if (wordGameContainer) {
            wordGameContainer.innerHTML = '';
        }
    }
    
    // Reset game variables
    clueState = 3; // Start with all clues visible
    attempts = 0;
    incorrectGuessCount = 0;
    
    // Initialize the WordGuessingGame
    wordGame = new WordGuessingGame({
        containerId: 'wordGuessingGameContainer',
        phrase: phrase.toUpperCase(),
        onComplete: function() {
            console.log('Word game completed!');
            setHints(n, phrase.toUpperCase());
        }
    });
    
    // Hide the controls container with the redundant buttons
    $("#wordGuessingGameContainer .controls-container").hide();
    
    // Add input event listeners to all letter inputs for auto-win checking
    setTimeout(() => {
        const inputs = document.querySelectorAll('.letter-input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // Wait a moment for the input to update before checking
                setTimeout(checkLettersForWin, 50);
            });
        });
    }, 100);
    
    // Set initial hint level based on current clue state
    if (clueState > 3) {
        const hintLevel = clueState - 3; // Convert clue state to hint level
        
        // Apply hints based on current state
        for (let i = 0; i < hintLevel; i++) {
            wordGame.getNextHint();
        }
    }
}

// Function to check letters for win condition
function checkLettersForWin() {
    if (!wordGame) return;
    
    const words = wordGame.words;
    let allFilled = true;
    let allCorrect = true;
    
    // Check if all letters are filled and correct
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length; j++) {
            const key = `${i}-${j}`;
            const input = wordGame.inputRefs[key];
            const letterBox = document.querySelector(`.letter-box[data-key="${key}"]`);
            
            // Skip letters that are already revealed by hints
            if (letterBox.classList.contains('revealed')) {
                continue;
            }
            
            // Check if all inputs are filled
            if (!input.value.trim()) {
                allFilled = false;
                break;
            }
            
            // Check if the input value matches the expected letter
            if (input.value !== word[j]) {
                allCorrect = false;
                
                // Mark incorrect letters
                letterBox.classList.remove('correct');
                letterBox.classList.add('incorrect');
            } else {
                // Mark correct letters
                letterBox.classList.remove('incorrect');
                letterBox.classList.add('correct');
            }
        }
        
        if (!allFilled) break;
    }
    
    // If all letters are filled and correct, trigger the win
    if (allFilled && allCorrect) {
        wordGame.onComplete();
    }
}