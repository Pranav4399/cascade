# Cascade - Word Chain Puzzle Game

A modern word puzzle game where you find synonyms that follow a cascade pattern. Each word must share progressively more starting letters with the next word in the chain.

## 🎯 How to Play

1. **Find synonyms** for each clue word
2. **Follow the pattern**: Each answer must start with the same letters as the previous answer
3. **Build the cascade**: First word can start with any letter, second must share the first letter, third must share the first two letters, and so on

**Example**: BICKER → BAMBOOZLE → BARBARIC (B → BA → BAR...)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd synonyzzle-word-chain

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Native components** - Lightweight UI (no external component libraries)

## 📱 Features

- **Responsive design** - Works on desktop and mobile
- **Dynamic sizing** - Adaptive letter boxes for different word lengths
- **Auto-validation** - Real-time checking as you type
- **Focus management** - Smooth navigation between input boxes
- **Share results** - Share your completed puzzles
- **How-to-play modal** - Built-in instructions for new players

## 🎨 Game Design

- Clean, minimalist interface
- Yellow highlighting for cascade pattern visualization
- Green validation for correct answers
- Smooth animations and transitions
- Mobile-optimized input handling

## 📄 License

This project is open source and available under the MIT License.
