# LyceumConnection

Социальная сеть для общения учащихся лицея.

## Стек

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + HttpOnly Cookies
- Passwords: bcrypt

## Запуск

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

Открывается через Express:

```
http://localhost:3000/pages/login.html
```

## Структура

- `client/` — интерфейс
- `server/` — API
- `database/` — SQL
- `uploads/` — пользовательские файлы