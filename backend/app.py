from flask import Flask, request, jsonify, send_from_directory
import os
import cv2
import numpy as np
import face_recognition
from datetime import datetime, timedelta
from db import get_db_connection, add_users_from_images, init_db
from werkzeug.utils import secure_filename
from flask_cors import CORS
import calendar

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
KNOWN_IMAGES_FOLDER = '../images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load known faces at startup
def load_known_faces():
    known_encodings = []
    known_names = []
    for filename in os.listdir(KNOWN_IMAGES_FOLDER):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            img_path = os.path.join(KNOWN_IMAGES_FOLDER, filename)
            img = cv2.imread(img_path)
            if img is not None:
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                encodings = face_recognition.face_encodings(rgb_img)
                if encodings:
                    known_encodings.append(encodings[0])
                    known_names.append(os.path.splitext(filename)[0])
    return known_encodings, known_names

# Initialize DB and known faces
def setup():
    init_db()
    add_users_from_images(KNOWN_IMAGES_FOLDER)
    return load_known_faces()

known_encodings, known_names = setup()

@app.route('/')
def health_check():
    return jsonify({'status': 'ok', 'message': 'Attendify backend running'})

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Load uploaded image
    img = cv2.imread(filepath)
    if img is None:
        return jsonify({'error': 'Could not read uploaded image'}), 400
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_img)
    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)

    recognized = set()  # Use set to ensure unique users
    conn = get_db_connection()
    cur = conn.cursor()
    today = datetime.now().strftime('%Y-%m-%d')
    
    # First, identify all recognized users from the uploaded image
    for encoding in face_encodings:
        matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.5)
        face_distances = face_recognition.face_distance(known_encodings, encoding)
        if len(face_distances) > 0:
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                name = known_names[best_match_index]
                recognized.add(name)  # Add to set to ensure uniqueness
    
    # Then, mark attendance for each unique recognized user
    attendance_marked = []
    for name in recognized:
        cur.execute('SELECT id FROM users WHERE name = ?', (name,))
        user = cur.fetchone()
        if user:
            user_id = user['id']
            # Only mark present if not already marked today
            cur.execute('SELECT * FROM attendance WHERE user_id = ? AND date = ?', (user_id, today))
            if not cur.fetchone():
                cur.execute('INSERT INTO attendance (user_id, date, present) VALUES (?, ?, ?)', (user_id, today, 1))
                attendance_marked.append(name)
    
    conn.commit()
    conn.close()

    recognized_list = list(recognized)  # Convert back to list for JSON response
    return jsonify({
        'recognized': recognized_list, 
        'message': f'Attendance updated for: {recognized_list}',
        'attendance_marked': attendance_marked
    })

@app.route('/add_user', methods=['POST'])
def add_user():
    name = request.form.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(f"{name}.jpg")
    image_path = os.path.join(KNOWN_IMAGES_FOLDER, filename)
    file.save(image_path)

    # Add user to DB
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('INSERT OR IGNORE INTO users (name, image_filename) VALUES (?, ?)', (name, filename))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Failed to add user: {e}'}), 500
    conn.close()

    # Reload known faces
    global known_encodings, known_names
    known_encodings, known_names = load_known_faces()

    return jsonify({'message': f'User {name} added successfully'}), 200

@app.route('/attendance', methods=['GET'])
def get_attendance():
    user = request.args.get('user')  # user name (optional)
    month = request.args.get('month')  # format: YYYY-MM (optional)
    conn = get_db_connection()
    cur = conn.cursor()
    query = '''
        SELECT users.name, attendance.date, attendance.present
        FROM attendance
        JOIN users ON attendance.user_id = users.id
    '''
    params = []
    filters = []
    if user:
        filters.append('users.name = ?')
        params.append(user)
    if month:
        filters.append('attendance.date LIKE ?')
        params.append(f'{month}%')
    if filters:
        query += ' WHERE ' + ' AND '.join(filters)
    query += ' ORDER BY attendance.date DESC, users.name ASC'
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    # Format results
    results = [
        {'name': row['name'], 'date': row['date'], 'present': bool(row['present'])}
        for row in rows
    ]
    return jsonify({'attendance': results})

@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT name, image_filename FROM users ORDER BY name ASC')
    users = [{'name': row['name'], 'image_filename': row['image_filename']} for row in cur.fetchall()]
    conn.close()
    return jsonify({'users': users})

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory('../images', filename)

@app.route('/attendance/summary', methods=['GET'])
def attendance_summary():
    period = request.args.get('period', 'month')  # 'week' or 'month'
    value = request.args.get('value')  # e.g., '2025-07' or '2025-W27'
    conn = get_db_connection()
    cur = conn.cursor()
    if period == 'month' and value:
        # value: 'YYYY-MM'
        query = '''
            SELECT users.name, COUNT(attendance.id) as present_days
            FROM attendance
            JOIN users ON attendance.user_id = users.id
            WHERE attendance.present = 1 AND attendance.date LIKE ?
            GROUP BY users.name
            ORDER BY users.name ASC
        '''
        cur.execute(query, (f'{value}%',))
    elif period == 'week' and value:
        # value: 'YYYY-Www' (ISO week, e.g., '2025-W27')
        try:
            year, week = value.split('-W')
            year = int(year)
            week = int(week)
            # Get start and end date of the ISO week
            start_date = datetime.strptime(f'{year}-W{week}-1', "%Y-W%W-%w").date()
            end_date = start_date + timedelta(days=6)
        except Exception:
            return jsonify({'error': 'Invalid week format. Use YYYY-Www.'}), 400
        query = '''
            SELECT users.name, COUNT(attendance.id) as present_days
            FROM attendance
            JOIN users ON attendance.user_id = users.id
            WHERE attendance.present = 1 AND attendance.date BETWEEN ? AND ?
            GROUP BY users.name
            ORDER BY users.name ASC
        '''
        cur.execute(query, (str(start_date), str(end_date)))
    else:
        return jsonify({'error': 'Missing or invalid period/value'}), 400
    rows = cur.fetchall()
    conn.close()
    results = [
        {'name': row['name'], 'present_days': row['present_days']} for row in rows
    ]
    return jsonify({'summary': results})

if __name__ == '__main__':
    app.run(debug=True) 