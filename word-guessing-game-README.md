# Word Guessing Game Component

This is a modern implementation of a word guessing game with individual letter containers, designed to be integrated with your existing Quadegories project.

## Features

- Individual letter containers for better user feedback
- Color-coded visual feedback (blue for active, purple for hint-revealed, green for correct, red for incorrect)
- Comprehensive hint system that reveals letters progressively
- Keyboard navigation with arrow keys
- Mobile-friendly design
- Works with your existing jQuery codebase

## Files

- `word-guessing-game.js` - The main component implementation
- `word-guessing-game-example.html` - Example usage and integration guide

## Integration Steps

### 1. Add the JavaScript File

Copy the `word-guessing-game.js` file to your project directory.

### 2. Include the Script

Add the following script tag to your HTML file, after jQuery:

```html
<script src="word-guessing-game.js"></script>
```

### 3. Create a Container

In your HTML where the blurred answer container currently is, add a new container:

```html
<div class="row justify-content-center">
    <div class="col-12 mb-3 mt-3">
        <div id="blurredAnswerContainer" class="editable-container w-100">
            <div id="wordGuessingGameContainer"></div>
        </div>
    </div>
</div>
```

### 4. Initialize the Game

Add the following JavaScript to your `index.js` file:

```javascript
// Initialize the word guessing game
let wordGame;

function initWordGuessingGame() {
    // Get the current quadegory
    const quadegoryName = quadegories[n].name.toUpperCase();
    
    // Initialize the game
    wordGame = new WordGuessingGame({
        containerId: 'wordGuessingGameContainer',
        phrase: quadegoryName,
        onComplete: function(isCorrect) {
            // Handle game completion
            if (isCorrect) {
                // Show success message and move to next question
                handleCorrectAnswer();
            }
        }
    });
}

// Call this in your setClues or setGame function
function setClues(questionIndex) {
    // Your existing setClues code...
    
    // Initialize the word guessing game with the new phrase
    initWordGuessingGame();
}

// Initialize on page load
$(document).ready(function() {
    // Your existing code...
    
    // Initialize the word guessing game
    initWordGuessingGame();
});
```

### 5. Connect to Existing Hint System

Connect your existing next clue button to the word game's hint system:

```javascript
// Modify your existing nextClueButton click handler
$nextClueButton.on('click', function() {
    // Your existing code...
    
    // Also trigger a hint in the word game
    if (wordGame) {
        wordGame.getNextHint();
    }
});
```

### 6. Connect to Guess Checking

Modify your guess checking to work with the new component:

```javascript
// Modify your existing guess button click handler
$guessButton.on('click', function() {
    // The wordGame will handle the guess checking internally
    // You can check wordGame.isComplete and wordGame.isCorrect if needed
    
    if (wordGame && wordGame.isComplete && !wordGame.isCorrect) {
        // Handle incorrect guess
        handleIncorrectGuess();
    }
});
```

### 7. Modify "I'm Stuck" Functionality

Update your "I'm Stuck" button to reset the game:

```javascript
$forwardButton.on('click', function() {
    // Your existing code...
    
    // Reset the word game with the revealed answer
    if (wordGame) {
        // Show the correct answer
        userStuck(temp, n);
    }
});
```

## Customization

The game is styled with CSS variables that you can override to match your project's design. Add these to your CSS file and modify as needed:

```css
/* Word guessing game customizations */
.word-guessing-game-area {
    border-color: var(--your-border-color, #ccc);
}

.letter-box.active {
    border-color: var(--your-active-color, #4299e1);
    background-color: var(--your-active-bg, #ebf8ff);
}

.letter-box.revealed {
    border-color: var(--your-hint-color, #9f7aea);
    background-color: var(--your-hint-bg, #e9d8fd);
}

/* Add more customizations as needed */
```

## API

The `WordGuessingGame` class accepts the following options:

- `containerId` (string): The ID of the container element
- `phrase` (string): The phrase to guess
- `onComplete` (function): Callback when game is complete, receives boolean indicating correctness

Methods:

- `getNextHint()`: Reveals the next hint level
- `resetGame()`: Resets the game state
- `updateUI()`: Refreshes the UI based on current state

## Browser Compatibility

This component is compatible with all modern browsers (Chrome, Firefox, Safari, Edge).

## License

This component is provided as-is for use in your Quadegories project. 