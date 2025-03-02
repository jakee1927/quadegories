let quadegories = []; // Initialize as empty array

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
const $clueBox = [$("#box1 > .hintContainer p"), $("#box2 > .hintContainer p"), $("#box3 > .hintContainer p"), $("#box4 > .hintContainer p")];
var n = 0;
var i;
var wordNumber = 4;
var attempts = 0;
var startOfGame = true;
var numberofWords = 1;
var words = [""];
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

// Track clue state
var clueState = 3; // Starting at state 3 (showing clue 1, ready to reveal first letter)
var originalBlurredContent = ""; // Store the original content

$(document).ready(function(){
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
});
$(document).on("keydown", function(event){
    if (event.key === "Tab"){
        event.preventDefault(); // Prevent tabbing to next element
        if (!$nextClueButton.hasClass("disabled")) {
            clueState++;
            updateClueState();
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
        userStuck(temp, n);
    }
    else if($forwardButton.text() === "Next Quadegory!"){
        console.log("Moving to next quadegory");
        setClues(n);
    }
});
$guessButton.click(function(){
    var userGuess = $blurredAnswer.text().trim();
    if(userGuess !== "" && userGuess !== "Type your answer here...") {
        console.log("userGuess: " + userGuess);
        checkGuess(userGuess);
    } else {
        $blurredAnswer.focus();
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
    wordNumber = 4;
    startOfGame = true;
    clueState = 3; // Start at clue state 3
    originalBlurredContent = "";
    
    // Set clues
    for (i = 3; i >= 0; i--) {
        $clueBox[i].text(quadegories[n].clues[i]);
    }
    
    console.log("Setting game with quadegory index: " + n);
    
    // Reset UI
    $blurredAnswer.empty();
    
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
    
    // Reset buttons
    resetClueButton();
    
    if (!$forwardButton.hasClass("btn-danger")) {
        $forwardButton.addClass("btn-danger");
    }
    if ($forwardButton.hasClass("btn-success")) {
        $forwardButton.removeClass("btn-success");
    }
    if ($forwardButton.hasClass("btn-dark")) {
        $forwardButton.removeClass("btn-dark");
    }
    
    $forwardButton.text("I'm Stuck!");
    
    // Update blurred answer
    updateBlurredAnswer();
    
    // Set fun fact
    $("#funFact p").html(quadegories[n].funFact);
}
function setClues(n) {
    // Reset game state
    attempts = 0;
    wordNumber = 4;
    clueState = 3; // Start at clue state 3
    originalBlurredContent = "";
    
    // Reset UI
    $blurredAnswer.empty();
    
    // Reset hint box colors
    $(".hints").css("background-color", "lightblue");
    $(".hintContainer").css("color", "black");
    
    // Reset buttons
    resetClueButton();
    
    if (!$forwardButton.hasClass("btn-danger")) {
        $forwardButton.addClass("btn-danger");
    }
    if ($forwardButton.hasClass("btn-success")) {
        $forwardButton.removeClass("btn-success");
    }
    if ($forwardButton.hasClass("btn-dark")) {
        $forwardButton.removeClass("btn-dark");
    }
    
    // Disable the forward button at the start of a new game
    if (!$forwardButton.hasClass("disabled")) {
        $forwardButton.addClass("disabled");
    }
    
    $forwardButton.text("I'm Stuck!");
    
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
    
    // Set clues
    for (i = 3; i >= 0; i--) {
        $clueBox[i].text(quadegories[n].clues[i]);
    }
    
    // Update blurred answer
    updateBlurredAnswer();
    
    // Set fun fact
    $("#funFact p").html(quadegories[n].funFact);
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
    userGuess = userGuess.toLowerCase();
    let correctAnswer = quadegories[n].name.toLowerCase();
    
    if(userGuess === correctAnswer){
        console.log("Correct!");
        $forwardButton.text("Next Quadegory!");
        
        // Update button states
        if ($forwardButton.hasClass("btn-dark")) {
            $forwardButton.removeClass("btn-dark");
        }
        if ($forwardButton.hasClass("btn-danger")) {
            $forwardButton.removeClass("btn-danger");
        }
        if (!$forwardButton.hasClass("btn-success")) {
            $forwardButton.addClass("btn-success");
        }
        
        // Disable next clue button
        if (!$nextClueButton.hasClass("disabled")) {
            $nextClueButton.addClass("disabled");
        }
        
        setTimeout(function(){ // to make sure button loads before background
            $(".hints").css("background-color", "green"); // change button colors when right
            $(".hintContainer").css("color", "white");
            setTimeout(function(){
                $(".hints").css("background-color", "lightblue");
                $(".hintContainer").css("color", "black");
            }, 1200);
        }, 50);
        
        // Show the full answer
        $blurredAnswer.text(correctAnswer);
        $blurredAnswer.removeAttr("data-placeholder"); // Remove placeholder when correct
        originalBlurredContent = "";
        
        $funFact.dialog({
            modal: true,
            open: function() {
                let dialogFullyOpened = false;
                // Delay setting dialog as fully opened to prevent immediate closure
                setTimeout(function() {
                    dialogFullyOpened = true;
                }, 200); // Adjust delay as needed
        
                // Close dialog when user clicks outside
                $('.ui-widget-overlay').bind('click', function() {
                    $funFact.dialog('close');
                });
        
                // Close dialog when "Enter" key is pressed after dialog is fully open
                $(document).on('keydown', function(e) {
                    if (e.key === "Enter" && dialogFullyOpened) {
                        $funFact.dialog('close');
                        $(document).off('keydown'); // Unbind to prevent multiple bindings
                    }
                });
            },
            close: function() {
                $(document).off('keydown'); // Ensure the event listener is removed on close
                let temp = n;
                n = Math.floor(Math.random() * quadegories.length);
                while (n==temp && quadegories.length > 1){
                    n = Math.floor(Math.random() * quadegories.length);
                }
                setClues(n);
            }
        });           
        startOfGame = false;
    }
    else {
        // Make the boxes blink red for wrong answer
        setTimeout(function(){
            $(".hints").css("background-color", "red");
            $(".hintContainer").css("color", "white");
            setTimeout(function(){
                $(".hints").css("background-color", "lightblue");
                $(".hintContainer").css("color", "black");
            }, 300);
        }, 50);
        // Reset the answer container to empty state for placeholder to show
        $blurredAnswer.empty();
        // Remove focus from the answer container
        $blurredAnswer.blur();
    }
}
function userStuck(temp, n) {
    let clickedOut = false;
    let correctAnswer = quadegories[temp].name;
    
    // Show the full answer in the blurred answer container
    $blurredAnswer.text(correctAnswer);
    $blurredAnswer.removeAttr("data-placeholder"); // Remove placeholder when showing answer
    originalBlurredContent = "";
    
    $imStuckPopup.find('p').html("The quadegory was <b>" + correctAnswer + "</b>!");
    $imStuckPopup.dialog({
        modal: true,
        open: function() {
            // Close dialog when user clicks outside
            $('.ui-widget-overlay').bind('click', function() {
                clickedOut = true;
                $imStuckPopup.dialog('close');
                console.log("user clicked out of popup");
            });
        },
        close: function(){
            if (!clickedOut){
                console.log("Dialog closed normally");
            }
            setClues(n);
        }
    });
    
    $(".hints").css("background-color", "red");
    $(".hintContainer").css("color", "white");
    setTimeout(function(){
        $(".hints").css("background-color", "lightblue");
        $(".hintContainer").css("color", "black");
    }, 1200);
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
    // Only show hints when all clues are revealed and user has made at least one attempt
    if (wordNumber <= 1 && attempts > 0) {
        // Get the quadegory name and split it into words
        let quadegoryName = quadegories[n].name;
        let quadegorySplitWords = quadegoryName.split(" ");
        let displayText = "";
        
        // For each word in the quadegory
        for (let i = 0; i < quadegorySplitWords.length; i++) {
            if (i > 0) {
                displayText += " "; // Add space between words
            }
            
            let word = quadegorySplitWords[i];
            let revealedWord = "";
            
            // For each character in the word
            for (let j = 0; j < word.length; j++) {
                // Reveal letters based on number of attempts (up to 3)
                if (j < Math.min(attempts, 3)) {
                    revealedWord += word[j]; // Reveal character
                } else {
                    revealedWord += "_"; // Keep hidden
                }
            }
            
            displayText += revealedWord;
        }
        
        // Update the display with the progressively revealed quadegory
        $quadegoryNumberOfWords.html(displayText).css("letter-spacing", ".2rem").effect("highlight");
    }
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