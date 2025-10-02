# Wordle Clone

A web-based clone of the popular word-guessing game Wordle, built with HTML, CSS, and JavaScript.

## Features

- **6x5 Game Grid**: Six attempts to guess a 5-letter word
- **Color-Coded Feedback**: 
  - 🟩 Green: Correct letter in correct position
  - 🟨 Yellow: Correct letter in wrong position  
  - ⬜ Gray: Letter not in the word
- **Dual Input Methods**: Virtual on-screen keyboard and physical keyboard support
- **Word Validation**: Checks guesses against a curated list of valid 5-letter words
- **Statistics Tracking**: Comprehensive game statistics including:
  - Games played and win percentage
  - Current and maximum win streaks
  - Guess distribution chart showing performance across all attempts
  - Persistent storage using localStorage
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Smooth Animations**: Engaging visual feedback with CSS animations
- **Game State Management**: Win/lose detection with appropriate messaging

## How to Play

1. Open `index.html` in your web browser
2. Start typing or clicking letters to make your first guess
3. Press Enter or click the ENTER button to submit your guess
4. Use the color feedback to inform your next guess:
   - Green tiles are in the correct position
   - Yellow tiles are in the word but wrong position
   - Gray tiles are not in the word at all
5. You have 6 attempts to guess the correct word
6. Click "📊 Stats" to view your game statistics and performance
7. Click "New Game" to start over with a new word

## Statistics

The game tracks comprehensive statistics that persist between sessions:

- **Games Played**: Total number of games completed
- **Win Percentage**: Percentage of games won
- **Current Streak**: Number of consecutive wins
- **Max Streak**: Highest number of consecutive wins achieved
- **Guess Distribution**: Visual chart showing how many games were won in 1-6 guesses

Statistics are automatically saved to your browser's local storage and will persist between visits. You can reset your statistics at any time using the "Reset Statistics" button in the stats modal.

## Technical Details

### Files Structure
```
Disnedle/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Game logic and interactions
├── words.js            # Word list for the game
└── README.md           # This file
```

### Game Logic
- Random word selection from a curated list of 300+ common 5-letter words
- Letter frequency tracking for accurate yellow/green feedback
- Keyboard state management to show used letters
- Input validation and error handling
- Win/lose condition detection

### Browser Compatibility
- Modern browsers with ES6+ support
- Mobile-responsive design
- Touch-friendly interface

## Customization

You can easily customize the game by:

- **Adding more words**: Extend the `WORD_LIST` array in `words.js`
- **Changing colors**: Modify the CSS custom properties in `style.css`
- **Adjusting difficulty**: Change `maxGuesses` or `wordLength` in the game constructor
- **Adding features**: Implement statistics tracking, daily words, or hints

## Development

The game is built with vanilla JavaScript and requires no build process or dependencies. Simply open `index.html` in a web browser to play.

For development:
1. Make changes to the HTML, CSS, or JavaScript files
2. Refresh the browser to see updates
3. Use browser developer tools for debugging

## License

This project is open source and available under the MIT License.
