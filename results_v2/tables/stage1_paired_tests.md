### Tahap 1 — uji t berpasangan & Wilcoxon, koreksi Holm atas seluruh keluarga uji

| variant | reference | metric | n_pairs | variant_mean | reference_mean | mean_diff_variant_minus_ref | n_variant_better | t_pvalue | t_pvalue_holm | wilcoxon_pvalue | wilcoxon_pvalue_holm |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CTGAN no-weight (v2) | CTGAN + weights (main) | Macro F1 | 5 | 0.8655 | 0.8176 | 0.0479 | 5 | 0.0444 | 0.1776 | 0.0625 | 0.5000 |
| CTGAN no-weight (v2) | CTGAN + weights (main) | WA precision | 5 | 0.9164 | 0.3973 | 0.5191 | 5 | 0.0062 | 0.0310 | 0.0625 | 0.5000 |
| CTGAN no-weight (v2) | CTGAN + weights (main) | WA recall | 5 | 0.7444 | 1.0000 | -0.2556 | 0 | 0.0732 | 0.2195 | 0.2500 | 0.5000 |
| CTGAN no-weight (v2) | CTGAN + weights (main) | WA F1 | 5 | 0.7970 | 0.5465 | 0.2505 | 4 | 0.0749 | 0.2195 | 0.1250 | 0.5000 |
| CTGAN no-weight (v2) | SMOTE + weights | Macro F1 | 5 | 0.8655 | 0.7921 | 0.0733 | 5 | 0.0022 | 0.0151 | 0.0625 | 0.5000 |
| CTGAN no-weight (v2) | SMOTE + weights | WA precision | 5 | 0.9164 | 0.2450 | 0.6714 | 5 | 0.0001 | 0.0006 | 0.0625 | 0.5000 |
| CTGAN no-weight (v2) | SMOTE + weights | WA recall | 5 | 0.7444 | 1.0000 | -0.2556 | 0 | 0.0732 | 0.2195 | 0.2500 | 0.5000 |
| CTGAN no-weight (v2) | SMOTE + weights | WA F1 | 5 | 0.7970 | 0.3899 | 0.4071 | 5 | 0.0041 | 0.0243 | 0.0625 | 0.5000 |
