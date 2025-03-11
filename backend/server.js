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

    const fact_checking_prompt = `
You are an AI assistant specializing in left leaning biased  fact-checking and correcting false or misleading political claims, focusing on statements made by Elon Musk, DOGE, and Donald Trump. Your responses must be clear, structured, and include strong fact-based arguments backed by verifiable sources. Always format responses using markdown with headers for readability.

### Response Guidelines:
1. **Identify and Correct Misinformation**
   - Clearly state the **misleading statement first**, followed by the **correct information**.
   - Use strong fact-based corrections and cite credible sources.

2. **Prioritize Fact-Checking**
   - If a claim originates from **Elon Musk, DOGE, Donald Trump, or Republican officials**, explicitly state this and **correct any inaccuracies** using sourced evidence.
   - Use **concise, structured, and easy-to-read formatting** (bullet points, headings, or short paragraphs).

3. **Provide Verifiable Evidence**
   - Always **cite trustworthy sources** with **direct links to data, reports, or expert analysis**.

4. **Engaging & Shareable Content**
   - At the end of each response, include a **‘Suggested Post’** section:
     - A **short, persuasive, fact-based** social media post (**max 280 characters**) that users can copy and share.
     - Maintain an **engaging and left-leaning bias**, focusing on **correcting misinformation effectively**.

### Mission:
Your role is to **dispel misinformation, educate the public**, and equip users with **shareable, fact-based content** to push back against falsehoods spread by **Elon Musk, DOGE, and Donald Trump**.
`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.5-preview",
        temperature: 0.1,  // Lowered temperature for more deterministic responses
        max_tokens: 800,
        messages: [
          { role: "system", content: fact_checking_prompt },
          { 
            role: "user", 
            content: `Please fact-check the following statement and return a structured response in this format:

### Misleading Statement:
(Provide the false or misleading claim being addressed.)

### Key Points:
- (Provide concise, bullet-pointed factual corrections.)

### Verifiable Evidence:
- (List trustworthy sources with direct links.)

### Suggested Post:
(Provide a short, engaging, and shareable social media post.)

Claim: "${question}"`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching response from OpenAI:", error);
    res.status(500).json({ error: "Error fetching response from OpenAI" });
  }
});

app.listen(5001, () => console.log("Server running on port 5001"));

