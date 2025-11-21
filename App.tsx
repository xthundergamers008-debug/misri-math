import React, { useState } from 'react';
import { Camera, PenTool, Type, History, ScanLine } from 'lucide-react';
import CameraInput from './components/CameraInput';
import CanvasInput from './components/CanvasInput';
import SolutionView from './components/SolutionView';
import { solveMathProblem, solveFromImage } from './services/geminiService';
import { InputMode, MathSolution } from './types';

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleTextSolve = async () => {
    if (!manualInput.trim()) return;
    setLoading(true);
    try {
      const result = await solveMathProblem(manualInput);
      setSolution(result);
    } catch (e) {
      alert("Failed to solve problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSolve = async (base64Image: string) => {
    setCameraOpen(false); // Close camera if open
    setLoading(true);
    try {
      const result = await solveFromImage(base64Image);
      setSolution(result);
    } catch (e) {
      alert("Failed to analyze image. Please ensure the image is clear.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSolution(null);
    setManualInput('');
  };

  // If solution exists, show result view
  if (solution) {
    return <SolutionView solution={solution} onReset={reset} />;
  }

  // If camera is active (full screen overlay)
  if (cameraOpen) {
    return <CameraInput onCapture={handleImageSolve} onClose={() => setCameraOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-bgLight flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-white p-6 pb-4 shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-textDark">AI Solver</h1>
            <p className="text-sm text-gray-500">Gemini Powered Math Genius</p>
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="History">
            <History size={24} />
          </button>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setInputMode(InputMode.TEXT)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center
              ${inputMode === InputMode.TEXT ? 'bg-white shadow-md text-primary' : 'text-gray-500'}`}
          >
            <Type size={16} className="mr-2" /> Text
          </button>
          <button 
             onClick={() => setInputMode(InputMode.DRAW)}
             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center
              ${inputMode === InputMode.DRAW ? 'bg-white shadow-md text-primary' : 'text-gray-500'}`}
          >
            <PenTool size={16} className="mr-2" /> Draw
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        
        {loading ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-textDark">Thinking...</h3>
              <p className="text-sm text-gray-500 mt-2">Gemini is crunching the numbers</p>
           </div>
        ) : (
          <>
            {inputMode === InputMode.TEXT && (
              <div className="flex-1 flex flex-col">
                <textarea 
                  className="w-full flex-1 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-lg outline-none bg-white"
                  placeholder="Type a math problem (e.g., Determine the integral of x^2)..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <button 
                  onClick={handleTextSolve}
                  disabled={!manualInput.trim()}
                  className={`mt-4 w-full py-4 rounded-xl font-bold text-white shadow-lg transition
                    ${manualInput.trim() ? 'bg-primary hover:bg-primaryHover' : 'bg-gray-300 cursor-not-allowed'}
                  `}
                >
                  Solve
                </button>
              </div>
            )}

            {inputMode === InputMode.DRAW && (
              <div className="flex-1 flex flex-col h-full">
                <CanvasInput onCapture={handleImageSolve} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button for Camera */}
      {!loading && !cameraOpen && (
        <div className="absolute bottom-6 right-6">
          <button 
            onClick={() => setCameraOpen(true)}
            className="w-16 h-16 bg-secondary rounded-full shadow-2xl flex items-center justify-center text-textDark hover:scale-105 transition transform border-2 border-white"
            aria-label="Scan with Camera"
          >
            <Camera size={32} />
          </button>
        </div>
      )}
      
      {!loading && !cameraOpen && (
        <div className="absolute bottom-16 right-8 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Scan
        </div>
      )}
    </div>
  );
};

export default App;
