#建立 Django 後端環境(VScode Terminal)
python -m venv backend\venv

backend\venv\Scripts\activate

pip install -r requirements.txt

cd backend

python manage.py runserver

#啟動 React 前端(PowerShell) 網址在這裡
cd frontend
npm install
npm run dev