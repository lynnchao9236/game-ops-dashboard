# Goglobalgames — Overseas Game Operations Dashboard

A full-stack internal operations platform for overseas game publishing teams.

## 📦 Project Structure

```
goglobalgames-public/
├── homepage/              # Main navigation page
│   └── index.html
├── platform-app/          # Strategy Center (Platform)
│   ├── main.py            # FastAPI backend, port 8000
│   ├── wxcloud_db.py      # MySQL database operations
│   ├── update_strategies.py
│   ├── requirements.txt
│   ├── .env.example       # ← Copy to .env and fill in real values
│   └── static/
│       ├── index.html
│       ├── app.js
│       ├── components.js
│       ├── data.js
│       └── style.css
├── kol-app/               # KOL Management System
│   ├── main.py            # FastAPI backend, port 8001
│   ├── requirements.txt
│   ├── .env.example       # ← Copy to .env and fill in real values
│   └── static/
│       ├── index.html
│       ├── main.js
│       ├── api.js
│       ├── kolList.js
│       ├── cooperation.js
│       ├── dashboard.js
│       ├── headerMapping.js
│       ├── import.js
│       ├── search.js
│       └── style.css
├── community-app/         # Community Strategy Page
│   ├── index.html
│   ├── main.js
│   └── style.css
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- MySQL 8.0+
- Nginx

### 1. Configure Environment Variables

```bash
# Platform App
cd platform-app
cp .env.example .env
# Edit .env and fill in your database credentials

# KOL App
cd ../kol-app
cp .env.example .env
# Edit .env and fill in your database credentials
```

### 2. Install Python Dependencies

```bash
# Platform App
cd platform-app
pip install -r requirements.txt

# KOL App
cd ../kol-app
pip install -r requirements.txt
```

### 3. Start Backend Services

```bash
# Platform App (port 8000)
cd platform-app
uvicorn main:app --host 0.0.0.0 --port 8000

# KOL App (port 8001)
cd ../kol-app
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 4. Nginx Configuration (Example)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/homepage;
        index index.html;
    }

    location /platform/ {
        alias /path/to/platform-app/static/;
        try_files $uri $uri/ /platform/index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
    }

    location /kol/ {
        alias /path/to/kol-app/static/;
        try_files $uri $uri/ /kol/index.html;
    }

    location /kol/api/ {
        proxy_pass http://127.0.0.1:8001/api/;
    }

    location /Community/ {
        alias /path/to/community-app/;
        try_files $uri $uri/ /Community/index.html;
    }
}
```

## 🔐 Security Notes

- All sensitive values (DB password, API keys, internal passwords) are stored in `.env` files
- `.env` files are listed in `.gitignore` — **never commit them**
- Frontend passwords (internal access control) should be changed before production use
- See `.env.example` for the full list of required environment variables

## 🛠️ Tech Stack

- **Backend**: Python / FastAPI / pymysql
- **Frontend**: Vanilla JS (ES Modules) / HTML5 / CSS3
- **Database**: MySQL 8.0
- **Server**: Nginx (reverse proxy)
