
import { GoogleGenAI, Type } from "@google/genai";
import type { Problem, Review } from '../types';

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

export async function getReview(code: string, problem: Problem, apiKey: string): Promise<Review> {
  if (!apiKey) {
    throw new Error("API Key Not Provided. Please add your Gemini API key in the settings to get a review.");
  }

  const ai = new GoogleGenAI({ apiKey });

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
    if (!jsonText) {
        throw new Error("Received an empty response from Gemini API. The request may have been blocked due to safety settings.");
    }
    const reviewData = JSON.parse(jsonText) as Review;
    return reviewData;
    
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    
    let errorMessage = "Failed to get a review from the Gemini API. This could be due to network issues or the request being blocked. Please check the browser console for more details.";

    if (error instanceof Error) {
      const lowerCaseMsg = error.message.toLowerCase();
      // Check for various API key-related error messages.
      if (
        lowerCaseMsg.includes('api key not valid') || 
        lowerCaseMsg.includes('api_key_invalid') ||
        lowerCaseMsg.includes('permission_denied') ||
        lowerCaseMsg.includes('api key service is blocked')
      ) {
         errorMessage = "The provided Gemini API key is invalid, expired, or doesn't have the necessary permissions. Please check your key in the settings and try again.";
      }
    }
    
    throw new Error(errorMessage);
  }
}