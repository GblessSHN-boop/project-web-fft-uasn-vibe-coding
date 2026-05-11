import sqlite3

DB_NAME = "database_dosen.db"


def connect_db():
    return sqlite3.connect(DB_NAME)


def create_table():
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dosen (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            jabatan TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )
    """)

    conn.commit()
    conn.close()


def tambah_dosen():
    print("\n=== TAMBAH DATA DOSEN ===")
    nama = input("Masukkan nama dosen: ").strip()
    jabatan = input("Masukkan jabatan: ").strip()
    email = input("Masukkan email: ").strip()

    if not nama or not jabatan or not email:
        print("Data tidak boleh kosong.")
        return

    try:
        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO dosen (nama, jabatan, email)
            VALUES (?, ?, ?)
        """,
            (nama, jabatan, email),
        )

        conn.commit()
        conn.close()

        print("Data dosen berhasil ditambahkan.")

    except sqlite3.IntegrityError:
        print("Email sudah digunakan. Gunakan email lain.")


def lihat_semua_dosen():
    print("\n=== DATA DOSEN ===")

    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, nama, jabatan, email FROM dosen")
    rows = cursor.fetchall()

    conn.close()

    if not rows:
        print("Belum ada data dosen.")
        return

    for row in rows:
        print(f"ID      : {row[0]}")
        print(f"Nama    : {row[1]}")
        print(f"Jabatan : {row[2]}")
        print(f"Email   : {row[3]}")
        print("-" * 30)


def cari_dosen_by_id(dosen_id):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, nama, jabatan, email FROM dosen WHERE id = ?", (dosen_id,)
    )
    row = cursor.fetchone()

    conn.close()
    return row


def ubah_dosen():
    print("\n=== UBAH DATA DOSEN ===")

    try:
        dosen_id = int(input("Masukkan ID dosen yang ingin diubah: "))
    except ValueError:
        print("ID harus berupa angka.")
        return

    data = cari_dosen_by_id(dosen_id)

    if not data:
        print("Data dosen tidak ditemukan.")
        return

    print("\nData lama:")
    print(f"1. Nama    : {data[1]}")
    print(f"2. Jabatan : {data[2]}")
    print(f"3. Email   : {data[3]}")

    nama_baru = input("Nama baru (kosongkan jika tidak diubah): ").strip()
    jabatan_baru = input("Jabatan baru (kosongkan jika tidak diubah): ").strip()
    email_baru = input("Email baru (kosongkan jika tidak diubah): ").strip()

    nama_final = nama_baru if nama_baru else data[1]
    jabatan_final = jabatan_baru if jabatan_baru else data[2]
    email_final = email_baru if email_baru else data[3]

    try:
        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE dosen
            SET nama = ?, jabatan = ?, email = ?
            WHERE id = ?
        """,
            (nama_final, jabatan_final, email_final, dosen_id),
        )

        conn.commit()
        conn.close()

        print("Data dosen berhasil diubah.")

    except sqlite3.IntegrityError:
        print("Email sudah digunakan. Gunakan email lain.")


def hapus_dosen():
    print("\n=== HAPUS DATA DOSEN ===")

    try:
        dosen_id = int(input("Masukkan ID dosen yang ingin dihapus: "))
    except ValueError:
        print("ID harus berupa angka.")
        return

    data = cari_dosen_by_id(dosen_id)

    if not data:
        print("Data dosen tidak ditemukan.")
        return

    print(f"Data yang akan dihapus: {data[1]} - {data[2]} - {data[3]}")
    konfirmasi = input("Yakin ingin menghapus? (y/n): ").strip().lower()

    if konfirmasi != "y":
        print("Penghapusan dibatalkan.")
        return

    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM dosen WHERE id = ?", (dosen_id,))

    conn.commit()
    conn.close()

    print("Data dosen berhasil dihapus.")


def menu():
    while True:
        print("\n" + "=" * 40)
        print("SISTEM CRUD DOSEN - SQLITE + PYTHON")
        print("=" * 40)
        print("1. Tambah data dosen")
        print("2. Lihat semua data dosen")
        print("3. Ubah data dosen")
        print("4. Hapus data dosen")
        print("5. Keluar")

        pilihan = input("Pilih menu (1/2/3/4/5): ").strip()

        if pilihan == "1":
            tambah_dosen()
        elif pilihan == "2":
            lihat_semua_dosen()
        elif pilihan == "3":
            ubah_dosen()
        elif pilihan == "4":
            hapus_dosen()
        elif pilihan == "5":
            print("Program selesai.")
            break
        else:
            print("Pilihan tidak valid.")


if __name__ == "__main__":
    create_table()
    menu()
