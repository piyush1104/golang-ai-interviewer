
export interface Problem {
  id: string;
  title: string;
  description: string;
  skeletonCode: string;
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
}