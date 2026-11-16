# IDS-CTGAN-CNN-LSTM

Code and results for the revised manuscript **PAPER024914** (IJMECS, MECS Press):
*Hybrid CNN-LSTM for Multi-Class Intrusion Detection: Minority-Targeted Oversampling and Class Weighting on an Unrebalanced Test Set.*

All numbers reported in the revised manuscript come from the notebooks and result folders in this repository.

## Repository contents

| Item | Description |
|---|---|
| `revisi_eksperimen_colab.ipynb` | Main revision experiment (v1). Baselines (SMOTE, ADASYN, class weights only, undersampling only), ablation, 5 seeds, statistical tests, Web Attack threshold and PR analysis, LightGBM second-stage filter, CTGAN quality checks (TSTR, real-vs-synthetic AUC). Outputs to `results/`. |
| `revisi_eksperimen_colab_v2.ipynb` | Follow-up Stage 1: CTGAN **without** class weights, 5 seeds, paired tests with Holm correction, LightGBM filter, threshold analysis. Outputs to `results_v2/`. Previous `results/` are read only and never modified. |
| `revisi_eksperimen_colab_v3.ipynb` | v2 plus Stage 1b: SMOTE **without** class weights, 5 seeds, to remove the confound between oversampling method and class weighting. Runs already in `results_v2/` are skipped. Outputs to `results_v2/` (`stage1b_*` tables). |
| `results/` | Outputs of v1: per-run metrics, confusion matrices, training histories, PR curves, CTGAN quality figures, summary and statistical-test tables. |
| `results_v2/` | Outputs of v2 and v3: `all_runs_v2.csv`, `tables/stage1_*` and `tables/stage1b_*`, figures, run logs, `environment.json`. |

## Dataset

CSE-CIC-IDS2018 (Canadian Institute for Cybersecurity), files `02-14-2018.csv`, `02-16-2018.csv`, `02-22-2018.csv`.
Download: https://www.unb.ca/cic/datasets/ids-2018.html
The raw data is not included in this repository because of its size.

## Experimental protocol (all notebooks)

- 6 classes, 68 features; stratified 80/20 train/test split with `random_state=42`.
- MinMax scaler fitted on the training set only.
- **The test set (627,258 rows) is never rebalanced or modified.**
- Oversampling (CTGAN or SMOTE) is applied only to the Web Attack class in the training set (290 real samples, 5,000 synthetic samples added), followed by Benign undersampling.
- CNN-LSTM: up to 50 epochs, early stopping patience 5, batch size 512.
- Seeds: 42, 123, 456, 789, 1024.
- Statistics: paired t-test and Wilcoxon signed-rank test with Holm correction over each family of tests.

## Hardware

| Experiment | GPU |
|---|---|
| v1 (`results/`) | NVIDIA A100-SXM4-40GB (Google Colab) |
| v2, Stage 1 (`results_v2/`) | NVIDIA L4 (Google Colab) |
| v3, Stage 1b (`results_v2/`) | NVIDIA A100-SXM4-80GB (Google Colab) |

Exact library versions and GPU names are recorded in `environment.json`. Training times measured on different GPUs should not be compared directly.

## How to run

1. Open a notebook in Google Colab with a GPU runtime.
2. Put the three CSE-CIC-IDS2018 CSV files in your Google Drive and set the data path in the first configuration cell.
3. Run all cells. Run v1 first; v2 and v3 read from `results/` and write to `results_v2/`.

## Main findings

- Combining minority oversampling with class weighting over-corrects the model and sharply lowers Web Attack precision, for both CTGAN and SMOTE.
- Without class weights, CTGAN and SMOTE are statistically comparable in macro F1. CTGAN gives higher Web Attack precision in all five seeds, while SMOTE gives higher and more stable recall.
- The best configuration is SMOTE without class weights followed by the LightGBM second-stage filter.

See the manuscript and the tables in `results_v2/tables/` for exact values.

## Citation

If you use this code, please cite the published article (details will be added after publication).
