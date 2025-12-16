import React, { useState, useContext } from 'react'; 
import { explainWord, speechToText, textToSpeech } from '../utils/api';
import { FaMicrophone, FaVolumeUp, FaRobot, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Chatbot = () => {
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false); 
  const mediaRecorderRef = React.useRef(null);

  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  if (!user) return null; 

  const bgColor = theme === 'light' ? '#f0f0f0' : '#1e1e1e';
  const textColor = theme === 'light' ? '#333' : '#e0e0e0';
  const inputBg = theme === 'light' ? 'white' : '#333';
  const shadow = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const iconColor = theme === 'light' ? '#007bff' : '#4a90e2';
  const windowBg = theme === 'light' ? 'white' : '#333';
  const borderColor = theme === 'light' ? '#ddd' : '#555';

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
    <>
      {/* Icon floating bottom-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: bgColor,
          color: iconColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: `0 2px 10px ${shadow}`,
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <FaRobot size={24} />
      </button>

      {/* Chatbot window khi open */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px', // Cách icon một chút
            right: '20px',
            width: '300px',
            height: '400px',
            background: windowBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            padding: '16px',
            boxShadow: `0 4px 12px ${shadow}`,
            zIndex: 999,
            overflowY: 'auto',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ color: textColor }}>Hỏi Cô Linda</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer' }}>
              <FaTimes size={18} />
            </button>
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Hỏi nghĩa từ, ví dụ: 'Từ apple nghĩa là gì?'"
            style={{ width: '100%', padding: '8px', marginBottom: '8px', background: inputBg, color: textColor, border: `1px solid ${borderColor}` }}
          />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button onClick={() => handleExplain(question)} style={{ flex: 1, padding: '8px', color: textColor, background: iconColor, border: 'none', cursor: 'pointer' }}>Gửi</button>
            <button onClick={isRecording ? stopRecording : startRecording} style={{ flex: 1, padding: '8px', color: textColor, background: iconColor, border: 'none', cursor: 'pointer' }}>
              <FaMicrophone /> {isRecording ? 'Dừng' : 'Ghi Âm'}
            </button>
          </div>
          {explanation && (
            <div>
              <p style={{ color: textColor, marginBottom: '8px' }}>{explanation}</p>
              {audioUrl && (
                <button onClick={() => new Audio(audioUrl).play()} style={{ color: textColor, background: iconColor, padding: '8px', border: 'none', cursor: 'pointer' }}>
                  <FaVolumeUp /> Nghe Lại
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;