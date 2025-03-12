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

    const factCheckingPrompt = `
You are an AI assistant specializing in fact-checking and correcting false or misleading political claims made by figures such as Elon Musk, DOGE, and Donald Trump. Your task is to dispel misinformation and provide clear, fact-based corrections. Please answer using the exact format below, ensuring that every section is included (if a section is not applicable, simply write "N/A"):

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

    const apiPayload = {
      model: "gpt-4o-2024-08-06",
      tools: [
        {
          type: "web_search_preview",
          search_context_size: "medium"
        }
      ],
      input: `${factCheckingPrompt}\n\nUser Question: ${question}`
    };

    const apiResponse = await axios.post(
      "https://api.openai.com/v1/responses",
      apiPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Full OpenAI Response:", apiResponse.data);

    let outputText = "No response generated.";
    if (
      apiResponse.data &&
      Array.isArray(apiResponse.data.output) &&
      apiResponse.data.output.length > 0
    ) {
      const messageContent = apiResponse.data.output[0].content;
      if (Array.isArray(messageContent)) {
        outputText = messageContent
          .map(item => {
            if (typeof item === "object" && item !== null) {
              return item.text ? item.text : JSON.stringify(item);
            }
            return item;
          })
          .join("");
      } else if (typeof messageContent === "object" && messageContent !== null) {
        outputText = messageContent.text
          ? messageContent.text
          : JSON.stringify(messageContent);
      } else {
        outputText = messageContent;
      }
    } else {
      console.log("No output found in API response:", apiResponse.data);
    }

    console.log("Extracted Output Text:", outputText);
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

