let quadegories;
fetch('quadegories.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    console.log("got JSON data");
    return response.json();
  })
  .then(data => {
    quadegories = data.quadegories; // Assign the data to quadegories
    console.log('The name of the first quadegory is:', quadegories[0].name);
    n = Math.floor(Math.random() * quadegories.length);
    setGame(n);
  })
  .catch(error => console.error('Error loading JSON:', error));
const $clueBox = [$("#box1 > .hintContainer p"), $("#box2 > .hintContainer p"), $("#box3 > .hintContainer p"), $("#box4 > .hintContainer p")];
var n = 0;
var i;
var wordNumber = 4;
var attempts = 0;
var startOfGame = true;
var numberofWords = 1;
var words = [""];
// jQuery Vars
$forwardButton = $("#forwardButton");
$nextWordButton = $("#nextWordButton");
$questionMark = $("#questionMarkImg");

$(document).ready(function(){
    $("#box3").toggleClass("d-flex");
    $("#box3").hide();
    $("#box2").toggleClass("d-flex");
    $("#box2").hide();
    $("#box1").toggleClass("d-flex");
    $("#box1").hide();
    $forwardButton.toggleClass("disabled");
    // see if it's a new user
    if (!localStorage.getItem('isReturningVisitor')) {
        $("#questionMarkImg").css("opacity", 1);
        localStorage.setItem('isReturningVisitor', 'true');
    } else {
        $("#questionMarkImg").removeClass("pulsing-border");
        console.log('Welcome back, returning visitor!');
    }    
});
$(document).on("keyup", function(event){
    if (event.key == "Shift"){
        wordNumber--;
        revealWord(wordNumber);
        $("#enterGuess").focus();
    }
})
$questionMark.click(function(){
    $("#questionMarkImg").removeClass("pulsing-border");
    $("#questionMarkImg").css("opacity", 0.3);
    $("#howToPlayWrapper").css("display", "flex");
    $("#howToPlay").css("display", "block");
    $("#howToPlay").animate({ scrollTop: 10 }, 500);
});
$("#howToPlayWrapper").click(function(){
    if($("#howToPlayWrapper").css("display", "flex")){
        $("#howToPlayWrapper").css("display", "none");
        $("#howToPlay").css("display", "none");
    }
});
var firstFocus = false;
$("#enterGuess").focus(function(){
    if(!firstFocus){
        $("#quadegoryNumberOfWords").addClass("pulse");
        $("#quadegoryNumberOfWords").on("animationend", function () {
            $(this).removeClass("pulse");
        });
    }
    firstFocus = true;
});
$nextWordButton.click(function(){
    wordNumber--;
    revealWord(wordNumber);
});
$forwardButton.click(function() {
    let temp = n;
    n = Math.floor(Math.random() * quadegories.length);
    while (n==temp){
        n = Math.floor(Math.random() * quadegories.length);
    };
    console.log("n: " + n);
    console.log("start of game: " + startOfGame);
    if($forwardButton.text() == "I'm Stuck!"){
        console.log("User Gave up");
        userStuck(temp, n);
    }
    else {
        setClues(n);
    }
});
$("#guessButton").click(function(){
    var userGuess = $("#enterGuess").val();
    console.log("userGuess: " + userGuess);
    checkGuess(userGuess);
})
$("#enterGuess").on("keydown", function(event){
    if (event.key == "Enter"){
        event.preventDefault(); // Prevent form submission
        let userGuess = $("#enterGuess").val();
        console.log("userGuess: " + userGuess);
        checkGuess(userGuess);
    }
})
function setGame(n) {
    for (i = 3; i >= 0; i--) {
        $clueBox[i].text(quadegories[n].clues[i]);
    }
    wordNumber = 4;
    console.log("n: " + n);
    getWords();
    $("#funFact p").html(quadegories[n].funFact);
}
function setClues(n) {
    $("#enterGuess").val('');
    attempts = 0;
    $("#quadegoryNumberOfWords").html("<p>The quadegory is <span id=\"numberOfWordsText\">1</span> <span id=\"sOrNot\">word</span>.</p>").css("letter-spacing", "normal");
    numberofWords = 1;
    if ($(".hints").css("background-color", "green")){
        $(".hints").css("background-color", "lightblue");
        $(".hintContainer").css("color", "black");
    }
    $nextWordButton.toggleClass("disabled");
    $forwardButton.toggleClass("disabled");
    if ($nextWordButton.hasClass("btn-dark")){
        console.log("nextwordButton has btn-dark class!");
        $nextWordButton.toggleClass("btn-dark");
        $nextWordButton.toggleClass("btn-warning");
    }
    if (!$nextWordButton.hasClass("btn-warning")){
        $nextWordButton.toggleClass("btn-warning");
    }
    if ($forwardButton.hasClass("btn-success")){
        $forwardButton.toggleClass("btn-success");
        $forwardButton.toggleClass("btn-dark");
    }
    else if ($forwardButton.hasClass("btn-danger")){
        $forwardButton.toggleClass("btn-danger");
        $forwardButton.toggleClass("btn-dark");
    }
    $forwardButton.text("I'm Stuck!");
    if (wordNumber <= 3){
        $("#box3").hide();
        if ($("#box3").hasClass("d-flex")) {
            $("#box3").toggleClass("d-flex");
        }
        console.log("box 3 hidden.");
    }
    if (wordNumber <= 2){
        $("#box2").hide();
        if ($("#box2").hasClass("d-flex")) {
            $("#box2").toggleClass("d-flex");
        }
        console.log("box 2 hidden.");
    }
    if (wordNumber <= 1){
        $("#box1").hide();
        if ($("#box1").hasClass("d-flex")) {
            $("#box1").toggleClass("d-flex");
        }
        console.log("box 1 hidden.");
    }
    for (i = 3; i >= 0; i--) {
        $clueBox[i].text(quadegories[n].clues[i]);
    }
    wordNumber = 4;
    console.log("wordNumber: " + wordNumber);
    getWords();
    $("#funFact p").html(quadegories[n].funFact);
}
function revealWord(wordNumber) {
    if(wordNumber === 3){
        if ($(window).width() >= 1200){
            $("#box3").show("highlight", 500);
        }
        else {
            $("#box3").slideDown();
        }
        $("#box3").toggleClass("d-flex");
    }
    else if (wordNumber === 2){
        $("#box2").slideDown();
        $("#box2").toggleClass("d-flex");
    }
    else if (wordNumber === 1){
        if ($(window).width() >= 1200){
            $("#box1").show("highlight", 500);
        }
        else {
            $("#box1").slideDown();
        }
        $("#box1").toggleClass("d-flex");
        $nextWordButton.toggleClass("disabled");
        $nextWordButton.toggleClass("btn-warning");
        $nextWordButton.toggleClass("btn-dark");
        $forwardButton.toggleClass("disabled");
        $forwardButton.toggleClass("btn-dark");
        $forwardButton.toggleClass("btn-danger");
    }
    else {
    }
}
function checkGuess(userGuess) {
    userGuess = userGuess.toLowerCase();
    quadegories[n].name = quadegories[n].name.toLowerCase();
    if(userGuess === quadegories[n].name){
        console.log("Correct!");
        $forwardButton.text("Next Quadegory!");
        if (wordNumber >= 2) {
            $forwardButton.toggleClass("disabled");
            $nextWordButton.toggleClass("btn-dark");
            $nextWordButton.toggleClass("disabled");
            $forwardButton.toggleClass("btn-dark");
            $forwardButton.toggleClass("btn-success");
        } else {
            $forwardButton.toggleClass("btn-success btn-danger");
        }
        setTimeout(function(){ // to make sure button loads before background
            $(".hints").css("background-color", "green"); // change button colors when right
            $(".hintContainer").css("color", "white");
            setTimeout(function(){
                $(".hints").css("background-color", "lightblue");
                $(".hintContainer").css("color", "black");
            }, 1200);
        }, 50);
        $("#funFact").dialog({
            modal: true,
            open: function() {
                let dialogFullyOpened = false;
                // Delay setting dialog as fully opened to prevent immediate closure
                setTimeout(function() {
                    dialogFullyOpened = true;
                }, 200); // Adjust delay as needed
        
                // Close dialog when user clicks outside
                $('.ui-widget-overlay').bind('click', function() {
                    $('#funFact').dialog('close');
                });
        
                // Close dialog when "Enter" key is pressed after dialog is fully open
                $(document).on('keydown', function(e) {
                    if (e.key === "Enter" && dialogFullyOpened) {
                        $('#funFact').dialog('close');
                        $(document).off('keydown'); // Unbind to prevent multiple bindings
                    }
                });
            },
            close: function() {
                $(document).off('keydown'); // Ensure the event listener is removed on close
                let temp = n;
    n = Math.floor(Math.random() * quadegories.length);
    while (n==temp){
        n = Math.floor(Math.random() * quadegories.length);
    };
                setClues(n);
            }
        });           
        startOfGame = false;
        console.log("Word number: " + wordNumber);
    }
    else {
        if (wordNumber <= 4){
            $("#box4").effect("shake", {times:2},250);
        }
        if (wordNumber <= 3){
            $("#box3").effect("shake", {times:2},250);
        }
        if (wordNumber <= 2){
            $("#box2").effect("shake", {times:2},250);
        }
        if (wordNumber <= 1){
            $("#box1").effect("shake", {times:2},250);
            attempts++;
        }
        $("#enterGuess").val('').focus();
        $("#quadegoryNumberOfWords").addClass("pulse");
        $("#quadegoryNumberOfWords").on("animationend", function () {
            $(this).removeClass("pulse");
        });
        setHints(n);
    }
}
function userStuck(temp, n) {
    let clickedOut = false;
    $("#imStuckPopup p").html("The quadegory was <b>" + quadegories[temp].name + "</b>!");
            $("#imStuckPopup").dialog({
                modal: true,
                open: function() {
                    // Close dialog when user clicks outside
                    $('.ui-widget-overlay').bind('click', function() {
                        clickedOut = true;
                        $('#imStuckPopup').dialog('close');
                        console.log("user clicked out of popup");
                        setClues(n);
                    });
                },
                close: function(){
                    if (!clickedOut){
                        setClues(n);
                    } 
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
    for (let j = 0; j <= quadegories[n].name.length; j++){
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
function setHints(n) {
    let quadegoryNoLetters = quadegories[n].name.replace(/[a-z]/g, "_");
    let quadegorySplitWords = quadegories[n].name.split(" ");
    let quadegorySplitWordsNoLetters = quadegoryNoLetters.split(" ");
    if (wordNumber <= 1 && (attempts-1) < 2){
        for (let i = 0; i < quadegorySplitWords.length; i++) {
            let revealedWord = ""; // To build the progressively revealed word
    
            for (let j = 0; j < quadegorySplitWords[i].length; j++) {
                // Reveal letters up to the current attempt count
                if (j < attempts - 1) {
                    revealedWord += quadegorySplitWords[i][j]; // Reveal character
                } else {
                    revealedWord += "_"; // Keep hidden
                }
            }
    
            // Update the corresponding word in the no-letters array
            quadegorySplitWordsNoLetters[i] = revealedWord;
        }
        $("#quadegoryNumberOfWords").html(quadegorySplitWordsNoLetters.join(" ")).css("letter-spacing", ".2rem").effect("highlight");
    }
}