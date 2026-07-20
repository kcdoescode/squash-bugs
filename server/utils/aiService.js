const { GoogleGenerativeAI } = require("@google/generative-ai");

const analyzeBugAndGenerateTags = async (title, description) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found. Skipping AI tagging.");
      return [];
    }

    // Create the client only after checking and reading the API key
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const prompt = `
You are an expert software engineer triage assistant.

Analyze the following bug report and provide 1 to 3 short,
one-word tags such as Frontend, Database, Auth, UI, API,
Security, or CSS.

Return only a comma-separated list of tags.
Do not provide explanations.

Title: ${title}
Description: ${description}
    `.trim();

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return response
      .split(",")
      .map((tag) => tag.trim().replace(/[^a-zA-Z0-9-]/g, ""))
      .filter((tag) => tag.length > 0);
  } catch (error) {
    console.error("AI Tagging Error:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    });

    return [];
  }
};

module.exports = { analyzeBugAndGenerateTags };