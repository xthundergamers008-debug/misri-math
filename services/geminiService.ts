import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MathSolution } from "../types";

// Initialize GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SOLVER_MODEL = "gemini-3-pro-preview"; // High reasoning for solving
const VISION_MODEL = "gemini-3-pro-image-preview"; // Best for OCR/Vision
const FAST_MODEL = "gemini-2.5-flash-lite-latest"; // For quick explanations

// Schema for structured math output
const mathSolutionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    originalProblem: { type: Type.STRING, description: "The interpreted math problem statement" },
    finalAnswer: { type: Type.STRING, description: "The final concise result" },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the step (e.g., 'Derivation')" },
          description: { type: Type.STRING, description: "Detailed explanation of what happened in this step" },
          latex: { type: Type.STRING, description: "The mathematical representation in LaTeX format for this step" }
        },
        required: ["title", "description"]
      }
    },
    graphExpression: { type: Type.STRING, description: "If the problem is a function that can be graphed (y=...), provide the JavaScript-compatible expression using x (e.g., 'Math.pow(x,2) + 2*x'). Returns null if not graphable." },
    category: { type: Type.STRING, enum: ['Arithmetic', 'Algebra', 'Geometry', 'Calculus', 'Other'] }
  },
  required: ["originalProblem", "finalAnswer", "steps", "category"]
};

export const solveMathProblem = async (problemText: string): Promise<MathSolution> => {
  try {
    const response = await ai.models.generateContent({
      model: SOLVER_MODEL,
      contents: `Solve the following math problem step-by-step. Ensure accuracy. Problem: ${problemText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: mathSolutionSchema,
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for complex math
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...data
    };
  } catch (error) {
    console.error("Error solving math problem:", error);
    throw error;
  }
};

export const solveFromImage = async (base64Image: string): Promise<MathSolution> => {
  try {
    // Clean base64 string if needed
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "Analyze this image. Identify the math problem and solve it step-by-step. Return the result in the specified JSON format." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: mathSolutionSchema,
        // Note: thinkingConfig is not fully supported on vision models in all regions yet, 
        // but standard reasoning is strong in 3-pro-image.
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...data
    };

  } catch (error) {
    console.error("Error solving from image:", error);
    throw error;
  }
};

export const explainStep = async (stepDescription: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL, // Use Flash Lite for low latency UI interactions
      contents: `The user is looking at a math solution. 
      Context of problem: "${context}".
      The specific step is: "${stepDescription}".
      
      Explain this specific step in simple, plain English for a student. Keep it under 2 sentences.`,
    });

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Error explaining step:", error);
    return "Sorry, I couldn't load an explanation for this step right now.";
  }
};
