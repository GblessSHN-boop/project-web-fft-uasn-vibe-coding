# Project Web FFT UASN Vibe Coding

<div align="center">

## Faculty of Philosophy and Theology UASN Website

A web application project for the Faculty of Philosophy and Theology at **Universitas Advent Surya Nusantara**.

This project was developed as a collaboration work with **Universitas Advent Surya Nusantara** to support the digital presence of the Faculty of Philosophy and Theology through a public website and a Flask-based admin dashboard.

<br>

![HTML5](https://img.shields.io/badge/HTML5-Structure-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Interaction-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-Backend-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Admin_Dashboard-000000?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend_Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-Version_Control-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)

</div>

---

## Live Demo

<div align="center">

### Website Preview Window

<a href="https://fft-uasndemo-by-devglandsiahaan-sta.vercel.app/" target="_blank">
<table>
<tr>
<td>

```text
┌──────────────────────────────────────────────────────────────┐
│  ●  ●  ●   fft-uasndemo-by-devglandsiahaan-sta.vercel.app    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│        Faculty of Philosophy and Theology UASN               │
│                                                              │
│        Public website preview deployed on Vercel             │
│                                                              │
│        Click this preview window to open the live demo        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

</td>
</tr>
</table>
</a>

<br>

[Open Live Demo](https://fft-uasndemo-by-devglandsiahaan-sta.vercel.app/)

</div>

---

## Project Overview

**Project Web FFT UASN Vibe Coding** is a web application project created for the **Faculty of Philosophy and Theology at Universitas Advent Surya Nusantara**.

The project provides two main systems.

First, a public frontend website that presents faculty information to visitors.  
Second, a Flask-based admin dashboard that helps authorized users manage website content.

The website is designed to present faculty identity, background information, vision and mission, organization structure, leadership profile, lecturer profile, news, announcements, and public contact information.

The admin dashboard is designed to support content management without requiring direct code editing for every content update.

---

## Project Purpose

The main purpose of this project is to support the digital publication needs of the Faculty of Philosophy and Theology at Universitas Advent Surya Nusantara.

This project aims to:

- Provide a public website for faculty information.
- Present faculty profile content in a structured format.
- Support digital publication for news and announcements.
- Display dean and lecturer profile data.
- Provide an admin dashboard for internal content management.
- Improve the maintainability of faculty website content.
- Document the development process using Git and GitHub.

---

## Main Features

### Public Website

- Responsive public homepage.
- Faculty profile section.
- Background section.
- Vision and mission section.
- Organization section.
- Dean and lecturer profile page.
- News and announcement pages.
- Banner information section.
- Contact and social media access.
- Mobile-friendly layout.

### Admin Dashboard

- Admin login page.
- Dashboard selection page.
- Dean data management.
- Lecturer data management.
- News management.
- Banner information management.
- Image upload handling.
- Published JSON data support.
- PostgreSQL database integration.

---

## Tech Stack

This project uses frontend, backend, database, deployment, and version control technologies.

### Frontend

![HTML5](https://img.shields.io/badge/HTML5-Page_Structure-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Visual_Design-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Interaction-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

The frontend uses HTML, CSS, and JavaScript to build the public interface, page layout, styling, and browser-side interaction.

### Backend

![Python](https://img.shields.io/badge/Python-Backend_Logic-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Admin_Dashboard-000000?style=flat-square&logo=flask&logoColor=white)

The backend uses Python and Flask to manage admin routes, authentication flow, form processing, file uploads, API endpoints, and database operations.

### Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational_Database-336791?style=flat-square&logo=postgresql&logoColor=white)

PostgreSQL is used to store structured website data, including dean information, lecturer information, and related content.

### Deployment and Version Control

![Vercel](https://img.shields.io/badge/Vercel-Frontend_Deployment-000000?style=flat-square&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-Version_Control-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Code_Repository-181717?style=flat-square&logo=github&logoColor=white)

The frontend demo is deployed using Vercel. Git and GitHub are used for version control, project backup, and development documentation.

---

## Project Structure

```text
project-web-fft-uasn-vibe-coding
├── backend
│   ├── static
│   ├── templates
│   ├── .env.example
│   ├── app.py
│   └── crud_dosen.py
├── frontend
│   ├── indexfft.html
│   ├── indexfft.html
│   ├── berita-detail.html
│   ├── berita-ketentuan.html
│   ├── pimpinan-dosen.html
│   ├── style.css
│   ├── script.js
│   └── assets and media files
├── .gitignore
├── .vercelignore
├── README.md
├── requirements.txt
└── vercel.json
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/GblessSHN-boop/project-web-fft-uasn-vibe-coding.git
```

```bash
cd project-web-fft-uasn-vibe-coding
```

### 2. Backend Setup

Go to the backend folder.

```bash
cd backend
```

Create a virtual environment.

```bash
python -m venv .venv
```

Activate the virtual environment.

```bash
.venv\Scripts\activate
```

Install dependencies.

```bash
pip install -r ../requirements.txt
```

Create a `.env` file based on this template.

```text
backend/.env.example
```

Run the backend server.

```bash
python app.py
```

Backend local server:

```text
http://127.0.0.1:5000
```

Admin dashboard:

```text
http://127.0.0.1:5000/admin/login
```

### 3. Frontend Setup

Open the frontend using Live Server.

Main frontend file:

```text
frontend/indexfft.html
```

Local frontend preview usually runs on:

```text
http://127.0.0.1:5500/frontend/indexfft.html
```

---

## Environment Configuration

The real `.env` file is not included in this repository for security reasons.

Use this file as a template:

```text
backend/.env.example
```

The following files are excluded from this repository:

- Local environment files.
- Admin credential files.
- Local database files.
- SQL backup files.
- Virtual environment folders.
- Admin upload files.
- Local deployment cache files.

---

## Development Status

This project is still under active development.

Completed parts:

- Public frontend structure.
- Faculty landing page.
- Dean and lecturer profile page.
- Admin dashboard base.
- Flask backend setup.
- PostgreSQL local setup.
- Frontend demo deployment on Vercel.
- GitHub repository setup.
- Basic security ignore rules for sensitive files.

Current development focus:

- Improving admin dashboard features.
- Fixing news upload and save flow.
- Refining frontend data integration.
- Cleaning unused development files.
- Preparing a more stable deployment workflow.

---

## Vibe Coding Workflow

This project uses a vibe coding workflow to speed up implementation, debugging, and code iteration.

The project flow, content direction, interface concept, and visual design decisions were arranged manually. Vibe coding was used to support faster implementation, technical problem solving, and development workflow efficiency.

---

## Developer

**Gland Jermano Blessed Siahaan**

GitHub:

```text
https://github.com/GblessSHN-boop
```

Email:

```text
glandjermanoblessedsiahaan@gmail.com
```

LinkedIn:

```text
https://www.linkedin.com/in/glandsiahaan
```

---

## Catatan Hak Cipta dan Penggunaan

© 2026 Gland Jermano Blessed Siahaan. Seluruh hak cipta dilindungi.

Project ini merupakan website Fakultas Filsafat Teologi Universitas Advent Surya Nusantara yang dibuat untuk kebutuhan kerja sama, pengembangan sistem informasi fakultas, dokumentasi project, dan portofolio pengembangan web.

Source code, desain visual, layout, struktur halaman, alur admin dashboard, dokumentasi, konsep pengembangan, dan struktur folder dalam repository ini merupakan milik Gland Jermano Blessed Siahaan, kecuali dinyatakan lain.

Dilarang menyalin, menggandakan, memodifikasi, mendistribusikan ulang, menjual, mempublikasikan, menggunakan kembali, atau mengklaim bagian apa pun dari project ini sebagai milik sendiri tanpa izin tertulis dari pemilik.

Melihat, membuka, melakukan clone, fork, atau mengakses repository ini tidak berarti memperoleh lisensi, hak penggunaan, atau izin untuk menggunakan bagian apa pun dari project ini.

Setiap penggunaan, pengutipan, pengembangan ulang, modifikasi, adaptasi, publikasi, atau distribusi dari project ini harus mendapatkan izin tertulis terlebih dahulu dari pemilik.

Pelanggaran terhadap ketentuan ini dapat dianggap sebagai pelanggaran hak cipta dan penyalahgunaan karya digital.

Untuk permintaan izin, silakan hubungi:

```text
glandjermanoblessedsiahaan@gmail.com
```

---

## Copyright and Usage Notice

© 2026 Gland Jermano Blessed Siahaan. All rights reserved.

This project is a Faculty of Philosophy and Theology website for Universitas Advent Surya Nusantara, created for collaboration work, faculty web system development, project documentation, and web development portfolio purposes.

The source code, visual design, layout, page structure, admin dashboard flow, documentation, development concept, and folder structure in this repository are owned by Gland Jermano Blessed Siahaan unless otherwise stated.

You are not allowed to copy, reproduce, modify, redistribute, sell, publish, reuse, or claim any part of this project as your own without written permission from the owner.

Viewing, opening, cloning, forking, or accessing this repository does not grant any license, usage right, or permission to use any part of this project.

Any use, citation, redevelopment, modification, adaptation, publication, or distribution of this project must receive written permission from the owner first.

Violation of this notice may be considered copyright infringement and misuse of digital work.

For permission requests, please contact:

```text
glandjermanoblessedsiahaan@gmail.com
```

---

## License

No open-source license is granted for this repository.

All rights are reserved by the owner. This project may not be used, copied, modified, distributed, published, or claimed without written permission.
