### Tahap 1 — filter tahap kedua per seed

| seed | pipeline | accuracy | f1_macro | Web Attack__precision | Web Attack__recall | Web Attack__f1 | n_rerouted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 42 | cnn_lstm_only | 0.9710 | 0.8591 | 0.9375 | 0.6250 | 0.7500 | 0 |
| 42 | cnn_lstm_then_lightgbm | 0.9710 | 0.8623 | 1.0000 | 0.6250 | 0.7692 | 3 |
| 123 | cnn_lstm_only | 0.9697 | 0.8407 | 0.9737 | 0.5139 | 0.6727 | 0 |
| 123 | cnn_lstm_then_lightgbm | 0.9697 | 0.8417 | 1.0000 | 0.5139 | 0.6789 | 1 |
| 456 | cnn_lstm_only | 0.9708 | 0.8920 | 0.9114 | 1.0000 | 0.9536 | 0 |
| 456 | cnn_lstm_then_lightgbm | 0.9708 | 0.8974 | 0.9730 | 1.0000 | 0.9863 | 5 |
| 789 | cnn_lstm_only | 0.9710 | 0.8553 | 0.9767 | 0.5833 | 0.7304 | 0 |
| 789 | cnn_lstm_then_lightgbm | 0.9710 | 0.8564 | 1.0000 | 0.5833 | 0.7368 | 1 |
| 1024 | cnn_lstm_only | 0.9712 | 0.8803 | 0.7826 | 1.0000 | 0.8780 | 0 |
| 1024 | cnn_lstm_then_lightgbm | 0.9712 | 0.8984 | 0.9730 | 1.0000 | 0.9863 | 18 |
