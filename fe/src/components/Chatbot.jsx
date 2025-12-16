// src/components/Chatbot/Chatbot.jsx
import React, { useState, useContext } from 'react'; 
import { explainWord, speechToText, textToSpeech } from '../utils/api';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Chatbot = () => {
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = React.useRef(null);

  const { user } = useContext(AuthContext);
  if (!user) return <p>Vui lòng đăng nhập để sử dụng chatbot.</p>;

  // Xử lý ghi âm (STT)
  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const text = await speechToText(blob);
      setQuestion(text);
      handleExplain(text);
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
  };

  // Giải thích từ
  const handleExplain = async (q) => {
    if (!q) return;
    const text = await explainWord(q);
    setExplanation(text);
    // TTS: Chuyển thành audio
    const audioBlob = await textToSpeech(text);
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    new Audio(url).play(); // Phát tự động
  };

  return (
    <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#f0f0f0', padding: '16px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}>
      <h3>Hỏi Cô Linda (Giải Thích Từ)</h3>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Hỏi nghĩa từ, ví dụ: 'Từ apple nghĩa là gì?'"
        style={{ width: '70%', padding: '8px', marginRight: '8px' }}
      />
      <button 
        onClick={() => handleExplain(question)}
        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2196F3', color: 'white', cursor: 'pointer' }}
      >
        Gửi
      </button>
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: '12px 28px',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '50px',
          backgroundColor: isRecording ? '#ff4d4d' : '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          marginLeft: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          transform: isRecording ? 'scale(1.05)' : 'scale(1)'
        }}
        onMouseEnter={(e) => !isRecording && (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => !isRecording && (e.currentTarget.style.transform = 'scale(1)')}
      >
        <FaMicrophone size={20} /> {isRecording ? 'Dừng Ghi Âm' : 'Ghi Âm Hỏi'}
      </button>
      {explanation && (
        <div>
          <p>{explanation}</p>
          {audioUrl && (
            <button onClick={() => new Audio(audioUrl).play()}>
              <FaVolumeUp /> Nghe Lại
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;