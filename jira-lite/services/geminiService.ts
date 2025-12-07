import { GoogleGenAI } from "@google/genai";
import { Issue } from '../types';

// Initialize the client. API_KEY is assumed to be in process.env
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateIssueDescription = async (title: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate description.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a project manager. Write a detailed, professional issue description for a software task titled: "${title}". 
      Include sections for: Context, Acceptance Criteria, and Technical Notes. Keep it under 200 words.`,
    });
    return response.text || "Failed to generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const summarizeIssue = async (issue: Issue): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  const commentsText = issue.comments.map(c => c.content).join("\n");
  const prompt = `
    Summarize the current status and key discussions for this issue.
    Title: ${issue.title}
    Description: ${issue.description}
    Comments:
    ${commentsText}
    
    Provide a concise summary (max 3 bullets).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not summarize.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary.";
  }
};

export const suggestNextSteps = async (issue: Issue): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  const prompt = `
    Based on the following issue, suggest 3 actionable next steps for the developer.
    Title: ${issue.title}
    Description: ${issue.description}
    Status: ${issue.status}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No suggestions available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating suggestions.";
  }
};
