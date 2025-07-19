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