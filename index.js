let quadegories = []; // Initialize as empty array
let dataLoaded = false; // Flag to track if data has been loaded
let temp = -1, n = 0, p = 0, points = 0, counter = 0;
let currentN = 0; // Add a global tracking variable for the current quadegory index
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
    console.log("[jake] Got JSON response, processing data...");
    return response.json();
  })
  .then(data => {
    if (!data || !data.quadegories || !Array.isArray(data.quadegories)) {
      throw new Error('Invalid JSON data format');
    }
    quadegories = data.quadegories; // Assign the data to quadegories
    dataLoaded = true; // Set the flag once data is loaded
    console.log('[jake] Data loaded successfully. Found', quadegories.length, 'quadegories');
    console.log('[jake] The name of the first quadegory is:', quadegories[0].name);
    // Initialize the game with a random quadegory
    n = Math.floor(Math.random() * quadegories.length);
    currentN = n; // Set currentN to match n
    console.log('[jake] Selected random quadegory index:', n);
    setGame(n);
  })
  .catch(error => {
    console.error('[jake] Error loading JSON:', error);
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
    
    // Update currentN to match the new n for "Next Quadegory" functionality
    currentN = n;
    
    console.log("[jake] Forward button clicked with text:", $forwardButton.text());
    console.log("[jake] Current n:", temp, "Next n:", n, "Updated currentN:", currentN);
    
    if($forwardButton.text() === "I'm Stuck!"){
        console.log("[jake] User clicked I'm Stuck");
        
        // Reset "I'm Stuck" button text
        $forwardButton.text("Continue");
        $forwardButton.removeClass("btn-danger").addClass("btn-success");
        
        // Use the userStuck function to reveal the answer - important to pass temp as the current quadegory
        userStuck(temp, n);
    }
    else if($forwardButton.text() === "Next Quadegory!"){
        console.log("[jake] Moving to next quadegory");
        // Clean up any existing game state first
        if (wordGame && wordGame.isComplete) {
            wordGame.isComplete = true; // Ensure it's marked as complete
        }
        setGame(n);
    }
    else if($forwardButton.text() === "Continue"){
        console.log("[jake] Continue clicked, setting new game");
        
        // Clean up any existing game state first
        if (wordGame && wordGame.isComplete) {
            wordGame.isComplete = true; // Ensure it's marked as complete
        }
        
        // Double-check that currentN and n are synchronized before setting the new game
        console.log("[jake] Continue: using n:", n, "currentN:", currentN);
        currentN = n; // Ensure they are synchronized
        
        setGame(n);
        
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
    console.log("[jake] setGame called with n:", n);
    
    // Check if quadegories is loaded and n is valid
    if (!dataLoaded || !quadegories || !quadegories.length || n === undefined || n < 0 || n >= quadegories.length) {
        console.error("[jake] setGame error: quadegories not loaded or invalid n value:", n);
        return; // Exit early if data isn't available yet or n is invalid
    }
    
    // Update the global currentN to match n
    currentN = n;
    console.log("[jake] Updated currentN to:", currentN);
    
    // Reset game state
    attempts = 0;
    clueState = 3;
    incorrectGuessCount = 0;
    
    // Get the current quadegory data
    let currentQuadegory = quadegories[n];
    let quadegoryName = currentQuadegory.name;
    console.log("[jake] Setting up game for quadegory:", quadegoryName);
    
    // Reset UI elements
    $blurredAnswer.empty();
    $blurredAnswer.attr("data-placeholder", "Type your answer here...");
    $blurredAnswer.text("");
    originalBlurredContent = ""; // Reset this to avoid placeholders from previous games
    
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
    console.log("[jake] setClues called with n:", n);
    
    // Check if quadegories is loaded and n is valid
    if (!dataLoaded || !quadegories || !quadegories.length || n === undefined || n < 0 || n >= quadegories.length) {
        console.error("[jake] setClues error: quadegories not loaded or invalid n value:", n);
        return; // Exit early if data isn't available yet or n is invalid
    }
    
    // Reset attempts
    attempts = 0;
    incorrectGuessCount = 0;
    
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
}
function checkGuess(userGuess) {
    console.log("Checking guess: " + userGuess);
    
    // If wordGame is active, use the wordGame approach
    if (wordGame) {
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
            // Increment attempts for incorrect guesses
            attempts++;
            
            // Show feedback
            $feedbackText.text(`Incorrect guess. Try again or use hints.`);
            $feedbackContainer.show();
            setTimeout(() => {
                $feedbackContainer.hide();
            }, 3000);
            
            return false;
        }
    }
    
    // Fallback for non-wordGame approach
    return false;
}
function userStuck(temp, n) {
    console.log("[jake] User stuck called with temp:", temp, "n:", n, "currentN:", currentN);
    
    // Check if currentN is valid and quadegories is loaded
    if (!dataLoaded || !quadegories || !quadegories.length || currentN === undefined || currentN < 0 || currentN >= quadegories.length) {
        console.error("[jake] userStuck error: quadegories not loaded or invalid currentN value:", currentN);
        return; // Exit early if data isn't available yet or currentN is invalid
    }
    
    // Use currentN to get the actual current quadegory being displayed
    const currentQuadegory = quadegories[currentN];
    console.log("[jake] Current quadegory in userStuck:", currentQuadegory.name);
    
    // Verify that currentN and n are correct
    console.log("[jake] Next quadegory will be:", quadegories[n].name);
    
    // Disable buttons
    $forwardButton.addClass("disabled");
    $nextClueButton.addClass("disabled");
    $guessButton.addClass("disabled");
    
    // Update the word game to show the complete answer
    if (wordGame) {
        console.log("[jake] Cleaning up wordGame in userStuck");
        
        // Remove any existing event listeners first
        const inputs = document.querySelectorAll('.letter-input');
        inputs.forEach(input => {
            input.removeEventListener('input', checkLettersForWin);
        });
        
        // Set isComplete to true to prevent further checking
        wordGame.isComplete = true;
        
        // Disable all inputs
        inputs.forEach(input => {
            input.readOnly = true;
        });
        
        // Reveal all letters - IMPORTANT: use currentN (current quadegory), not n (next quadegory)
        const phrase = currentQuadegory.name.toUpperCase();
        console.log("[jake] Revealing answer:", phrase);
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
    
    // Make the hint boxes flash red
    $(".hints").css("background-color", "red");
    $(".hintContainer").css("color", "white");
    setTimeout(function(){
        $(".hints").css("background-color", "lightblue");
        $(".hintContainer").css("color", "black");
    }, 1200);
    
    // Hide feedback elements
    $feedbackContainer.hide();
    
    // Set the popup content with the CURRENT quadegory's name
    console.log("[jake] Setting up stuck popup with answer:", currentQuadegory.name);
    $("#imStuckPopup p").html("The quadegory was <b>" + currentQuadegory.name + "</b>!");
    
    // Close any existing dialogs to prevent stacking
    if ($imStuckPopup.dialog("instance")) {
        $imStuckPopup.dialog("close");
    }
    
    // Show the popup with fun fact - IMPORTANT: Use currentN here, not n or temp
    $imStuckPopup.dialog({
        modal: true,
        width: 400,
        buttons: {
            "Next Quadegory": function() {
                console.log("[jake] Closing stuck popup, starting new game with n:", n, "currentN:", currentN);
                $(this).dialog("close");
                
                // Ensure currentN is synchronized before setting the game
                currentN = n;
                console.log("[jake] Starting new quadegory with synchronized values n:", n, "currentN:", currentN);
                
                // Important: Use the next quadegory index
                setGame(n);
            }
        },
        // Ensure dialog is properly destroyed when closed
        close: function() {
            console.log("[jake] Dialog closed");
        }
    });
}
function setHints(n, userGuess) {
    console.log("[jake] Setting hints for quadegory:", quadegories[n].name, "with index:", n);
    console.log("[jake] Global currentN:", currentN, "with name:", quadegories[currentN].name);
    
    // Verify that n and currentN match (they should at this point)
    if (n !== currentN) {
        console.warn("[jake] Warning: n and currentN mismatch in setHints! n:", n, "currentN:", currentN);
    }
    
    // Disable buttons
    $guessButton.addClass("disabled");
    $nextClueButton.addClass("disabled");
    $forwardButton.removeClass("disabled");
    $forwardButton.text("Next Quadegory!");
    $forwardButton.removeClass("btn-danger").addClass("btn-success");
    
    // Mark the word game as complete and correct
    if (wordGame) {
        // Set isComplete to true to prevent further checking
        wordGame.isComplete = true;
        
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
    
    // Set the fun fact content - ensure we're using the correct n index
    const funFactContent = quadegories[n].funFact;
    console.log("[jake] Showing fun fact for:", quadegories[n].name, ":", funFactContent);
    $("#funFact p").html(funFactContent);
    
    // Close any existing dialogs to prevent stacking
    if ($funFact.dialog("instance")) {
        $funFact.dialog("close");
    }
    
    // Show the fun fact popup
    $funFact.dialog({
        modal: true,
        width: 400,
        buttons: {
            "Next Quadegory": function() {
                console.log("[jake] Closing fun fact popup");
                $(this).dialog("close");
                // Get a new random quadegory
                const nextN = Math.floor(Math.random() * quadegories.length);
                console.log("[jake] Moving to next quadegory:", nextN);
                // Also update currentN when setting the new game
                n = nextN;
                currentN = nextN;
                setGame(nextN);
            }
        },
        // Ensure dialog is properly destroyed when closed
        close: function() {
            console.log("[jake] Fun fact dialog closed");
        }
    });
    
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
    console.log("[jake] Initializing word game with phrase:", phrase);
    
    // Check if phrase is valid
    if (!phrase) {
        console.error("[jake] initWordGuessingGame error: Invalid phrase:", phrase);
        return; // Exit early if phrase is invalid
    }
    
    // Use the global currentN instead of capturing n
    console.log("[jake] Using global currentN:", currentN, "with name:", 
        (quadegories && quadegories[currentN]) ? quadegories[currentN].name : "unknown");
    
    // Hide the original blurred answer element
    $blurredAnswer.hide();
    
    // Clear any existing word game
    if (wordGame) {
        console.log("[jake] Cleaning up previous word game");
        // Remove any existing event listeners to avoid duplicates
        const inputs = document.querySelectorAll('.letter-input');
        inputs.forEach(input => {
            input.removeEventListener('input', checkLettersForWin);
        });
        
        const wordGameContainer = document.querySelector('#wordGuessingGameContainer');
        if (wordGameContainer) {
            wordGameContainer.innerHTML = '';
        }
        
        // Clear the old word game reference
        wordGame = null;
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
            console.log('[jake] Word game completed for:', quadegories[currentN].name);
            // Use the global currentN to ensure the correct fun fact shows
            setHints(currentN, phrase.toUpperCase());
        }
    });
    
    // Hide the controls container with the redundant buttons
    $("#wordGuessingGameContainer .controls-container").hide();
    
    // Add input event listeners to all letter inputs for auto-win checking
    setTimeout(() => {
        console.log("[jake] Setting up input listeners");
        const inputs = document.querySelectorAll('.letter-input');
        inputs.forEach(input => {
            // First remove any existing listeners to avoid duplicates
            input.removeEventListener('input', checkLettersForWin);
            // Then add the listener
            input.addEventListener('input', checkLettersForWin);
        });
    }, 100);
    
    // Set initial hint level based on current clue state
    if (clueState > 3) {
        const hintLevel = clueState - 3; // Convert clue state to hint level
        console.log("[jake] Applying initial hints, level:", hintLevel);
        
        // Apply hints based on current state
        for (let i = 0; i < hintLevel; i++) {
            wordGame.getNextHint();
        }
    }
}

// Function to check letters for win condition
function checkLettersForWin(event) {
    if (!wordGame || wordGame.isComplete) return;
    
    // Get the current input if we have an event
    if (event && event.target) {
        const target = event.target;
        const letterBox = target.closest('.letter-box');
        if (letterBox) {
            const key = letterBox.dataset.key;
            const currentValue = target.value.trim().toUpperCase();
            
            if (key) {
                const [wordIdx, letterIdx] = key.split('-').map(Number);
                if (wordGame.words[wordIdx] && wordGame.words[wordIdx][letterIdx]) {
                    const expectedLetter = wordGame.words[wordIdx][letterIdx];
                    console.log(`[jake] Input updated at ${key}: value='${currentValue}', expected='${expectedLetter}', match=${currentValue === expectedLetter}`);
                }
            }
        }
    }
    
    // Add a small delay to avoid immediate checking while the user is still typing
    clearTimeout(wordGame.checkTimeout);
    wordGame.checkTimeout = setTimeout(() => {
        const words = wordGame.words;
        let allFilled = true;
        let allCorrect = true;
        let totalLetters = 0;
        let filledLetters = 0;
        let correctLetters = 0;
        
        // Check if all letters are filled and correct
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.length; j++) {
                const key = `${i}-${j}`;
                const input = wordGame.inputRefs[key];
                const letterBox = document.querySelector(`.letter-box[data-key="${key}"]`);
                totalLetters++;
                
                // Skip letters that are already revealed by hints
                const isRevealed = letterBox && letterBox.classList.contains('revealed');
                
                if (isRevealed) {
                    filledLetters++;
                    correctLetters++;
                    continue;
                }
                
                // Check if input exists and has a value
                if (!input || !input.value || !input.value.trim()) {
                    allFilled = false;
                } else {
                    filledLetters++;
                    
                    // Check if the input value matches the expected letter
                    const inputValue = input.value.trim().toUpperCase();
                    const expectedLetter = word[j];
                    
                    if (inputValue === expectedLetter) {
                        correctLetters++;
                        // Mark correct letters
                        if (letterBox) {
                            letterBox.classList.remove('incorrect');
                            letterBox.classList.add('correct');
                        }
                    } else {
                        allCorrect = false;
                        
                        // Mark incorrect letters
                        if (letterBox) {
                            letterBox.classList.remove('correct');
                            letterBox.classList.add('incorrect');
                        }
                    }
                }
            }
        }
        
        console.log(`[jake] Check results - Total: ${totalLetters}, Filled: ${filledLetters}, Correct: ${correctLetters}`);
        console.log("[jake] Check letters result - allFilled:", allFilled, "allCorrect:", allCorrect);
        
        // If all letters are filled and correct, trigger the win
        if (allFilled && allCorrect && !wordGame.isComplete) {
            console.log("[jake] Win condition detected! All letters correct");
            wordGame.isComplete = true; // Prevent multiple win triggers
            wordGame.onComplete();
        } else if (allFilled && !allCorrect) {
            console.log("[jake] All letters filled but some are incorrect");
        }
    }, 200); // Small delay to avoid checking too frequently
}