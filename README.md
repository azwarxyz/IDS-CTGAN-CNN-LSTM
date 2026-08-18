## 📦 Dataset and Large File Notice

Some datasets used in this research are **not included in this GitHub repository** due to their large file sizes and GitHub repository limitations.

The excluded datasets and generated data include:

| Dataset / File               | Approximate Size | Description                                     |
| ---------------------------- | ---------------: | ----------------------------------------------- |
| `CIC_Dataset/` (CIC-IDS2018) |        **~3 GB** | CIC-IDS2018 network intrusion detection dataset |
| `X_train_scaled.csv`         |     **~6.09 GB** | Scaled training feature dataset                 |
| `X_test_scaled.csv`          |     **~1.52 GB** | Scaled testing feature dataset                  |
| `synthetic_DDoS_CTGAN.csv`   |      **~172 MB** | Synthetic DDoS traffic generated using CTGAN    |
| `X_attack_gan.csv`           |     **~45.7 MB** | Generated attack feature dataset                |
| `y_train.csv`                |     **~18.9 MB** | Training labels                                 |
| `y_test.csv`                 |      **~4.7 MB** | Testing labels                                  |

### 🔬 CIC-IDS2018 Dataset

The research uses the **CIC-IDS2018** dataset as one of the primary sources of network traffic data. The dataset contains network traffic and various types of cyberattack scenarios used for intrusion detection research.

The original CIC-IDS2018 dataset is approximately **3 GB** in size and is therefore not stored in this GitHub repository.

In addition, several processed datasets generated during the preprocessing, feature scaling, and synthetic data generation stages are also excluded because of their large file sizes.

### 💾 Why Are These Files Not Included?

The large datasets are intentionally excluded to:

1. Avoid GitHub file-size limitations.
2. Keep the repository lightweight and manageable.
3. Prevent unnecessary duplication of large publicly available datasets.
4. Separate the research source code from large experimental data files.

The excluded files are **not required to inspect or understand the main implementation**. The repository provides the source code, trained model, notebook, and web application components used in the research.

### 📁 Repository Contents

The repository contains the main implementation and supporting files, including:

* `app.py` — Flask-based web application.
* `hybrid_cnn_lstm_model_final.h5` — trained CNN-LSTM model.
* `hybrid_cnn_lstm_model_final.keras` — trained model in Keras format.
* `pakraisul_hibah_rev_2.ipynb` — research and model development notebook.
* `pakraisul_hibah_rev_2.html` — exported HTML version of the notebook.
* `create_dummy_model.py` — utility script for model generation/testing.
* `templates/` — HTML templates for the web application.
* `static/` — CSS and JavaScript resources.

### 📌 Dataset Reproduction

Researchers who require the complete experimental datasets can obtain the original CIC-IDS2018 dataset from its official source and reproduce the preprocessing and data-generation stages by following the procedures provided in the research notebook.

The large processed datasets can then be regenerated from the original data and the preprocessing pipeline.

> **Note:** The datasets are excluded from this repository due to their large size. Their exclusion does not indicate that the datasets were omitted from the research; they were used during the experimental and model development stages.
