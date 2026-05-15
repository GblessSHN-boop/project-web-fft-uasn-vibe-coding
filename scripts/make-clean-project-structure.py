from pathlib import Path
import shutil
import re
from datetime import datetime

source = Path(r"D:\Pemograman\Project\Web FFT\Project by Gland Siahaan\projek web fft")
target = Path(r"D:\\Pemograman\\Project\\Web FFT\\Project by Gland Siahaan\\Web FFT UASN - CLEAN-20260514-200236")

ignore_dirs = {
    ".git", ".venv", "node_modules", "__pycache__",
    ".local-backups"
}

ignore_prefixes = (
    "backup-",
)

ignore_files = {
    ".env",
    "Thumbs.db",
    "desktop.ini",
}

frontend = source / "frontend"
backend = source / "backend"

def safe_copy_file(src: Path, dst: Path):
    if not src.exists() or not src.is_file():
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

def should_skip(path: Path):
    parts = path.parts
    for part in parts:
        if part in ignore_dirs:
            return True
        if part.startswith(ignore_prefixes):
            return True
    if path.name in ignore_files:
        return True
    return False

def copy_tree_clean(src: Path, dst: Path):
    if not src.exists():
        return
    for item in src.rglob("*"):
        if should_skip(item):
            continue
        rel = item.relative_to(src)
        out = dst / rel
        if item.is_dir():
            out.mkdir(parents=True, exist_ok=True)
        elif item.is_file():
            safe_copy_file(item, out)

def read_text(path: Path):
    return path.read_text(encoding="utf-8-sig", errors="ignore")

def write_text(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")

def rewrite_html(html: str, css_files, js_files, root_assets):
    for css in css_files:
        html = re.sub(
            rf'(?P<prefix>(?:href|src)=["\']){re.escape(css)}(?P<suffix>["\'])',
            rf'\g<prefix>../css/{css}\g<suffix>',
            html
        )

    for js in js_files:
        html = re.sub(
            rf'(?P<prefix>(?:href|src)=["\']){re.escape(js)}(?P<suffix>["\'])',
            rf'\g<prefix>../js/{js}\g<suffix>',
            html
        )

    html = html.replace('href="assets/', 'href="../assets/')
    html = html.replace("href='assets/", "href='../assets/")
    html = html.replace('src="assets/', 'src="../assets/')
    html = html.replace("src='assets/", "src='../assets/")

    html = html.replace('href="BG Latar..visi&mi/', 'href="../assets/legacy/BG Latar..visi&mi/')
    html = html.replace('src="BG Latar..visi&mi/', 'src="../assets/legacy/BG Latar..visi&mi/')
    html = html.replace('href="icon fft/', 'href="../assets/legacy/icon fft/')
    html = html.replace('src="icon fft/', 'src="../assets/legacy/icon fft/')
    html = html.replace('href="organisasi/', 'href="../assets/legacy/organisasi/')
    html = html.replace('src="organisasi/', 'src="../assets/legacy/organisasi/')
    html = html.replace('href="viewmore/', 'href="../assets/legacy/viewmore/')
    html = html.replace('src="viewmore/', 'src="../assets/legacy/viewmore/')
    html = html.replace('href="file tentang fft/', 'href="../assets/legacy/file tentang fft/')
    html = html.replace('src="file tentang fft/', 'src="../assets/legacy/file tentang fft/')

    for asset in root_assets:
        html = re.sub(
            rf'(?P<prefix>(?:href|src)=["\']){re.escape(asset)}(?P<suffix>["\'])',
            rf'\g<prefix>../assets/images/root/{asset}\g<suffix>',
            html
        )

    return html

def rewrite_css(css: str, root_assets):
    css = css.replace("url('assets/", "url('../assets/")
    css = css.replace('url("assets/', 'url("../assets/')
    css = css.replace("url(assets/", "url(../assets/")

    css = css.replace("url('BG Latar..visi&mi/", "url('../assets/legacy/BG Latar..visi&mi/")
    css = css.replace('url("BG Latar..visi&mi/', 'url("../assets/legacy/BG Latar..visi&mi/')
    css = css.replace("url(BG Latar..visi&mi/", "url(../assets/legacy/BG Latar..visi&mi/")

    css = css.replace("url('icon fft/", "url('../assets/legacy/icon fft/")
    css = css.replace('url("icon fft/', 'url("../assets/legacy/icon fft/')
    css = css.replace("url(icon fft/", "url(../assets/legacy/icon fft/")

    css = css.replace("url('organisasi/", "url('../assets/legacy/organisasi/")
    css = css.replace('url("organisasi/', 'url("../assets/legacy/organisasi/')
    css = css.replace("url(organisasi/", "url(../assets/legacy/organisasi/")

    css = css.replace("url('viewmore/", "url('../assets/legacy/viewmore/")
    css = css.replace('url("viewmore/', 'url("../assets/legacy/viewmore/')
    css = css.replace("url(viewmore/", "url(../assets/legacy/viewmore/")

    for asset in root_assets:
        css = css.replace(f"url('{asset}')", f"url('../assets/images/root/{asset}')")
        css = css.replace(f'url("{asset}")', f'url("../assets/images/root/{asset}")')
        css = css.replace(f"url({asset})", f"url(../assets/images/root/{asset})")

    return css

def rewrite_js(js: str, root_assets):
    js = js.replace('"assets/', '"../assets/')
    js = js.replace("'assets/", "'../assets/")

    js = js.replace('"BG Latar..visi&mi/', '"../assets/legacy/BG Latar..visi&mi/')
    js = js.replace("'BG Latar..visi&mi/", "'../assets/legacy/BG Latar..visi&mi/")
    js = js.replace('"icon fft/', '"../assets/legacy/icon fft/')
    js = js.replace("'icon fft/", "'../assets/legacy/icon fft/")
    js = js.replace('"organisasi/', '"../assets/legacy/organisasi/')
    js = js.replace("'organisasi/", "'../assets/legacy/organisasi/")
    js = js.replace('"viewmore/', '"../assets/legacy/viewmore/')
    js = js.replace("'viewmore/", "'../assets/legacy/viewmore/")

    for asset in root_assets:
        js = js.replace(f'"{asset}"', f'"../assets/images/root/{asset}"')
        js = js.replace(f"'{asset}'", f"'../assets/images/root/{asset}'")

    return js

def folder_info(path: Path, title_id: str, title_en: str, body_id: str, body_en: str):
    content = f"""INFORMASI FOLDER
================

ID:
{title_id}

{body_id}

EN:
{title_en}

{body_en}
"""
    write_text(path / "FOLDER_INFO_ID_EN.txt", content)

# Struktur utama
dirs = [
    target,
    target / "frontend",
    target / "frontend" / "pages",
    target / "frontend" / "css",
    target / "frontend" / "js",
    target / "frontend" / "assets",
    target / "frontend" / "assets" / "images",
    target / "frontend" / "assets" / "images" / "root",
    target / "frontend" / "assets" / "legacy",
    target / "backend",
    target / "backend" / "app",
    target / "backend" / "templates",
    target / "backend" / "static",
    target / "database",
    target / "docs",
    target / "public",
    target / "tools",
    target / "tools" / "scripts",
]
for d in dirs:
    d.mkdir(parents=True, exist_ok=True)

# File root penting
for name in [
    "README.md",
    "requirements.txt",
    "vercel.json",
    ".gitignore",
    ".vercelignore",
    "database_dosen",
]:
    safe_copy_file(source / name, target / name)

# Database, docs, public
copy_tree_clean(source / "database", target / "database")
copy_tree_clean(source / "docs", target / "docs")
copy_tree_clean(source / "public", target / "public")

# Backend
if backend.exists():
    for item in backend.iterdir():
        if should_skip(item):
            continue

        if item.name == ".venv":
            continue

        if item.is_file():
            if item.suffix.lower() == ".py":
                safe_copy_file(item, target / "backend" / "app" / item.name)
            elif item.name == ".env.example":
                safe_copy_file(item, target / "backend" / item.name)
            elif item.name != ".env":
                safe_copy_file(item, target / "backend" / item.name)

        elif item.is_dir():
            if item.name == "templates":
                copy_tree_clean(item, target / "backend" / "templates")
            elif item.name == "static":
                copy_tree_clean(item, target / "backend" / "static")
            else:
                copy_tree_clean(item, target / "backend" / item.name)

# Frontend
html_files = sorted([p for p in frontend.glob("*.html") if p.is_file()])
css_files = sorted([p for p in frontend.glob("*.css") if p.is_file()])
js_files = sorted([p for p in frontend.glob("*.js") if p.is_file()])
root_asset_files = sorted([
    p for p in frontend.iterdir()
    if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"}
])

css_names = [p.name for p in css_files]
js_names = [p.name for p in js_files]
root_asset_names = [p.name for p in root_asset_files]

# Copy root assets
for p in root_asset_files:
    safe_copy_file(p, target / "frontend" / "assets" / "images" / "root" / p.name)

# Copy existing assets
copy_tree_clean(frontend / "assets", target / "frontend" / "assets")

# Copy legacy folders if still exist
for legacy in [
    "BG Latar..visi&mi",
    "file tentang fft",
    "icon fft",
    "organisasi",
    "viewmore",
]:
    copy_tree_clean(frontend / legacy, target / "frontend" / "assets" / "legacy" / legacy)

# Copy unusual old program folder to tools, not active frontend
copy_tree_clean(frontend / "program lain", target / "tools" / "program-lain-archive")

# HTML pages
for p in html_files:
    html = read_text(p)
    html = rewrite_html(html, css_names, js_names, root_asset_names)
    write_text(target / "frontend" / "pages" / p.name, html)

# CSS
for p in css_files:
    css = read_text(p)
    css = rewrite_css(css, root_asset_names)
    write_text(target / "frontend" / "css" / p.name, css)

# JS
for p in js_files:
    js = read_text(p)
    js = rewrite_js(js, root_asset_names)
    write_text(target / "frontend" / "js" / p.name, js)

# Root frontend redirect
index_redirect = """<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=pages/indexfft.html">
  <title>Web FFT UASN</title>
</head>
<body>
  <p>Mengarahkan ke halaman utama Web FFT UASN...</p>
  <p><a href="pages/indexfft.html">Buka halaman utama</a></p>
</body>
</html>
"""
write_text(target / "frontend" / "index.html", index_redirect)

# Dokumentasi folder
folder_info(
    target,
    "Folder induk project Web FFT UASN.",
    "Main project folder for Web FFT UASN.",
    "Folder ini berisi seluruh bagian utama website, yaitu frontend, backend, database, dokumentasi, public file, dan tools. Folder ini dibuat agar struktur project lebih mudah dibaca, dirawat, dan dikembangkan.",
    "This folder contains the main parts of the website, including frontend, backend, database, documentation, public files, and tools. It is structured to make the project easier to read, maintain, and develop."
)

folder_info(
    target / "frontend",
    "Folder tampilan website.",
    "Website user interface folder.",
    "Folder ini berisi semua file yang dilihat pengunjung, seperti halaman HTML, CSS, JavaScript, gambar, ikon, dokumen, dan video. Bagian ini bertanggung jawab terhadap tampilan, navigasi, animasi, dan pengalaman pengguna.",
    "This folder contains all files seen by visitors, such as HTML pages, CSS, JavaScript, images, icons, documents, and videos. This part controls the visual layout, navigation, animation, and user experience."
)

folder_info(
    target / "frontend" / "pages",
    "Folder halaman HTML.",
    "HTML pages folder.",
    "Folder ini berisi halaman utama website, misalnya beranda, e-brochure, kontak, kurikulum, kalender akademik, persyaratan, simulasi pendaftaran, testimoni, dan halaman lain yang bisa dibuka pengunjung.",
    "This folder contains the main website pages, such as home, e-brochure, contact, curriculum, academic calendar, requirements, registration simulation, testimonials, and other visitor pages."
)

folder_info(
    target / "frontend" / "css",
    "Folder style dan desain.",
    "Styles and design folder.",
    "Folder ini berisi file CSS untuk mengatur warna, ukuran, layout, jarak, responsive design, animasi ringan, komponen e-brochure, scroll-to-top, ranking board, dan tampilan halaman lainnya.",
    "This folder contains CSS files for colors, sizing, layout, spacing, responsive design, light animations, e-brochure components, scroll-to-top, ranking board, and other page visuals."
)

folder_info(
    target / "frontend" / "js",
    "Folder logic frontend.",
    "Frontend logic folder.",
    "Folder ini berisi JavaScript yang menjalankan interaksi website, seperti navigasi, switch bahasa, popup e-brochure, scroll-to-top, konten dinamis, dan fitur interaktif lain.",
    "This folder contains JavaScript for website interactions, such as navigation, language switching, e-brochure popup, scroll-to-top, dynamic content, and other interactive features."
)

folder_info(
    target / "frontend" / "assets",
    "Folder aset visual dan dokumen.",
    "Visual assets and documents folder.",
    "Folder ini berisi gambar, ikon, dokumen, video, file e-brochure, logo, dan aset pendukung lain. Semua file non-kode frontend sebaiknya diletakkan di sini agar tidak bercampur dengan HTML, CSS, dan JavaScript.",
    "This folder contains images, icons, documents, videos, e-brochure files, logos, and supporting assets. All non-code frontend files should be placed here to keep them separate from HTML, CSS, and JavaScript."
)

folder_info(
    target / "backend",
    "Folder server dan sistem admin.",
    "Server and admin system folder.",
    "Folder ini berisi kode backend, template admin, file static backend, database lokal backend, dan konfigurasi contoh. Bagian ini dipakai untuk fitur yang membutuhkan proses server, pengelolaan data, dan dashboard admin.",
    "This folder contains backend code, admin templates, backend static files, local backend database, and example configuration. This part is used for server-side processing, data management, and admin dashboard features."
)

folder_info(
    target / "backend" / "app",
    "Folder kode Python backend.",
    "Backend Python code folder.",
    "Folder ini berisi file Python utama seperti app.py dan modul CRUD. File ini mengatur route Flask, koneksi database, proses admin, dan logic server.",
    "This folder contains main Python files such as app.py and CRUD modules. These files manage Flask routes, database connection, admin processes, and server logic."
)

folder_info(
    target / "backend" / "templates",
    "Folder template backend.",
    "Backend template folder.",
    "Folder ini berisi file HTML untuk halaman admin atau halaman yang dirender oleh Flask. Template ini berbeda dari frontend statis karena biasanya berhubungan langsung dengan data backend.",
    "This folder contains HTML files for admin pages or pages rendered by Flask. These templates are different from static frontend pages because they usually connect directly to backend data."
)

folder_info(
    target / "backend" / "static",
    "Folder static backend.",
    "Backend static folder.",
    "Folder ini berisi CSS, JavaScript, gambar upload, dan file publik yang dipakai oleh halaman admin atau sistem backend.",
    "This folder contains CSS, JavaScript, uploaded images, and public files used by admin pages or backend systems."
)

folder_info(
    target / "database",
    "Folder database project.",
    "Project database folder.",
    "Folder ini menyimpan file database atau struktur data yang dipakai oleh project. File database perlu dijaga karena berisi sumber data aplikasi.",
    "This folder stores database files or data structures used by the project. Database files should be handled carefully because they contain application data."
)

folder_info(
    target / "docs",
    "Folder dokumentasi.",
    "Documentation folder.",
    "Folder ini berisi catatan teknis, panduan, atau dokumen pendukung project. Dokumentasi membantu developer berikutnya memahami struktur, cara menjalankan, dan arah pengembangan website.",
    "This folder contains technical notes, guides, or supporting project documents. Documentation helps future developers understand the structure, how to run the project, and its development direction."
)

folder_info(
    target / "public",
    "Folder file publik.",
    "Public files folder.",
    "Folder ini berisi file yang bisa dipakai untuk deployment atau akses publik sesuai kebutuhan platform hosting.",
    "This folder contains files used for deployment or public access depending on the hosting platform."
)

folder_info(
    target / "tools",
    "Folder alat bantu project.",
    "Project tools folder.",
    "Folder ini berisi script bantu, arsip eksperimen, atau file pendukung yang bukan bagian langsung dari website berjalan. Isi folder ini tidak boleh dipanggil langsung oleh halaman produksi kecuali memang diperlukan.",
    "This folder contains helper scripts, experiment archives, or supporting files that are not directly part of the running website. Files here should not be called by production pages unless required."
)

# Folder info untuk semua subfolder yang belum punya
for d in target.rglob("*"):
    if d.is_dir() and not (d / "FOLDER_INFO_ID_EN.txt").exists():
        rel = d.relative_to(target)
        folder_info(
            d,
            f"Subfolder {rel}.",
            f"Subfolder {rel}.",
            "Folder ini berisi file pendukung sesuai nama foldernya. Jika folder ini berisi gambar, ikon, dokumen, atau data, simpan hanya file yang benar-benar dipakai oleh website.",
            "This folder contains supporting files based on its folder name. If it contains images, icons, documents, or data, keep only files that are actually used by the website."
        )

# Struktur utama + hak cipta
root_doc = f"""WEB FFT UASN, STRUKTUR PROJECT
==============================

ID:
Project ini disusun ulang agar lebih rapi dan mudah dipahami. Struktur folder dipisahkan berdasarkan fungsi utama, yaitu frontend, backend, database, dokumentasi, public file, dan tools.

Struktur utama:
1. frontend
   Berisi tampilan website yang dilihat pengunjung. Di dalamnya ada pages, css, js, dan assets.

2. backend
   Berisi kode server, template admin, static backend, database backend, dan file konfigurasi contoh.

3. database
   Berisi database atau file data utama project.

4. docs
   Berisi dokumentasi teknis dan catatan project.

5. public
   Berisi file publik untuk kebutuhan deployment.

6. tools
   Berisi script bantu dan arsip eksperimen yang tidak langsung menjadi bagian halaman produksi.

Catatan penting:
- File .env tidak disalin karena biasanya berisi data sensitif.
- Folder .venv tidak disalin karena bisa dibuat ulang dari requirements.txt.
- Folder node_modules tidak disalin karena bisa dibuat ulang dari package.json jika diperlukan.
- Folder backup lokal tidak disalin karena bukan bagian dari website produksi.

EN:
This project has been reorganized to make it cleaner and easier to understand. The folder structure is separated by main function, including frontend, backend, database, documentation, public files, and tools.

Main structure:
1. frontend
   Contains the website interface seen by visitors. It includes pages, css, js, and assets.

2. backend
   Contains server code, admin templates, backend static files, backend database, and example configuration files.

3. database
   Contains project database or data files.

4. docs
   Contains technical documentation and project notes.

5. public
   Contains public files for deployment needs.

6. tools
   Contains helper scripts and experiment archives that are not directly part of production pages.

Important notes:
- The .env file is not copied because it usually contains sensitive data.
- The .venv folder is not copied because it can be recreated from requirements.txt.
- The node_modules folder is not copied because it can be recreated from package.json if needed.
- Local backup folders are not copied because they are not part of the production website.

Hak Cipta:
© {datetime.now().year} Fakultas Filsafat dan Teologi, Universitas Advent Surya Nusantara. Seluruh struktur, desain, konten, dan aset project ini digunakan untuk kepentingan pengembangan website Fakultas Filsafat dan Teologi. Penggunaan ulang, distribusi, atau modifikasi di luar kepentingan institusi harus mendapatkan izin dari pemilik project.

Copyright:
© {datetime.now().year} Faculty of Philosophy and Theology, Universitas Advent Surya Nusantara. All structure, design, content, and assets in this project are used for the development of the Faculty of Philosophy and Theology website. Reuse, distribution, or modification outside institutional purposes requires permission from the project owner.
"""
write_text(target / "PROJECT_STRUCTURE_ID_EN.txt", root_doc)

# Manifest
manifest_lines = ["MANIFEST FILE PROJECT BARU", "=" * 32, ""]
for p in sorted(target.rglob("*")):
    if p.is_file():
        manifest_lines.append(str(p.relative_to(target)).replace("\\", "/"))
write_text(target / "MANIFEST_FILES.txt", "\n".join(manifest_lines))

print("Selesai membuat folder project baru.")
print(f"Lokasi: {target}")
print(f"Total file: {sum(1 for p in target.rglob('*') if p.is_file())}")
