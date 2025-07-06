import sqlite3
import os

def get_db_connection():
    conn = sqlite3.connect('attendify.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    # Create users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image_filename TEXT NOT NULL UNIQUE
        )
    ''')
    # Create attendance table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            present INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()

def add_users_from_images(images_folder='../images'):
    conn = get_db_connection()
    cur = conn.cursor()
    for filename in os.listdir(images_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            name = os.path.splitext(filename)[0]
            try:
                cur.execute('INSERT OR IGNORE INTO users (name, image_filename) VALUES (?, ?)', (name, filename))
            except Exception as e:
                print(f"[DB] Error adding user {name}: {e}")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    add_users_from_images()
    print('Database initialized and users added from images folder.') 