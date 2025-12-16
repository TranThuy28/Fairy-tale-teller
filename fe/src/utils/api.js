// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/chatbot'; // Sửa port thành 8000 (backend FastAPI)

export const explainWord = async (question) => {
  const response = await axios.post(`${API_BASE_URL}/word-explain`, { question });
  return response.data.text; // Trả về text giải thích
};

export const askQuestion = async (question, filename) => {
  const payload = filename ? { question, filename } : { question };
  const response = await axios.post(`${API_BASE_URL}/ask`, payload);
  return response.data.answer;
};

export const speechToText = async (audioFile) => {
  const formData = new FormData();
  formData.append('file', audioFile, 'recording.webm');
  const response = await axios.post(`${API_BASE_URL}/stt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.transcription;
};

export const textToSpeech = async (text) => {
  const response = await axios.post(`${API_BASE_URL}/tts`, { text }, { responseType: 'blob' });
  return response.data; // Trả về blob audio
};

export const uploadStory = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`http://localhost:8000/api/stories/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getStories = async () => {
  const response = await axios.get(`http://localhost:8000/api/stories`);
  return response.data;
};