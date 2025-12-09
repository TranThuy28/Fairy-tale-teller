# be/test.py

import requests
import os

# URL API của bạn (đang chạy ở Terminal 1)
url = "http://127.0.0.1:8000/api/chatbot/tts"

# Data gửi đi
payload = {
    "text": """She was made to work from dawn until dusk without a single penny in return for her long-suffering hardship.
It was the most terrible injustice.
You see, her mother had died and her father soon remarried. But his new wife was a simply wretched woman. And she had—from a previous marriage—two equally wretched daughters of her own.
They would tease the poor girl dreadfully each day. And one day, while she swept the cinders from the fire, they taunted her and chanted,
“Cinders… cinders… sweep sweep sweep,
In those rags in which you sleep,
From this day your name will be,
Cinderella… hee… hee… hee!’”""",
    "voice": "echo",
    "model": "gpt-4o-mini-tts"
}

print(f"📡 Đang gửi request tới: {url}")

try:
    # Gửi POST request
    response = requests.post(url, json=payload, stream=True)
    
    # Kiểm tra kết quả
    if response.status_code == 200:
        response_content = response.content
        
        if not response_content:
            print("⚠️ LỖI: Phản hồi không chứa dữ liệu audio!")
        else:
            print(f"📊 Kích thước dữ liệu nhận được: {len(response_content)} bytes")
            filename = "test_audio.mp3"
            
            # Lưu file
            with open(filename, "wb") as f:
                f.write(response_content)
            
            file_size = os.path.getsize(filename)
            print(f"✅ THÀNH CÔNG! Server trả về file audio.")
            print(f"📁 Tên file: {filename}")
            print(f"⚖️ Dung lượng: {file_size} bytes")
            print("🎧 Hãy mở file test_audio.mp3 lên để nghe thử nhé!")
    else:
        print(f"❌ THẤT BẠI. Code lỗi: {response.status_code}")
        print("Nội dung lỗi:", response.text)

except Exception as e:
    print(f"❌ Lỗi kết nối: {e}")
    print("👉 Bạn có chắc là server uvicorn đang chạy ở cửa sổ kia không?")