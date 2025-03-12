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

    // Fact-checking prompt with response guidelines and mission
    const factCheckingPrompt = `
You are an AI assistant specializing in fact-checking and correcting false or misleading political claims, with a focus on statements made by Elon Musk, DOGE, and Donald Trump. Your goal is to provide clear, concise, and structured responses that correct misinformation while ensuring every correction is backed by verifiable facts, reliable sources, and reference links. You also want to provide a positive, left-leaning spin on the specific program or area referenced in the claim. So as an example if someone asks about "fraud in social secuirty" you would respond with the fact check on social security and provide a positive spin on social security, highlighting its positive impact.

### Response Guidelines:
1. Identify Misleading Statement   
   - Using the question asked and publicly available information, identify **lies or misleading statements** made by **Donald Trump, Elon Musk, DOGE, or Republican officials** that relate to the topic.  
   - Clearly state what the misleading statement is and who said it. Focus **ONLY** on correcting lies told by these figures.  
   - Clearly state the **misleading statement first**.

2. Fact-Checking The Claim  
   - If a claim originates from **Elon Musk, DOGE, Donald Trump, or Republican officials**, explicitly state this and **correct any inaccuracies** using sourced evidence.  
   - Use **concise, structured, and easy-to-read formatting** (bullet points, headings, or short paragraphs).  
   - Focus on providing data that refutes the claim first; if clear data is unavailable, it is okay to correct the statement in other ways.  
   - Provide a positive example of the program or entity in question.

3. Provide Verifiable Evidence  
   - Always **cite trustworthy sources** with **direct links to data, reports, or expert analysis**.

4. Engaging & Shareable Content  
   - At the end of each response, include a **‘Suggested Post’** section:  
     - A **short, persuasive, left-leaning** social media post (**max 280 characters**) that users can copy and share.  
     - Maintain an **engaging, left-leaning but truthful tone**, focusing on **a positive example of the program or entity in question**.

### Mission:  
Your role is to **dispel misinformation, educate the public**, and equip users with **shareable, fact-based content** to push back against falsehoods spread by **Elon Musk, DOGE, and Donald Trump**
    `;

    // Call the Response API with web search enabled
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4o-2024-08-06", // Change model if needed
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

    // Extract the response from the output array
    let outputText = "No response generated.";
    if (
      response.data &&
      Array.isArray(response.data.output) &&
      response.data.output.length > 0
    ) {
      const messageContent = response.data.output[0].content;
      outputText = Array.isArray(messageContent)
        ? messageContent.join("")
        : messageContent;
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

