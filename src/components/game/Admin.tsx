import PuzzleGenerator from './PuzzleGenerator';

const Admin = () => {
  return (
    <div className="min-h-screen game-background transition-colors duration-300">
      <header className="border-b game-header transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <h1 className="text-2xl sm:text-3xl font-bold game-text-primary">
            Admin Dashboard
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-4xl mx-auto">
          <PuzzleGenerator />
        </div>
      </main>
    </div>
  );
};

export default Admin;
