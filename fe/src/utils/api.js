// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/chatbot'; 

export const explainWord = async (question) => {
  const response = await axios.post(`${API_BASE_URL}/word-explain`, { question });
  return response.data.text; // Trả về text giải thích
};

export const speechToText = async (audioFile) => {
  const formData = new FormData();
  formData.append('file', audioFile);
  const response = await axios.post(`${API_BASE_URL}/stt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.transcription;
};

export const textToSpeech = async (text) => {
  const response = await axios.post(`${API_BASE_URL}/tts`, { text }, { responseType: 'blob' });
  return response.data; // Trả về blob audio
};