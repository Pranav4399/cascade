import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Admin from './components/game/Admin';
import GameGrid from './components/game/GameGrid';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameGrid />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;