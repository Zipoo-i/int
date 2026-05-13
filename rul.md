# Meyri — Premium Restaurant

Современный цифровой ресторан с системой онлайн-бронирования столиков и организацией мероприятий.

---

## Инструкция по запуску на Windows

### 1. Установка Node.js

1. Перейдите на сайт: [https://nodejs.org](https://nodejs.org)
2. Скачайте и установите **LTS-версию**.
3. После установки проверьте в PowerShell:

```powershell
node -v
npm -v

зайти в cafe\src\meyri
npm install
npm install --build-from-source

запуск сервера: 
node server.js

в поисковике:
http://localhost:3000