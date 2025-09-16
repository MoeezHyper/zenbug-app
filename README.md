# 🐞 ZenBug – Feedback & Bug Reporting Platform

ZenBug is a full-stack feedback and bug-reporting platform that makes it easy for users to capture screenshots or record videos, annotate issues, and submit detailed bug reports. It includes an **embeddable widget**, a **Chrome extension**, and an **admin dashboard** for managing reports.

## 🚀 Features
- 📸 **Screenshot Capture** – Uses **Chrome APIs** for capturing the current tab.  
- 🎥 **Video Recording** – Record the active screen or tab directly via Chrome APIs.  
- ✏️ **Image Annotation & Cropping** – Powered by `Fabric.js` for drawing, highlighting, and cropping bugs.  
- 🧩 **Embeddable Widget** – Drop the widget into any site with isolated Shadow DOM + Tailwind CSS v4 styling.  
- 🌐 **Chrome Extension** – Lightweight extension version of the widget.  
- 🗄️ **Storage & Metadata**  
  - Screenshots & videos stored in **Supabase Storage**.  
  - Metadata includes browser, OS, viewport, IP, Location, and current URL (via `UAParser.js`).  
- 🔑 **Authentication** –  
  - **JWT** for protected routes.  
  - **API Key** for open bug submissions.  
- 📊 **Admin Dashboard** – View, filter, and manage reports.  
- ☁️ **Deployment** – Serverless backend on Vercel + Supabase integration.

## 🛠️ Tech Stack
**Frontend**  
- React.js (Vite)  
- Tailwind CSS v4  
- Fabric.js (annotations)  
- Chrome APIs (screenshot + video recording)  
- Shadow DOM isolation  

**Backend**  
- Node.js + Express.js  
- MongoDB  
- Supabase (Storage only)  
- JWT Authentication (no Supabase Auth)  

**Other**  
- Chrome APIs (capture + recording)  
- Vercel (deployment)  

📦 API Endpoints

| Method | Endpoint            | Auth    | Description          |
| ------ | ------------------- | ------- | -------------------- |
| POST   | `/api/feedback`     | API Key | Submit a bug report  |
| GET    | `/api/feedback`     | JWT     | Get all reports      |
| GET    | `/api/feedback/:id` | JWT     | Get single report    |
| PATCH  | `/api/feedback/:id` | JWT     | Update report status |
| DELETE | `/api/feedback/:id` | JWT     | Delete a report      |

