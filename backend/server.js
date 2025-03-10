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

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an AI assistant providing fact-based responses about political issues. Your responses should be concise, structured, and include suggested talking points for discussion. At the end of every response, include a section titled 'Suggested Post:' that provides a short, engaging, and shareable social media post that users can copy and paste. The suggested post should be written in an engaging and persuasive tone while remaining fact-based. Ensure it does not exceed 280 characters."
          },
          { role: "user", content: question }
        ],
        max_tokens: 300
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

