import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# --- 1. CẤU HÌNH MÔI TRƯỜNG ---
# Lấy thư mục chứa file này (thư mục 'be')
current_dir = Path(__file__).resolve().parent
env_path = current_dir / ".env"

# Load biến môi trường ngay lập tức
print(f"🔌 Loading environment from: {env_path}")
if env_path.exists():
    load_dotenv(env_path)
else:
    print("⚠️ WARNING: .env file not found! API Key errors may occur.")

# Thêm thư mục 'be' vào sys.path để Python tìm thấy module 'app'
sys.path.append(str(current_dir))

# --- 2. IMPORT MODULE ---
try:
    from app.core.vector_store import get_vector_store
except ImportError as e:
    print(f"❌ Import Error: {e}")
    sys.exit(1)

def main():
    print("\n" + "="*40)
    print("🔍 CHECKING CHROMA DB METADATA")
    print("="*40)

    try:
        vs = get_vector_store()
        # Lấy 10 documents bất kỳ để kiểm tra
        results = vs.collection.get(limit=100)
        
        metadatas = results.get('metadatas', [])
        
        if not metadatas:
            print("❌ Database rỗng! Chưa có dữ liệu nào.")
            return

        print(f"✅ Found {len(metadatas)} samples. Checking 'source' field:\n")
        
        for i, meta in enumerate(metadatas):
            source = meta.get('source', 'MISSING')
            print(f" 📄 Doc {i+1}: {source}")
            
            # Cảnh báo nếu thấy đường dẫn tuyệt đối
            if "/" in source or "\\" in source:
                 print(f"    ⚠️ CẢNH BÁO: Metadata chứa đường dẫn đầy đủ -> RAG sẽ không tìm thấy nếu chỉ lọc theo tên file.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()