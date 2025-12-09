import React, { useState, useRef } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

function ChatOverlay() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg, { sender: "bot", text: "Linda đang trả lời..." }]);
    const question = input;
    setInput("");
    setLoading(true);
    stopAudio();

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const answer = data.answer || "Cô chưa đọc đến đoạn đó, chúng mình cùng đọc tiếp nhé!";

      // Replace the placeholder bot message
      setMessages((prev) => {
        const updated = [...prev];
        // remove last placeholder
        const idx = updated.findIndex((m) => m.sender === "bot" && m.text === "Linda đang trả lời...");
        if (idx !== -1) updated.splice(idx, 1);
        return [...updated, { sender: "bot", text: answer }];
      });

      // Auto-play TTS
      try {
        const ttsRes = await fetch(`${API_BASE_URL}/chatbot/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: answer }),
        });
        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.play();
        }
      } catch (e) {
        // ignore TTS failures
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Có lỗi rồi, thử lại nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-500 text-white shadow-2xl flex items-center justify-center text-2xl"
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col">
          <div className="bg-amber-600 text-white px-4 py-3 font-semibold">Cô Linda</div>
          <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-96">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded-lg ${
                  m.sender === "user"
                    ? "bg-amber-100 text-amber-900 self-end ml-10"
                    : "bg-amber-50 text-amber-800 mr-10"
                }`}
              >
                {m.text}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-amber-800 text-sm">Hỏi cô Linda bất kỳ điều gì về câu chuyện nhé!</div>
            )}
          </div>
          <div className="p-3 border-t border-amber-100 flex items-center gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Viết câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatOverlay;


