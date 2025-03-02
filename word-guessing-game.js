/**
 * Word Guessing Game Component
 * 
 * This is a modern implementation of a word guessing game that can be integrated with jQuery
 */

class WordGuessingGame {
  /**
   * Create a new word guessing game
   * @param {Object} options Configuration options
   * @param {string} options.containerId The ID of the container element
   * @param {string} options.phrase The phrase to guess
   * @param {Function} options.onComplete Callback when game is complete
   */
  constructor(options) {
    this.containerId = options.containerId || 'wordGuessingGameContainer';
    this.phrase = (options.phrase || 'THE QUICK BROWN FOX').toUpperCase();
    this.onComplete = options.onComplete || function() {};
    
    this.guessedLetters = {};
    this.currentPosition = { wordIndex: 0, letterIndex: 0 };
    this.hintLevel = 0;
    this.revealedByHint = new Set();
    this.isCorrect = null;
    this.isComplete = false;
    this.words = this.phrase.split(' ');
    this.inputRefs = {};
    
    // Create and render the component
    this.render();
    this.initEventListeners();
  }
  
  /**
   * Create the HTML structure for the game
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID "${this.containerId}" not found`);
      return;
    }
    
    // Clear the container
    container.innerHTML = '';
    container.tabIndex = 0;
    container.className = 'word-guessing-game-container';
    
    // Create the game area
    const gameArea = document.createElement('div');
    gameArea.className = 'word-guessing-game-area';
    
    // Create the words container
    const wordsContainer = document.createElement('div');
    wordsContainer.className = 'words-container';
    
    // Create each word and its letters
    this.words.forEach((word, wordIndex) => {
      const wordElement = document.createElement('div');
      wordElement.className = 'word';
      
      // Create each letter in the word
      word.split('').forEach((letter, letterIndex) => {
        const key = `${wordIndex}-${letterIndex}`;
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        letterBox.dataset.key = key;
        
        const letterDisplay = document.createElement('span');
        letterDisplay.className = 'letter-display';
        letterDisplay.textContent = '_';
        
        const letterInput = document.createElement('input');
        letterInput.type = 'text';
        letterInput.className = 'letter-input';
        letterInput.maxLength = 1;
        letterInput.readOnly = true;
        letterInput.tabIndex = -1;
        
        // Store reference to the input
        this.inputRefs[key] = letterInput;
        
        letterBox.appendChild(letterDisplay);
        letterBox.appendChild(letterInput);
        wordElement.appendChild(letterBox);
      });
      
      wordsContainer.appendChild(wordElement);
    });
    
    gameArea.appendChild(wordsContainer);
    
    // Create the completion overlay (hidden initially)
    const completionOverlay = document.createElement('div');
    completionOverlay.className = 'completion-overlay hidden';
    completionOverlay.innerHTML = `
      <div class="completion-message">
        <div class="completion-icon"></div>
        <h2 class="completion-text"></h2>
        <button class="play-again-button">Play Again</button>
      </div>
    `;
    
    gameArea.appendChild(completionOverlay);
    container.appendChild(gameArea);
    
    // Create controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    
    const hintButton = document.createElement('button');
    hintButton.className = 'hint-button';
    hintButton.textContent = 'Get Hint (1/3)';
    hintButton.addEventListener('click', () => this.getNextHint());
    
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-button';
    resetButton.textContent = 'Reset Game';
    resetButton.addEventListener('click', () => this.resetGame());
    
    controlsContainer.appendChild(hintButton);
    controlsContainer.appendChild(resetButton);
    container.appendChild(controlsContainer);
    
    // Add styles if they don't exist
    if (!document.getElementById('word-guessing-game-styles')) {
      const styles = document.createElement('style');
      styles.id = 'word-guessing-game-styles';
      styles.textContent = `
        .word-guessing-game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          gap: 20px;
          font-family: Arial, sans-serif;
        }
        
        .word-guessing-game-area {
          position: relative;
          width: 100%;
          padding: 20px;
          border: 2px solid #ccc;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .words-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
        }
        
        .word {
          display: flex;
          gap: 5px;
        }
        
        .letter-box {
          position: relative;
          width: 40px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ccc;
          border-radius: 6px;
          background-color: #f8f9fa;
          font-weight: bold;
          font-size: 20px;
          transition: all 0.3s ease;
        }
        
        .letter-box.active {
          border-color: #4299e1;
          background-color: #ebf8ff;
        }
        
        .letter-box.revealed {
          border-color: #9f7aea;
          background-color: #e9d8fd;
        }
        
        .letter-box.correct {
          border-color: #48bb78;
          background-color: #c6f6d5;
        }
        
        .letter-box.incorrect {
          border-color: #f56565;
          background-color: #fed7d7;
        }
        
        .letter-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: text;
        }
        
        .completion-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        
        .completion-overlay.hidden {
          display: none;
        }
        
        .completion-overlay.correct {
          background-color: rgba(198, 246, 213, 0.9);
        }
        
        .completion-overlay.incorrect {
          background-color: rgba(254, 215, 215, 0.9);
        }
        
        .completion-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 24px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .completion-icon {
          width: 64px;
          height: 64px;
          font-size: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .completion-icon.correct {
          color: #48bb78;
        }
        
        .completion-icon.incorrect {
          color: #f56565;
        }
        
        .completion-text {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        
        .completion-text.correct {
          color: #2f855a;
        }
        
        .completion-text.incorrect {
          color: #c53030;
        }
        
        .play-again-button {
          margin-top: 10px;
          padding: 8px 16px;
          background-color: #4299e1;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        
        .play-again-button:hover {
          background-color: #3182ce;
        }
        
        .controls-container {
          display: flex;
          gap: 15px;
        }
        
        .hint-button, .reset-button {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .hint-button {
          background-color: #4299e1;
          color: white;
        }
        
        .hint-button:hover {
          background-color: #3182ce;
        }
        
        .hint-button.disabled {
          background-color: #cbd5e0;
          color: #4a5568;
          cursor: not-allowed;
        }
        
        .reset-button {
          background-color: #e2e8f0;
          color: #4a5568;
        }
        
        .reset-button:hover {
          background-color: #cbd5e0;
        }
      `;
      document.head.appendChild(styles);
    }
    
    // Initialize the game state after rendering
    this.updateUI();
  }
  
  /**
   * Initialize event listeners
   */
  initEventListeners() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Handle key press
    container.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Handle play again button
    const playAgainButton = container.querySelector('.play-again-button');
    if (playAgainButton) {
      playAgainButton.addEventListener('click', this.resetGame.bind(this));
    }
  }
  
  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event 
   */
  handleKeyDown(event) {
    if (this.isComplete) return;
    
    const key = event.key;
    const upperKey = key.toUpperCase();
    
    // Only accept letters
    if (/^[A-Z]$/.test(upperKey)) {
      const { wordIndex, letterIndex } = this.currentPosition;
      const currentWord = this.words[wordIndex];
      const positionKey = `${wordIndex}-${letterIndex}`;
      
      // Update guessed letter
      this.guessedLetters[positionKey] = upperKey;
      
      // Move to next position (will automatically skip revealed letters)
      this.focusNextInput(wordIndex, letterIndex + 1);
      
      // Update UI
      this.updateUI();
      this.checkCompletion();
    } else if (key === 'Backspace') {
      // Handle backspace
      const { wordIndex, letterIndex } = this.currentPosition;
      
      // First check if the current position has a non-revealed letter that can be deleted
      const currentPositionKey = `${wordIndex}-${letterIndex}`;
      if (this.guessedLetters[currentPositionKey] && !this.revealedByHint.has(currentPositionKey)) {
        // Delete the letter at the current position
        delete this.guessedLetters[currentPositionKey];
        this.updateUI();
        return;
      }
      
      // If not at the current position, try to delete and move to the previous position
      if (letterIndex > 0 || wordIndex > 0) {
        // If we're not at the beginning of the puzzle
        let targetWordIndex = wordIndex;
        let targetLetterIndex = letterIndex - 1;
        
        // If we're at the beginning of a word, go to previous word
        if (targetLetterIndex < 0 && wordIndex > 0) {
          targetWordIndex = wordIndex - 1;
          targetLetterIndex = this.words[targetWordIndex].length - 1;
        }
        
        // Find the first non-revealed letter before the current position
        while (targetLetterIndex >= 0) {
          const positionKey = `${targetWordIndex}-${targetLetterIndex}`;
          
          if (!this.revealedByHint.has(positionKey)) {
            // Delete this letter
            delete this.guessedLetters[positionKey];
            // Move focus to this position
            this.focusNextInput(targetWordIndex, targetLetterIndex, true);
            // Update UI and exit
            this.updateUI();
            return;
          }
          
          // Move to previous letter
          targetLetterIndex--;
          
          // If we reach the beginning of the word, move to previous word
          if (targetLetterIndex < 0 && targetWordIndex > 0) {
            targetWordIndex--;
            targetLetterIndex = this.words[targetWordIndex].length - 1;
          } else if (targetLetterIndex < 0) {
            // Reached the beginning of the puzzle
            break;
          }
        }
        
        // If we get here, there are no deletable letters before the current position
        // Still move the cursor back for consistency
        this.focusNextInput(targetWordIndex, targetLetterIndex, true);
        this.updateUI();
      }
    } else if (key === 'ArrowLeft') {
      // Navigate to previous letter
      const { wordIndex, letterIndex } = this.currentPosition;
      this.focusNextInput(wordIndex, letterIndex - 1, true);
      event.preventDefault();
    } else if (key === 'ArrowRight') {
      // Navigate to next letter
      const { wordIndex, letterIndex } = this.currentPosition;
      this.focusNextInput(wordIndex, letterIndex + 1);
      event.preventDefault();
    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
      // Prevent default behavior for arrow keys to avoid page scrolling
      event.preventDefault();
    }
  }
  
  /**
   * Focus the next input
   * @param {number} wordIndex 
   * @param {number} letterIndex 
   * @param {boolean} isBackspace 
   */
  focusNextInput(wordIndex, letterIndex, isBackspace = false) {
    // Handle out of bounds indices
    if (wordIndex < 0 || wordIndex >= this.words.length) {
      return;
    }
    
    const currentWord = this.words[wordIndex];
    
    // If we're at the end of the word
    if (letterIndex >= currentWord.length) {
      // Move to next word
      if (wordIndex < this.words.length - 1) {
        this.focusNextInput(wordIndex + 1, 0);
      } else {
        // We're at the end of the last word
        this.currentPosition = { wordIndex, letterIndex: currentWord.length - 1 };
        const lastKey = `${wordIndex}-${currentWord.length - 1}`;
        setTimeout(() => {
          const lastInput = this.inputRefs[lastKey];
          if (lastInput) lastInput.focus();
        }, 0);
      }
      return;
    }
    
    // If we're before the beginning of the word
    if (letterIndex < 0) {
      // Move to previous word
      if (wordIndex > 0) {
        const prevWordIndex = wordIndex - 1;
        const prevWordLength = this.words[prevWordIndex].length;
        this.focusNextInput(prevWordIndex, prevWordLength - 1, isBackspace);
      } else {
        // We're at the beginning of the first word
        this.currentPosition = { wordIndex: 0, letterIndex: 0 };
        const firstKey = "0-0";
        setTimeout(() => {
          const firstInput = this.inputRefs[firstKey];
          if (firstInput) firstInput.focus();
        }, 0);
      }
      return;
    }
    
    // If moving forward, skip revealed letters; when backspacing, do not skip so that the previous letter is reached
    const key = `${wordIndex}-${letterIndex}`;
    if (!isBackspace && this.revealedByHint.has(key)) {
      // Skip this letter and move to the next letter
      this.focusNextInput(wordIndex, letterIndex + 1, false);
      return;
    }
    
    // We found a non-revealed letter to focus
    this.currentPosition = { wordIndex, letterIndex };
    setTimeout(() => {
      const inputKey = `${wordIndex}-${letterIndex}`;
      const input = this.inputRefs[inputKey];
      if (input) input.focus();
    }, 0);
  }
  
  /**
   * Get the next hint
   */
  getNextHint() {
    if (this.hintLevel >= 3 || this.isComplete) return;
    
    this.hintLevel++;
    
    // Store current position before applying hints
    const currentPosition = { ...this.currentPosition };
    
    // Track if the current position is being revealed
    let currentPositionRevealed = false;
    
    // Reveal letters based on hint level
    this.words.forEach((word, wordIndex) => {
      // For hint level 1, reveal the first letter of each word
      // For hint level 2, reveal the first and middle letters
      // For hint level 3, reveal the first, middle, and last letters
      
      const lettersToReveal = [];
      
      if (this.hintLevel >= 1) {
        lettersToReveal.push(0); // First letter
      }
      
      if (this.hintLevel >= 2 && word.length > 2) {
        lettersToReveal.push(Math.floor(word.length / 2)); // Middle letter
      }
      
      if (this.hintLevel >= 3 && word.length > 1) {
        lettersToReveal.push(word.length - 1); // Last letter
      }
      
      lettersToReveal.forEach(letterIndex => {
        const key = `${wordIndex}-${letterIndex}`;
        this.revealedByHint.add(key);
        
        // Also update guessed letters to match the revealed letter
        this.guessedLetters[key] = word[letterIndex];
        
        // Check if this is the current position
        if (wordIndex === currentPosition.wordIndex && letterIndex === currentPosition.letterIndex) {
          currentPositionRevealed = true;
        }
      });
    });
    
    // Update UI
    this.updateUI();
    
    // Update hint button text
    const hintButton = document.querySelector(`#${this.containerId} .hint-button`);
    if (hintButton) {
      hintButton.textContent = 
        this.hintLevel === 1 ? 'Get Hint (2/3)' :
        this.hintLevel === 2 ? 'Get Hint (3/3)' : 
        'No More Hints';
        
      if (this.hintLevel >= 3) {
        hintButton.classList.add('disabled');
      }
    }
    
    // Find next available position to focus
    setTimeout(() => {
      // If the current position was revealed or we need to find the next available position
      if (currentPositionRevealed) {
        // Find next non-revealed position
        let found = false;
        const maxWordIndex = this.words.length - 1;
        
        // Start search from current position
        let searchWordIndex = currentPosition.wordIndex;
        let searchLetterIndex = currentPosition.letterIndex;
        
        // Continue searching until we find a non-revealed position or reach the end
        while (!found && searchWordIndex <= maxWordIndex) {
          const word = this.words[searchWordIndex];
          
          // Search through letters in current word
          while (!found && searchLetterIndex < word.length) {
            const key = `${searchWordIndex}-${searchLetterIndex}`;
            
            // If this position is not revealed, set as new focus position
            if (!this.revealedByHint.has(key)) {
              found = true;
              this.focusNextInput(searchWordIndex, searchLetterIndex);
              // Ensure UI is updated to reflect the new active position
              setTimeout(() => this.updateUI(), 10);
              break;
            }
            
            searchLetterIndex++;
          }
          
          // If not found in current word, move to next word
          if (!found) {
            searchWordIndex++;
            searchLetterIndex = 0;
          }
        }
        
        // If no non-revealed position found, do nothing (keep current position)
        if (!found) {
          this.updateUI(); // Make sure UI reflects current state
        }
      } else {
        // Just update focus at current position
        this.focusNextInput(currentPosition.wordIndex, currentPosition.letterIndex);
        // Ensure UI is updated
        setTimeout(() => this.updateUI(), 10);
      }
    }, 0);
    
    // Check if game is complete
    this.checkCompletion();
  }
  
  /**
   * Reset the game
   */
  resetGame() {
    this.guessedLetters = {};
    this.currentPosition = { wordIndex: 0, letterIndex: 0 };
    this.hintLevel = 0;
    this.revealedByHint = new Set();
    this.isCorrect = null;
    this.isComplete = false;
    
    // Update UI
    this.updateUI();
    
    // Hide completion overlay
    const completionOverlay = document.querySelector(`#${this.containerId} .completion-overlay`);
    if (completionOverlay) {
      completionOverlay.classList.add('hidden');
      completionOverlay.classList.remove('correct', 'incorrect');
    }
    
    // Update hint button
    const hintButton = document.querySelector(`#${this.containerId} .hint-button`);
    if (hintButton) {
      hintButton.textContent = 'Get Hint (1/3)';
      hintButton.classList.remove('disabled');
    }
    
    // Focus the first input
    setTimeout(() => {
      this.focusNextInput(0, 0);
    }, 0);
  }
  
  /**
   * Update the UI based on current state
   */
  updateUI() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Update letter boxes
    this.words.forEach((word, wordIndex) => {
      word.split('').forEach((letter, letterIndex) => {
        const key = `${wordIndex}-${letterIndex}`;
        const letterBox = container.querySelector(`.letter-box[data-key="${key}"]`);
        const letterDisplay = letterBox?.querySelector('.letter-display');
        
        if (!letterBox || !letterDisplay) return;
        
        // Remove existing state classes
        letterBox.classList.remove('active', 'revealed', 'correct', 'incorrect');
        
        // Check if this is the active letter
        const isActive = this.currentPosition.wordIndex === wordIndex && 
                          this.currentPosition.letterIndex === letterIndex;
        
        // Check if this letter is revealed by hint
        const isRevealed = this.revealedByHint.has(key);
        
        // Get guessed letter
        const guessedLetter = this.guessedLetters[key] || '';
        
        // Determine what to display
        const displayLetter = isRevealed ? letter : guessedLetter;
        
        // Update the display
        letterDisplay.textContent = displayLetter || '_';
        
        // Update classes
        if (isActive) {
          letterBox.classList.add('active');
        } else if (isRevealed) {
          letterBox.classList.add('revealed');
        } else if (displayLetter) {
          if (displayLetter === letter) {
            letterBox.classList.add('correct');
          } else {
            letterBox.classList.add('incorrect');
          }
        }
      });
    });
  }
  
  /**
   * Check if the game is complete
   */
  checkCompletion() {
    // Check if all letters are filled
    const allLettersFilled = this.words.every((word, wordIndex) =>
      word.split('').every((letter, letterIndex) => {
        const key = `${wordIndex}-${letterIndex}`;
        return this.guessedLetters[key] || this.revealedByHint.has(key);
      })
    );
    
    if (allLettersFilled && !this.isComplete) {
      // Check if all letters are correct
      const allCorrect = this.words.every((word, wordIndex) =>
        word.split('').every((letter, letterIndex) => {
          const key = `${wordIndex}-${letterIndex}`;
          return (this.guessedLetters[key] || '') === letter;
        })
      );
      
      this.isCorrect = allCorrect;
      this.isComplete = true;
      
      // Show completion message
      this.showCompletionMessage(allCorrect);
      
      // Call the onComplete callback
      if (typeof this.onComplete === 'function') {
        this.onComplete(allCorrect);
      }
    }
  }
  
  /**
   * Show completion message
   * @param {boolean} isCorrect 
   */
  showCompletionMessage(isCorrect) {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    const completionOverlay = container.querySelector('.completion-overlay');
    const completionIcon = container.querySelector('.completion-icon');
    const completionText = container.querySelector('.completion-text');
    
    if (!completionOverlay || !completionIcon || !completionText) return;
    
    // Update classes
    completionOverlay.classList.remove('hidden');
    completionOverlay.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    completionIcon.classList.add(isCorrect ? 'correct' : 'incorrect');
    completionIcon.textContent = isCorrect ? '✓' : '✗';
    
    completionText.classList.add(isCorrect ? 'correct' : 'incorrect');
    completionText.textContent = isCorrect ? 'Correct!' : 'Not quite right!';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Check if the container exists
  if (!document.getElementById('wordGuessingGameContainer')) {
    console.warn('Word guessing game container not found. Create a div with id="wordGuessingGameContainer" to initialize the game.');
  }
});

// Expose the class to global scope for jQuery integration
window.WordGuessingGame = WordGuessingGame; 