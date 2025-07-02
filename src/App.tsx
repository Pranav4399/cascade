import GameGrid from './components/game/GameGrid';
import { Analytics } from "@vercel/analytics/react";

const App = () => { 
  return ( 
    <>
      <GameGrid />
      <Analytics />
    </>
  )
}

export default App;
