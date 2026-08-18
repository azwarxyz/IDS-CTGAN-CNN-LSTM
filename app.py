import os
from flask import Flask, request, render_template, jsonify
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import io
import time

app = Flask(__name__)

# Menekan log TensorFlow yang tidak perlu
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

# Variabel Global untuk Live Stream
stream_df = None
current_stream_index = 0

# Load model yang sudah dilatih
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'hybrid_cnn_lstm_model_final.h5')
try:
    model = load_model(model_path)
    print(f"[INFO] Model loaded successfully from {model_path}")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/predict_single', methods=['POST'])
def predict_single():
    if model is None:
        return jsonify({'status': 'error', 'message': 'Model tidak dapat dimuat oleh server.'})
    try:
        data = request.json
        input_data = data.get('log_data', '')
        
        # Parse data, buang karakter kosong
        data_list = [float(i.strip()) for i in input_data.split(',') if i.strip()]
        
        if not data_list:
            return jsonify({'status': 'error', 'message': 'Input kosong atau tidak valid. Masukkan nilai angka dipisahkan koma.'})
        
        # Reshape data untuk input Conv1D: (1, jumlah_fitur, 1)
        data_array = np.array(data_list)
        data_reshaped = data_array.reshape(1, len(data_list), 1)
        
        # Melakukan prediksi
        prediction = model.predict(data_reshaped)
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        confidence = float(np.max(prediction, axis=1)[0])
        
        # Interpretasi hasil (0 = Normal/Benign, 1 = Attack/DDoS)
        status_text = "Benign" if predicted_class == 0 else "DDoS LOIC-HTTP"
        
        return jsonify({
            'status': 'success',
            'prediction': status_text,
            'class': predicted_class,
            'confidence': round(confidence * 100, 2),
            'features_count': len(data_list)
        })
    except ValueError:
        return jsonify({'status': 'error', 'message': 'Format input tidak valid. Pastikan hanya memasukkan angka dan koma.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/predict_batch', methods=['POST'])
def predict_batch():
    if model is None:
        return jsonify({'status': 'error', 'message': 'Model tidak dapat dimuat oleh server.'})
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'Tidak ada file yang diunggah.'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'File kosong atau belum dipilih.'})
            
        if not file.filename.endswith('.csv'):
            return jsonify({'status': 'error', 'message': 'Format file harus berupa .csv'})
            
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)
        
        # Filter fitur numerik, abaikan IP/Timestamp/String
        if 'Label' in df.columns:
            features = df.drop(columns=['Label'])
        else:
            features = df
            
        # Ambil hanya kolom numerik
        features = features.select_dtypes(include=[np.number])
        features = features.fillna(0) # Tangani nilai kosong jika ada
        
        data_array = features.values
        num_samples = data_array.shape[0]
        num_features = data_array.shape[1]
        
        if num_samples == 0:
            return jsonify({'status': 'error', 'message': 'Tidak ditemukan data numerik yang valid di dalam CSV.'})
            
        # Reshape untuk Conv1D
        data_reshaped = data_array.reshape(num_samples, num_features, 1)
        
        start_time = time.time()
        # Batch Predict
        predictions = model.predict(data_reshaped, batch_size=256)
        predicted_classes = np.argmax(predictions, axis=1)
        end_time = time.time()
        
        benign_count = int(np.sum(predicted_classes == 0))
        attack_count = int(np.sum(predicted_classes != 0))
        
        # Ambil 10 indeks pertama yang terdeteksi sebagai serangan
        attack_indices = list(np.where(predicted_classes != 0)[0][:10])
        attack_indices = [int(i) for i in attack_indices]
        
        return jsonify({
            'status': 'success',
            'total_samples': num_samples,
            'benign_count': benign_count,
            'attack_count': attack_count,
            'attack_percentage': round((attack_count / num_samples) * 100, 2) if num_samples > 0 else 0,
            'processing_time_sec': round(end_time - start_time, 2),
            'attack_indices': attack_indices
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/start_stream', methods=['POST'])
def start_stream():
    global stream_df, current_stream_index
    if model is None:
        return jsonify({'status': 'error', 'message': 'Model tidak dapat dimuat oleh server.'})
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'Tidak ada file yang diunggah.'})
        
        file = request.files['file']
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)
        
        if 'Label' in df.columns:
            features = df.drop(columns=['Label'])
        else:
            features = df
            
        features = features.select_dtypes(include=[np.number]).fillna(0)
        stream_df = features.values
        current_stream_index = 0
        
        return jsonify({'status': 'success', 'total_rows': stream_df.shape[0]})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/poll_stream', methods=['GET'])
def poll_stream():
    global stream_df, current_stream_index
    if model is None or stream_df is None:
        return jsonify({'status': 'error', 'message': 'Stream belum dimulai.'})
    
    CHUNK_SIZE = 50
    start_idx = current_stream_index
    end_idx = start_idx + CHUNK_SIZE
    
    is_eof = False
    if end_idx >= stream_df.shape[0]:
        end_idx = stream_df.shape[0]
        is_eof = True
        
    if start_idx >= end_idx:
        return jsonify({'status': 'eof'})
        
    chunk = stream_df[start_idx:end_idx]
    current_stream_index = end_idx
    
    num_samples = chunk.shape[0]
    num_features = chunk.shape[1]
    data_reshaped = chunk.reshape(num_samples, num_features, 1)
    
    predictions = model.predict(data_reshaped, batch_size=256)
    predicted_classes = np.argmax(predictions, axis=1)
    
    benign_count = int(np.sum(predicted_classes == 0))
    attack_count = int(np.sum(predicted_classes != 0))
    
    return jsonify({
        'status': 'success',
        'benign_count': benign_count,
        'attack_count': attack_count,
        'is_eof': is_eof
    })

if __name__ == '__main__':
    # Menjalankan server web lokal
    app.run(debug=True, port=5000, use_reloader=False)