import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# --- CẤU HÌNH ĐƯỜNG DẪN (PATH CONFIG) ---
# 1. Lấy vị trí thư mục chứa file này (chính là thư mục 'be')
be_dir = Path(__file__).resolve().parent

# 2. Định nghĩa file .env (nằm ngay cạnh file script này)
env_path = be_dir / ".env"

# 3. Định nghĩa thư mục data (nằm trong be/data/stories)
stories_dir = be_dir / "data" / "stories"

# --- SETUP MÔI TRƯỜNG ---
# Load biến môi trường từ file .env
print(f"🔌 Loading environment from: {env_path}")
if env_path.exists():
    load_dotenv(env_path)
else:
    print("⚠️ WARNING: .env file not found in current directory!")

# Thêm chính thư mục 'be' vào sys.path để Python hiểu được module 'app'
# (Giúp lệnh 'from app.core...' hoạt động)
sys.path.append(str(be_dir))

# --- BÂY GIỜ MỚI IMPORT MODULE CỦA BACKEND ---
try:
    import pdfplumber
    import chromadb
    # Import các module từ source code dự án
    from app.core.vector_store import get_vector_store
    from app.services.rag.retriever import query_story_context
    from app.services.rag.ingestion import ingest_all_stories
except ImportError as e:
    print(f"\n❌ IMPORT ERROR: {e}")
    print(f"👉 Current sys.path includes: {sys.path}")
    print("👉 Hãy chắc chắn bạn đã kích hoạt môi trường ảo (.venv) và cài đủ thư viện!")
    sys.exit(1)

def main():
    print("\n" + "="*50)
    print("🚀 STARTING RAG DEBUGGER (Inside /be folder)")
    print("="*50)

    # --- BƯỚC 1: KIỂM TRA FILE PDF ---
    print(f"\n📂 Checking stories directory: {stories_dir}")
    
    if not stories_dir.exists():
        print(f"❌ ERROR: Directory not found: {stories_dir}")
        return

    pdf_files = sorted(stories_dir.glob("*.pdf"))
    if not pdf_files:
        print("❌ ERROR: No PDF files found! Please put some .pdf files in be/data/stories/")
        return
    else:
        print(f"✅ Found {len(pdf_files)} PDF files.")
        for f in pdf_files:
            print(f"   - {f.name}")

    # --- BƯỚC 2: KIỂM TRA DATABASE & AUTO-INGEST ---
    print("\n--- CHECKING VECTOR STORE ---")
    try:
        vs = get_vector_store()
        collection = vs.collection
        count = collection.count()
        print(f"📊 Documents in DB: {count}")

        if count == 0:
            print("⚠️ Database is empty. Triggering AUTO-INGESTION...")
            # Gọi hàm nạp dữ liệu thật từ code backend
            ingest_all_stories()
            
            # Kiểm tra lại sau khi nạp
            count = collection.count()
            print(f"🎉 Ingestion finished. New Total Count: {count}")
            
            if count == 0:
                print("❌ ERROR: Count is still 0 after ingestion. Check if PDFs are empty images!")
    except Exception as exc:
        print(f"❌ Failed to connect to ChromaDB: {exc}")
        return

    # --- BƯỚC 3: KIỂM TRA ĐỌC NỘI DUNG PDF ---
    print("\n--- TESTING TEXT EXTRACTION ---")
    target_pdf = pdf_files[0]
    print(f"📖 Reading: {target_pdf.name}")
    
    try:
        with pdfplumber.open(str(target_pdf)) as pdf:
            if not pdf.pages:
                print("❌ ALERT: PDF has 0 pages.")
            else:
                # Thử đọc trang đầu tiên
                first_page = pdf.pages[0]
                text = first_page.extract_text()
                
                if not text or not text.strip():
                    print("❌ CRITICAL ALERT: Extracted text is EMPTY!")
                    print("   This means your PDF is likely an IMAGE SCAN.")
                    print("   RAG cannot work without text. Please use OCR or a text-based PDF.")
                else:
                    preview = text.replace('\n', ' ')[:100]
                    print(f"✅ SUCCESS: Text detected!\n   Preview: \"{preview}...\"")
    except Exception as exc:
        print(f"❌ Error reading PDF: {exc}")

    # --- BƯỚC 4: TEST HỎI ĐÁP (RETRIEVAL) ---
    print("\n--- TESTING QUERY ---")
    query = "truyện này có nhân vật nào"
    print(f"❓ Asking: '{query}'")
    
    try:
        # Gọi hàm tìm kiếm vector
        chunks = query_story_context(query, top_k=3)
        
        if not chunks:
            print("❌ Result: 0 chunks found (Retrieval failed).")
        else:
            print(f"✅ Result: Found {len(chunks)} relevant chunks.")
            # In nội dung tìm thấy
            first_chunk = chunks[0] if isinstance(chunks, list) else str(chunks)
            print(f"   Context Content: {str(first_chunk)[:150]}...")
            
    except Exception as exc:
        print(f"❌ Retrieval Error: {exc}")

    print("\n" + "="*50)
    print("🏁 DEBUG FINISHED")

if __name__ == "__main__":
    main()