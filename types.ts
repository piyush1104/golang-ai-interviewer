export interface Problem {
  id: string;
  title: string;
  description: string;
  skeletonCode: string;
  tags: {
    label: string;
    level: 'Hard' | 'Medium' | 'Easy';
    concept: string;
  };
  requirements: string[];
  example: {
    input: string;
    output: string;
    explanation: string;
  };
  hints: string[];
}

export interface Submission {
  id: string;
  problemId: string;
  code: string;
  timestamp: string;
}

export interface Review {
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface SubmissionWithReview extends Submission {
  review: Review;
  isMock?: boolean;
}

export type MCQCategory = 'Syntax' | 'Concurrency' | 'Data Structures' | 'Concepts' | 'Code Fix';

export interface MCQ {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: MCQCategory;
}

export type MCQAnswerStatus = 'passed' | 'failed';
