const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildAnalysisPrompt } = require('../utils/promptBuilder');

exports.analyzeImage = async function (photoPath) {
  if (!fs.existsSync(photoPath)) {
    throw new Error('Photo file not found: ' + photoPath);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'buraya_gercek_anahtar_gelecek') {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in .env file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const imageBuffer = fs.readFileSync(photoPath);
  const base64Image = imageBuffer.toString('base64');

  const ext = path.extname(photoPath).toLowerCase();
  const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  const mimeType = mimeTypes[ext] || 'image/jpeg';

  const prompt = buildAnalysisPrompt();

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    }
  ]);

  const response = result.response;
  let text = response.text();

  // ```json ``` bloklarını temizle
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error('Gemini response could not be parsed as JSON: ' + text);
  }

  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    throw new Error('Gemini response does not contain a valid steps array.');
  }

  return parsed.steps;
};
