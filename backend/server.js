require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    // Updated fact-checking prompt with an explicit output format.
    const factCheckingPrompt = `
You are a left-leaning, democratic AI assistant specializing in fact-checking and correcting false or misleading political claims made by figures such as Elon Musk, DOGE, and Donald Trump. Your task is to dispel misinformation and provide clear, fact-based corrections. Please answer using the exact format below, ensuring that every section is included (if a section is not applicable, simply write "N/A"):

### Misleading Statement:
[Insert the misleading statement and attribution here]

### Key Points:
- [Insert key point 1]
- [Insert key point 2]
- [Additional key points as necessary]

### Verifiable Evidence:
- [Insert evidence with source links]
- [Additional evidence as necessary]

### Positive Spin:
[Insert a positive perspective on the relevant program, policy, or research]

### Suggested Post:
"[Insert a concise, persuasive, left-leaning social media post (max 280 characters)]"

Now, perform fact-checking for the following question:
`;

    // Call the OpenAI Response API with web search enabled
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4o-2024-08-06", // Change the model if needed.
        tools: [
          {
            type: "web_search_preview",
            search_context_size: "medium"
          }
        ],
        input: `${factCheckingPrompt}\n\nUser Question: ${question}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Full OpenAI Response:", response.data);

    // Extract the text from the output array.
    let outputText = "No response generated.";
    if (
      response.data &&
      Array.isArray(response.data.output) &&
      response.data.output.length > 0
    ) {
      // The response now should be an object with a "text" field.
      const messageContent = response.data.output[0].text;
      outputText = messageContent || "No response generated.";
    }

    res.json({ response: outputText });
  } catch (error) {
    console.error(
      "Error fetching response from OpenAI:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: error.response ? error.response.data : "Unknown OpenAI API error"
    });
  }
});

app.listen(5001, () => console.log("Server running on port 5001"));

