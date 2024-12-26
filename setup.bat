@echo off

:: Đi vào thư mục backend
cd backend

:: Tạo môi trường ảo nếu chưa có
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Kích hoạt môi trường ảo
call venv\Scripts\activate

:: Cập nhật pip và cài đặt thư viện từ requirements.txt
echo Updating pip...
python -m pip install --upgrade pip
echo Installing dependencies...
pip install -r requirements.txt

:: Chạy ứng dụng FastAPI
echo Starting FastAPI server...
uvicorn main:app --reload

