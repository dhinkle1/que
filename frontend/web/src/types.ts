export interface BookMetadata {
  title: string;
  authors: string[];
  google_books_id: string;
  description?: string;
}

export interface QuizRequest {
  book_id: string;
  difficulty: string;
  num_questions: number;
}

export interface Question {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface QuizResponse {
  questions: Question[];
}

export interface HistoryEntry {
  book: BookMetadata;
  questions: Question[];
  responses: number[];
  score: number;
  timestamp?: string;
}