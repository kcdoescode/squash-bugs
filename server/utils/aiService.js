require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

// ==============================
// Environment variables
// ==============================

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();

let ai = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
  });

  console.log("Gemini API configured.");
} else {
  console.warn(
    "GEMINI_API_KEY is not configured. Gemini will be skipped."
  );
}

if (openRouterApiKey) {
  console.log("OpenRouter fallback configured.");
} else {
  console.warn(
    "OPENROUTER_API_KEY is not configured. OpenRouter fallback will be unavailable."
  );
}

// ==============================
// OpenRouter fallback
// ==============================

const generateWithOpenRouter = async (prompt) => {
  if (!openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  console.log("Attempting request with OpenRouter free model...");

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "X-OpenRouter-Title": "Squash Bugs",
        },

        body: JSON.stringify({
          model: "openrouter/free",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.2,
          max_tokens: 600,
        }),

        signal: controller.signal,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        `OpenRouter request failed with status ${response.status}`;

      const error = new Error(errorMessage);
      error.status = response.status;

      throw error;
    }

    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("OpenRouter returned an empty response");
    }

    console.log(
      `OpenRouter request succeeded using: ${
        data.model || "an available free model"
      }`
    );

    return text;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("OpenRouter request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

// ==============================
// Gemini → OpenRouter fallback
// ==============================

const generateWithFallback = async (prompt) => {
  let lastGeminiError = null;

  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ];

  // First try Gemini
  if (ai) {
    for (const modelName of modelsToTry) {
      try {
        console.log(
          `Attempting request with Gemini model: ${modelName}`
        );

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const text = response.text?.trim();

        if (!text) {
          throw new Error(
            `Gemini model ${modelName} returned an empty response`
          );
        }

        console.log(`Success with Gemini model: ${modelName}`);

        return text;
      } catch (error) {
        lastGeminiError = error;

        const status =
          error.status ||
          error.code ||
          error.message ||
          "Unknown error";

        console.warn(
          `Gemini model ${modelName} failed. Reason: ${status}`
        );

        /*
         * A 401 or 403 generally affects all Gemini models,
         * so stop trying Gemini and move to OpenRouter.
         */
        if (error.status === 401 || error.status === 403) {
          console.warn(
            "Gemini authentication failed. Moving to OpenRouter."
          );

          break;
        }
      }
    }
  } else {
    console.warn(
      "Gemini is not configured. Moving directly to OpenRouter."
    );
  }

  // If every Gemini attempt failed, try OpenRouter
  try {
    console.warn(
      "Gemini is unavailable. Switching to OpenRouter fallback."
    );

    return await generateWithOpenRouter(prompt);
  } catch (openRouterError) {
    console.error(
      "OpenRouter fallback failed:",
      openRouterError.message || openRouterError
    );

    const finalError = new Error(
      "All configured AI providers failed."
    );

    finalError.geminiError =
      lastGeminiError?.message || null;

    finalError.openRouterError =
      openRouterError?.message || null;

    throw finalError;
  }
};

// ==============================
// Generate bug tags
// ==============================

const analyzeBugAndGenerateTags = async (
  title,
  description
) => {
  try {
    if (!ai && !openRouterApiKey) {
      console.warn(
        "No AI provider is configured. Returning empty tags."
      );

      return [];
    }

    const prompt = `
You are an expert software engineer triage assistant.

Analyze the following bug report and provide 1 to 3 short,
one-word tags that categorize it.

Examples:
Frontend, Backend, Database, Auth, UI, API, Security, CSS,
Performance, Network, Validation, Deployment

Return ONLY a comma-separated list of tags.
Do not provide explanations.
Do not include bullets or Markdown.

Title: ${title}
Description: ${description}
    `.trim();

    const text = await generateWithFallback(prompt);

    const tags = text
      .split(",")
      .map((tag) =>
        tag
          .trim()
          .replace(/[^a-zA-Z0-9-]/g, "")
      )
      .filter((tag) => tag.length > 0)
      .slice(0, 3);

    return tags;
  } catch (error) {
    console.error(
      "AI Tagging Error:",
      error.message || error
    );

    // Bug creation should continue even when AI fails
    return [];
  }
};



const suggestBugFix = async (title, description) => {
  try {
    if (!ai && !openRouterApiKey) {
      return "No AI provider is currently configured.";
    }

    const prompt = `
You are a helpful senior software engineer mentoring a junior developer.

Review this bug report:

Title: ${title}
Description: ${description}

Provide a short and easy-to-read response.

1. Begin with a one or two sentence explanation of the likely cause.
2. Provide two or three specific checks or fixes as a bulleted list.
3. If the report is too vague, ask the developer to provide relevant error logs, affected code, expected behavior, and actual behavior.
4. Do not invent files, errors, or technical details that are not present in the report.
    `.trim();

    return await generateWithFallback(prompt);
  } catch (error) {
    console.error(
      "AI Debugging Error:",
      error.message || error
    );

    return "Sorry, the AI debugging services are temporarily unavailable. Please try again later.";
  }
};

module.exports = {
  analyzeBugAndGenerateTags,
  suggestBugFix,
};