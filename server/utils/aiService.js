require('dotenv').config(); 
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in process.env!");
} else {
    console.log("Successfully found GEMINI_API_KEY starting with:", apiKey.substring(0, 5) + "...");
}

let ai;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey: String(apiKey) });
}

// Fallback helper function to try multiple models
const generateWithFallback = async (prompt) => {
    if (!ai) throw new Error("AI not initialized");

    const modelsToTry = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

    let lastError;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting request with model: ${modelName}`);
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
            });
            console.log(`Success with model: ${modelName}`);
            return response;
        } catch (error) {
            console.warn(`Model ${modelName} failed. Reason: ${error.status || error.message}`);
            lastError = error;
            // If it's a 401 (Bad API Key), stop trying. Otherwise, keep looping.
            if (error.status === 401) {
                throw error;
            }
        }
    }

    // If we exhausted all models
    throw lastError;
};


const analyzeBugAndGenerateTags = async (title, description) => {
  try {
    if (!ai) return [];

    const prompt = `
      You are an expert software engineer triage assistant.
      Analyze the following bug report and provide 1 to 3 short, one-word tags (e.g., Frontend, Database, Auth, UI, API, Security, CSS) that categorize it. 
      Return ONLY a comma-separated list of tags, nothing else. No explanations.
      
      Title: ${title}
      Description: ${description}
    `;

    // Use our new fallback wrapper
    const response = await generateWithFallback(prompt);
    
    const text = response.text;
    const tags = text
        .split(',')
        .map(tag => tag.trim().replace(/[^a-zA-Z0-9-]/g, '')) 
        .filter(t => t.length > 0); 
        
    return tags;
  } catch (error) {
    console.error("AI Tagging Error:", error.message || error);
    return []; 
  }
};

const suggestBugFix = async (title, description) => {
    try {
      if (!ai) return "No API key configured. Check your terminal for errors.";
  
      const prompt = `
        You are a helpful senior software engineer mentoring a junior developer.
        Please look at this bug report:
        
        Title: ${title}
        Description: ${description}
        
        Provide a short, easy-to-read response. 
        1. First, give a 1-2 sentence summary of what might be causing the issue.
        2. Second, provide a bulleted list of 2-3 specific things the developer should check or fix.
        3. If the description is too vague, politely ask them to look for specific error logs or code snippets.
      `;
  
      // Use our new fallback wrapper
      const response = await generateWithFallback(prompt);

      return response.text;
    } catch (error) {
      console.error("AI Debugging Error:", error.message || error);
      return "Sorry, I encountered an error. Please check your API limits or try again later.";
    }
  };

module.exports = { analyzeBugAndGenerateTags, suggestBugFix };
