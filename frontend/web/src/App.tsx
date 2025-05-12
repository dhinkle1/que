import React, { useState } from 'react';
import axios from 'axios';
import {
  BookMetadata,
  QuizRequest,
  Question,
  QuizResponse,
  HistoryEntry,
} from './types';

const difficulties = [
  { label: 'Of Simple Inclination', value: 'Of Simple Inclination' },
  { label: 'Of Earnest Pursuit', value: 'Of Earnest Pursuit' },
  { label: 'Of Considerable Travail', value: 'Of Considerable Travail' },
];
const questionCounts = [10, 20, 30];

type Stage = 'search' | 'setup' | 'quiz' | 'results';

const App: React.FC = () => {
  const [stage, setStage] = useState<Stage>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookMetadata | null>(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulties[0].value);
  const [numQuestions, setNumQuestions] = useState<number>(questionCounts[0]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.get<BookMetadata[]>('/api/books', {
        params: { q: searchTerm },
      });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startSetup = (book: BookMetadata) => {
    setSelectedBook(book);
    setStage('setup');
  };

  const handleStartQuiz = async () => {
    if (!selectedBook) return;
    const req: QuizRequest = {
      book_id: selectedBook.google_books_id,
      difficulty: selectedDifficulty,
      num_questions: numQuestions,
    };
    try {
      const res = await axios.post<QuizResponse>('/api/quiz', req);
      setQuestions(res.data.questions);
      setResponses(Array(res.data.questions.length).fill(-1));
      setStage('quiz');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptionClick = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    setResponses(prev => {
      const copy = [...prev];
      copy[currentIndex] = idx;
      return copy;
    });
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      const correctCount = responses.reduce(
        (acc, resp, i) => acc + (resp === questions[i].answer_index ? 1 : 0),
        0
      );
      const pct = Math.round((correctCount / questions.length) * 100);
      setScore(pct);
      setStage('results');
      // Save history
      if (selectedBook) {
        const entry: HistoryEntry = {
          book: selectedBook,
          questions,
          responses,
          score: pct,
        };
        try {
          await axios.post<HistoryEntry>('/api/history', entry);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const restart = () => {
    setStage('search');
    setSearchTerm('');
    setBooks([]);
    setSelectedBook(null);
    setSelectedDifficulty(difficulties[0].value);
    setNumQuestions(questionCounts[0]);
    setQuestions([]);
    setResponses([]);
    setSelectedOption(null);
    setShowFeedback(false);
    setCurrentIndex(0);
    setScore(0);
  };

  return (
    <div className="container mx-auto p-4">
      {stage === 'search' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Search Books</h1>
          <form onSubmit={handleSearch} className="flex mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search for a book"
              className="flex-grow border p-2 rounded"
            />
            <button
              type="submit"
              className="ml-2 p-2 bg-blue-500 text-white rounded"
            >
              Search
            </button>
          </form>
          <ul>
            {books.map(book => (
              <li
                key={book.google_books_id}
                onClick={() => startSetup(book)}
                className="mb-2 p-2 border rounded hover:bg-gray-100 cursor-pointer"
              >
                <div className="font-semibold">{book.title}</div>
                <div className="text-sm text-gray-600">
                  {book.authors?.join(', ')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stage === 'setup' && selectedBook && (
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Setup Quiz for "{selectedBook.title}"
          </h1>
          <div className="mb-4">
            <label className="block mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="border p-2 rounded"
            >
              {difficulties.map(d => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Number of Questions</label>
            <select
              value={numQuestions}
              onChange={e => setNumQuestions(parseInt(e.target.value))}
              className="border p-2 rounded"
            >
              {questionCounts.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStartQuiz}
            className="p-2 bg-green-500 text-white rounded"
          >
            Start Quiz
          </button>
        </div>
      )}

      {stage === 'quiz' && questions.length > 0 && (
        <div>
          <h1 className="text-xl font-bold mb-4">
            Question {currentIndex + 1} of {questions.length}
          </h1>
          <p className="mb-4">{questions[currentIndex].question}</p>
          <ul>
            {questions[currentIndex].options.map((opt, idx) => {
              const isSelected = idx === selectedOption;
              const isCorrect = idx === questions[currentIndex].answer_index;
              return (
                <li key={idx} className="mb-2">
                  <button
                    disabled={showFeedback}
                    onClick={() => handleOptionClick(idx)}
                    className="w-full text-left border p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    {opt}
                  </button>
                  {showFeedback && isSelected && (
                    <span className={`ml-2 font-bold text-${
                      isCorrect ? 'green' : 'red'
                    }-500`}>
                      {isCorrect ? '✔️' : '❌'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {showFeedback && (
            <button
              onClick={handleNext}
              className="mt-4 p-2 bg-blue-500 text-white rounded"
            >
              {currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
            </button>
          )}
        </div>
      )}

      {stage === 'results' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
          <p className="mb-4">Your Score: {score}%</p>
          {questions.map((q, idx) => {
            const resp = responses[idx];
            if (resp === q.answer_index) return null;
            return (
              <div key={idx} className="mb-4 p-2 border rounded">
                <p className="font-semibold">
                  Question {idx + 1}: {q.question}
                </p>
                <p>Your answer: {q.options[resp]}</p>
                <p>Correct answer: {q.options[q.answer_index]}</p>
                <p className="text-sm text-gray-700">
                  Explanation: {q.explanation}
                </p>
              </div>
            );
          })}
          <button
            onClick={restart}
            className="mt-4 p-2 bg-blue-500 text-white rounded"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
