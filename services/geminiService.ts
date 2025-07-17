
import { GoogleGenAI, Type } from "@google/genai";
import type { Problem, Review } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a developer-facing error, not for the user.
  // The environment should be configured with the key.
  console.error("Gemini API key is missing. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const reviewSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "A score from 1 to 100 representing the quality of the Go code.",
    },
    feedback: {
      type: Type.STRING,
      description: "A concise, one-paragraph summary of the overall assessment of the code.",
    },
    strengths: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "A list of specific positive points and what the code does well.",
    },
    areasForImprovement: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "A list of specific, actionable areas for improvement.",
    },
  },
  required: ["score", "feedback", "strengths", "areasForImprovement"],
};

export async function getReview(code: string, problem: Problem): Promise<Review | null> {
  if (!API_KEY) {
    alert("This application is not configured with a Gemini API key. Code review is disabled.");
    // Simulate a review for local testing without an API key
    return {
      score: 85,
      feedback: "This is a mock review. The API key is missing. The code appears to follow a good structure and addresses the main points of the problem. Concurrency is handled, but could be more robust.",
      strengths: ["Good use of structs and interfaces.", "The main logic is easy to follow.", "Handles the basic case correctly."],
      areasForImprovement: ["Add more comprehensive error handling.", "Consider edge cases, such as an empty input.", "The locking mechanism could be more fine-grained to improve performance."],
    };
  }

  const prompt = `
You are an expert Senior/Staff Backend Engineer at a top tech company, specializing in Go (Golang). You are conducting a machine coding interview.

Your task is to review the following Go code submission for the problem titled "${problem.title}".

Problem Description:
---
${problem.description}
---

User's Code Submission:
---
\`\`\`go
${code}
\`\`\`
---

Please provide a detailed and constructive review focusing on the following criteria:
1.  **Correctness & Completeness:** Does the code solve the problem as described? Are there any bugs or logical errors? Does it handle edge cases?
2.  **Concurrency:** (If applicable) Is concurrency handled correctly and safely? Is the use of goroutines, channels, and synchronization primitives (like mutexes) idiomatic and free of race conditions?
3.  **Code Structure & Design:** Is the code well-organized? Is the use of structs, interfaces, and packages appropriate for the problem?
4.  **Idiomatic Go:** Does the code follow standard Go conventions (e.g., \`gofmt\` style, error handling, naming conventions, capitalization for exports)?
5.  **Efficiency & Performance:** Are there any obvious performance bottlenecks? Is the choice of algorithms and data structures optimal?
6.  **Readability & Maintainability:** Is the code clean, well-commented where necessary, and easy to understand?

Provide your review in a structured JSON format.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
        temperature: 0.3,
      },
    });

    const jsonText = response.text.trim();
    const reviewData = JSON.parse(jsonText) as Review;
    return reviewData;
    
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to parse review from Gemini API.");
  }
}