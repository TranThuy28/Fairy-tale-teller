# Fairy-tale-teller
## BE
be/
└── app/
    ├── models/
    ├── routes/
    ├── schemas/
    ├── services/
    └── main.py

**main.py**
    - File chạy chính của FastAPI.

**routes/**
    - Chứa các API endpoint của ứng dụng. Không chứa logic nghiệp vụ.
    - Mỗi file là một nhóm route (ví dụ: story_routes.py).
    - Chỉ điều phối request → gọi service → trả response.

**schemas/**
    - Chứa các Pydantic schema dùng để validate dữ liệu, định nghĩa cấu trúc request và response.

**models/**
    - Chứa các ORM models. Không xử lý logic, chỉ mô tả dữ liệu và quan hệ.
    - Mỗi model ánh xạ tới một bảng trong database.

**services/**
    - Chứa toàn bộ logic của hệ thống. Xử lý luồng nghiệp vụ, thao tác DB, gọi AI model…
    - Routes sẽ gọi vào service để giữ cho route mỏng.