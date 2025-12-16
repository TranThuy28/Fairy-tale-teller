import sys
import os
from pathlib import Path
from dotenv import load_dotenv
import shutil

# Setup đường dẫn
current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir))
load_dotenv(current_dir / ".env")

from app.core.vector_store import get_vector_store
from app.services.rag.ingestion import ingest_all_stories

def main():
    print("🗑️  Đang xóa Database cũ...")
    vs = get_vector_store()
    try:
        # Xóa toàn bộ dữ liệu trong collection
        vs.collection.delete(where={}) 
        print("✅ Đã xóa sạch dữ liệu cũ.")
    except Exception as e:
        print(f"⚠️ Không thể xóa (có thể DB rỗng): {e}")

    print("\n🚀 Bắt đầu nạp lại (Re-ingest) toàn bộ PDF...")
    # Hàm này sẽ quét thư mục stories và nạp lại từ đầu
    ingest_all_stories()
    
    print("\n🎉 Hoàn tất! Bây giờ RAG đã cập nhật đúng tên file.")

if __name__ == "__main__":
    main()