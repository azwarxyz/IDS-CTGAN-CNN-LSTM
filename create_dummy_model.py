import os
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Dense, Dropout

def create_dummy_model():
    print("[INFO] Membuat arsitektur model Hybrid CNN-LSTM...")
    model = Sequential([
        # Kita menggunakan input_shape=(None, 1) agar bisa menerima jumlah fitur berapapun (fleksibel)
        Conv1D(filters=64, kernel_size=3, activation='relu', padding='same', input_shape=(None, 1)),
        MaxPooling1D(pool_size=2),
        Dropout(0.3),

        LSTM(128, return_sequences=True),
        Dropout(0.3),
        LSTM(64),

        Dense(64, activation='relu'),
        Dropout(0.3),
        Dense(2, activation='softmax')
    ])

    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, 'hybrid_cnn_lstm_model_final.h5')
    
    model.save(model_path)
    print(f"[INFO] File dummy berhasil dibuat dan disimpan di: {model_path}")

if __name__ == '__main__':
    create_dummy_model()
