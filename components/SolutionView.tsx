import React, { useState } from 'react';
import { MathSolution, MathStep } from '../types';
import GraphComponent from './GraphComponent';
import { explainStep } from '../services/geminiService';
import { BookOpen, ChevronRight, HelpCircle, X } from 'lucide-react';

interface SolutionViewProps {
  solution: MathSolution;
  onReset: () => void;
}

const SolutionView: React.FC<SolutionViewProps> = ({ solution, onReset }) => {
  const [explanation, setExplanation] = useState<{ index: number; text: string } | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const handleExplain = async (step: MathStep, index: number) => {
    if (explanation?.index === index) {
      setExplanation(null); // Toggle off
      return;
    }

    setLoadingExplanation(true);
    try {
      const text = await explainStep(step.description, solution.originalProblem);
      setExplanation({ index, text });
    } finally {
      setLoadingExplanation(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgLight overflow-y-auto no-scrollbar pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-textDark">{solution.category}</h2>
           <p className="text-gray-500 text-sm">Solved just now</p>
        </div>
        <button 
          onClick={onReset} 
          className="p-2 hover:bg-gray-100 rounded-full text-textDark"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Final Answer Card */}
        <div className="bg-primary rounded-xl p-6 text-white shadow-lg">
           <p className="text-primary-100 text-sm font-medium mb-1 uppercase tracking-wide">Final Answer</p>
           <div className="text-3xl font-bold font-mono break-words">
             {solution.finalAnswer}
           </div>
           <p className="mt-4 text-white/80 text-sm border-t border-white/20 pt-2">
             Problem: {solution.originalProblem}
           </p>
        </div>

        {/* Graph if available */}
        {solution.graphExpression && (
          <GraphComponent expression={solution.graphExpression} />
        )}

        {/* Steps */}
        <div>
           <h3 className="text-lg font-bold text-textDark mb-4 flex items-center">
             <BookOpen size={20} className="mr-2 text-primary" />
             Step-by-Step Solution
           </h3>
           
           <div className="space-y-4">
             {solution.steps.map((step, idx) => (
               <div key={idx} className="bg-white rounded-lg shadow-md p-4 border border-transparent hover:border-primary/20 transition">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center">
                     <span className="bg-primary/10 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">
                       {idx + 1}
                     </span>
                     <h4 className="font-bold text-textDark">{step.title}</h4>
                   </div>
                   <button 
                     onClick={() => handleExplain(step, idx)}
                     className="text-primary hover:bg-primary/5 p-1 rounded-full"
                     title="Explain this step"
                   >
                     <HelpCircle size={20} />
                   </button>
                 </div>
                 
                 <p className="text-gray-700 leading-relaxed ml-9">
                   {step.description}
                 </p>
                 
                 {step.latex && (
                   <div className="mt-3 ml-9 bg-gray-50 p-2 rounded font-mono text-sm text-gray-800 overflow-x-auto">
                     {step.latex}
                   </div>
                 )}

                 {/* Interactive Explanation Bubble */}
                 {explanation?.index === idx && (
                   <div className="mt-4 ml-9 bg-blue-50 border-l-4 border-secondary p-3 rounded animate-fade-in">
                     <p className="text-sm text-gray-800 font-medium">
                       💡 AI Explanation:
                     </p>
                     <p className="text-sm text-gray-700 mt-1">
                       {explanation.text}
                     </p>
                   </div>
                 )}
                 
                 {loadingExplanation && explanation?.index === idx && (
                    <div className="mt-2 ml-9 text-sm text-gray-400 animate-pulse">
                      Asking Gemini...
                    </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionView;
