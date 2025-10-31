import React from 'react';
import type { Evaluation } from '../types';
import { CheckIcon, LightbulbIcon, SparklesIcon } from './icons';

interface EvaluationDisplayProps {
  evaluation: Evaluation;
}

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ evaluation }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Your Feedback</h2>
      
      <div className="flex justify-center items-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-5xl font-bold text-blue-600">{evaluation.bandScore.toFixed(1)}</span>
          </div>
          <div className="absolute -top-2 -left-2 w-36 h-36 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <CheckIcon className="w-6 h-6 mr-2 text-green-600" />
            Strengths (Điểm mạnh)
          </h3>
          <ul className="space-y-2 list-inside">
            {evaluation.strengths.map((item, index) => (
              <li key={index} className="text-green-700 flex items-start">
                <span className="text-green-500 mr-2 mt-1">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            <LightbulbIcon className="w-6 h-6 mr-2 text-yellow-600" />
            Areas for Improvement (Cần cải thiện)
          </h3>
          <ul className="space-y-2 list-inside">
            {evaluation.improvements.map((item, index) => (
               <li key={index} className="text-yellow-700 flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">&#8250;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-blue-500" />
          High-Band Model Answer
        </h3>
        <blockquote className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500 text-slate-700 italic">
          {evaluation.highBandAnswer}
        </blockquote>
      </div>
    </div>
  );
};

export default EvaluationDisplay;
