import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateFacebookMindsetShift, generateSpeech } from './services/geminiService';
import { SparklesIcon, CheckIcon, LightbulbIcon, PlayIcon, ArrowDownTrayIcon } from './components/icons';
import type { FacebookMindsetShift } from './types';
import { decode, createWavBlob, toInt16Array } from './utils';


const App: React.FC = () => {
  const [belief1, setBelief1] = useState<string>("I don't know what topic to post about on Facebook.");
  const [belief2, setBelief2] = useState<string>("I don't know what to post, how long to post for, or if I can be consistent.");
  const [topic, setTopic] = useState<string>("");
  
  // Updated state for the new compound interest formula
  const [monthlyValue, setMonthlyValue] = useState<string>('500');
  const [years, setYears] = useState<string>('10');
  const [calculatedLoss, setCalculatedLoss] = useState<number>(0);
  
  const [result, setResult] = useState<FacebookMindsetShift | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for audio generation
  const [audioUrl1, setAudioUrl1] = useState<string | null>(null);
  const [audioBlob1, setAudioBlob1] = useState<Blob | null>(null);
  const [isGeneratingAudio1, setIsGeneratingAudio1] = useState<boolean>(false);

  const [audioUrl2, setAudioUrl2] = useState<string | null>(null);
  const [audioBlob2, setAudioBlob2] = useState<Blob | null>(null);
  const [isGeneratingAudio2, setIsGeneratingAudio2] = useState<boolean>(false);

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!topic.trim() || !belief1.trim() || !belief2.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setAudioUrl1(null);
    setAudioBlob1(null);
    setAudioUrl2(null);
    setAudioBlob2(null);


    try {
      const apiResult = await generateFacebookMindsetShift(topic, belief1, belief2);
      setResult(apiResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, belief1, belief2, isLoading]);

  useEffect(() => {
    // Future Value of an Annuity: FV = PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
    const PMT = parseFloat(monthlyValue) || 0; // Monthly contribution/loss
    const t = parseFloat(years) || 0;         // Years
    const r = 0.10;                           // 10% annual rate
    const n = 12;                             // Compounded monthly

    if (PMT > 0 && t > 0) {
      const ratePerPeriod = r / n;
      const numberOfPeriods = n * t;
      const futureValue = PMT * ((Math.pow(1 + ratePerPeriod, numberOfPeriods) - 1) / ratePerPeriod);
      setCalculatedLoss(futureValue);
    } else {
      setCalculatedLoss(0);
    }
  }, [monthlyValue, years]);
  

  const reframeNeeds: { [key: string]: string } = {
    certainty: 'Certainty',
    variety: 'Variety',
    significance: 'Significance',
    connection: 'Connection & Love',
    growth: 'Growth',
    contribution: 'Contribution'
  };

  const handleGenerateAudio = async (type: 'belief1' | 'belief2') => {
    if (!result) return;
    
    const setLoading = type === 'belief1' ? setIsGeneratingAudio1 : setIsGeneratingAudio2;
    const setUrl = type === 'belief1' ? setAudioUrl1 : setAudioUrl2;
    const setBlob = type === 'belief1' ? setAudioBlob1 : setAudioBlob2;
    const data = type === 'belief1' ? result.beliefReframing : result.resourceReframing;

    setLoading(true);
    setUrl(null);
    setBlob(null);
    setError(null);

    const textToSpeak = Object.entries(data)
      .map(([key, value]) => `${reframeNeeds[key]}. ${value}`)
      .join('\n');
      
    try {
      const base64Audio = await generateSpeech(textToSpeak);
      const rawAudioBytes = decode(base64Audio);
      const pcmData = toInt16Array(rawAudioBytes);
      const wavBlob = createWavBlob(pcmData, 24000, 1);
      
      setBlob(wavBlob);
      const url = URL.createObjectURL(wavBlob);
      setUrl(url);

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAudio = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-gradient-to-br from-sky-50 to-indigo-100">
      <main className="w-full max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Facebook Mindset Shifter</h1>
          <p className="text-slate-600 mt-2 text-lg">Break through your posting barriers.</p>
        </header>
        
        <audio ref={audioPlayerRef} hidden />

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full space-y-6">
          {/* Beliefs */}
          <div>
            <h2 className="text-xl font-bold text-slate-700 mb-4">Your Limiting Beliefs</h2>
            <div className="space-y-4">
               <div>
                <label htmlFor="belief1-input" className="block text-sm font-semibold text-slate-700 mb-1">
                  Belief 1 (e.g., about ideas, relevance)
                </label>
                <textarea
                  id="belief1-input"
                  value={belief1}
                  onChange={(e) => setBelief1(e.target.value)}
                  placeholder="e.g., I don't have good ideas to post."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
                  rows={2}
                  aria-label="Your first limiting belief"
                />
              </div>
              <div>
                <label htmlFor="belief2-input" className="block text-sm font-semibold text-slate-700 mb-1">
                  Belief 2 (e.g., about resources, consistency)
                </label>
                <textarea
                  id="belief2-input"
                  value={belief2}
                  onChange={(e) => setBelief2(e.target.value)}
                  placeholder="e.g., I don't have time to post every day."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
                  rows={2}
                  aria-label="Your second limiting belief"
                />
              </div>
            </div>
          </div>

          {/* User Input */}
          <div>
            <label htmlFor="topic-input" className="block text-lg font-semibold text-slate-800 mb-3">
              What topic can you post about to provide value?
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Raising intelligent genius children"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              aria-label="Your value-driven topic"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!topic.trim() || !belief1.trim() || !belief2.trim() || isLoading}
            className="w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Shifting Mindset...
              </>
            ) : (
              'Break Through & Get Ideas'
            )}
          </button>
        </div>
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {result && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            {/* Belief Reframing */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <SparklesIcon className="w-8 h-8 mr-2 text-indigo-500" />
                Your New Empowering Frames
              </h3>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg text-slate-700">On Lacking Ideas...</h4>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleGenerateAudio('belief1')} disabled={isGeneratingAudio1} className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 transition-colors">
                            {isGeneratingAudio1 ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <PlayIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleDownloadAudio(audioBlob1, 'lacking-ideas-reframe.wav')} disabled={!audioBlob1} className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 transition-colors">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(result.beliefReframing).map(([key, value]) => (
                        <p key={key} className="flex items-start text-sm"><CheckIcon className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" /> <div><strong className="capitalize">{reframeNeeds[key]}:</strong> {value}</div></p>
                    ))}
                  </div>
                </div>
                 <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg text-slate-700">On Lacking Resources...</h4>
                     <div className="flex items-center space-x-2">
                        <button onClick={() => handleGenerateAudio('belief2')} disabled={isGeneratingAudio2} className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 transition-colors">
                            {isGeneratingAudio2 ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <PlayIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleDownloadAudio(audioBlob2, 'lacking-resources-reframe.wav')} disabled={!audioBlob2} className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 transition-colors">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                     {Object.entries(result.resourceReframing).map(([key, value]) => (
                        <p key={key} className="flex items-start text-sm"><CheckIcon className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" /> <div><strong className="capitalize">{reframeNeeds[key]}:</strong> {value}</div></p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Ideas */}
             <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                  <LightbulbIcon className="w-8 h-8 mr-2 text-yellow-500" />
                  Content Ideas for "{topic}"
                </h3>
                <ul className="space-y-3 list-disc list-inside text-slate-700">
                  {result.contentIdeas.map((idea, index) => <li key={index}>{idea}</li>)}
                </ul>
            </div>
            
            {/* Compound Interest */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">The Cost of Inaction</h3>
              <p className="text-slate-600 mb-6">If not posting costs you potential earnings each month, see how much that lost value could grow if it were invested instead (at a 10% annual return, compounded monthly).</p>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="post-value" className="block text-sm font-medium text-slate-700">Estimated monthly value of posts ($)</label>
                    <input type="number" id="post-value" value={monthlyValue} onChange={e => setMonthlyValue(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"/>
                  </div>
                  <div>
                    <label htmlFor="years" className="block text-sm font-medium text-slate-700">Number of years</label>
                    <input type="number" id="years" value={years} onChange={e => setYears(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"/>
                  </div>
                </div>
                <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center">
                    <p className="font-semibold">Potential loss from not posting:</p>
                    <p className="text-3xl font-bold mt-1">
                      {calculatedLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
      <footer className="text-center mt-8 text-slate-500">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
