'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../lib/authContext';
import { fetchApi } from '../../../../../lib/api';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Code, 
  Award, 
  Loader2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Send,
  FileCheck,
  Lock,
  Github,
  ArrowRight
} from 'lucide-react';

export default function TestPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [moduleItem, setModuleItem] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!user || !id) return;
      try {
        const modRes = await fetchApi(`/modules/${id}`);
        if (modRes.success) setModuleItem(modRes.data);

        try {
          const subRes = await fetchApi(`/assignments/${id}`);
          if (subRes.success) setSubmission(subRes.data);
        } catch (e) {}

        try {
          const quizRes = await fetchApi(`/quizzes/${id}`);
          if (quizRes.success) {
            setQuizData(quizRes.quiz);
            if (quizRes.userResult) {
              setQuizResult(quizRes.userResult);
            }
          }
        } catch (e) {}

      } catch (err) {
        console.error('Error fetching quiz data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadQuizData();
    }
  }, [user, id]);

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setError('');

    const questions = quizData?.questions || [];
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < questions.length) {
      setError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetchApi('/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: moduleItem._id,
          answers: selectedAnswers,
        }),
      });

      if (res.success) {
        setQuizResult(res.userResult);
        setFeedback(res.feedback);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-600 text-sm font-semibold">Loading weekly knowledge test...</p>
      </div>
    );
  }

  if (!moduleItem || !quizData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Test Not Found</h2>
        <p className="text-slate-600">The requested weekly test does not exist.</p>
        <Link
          href={`/dashboard/modules/${id}`}
          className="inline-flex items-center space-x-2 text-indigo-600 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Module</span>
        </Link>
      </div>
    );
  }

  const { questions } = quizData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-dot-pattern">
      {/* Top Header Link */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/modules/${moduleItem.weekNumber}`}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Week {moduleItem.weekNumber} Workspace</span>
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
          WEEK {moduleItem.weekNumber} TEST
        </span>
      </div>

      {/* Quiz Header Card */}
      <div className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Multiple Choice & Code Debugging Test</span>
          </div>

          {quizResult && (
            <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${
              quizResult.passed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {quizResult.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
              <span>Score: {quizResult.score}% ({quizResult.passed ? 'PASSED' : 'FAILED'})</span>
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">{quizData.title}</h1>
        <p className="text-slate-600 text-sm leading-relaxed font-medium">
          Answer all questions below (MCQs & Code Snippet Debugging). A minimum score of <strong>70%</strong> is required to pass.
        </p>
      </div>

      {/* Test Questions & Results Display */}
      {feedback ? (
        /* Evaluation Results View */
        <div className="space-y-6">
          <div className={`light-card p-8 rounded-3xl border text-center space-y-3 ${
            quizResult.passed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md ${
              quizResult.passed ? 'gradient-bg-indigo' : 'bg-red-600'
            }`}>
              {quizResult.passed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {quizResult.passed ? 'Congratulations! Test Passed!' : 'Test Not Passed'}
            </h2>
            <p className="text-sm font-semibold text-slate-700">
              Your Score: <span className="text-lg font-black text-slate-900">{quizResult.score}%</span> (Passing Score: {quizData.passingScore}%)
            </p>

            <button
              onClick={() => {
                setFeedback(null);
                setSelectedAnswers({});
              }}
              className="mt-4 inline-flex items-center space-x-2 bg-white text-slate-800 font-bold px-6 py-2.5 rounded-xl border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>
          </div>

          {/* Feedback Question Breakdown */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">Detailed Explanations & Review</h3>

            {feedback.map((item, idx) => (
              <div
                key={item.questionId || idx}
                className={`light-card p-6 rounded-3xl border space-y-4 bg-white ${
                  item.isCorrect ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Question {idx + 1} ({item.type === 'code_debug' ? 'Code Debugging' : 'MCQ'})
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{item.question}</h4>
                  </div>
                  {item.isCorrect ? (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex-shrink-0">
                      Correct (+25%)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex-shrink-0">
                      Incorrect
                    </span>
                  )}
                </div>

                {/* Code Snippet if present */}
                {item.codeSnippet && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto text-slate-200 font-mono-code text-xs">
                    <pre><code>{item.codeSnippet}</code></pre>
                  </div>
                )}

                {/* Answer options review */}
                <div className="space-y-2 pt-2">
                  {item.options.map((opt, optIdx) => {
                    const isUserSelected = item.selectedOption === optIdx;
                    const isCorrectOpt = item.correctAnswer === optIdx;

                    let optStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isCorrectOpt) {
                      optStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold';
                    } else if (isUserSelected && !isCorrectOpt) {
                      optStyle = 'bg-red-50 border-red-300 text-red-900 font-bold';
                    }

                    return (
                      <div key={optIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}>
                        <span>{opt}</span>
                        {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                        {isUserSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">Explanation</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quiz Form View */
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {questions.map((q, idx) => (
            <div key={q.id} className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  QUESTION {idx + 1} OF {questions.length}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                  {q.type === 'code_debug' ? 'Code Snippet Fix' : 'Multiple Choice'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">{q.question}</h3>

              {/* Code Snippet Box */}
              {q.codeSnippet && (
                <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 overflow-x-auto text-slate-100 font-mono-code text-xs shadow-inner">
                  <pre><code>{q.codeSnippet}</code></pre>
                </div>
              )}

              {/* Option Radio Buttons */}
              <div className="space-y-2.5 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 text-xs font-semibold ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full gradient-bg-indigo hover:opacity-95 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Evaluating Test Answers...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit & Grade Weekly Test</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
