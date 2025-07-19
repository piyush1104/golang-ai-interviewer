import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getReview } from '../services/geminiService';
import type { Problem, SubmissionWithReview } from '../types';
import { CodeEditor } from './CodeEditor';
import { SubmissionHistory } from './SubmissionHistory';
import { Timer } from './Timer';
import { 
    IconArrowLeft, IconBook, IconHistory, IconCode, 
    IconLoader, IconPlay, IconRefreshCw, IconBrainCircuit,
    IconCheckCircle, IconAlertTriangle, IconEye, IconEyeOff, IconSettings
} from './Icons';
import { MOCKED_SUBMISSIONS } from '../mocks';

type LeftPaneTab = 'problem' | 'history';
type RightPaneView = 'editor' | 'review';

interface ProblemDetailProps {
    problem: Problem;
    onBackToList: () => void;
    onOpenSettings: (cb?: (key: string) => void, context?: 'general' | 'submit') => void;
}

const getScoreColorClasses = (score: number): string => {
  if (score >= 90) return 'bg-green-500/10 text-green-400 border-green-500/30';
  if (score >= 75) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  return 'bg-red-500/10 text-red-400 border-red-500/30';
};

const ReviewDisplay: React.FC<{
  submission: SubmissionWithReview;
  onBack: () => void;
}> = ({ submission, onBack }) => {
  const { review, code } = submission;

  const [codePanelHeight, setCodePanelHeight] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ y: number; height: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    dragStartRef.current = { y: e.clientY, height: codePanelHeight };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [codePanelHeight]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    dragStartRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !dragStartRef.current) return;
    
    const deltaY = e.clientY - dragStartRef.current.y;
    let newHeight = dragStartRef.current.height - deltaY;

    // Constraints
    const minHeight = 150;
    const maxHeight = window.innerHeight; // Allow it to be tall

    if (newHeight < minHeight) newHeight = minHeight;
    if (newHeight > maxHeight) newHeight = maxHeight;

    setCodePanelHeight(newHeight);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);


  return (
    <div className="flex flex-col bg-slate-800 h-full">
      <header className="flex-shrink-0 bg-slate-900 p-3 flex items-center justify-between border-b border-slate-700">
        <h2 className="flex items-center gap-3 text-lg font-bold text-slate-100">
            <IconBrainCircuit className="w-6 h-6 text-cyan-400" />
            <span>Submission Review</span>
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-md transition-colors duration-200 text-sm"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to Editor</span>
        </button>
      </header>
      
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 flex flex-col">
          <div className="flex flex-col bg-slate-900/70 rounded-lg">
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-slate-800/50">
                  <div className="flex-shrink-0">
                      <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${getScoreColorClasses(review.score)}`}>
                          <span className="text-4xl font-bold">{review.score}</span>
                      </div>
                  </div>
                  <div className="text-center sm:text-left flex-grow">
                      <h2 className="text-xl font-semibold text-slate-100 mb-2">Overall Feedback</h2>
                      <p className="text-slate-300 leading-relaxed">{review.feedback}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-green-400 mb-3"><IconCheckCircle className="w-5 h-5"/>Strengths</h3>
                      <ul className="space-y-2 list-disc list-inside text-slate-300">{review.strengths.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}</ul>
                  </div>
                  <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-yellow-400 mb-3"><IconAlertTriangle className="w-5 h-5"/>Areas for Improvement</h3>
                      <ul className="space-y-2 list-disc list-inside text-slate-300">{review.areasForImprovement.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}</ul>
                  </div>
                </div>
            </div>
          </div>
          
          <div
              onMouseDown={handleMouseDown}
              className="h-4 w-full flex-shrink-0 flex items-center justify-center cursor-row-resize group"
              title="Drag to resize"
          >
              <div className="h-1.5 w-16 bg-slate-700 group-hover:bg-cyan-400 rounded-full transition-colors duration-200" />
          </div>

          <div className="bg-slate-900/70 rounded-lg flex flex-col flex-shrink-0 overflow-hidden" style={{ height: `${codePanelHeight}px` }}>
              <div className="flex-shrink-0 p-4 border-b border-slate-700">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-400"><IconCode className="w-5 h-5" /><span>Submitted Code</span></h2>
              </div>
              <div className="flex-grow relative">
                  <CodeEditor code={code} readOnly={true} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export const ProblemDetail: React.FC<ProblemDetailProps> = ({ problem, onBackToList, onOpenSettings }) => {
    const [code, setCode] = useLocalStorage<string>(`code-editor-${problem.id}`, problem.skeletonCode);
    const [leftTab, setLeftTab] = useState<LeftPaneTab>('problem');
    const [rightPaneView, setRightPaneView] = useState<RightPaneView>('editor');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [submissions, setSubmissions] = useLocalStorage<SubmissionWithReview[]>(`submissions-${problem.id}`, []);

    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithReview | null>(null);
    const [hintsVisible, setHintsVisible] = useState<boolean>(false);

    // API Key is read from local storage, but not set here.
    const [apiKey] = useLocalStorage<string>('gemini-api-key', '');

    // Save status
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const saveTimeoutRef = useRef<number | null>(null);
    const isInitialMount = useRef(true);


    // Resizable panel logic
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const [leftPanelWidth, setLeftPanelWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (newWidth < 25) newWidth = 25;
            if (newWidth > 75) newWidth = 75;
            setLeftPanelWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
        const mouseUpHandler = () => handleMouseUp();

        if (isResizing) {
            window.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('mouseup', mouseUpHandler);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);


    // Effect for handling save status indicator
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setSaveStatus('saving');

        saveTimeoutRef.current = window.setTimeout(() => {
            setSaveStatus('saved');
            saveTimeoutRef.current = window.setTimeout(() => {
                setSaveStatus('idle');
            }, 1500); // Show "Saved" for 1.5s
        }, 500); // Debounce for 500ms

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [code]);

    // Effect for resetting view state when problem changes
    useEffect(() => {
        // Reset view state when problem changes
        isInitialMount.current = true;
        setSaveStatus('idle');
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        setLeftTab('problem');
        setRightPaneView('editor');
        setIsLoading(false);
        setHintsVisible(false);
        setSelectedSubmission(null);

        const problemSubmissions = submissions.filter(s => s.problemId === problem.id);
        if (problemSubmissions.length === 0 && MOCKED_SUBMISSIONS[problem.id]) {
            setSubmissions(prev => [...prev.filter(s => !s.isMock), MOCKED_SUBMISSIONS[problem.id]]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [problem.id, setSubmissions]);


    const handleCodeReset = useCallback(() => {
        if (window.confirm('Are you sure you want to reset your code to the original skeleton?')) {
            setCode(problem.skeletonCode);
        }
    }, [problem.skeletonCode, setCode]);

    const handleActualSubmit = async (key: string) => {
        setIsLoading(true);
        try {
            const reviewData = await getReview(code, problem, key);
            const newSubmission: SubmissionWithReview = {
                id: new Date().toISOString(),
                problemId: problem.id,
                code,
                timestamp: new Date().toISOString(),
                review: reviewData,
            };
            
            // Add new submission, replacing any mock submission
            setSubmissions(prev => [newSubmission, ...prev.filter(s => !s.isMock)]);
            setSelectedSubmission(newSubmission);
            setRightPaneView('review');

        } catch (error) {
            console.error("Failed to get review:", error);
            alert(`Sorry, something went wrong while getting your review.\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
      if (apiKey) {
        handleActualSubmit(apiKey);
      } else {
        onOpenSettings((savedKey: string) => {
          handleActualSubmit(savedKey);
        }, 'submit');
      }
    };

    const handleSelectHistoryItem = (submission: SubmissionWithReview) => {
        setSelectedSubmission(submission);
        setRightPaneView('review');
    };

    const TabButton: React.FC<{
        label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void;
    }> = ({ label, icon, isActive, onClick }) => (
        <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${isActive ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
            {icon}
            {label}
        </button>
    );

    const SaveStatusIndicator = () => {
        let content = null;
        if (saveStatus === 'saving') {
            content = (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <IconLoader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                </div>
            );
        } else if (saveStatus === 'saved') {
            content = (
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <IconCheckCircle className="w-4 h-4" />
                    <span>Saved</span>
                </div>
            );
        }

        return (
            <div className="ml-4 w-24 h-5 flex items-center transition-opacity duration-300" style={{ opacity: saveStatus !== 'idle' ? 1 : 0 }}>
                {content}
            </div>
        );
    };

    
    const problemSubmissions = submissions.filter(s => s.problemId === problem.id);

    const LeftPaneContent = (
        <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden h-full">
            <div className="flex-shrink-0 flex items-center border-b border-slate-700 bg-slate-900/50">
                <TabButton label="Problem" icon={<IconBook className="w-4 h-4" />} isActive={leftTab === 'problem'} onClick={() => setLeftTab('problem')} />
                <TabButton label={`History (${problemSubmissions.length})`} icon={<IconHistory className="w-4 h-4" />} isActive={leftTab === 'history'} onClick={() => setLeftTab('history')} />
            </div>
            <div className="flex-grow p-5 overflow-y-auto">
                {leftTab === 'problem' && (
                     <div className="space-y-6 text-slate-300">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${problem.tags.level === 'Hard' ? 'bg-red-900/50 text-red-300' : problem.tags.level === 'Medium' ? 'bg-yellow-700/40 text-yellow-300' : 'bg-green-900/50 text-green-300'}`}>{problem.tags.level}</span>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-700 text-slate-300">{problem.tags.concept}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 mb-3">{problem.title}</h2>
                            <div className="space-y-2">
                                {problem.requirements.map((req, i) => (
                                    <p key={i} className="flex items-start"><span className="text-cyan-400 mr-3 mt-1 text-lg leading-none">→</span><span>{req}</span></p>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-100 mb-3">Examples</h3>
                            <div className="space-y-4">
                                <pre className="bg-slate-900/70 p-4 rounded-md border border-slate-700 text-sm whitespace-pre-wrap"><strong>Input:</strong><br/>{problem.example.input}</pre>
                                <pre className="bg-slate-900/70 p-4 rounded-md border border-slate-700 text-sm whitespace-pre-wrap"><strong>Output:</strong><br/>{problem.example.output}</pre>
                                {problem.example.explanation && <p className="text-sm text-slate-400 pl-1"><strong>Explanation:</strong> {problem.example.explanation}</p>}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">💡 Hints</h3>
                                <button
                                    onClick={() => setHintsVisible(!hintsVisible)}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1 rounded-md hover:bg-slate-700/50"
                                >
                                    {hintsVisible ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                                    <span>{hintsVisible ? 'Hide' : 'Show'}</span>
                                </button>
                            </div>
                            {hintsVisible ? (
                                <ul className="list-decimal list-outside pl-6 space-y-2 text-slate-400">
                                    {problem.hints.map((hint, i) => <li key={i}>{hint}</li>)}
                                </ul>
                            ) : (
                                <div className="text-center p-4 border border-dashed border-slate-700 rounded-lg bg-slate-900/50">
                                    <p className="text-slate-400 text-sm">Hints are hidden. Click 'Show' to reveal them.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {leftTab === 'history' && <SubmissionHistory submissions={problemSubmissions} onSelect={handleSelectHistoryItem} />}
            </div>
        </div>
    );

    const RightPaneContent = (
         <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 flex-grow h-full">
            {rightPaneView === 'editor' ? (
                <>
                    <div className="flex-shrink-0 p-2 flex justify-between items-center border-b border-slate-700 bg-slate-900/50">
                        <div className="flex items-center">
                            <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <span className="bg-cyan-500 px-2 py-0.5 rounded text-xs text-white font-bold">GO</span>
                                <span>Code Editor</span>
                            </div>
                            <SaveStatusIndicator />
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleCodeReset} title="Reset Code" className="text-slate-400 hover:text-white transition-colors"><IconRefreshCw className="w-4 h-4" /></button>
                            <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-1.5 px-4 rounded-md transition-colors text-sm">
                                {isLoading ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconPlay className="w-4 h-4 fill-current" />}
                                <span>{isLoading ? 'Analyzing...' : 'Submit Solution'}</span>
                            </button>
                        </div>
                    </div>
                     <div className="flex-grow relative rounded-b-md overflow-hidden">
                        <CodeEditor code={code} onChange={setCode} />
                    </div>
                </>
            ) : selectedSubmission ? (
                <ReviewDisplay 
                    submission={selectedSubmission} 
                    onBack={() => setRightPaneView('editor')} 
                />
            ) : null }
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans">
            <header className="flex-shrink-0 bg-slate-900 border-b border-slate-700/50 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                    <button onClick={onBackToList} className="flex-shrink-0 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                        <IconArrowLeft className="w-5 h-5" />
                        Back to Problems
                    </button>
                    <span className="w-px h-6 bg-slate-700"></span>
                    <h1 className="text-xl font-bold text-slate-100 truncate pr-4">{problem.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Timer />
                    <button onClick={() => onOpenSettings()} className="text-slate-400 hover:text-white transition-colors" title="Settings">
                        <IconSettings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4">
                {isDesktop ? (
                    <div ref={containerRef} className="flex w-full h-full gap-4">
                        <div style={{ width: `${leftPanelWidth}%` }} className="flex-shrink-0 h-full">
                           {LeftPaneContent}
                        </div>
                        <div
                            onMouseDown={handleMouseDown}
                            className="w-2 flex-shrink-0 flex items-center justify-center cursor-col-resize group"
                            title="Drag to resize"
                        >
                            <div className="w-1.a-1.5 h-16 bg-slate-700 group-hover:bg-cyan-400 transition-colors duration-200 rounded-full" />
                        </div>
                        <div className="flex flex-col flex-grow h-full">
                           {RightPaneContent}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto h-full">
                        <div className="min-h-[600px]">{LeftPaneContent}</div>
                        <div className="min-h-[600px]">{RightPaneContent}</div>
                    </div>
                )}
            </main>
        </div>
    );
};