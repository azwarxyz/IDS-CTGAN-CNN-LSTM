let detectionChart = null;
let lastBatchResult = null;

document.addEventListener('DOMContentLoaded', () => {
    // Clock widget
    const timeDisplay = document.getElementById('current-time');
    setInterval(() => {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
    }, 1000);

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view-section');
    const titleText = document.getElementById('page-title-text');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update title
            titleText.textContent = link.innerText.trim();

            // Show target section
            sections.forEach(sec => {
                if(sec.id === targetId) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });
        });
    });

    // Single Prediction Logic
    const btnSingle = document.getElementById('btn-analyze-single');
    const singleInput = document.getElementById('log-input');
    const singleLoading = document.getElementById('single-loading');
    const singleResult = document.getElementById('single-result-content');
    const singleError = document.getElementById('single-error');

    btnSingle.addEventListener('click', async () => {
        const data = singleInput.value.trim();
        if(!data) return;

        // UI States
        singleResult.classList.add('hidden');
        singleError.classList.add('hidden');
        singleLoading.classList.remove('hidden');
        btnSingle.disabled = true;

        try {
            const response = await fetch('/api/predict_single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ log_data: data })
            });
            const result = await response.json();

            // Simulate slight delay for dramatic effect
            setTimeout(() => {
                singleLoading.classList.add('hidden');
                btnSingle.disabled = false;

                if (result.status === 'success') {
                    // Update UI
                    const badge = document.getElementById('status-badge');
                    const badgeIcon = badge.querySelector('.icon');
                    const badgeLabel = badge.querySelector('.label');
                    
                    document.getElementById('conf-score').textContent = result.confidence + '%';
                    document.getElementById('feat-count').textContent = result.features_count;

                    badge.className = 'status-badge ' + (result.class === 0 ? 'safe' : 'danger');
                    badgeIcon.className = result.class === 0 ? 'ph ph-shield-check icon' : 'ph ph-warning-octagon icon';
                    badgeLabel.textContent = result.prediction.toUpperCase();
                    
                    singleResult.classList.remove('hidden');
                } else {
                    singleError.querySelector('.msg').textContent = result.message;
                    singleError.classList.remove('hidden');
                }
            }, 800);
            
        } catch (error) {
            singleLoading.classList.add('hidden');
            btnSingle.disabled = false;
            singleError.querySelector('.msg').textContent = 'Koneksi ke server terputus.';
            singleError.classList.remove('hidden');
        }
    });

    // Batch Prediction Logic
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const btnBatch = document.getElementById('btn-analyze-batch');
    
    const batchLoading = document.getElementById('batch-loading');
    const batchResultsPanel = document.getElementById('batch-results-panel');
    const batchResultContent = document.getElementById('batch-result-content');

    let selectedFile = null;

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.name.endsWith('.csv')) {
            fileInfo.textContent = 'Error: Format file harus .csv';
            fileInfo.classList.remove('text-green');
            fileInfo.classList.add('text-danger', 'hidden');
            fileInfo.classList.remove('hidden');
            btnBatch.classList.add('disabled');
            btnBatch.disabled = true;
            return;
        }
        selectedFile = file;
        fileInfo.textContent = `File siap: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileInfo.classList.add('text-green');
        fileInfo.classList.remove('text-danger', 'hidden');
        
        btnBatch.classList.remove('disabled');
        btnBatch.disabled = false;
        batchResultsPanel.classList.add('hidden');
    }

    btnBatch.addEventListener('click', async () => {
        if (!selectedFile) return;

        batchResultsPanel.classList.remove('hidden');
        batchResultContent.classList.add('hidden');
        batchLoading.classList.remove('hidden');
        btnBatch.disabled = true;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/predict_batch', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            batchLoading.classList.add('hidden');
            btnBatch.disabled = false;

            if (result.status === 'success') {
                lastBatchResult = result;
                document.getElementById('btn-export-csv').classList.remove('hidden');

                // Render Chart.js
                const ctx = document.getElementById('detectionChart').getContext('2d');
                if (detectionChart) {
                    detectionChart.destroy();
                }
                
                Chart.defaults.color = '#8b9bb4';
                detectionChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Benign (Normal)', 'Attack (DDoS)'],
                        datasets: [{
                            data: [result.benign_count, result.attack_count],
                            backgroundColor: ['#00ff88', '#ff4757'],
                            borderColor: ['#1e2532', '#1e2532'],
                            borderWidth: 3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: '#8b9bb4',
                                    font: { size: 14 }
                                }
                            }
                        },
                        cutout: '70%'
                    }
                });

                // Update numbers with animation (simplified)
                document.getElementById('b-total').textContent = result.total_samples.toLocaleString();
                document.getElementById('b-safe').textContent = result.benign_count.toLocaleString();
                document.getElementById('b-attack').textContent = result.attack_count.toLocaleString();
                
                const pct = result.attack_percentage;
                const bPctEl = document.getElementById('b-percentage');
                bPctEl.textContent = pct + '%';
                
                // Color formatting based on threat level
                if (pct < 5) bPctEl.className = 'font-bold text-green';
                else if (pct < 20) bPctEl.className = 'font-bold text-warning';
                else bPctEl.className = 'font-bold text-danger';

                // Progress bar animation
                setTimeout(() => {
                    document.getElementById('b-progress').style.width = pct + '%';
                }, 100);

                // Update Waktu Eksekusi
                if(result.processing_time_sec !== undefined) {
                    document.getElementById('b-time').textContent = result.processing_time_sec + ' detik';
                }

                // Tampilkan log sampel serangan jika ada
                const attackPanel = document.getElementById('attack-logs-panel');
                const indicesList = document.getElementById('attack-indices-list');
                indicesList.innerHTML = ''; // Kosongkan dulu
                
                if(result.attack_indices && result.attack_indices.length > 0) {
                    result.attack_indices.forEach(idx => {
                        const badge = document.createElement('span');
                        badge.className = 'status-badge danger';
                        badge.style.padding = '4px 8px';
                        badge.style.fontSize = '0.8rem';
                        badge.innerHTML = `<i class="ph ph-bug"></i> Baris ${idx}`;
                        indicesList.appendChild(badge);
                    });
                    
                    if(result.attack_count > 10) {
                        const more = document.createElement('span');
                        more.className = 'text-muted text-sm';
                        more.style.padding = '4px 8px';
                        more.textContent = `... dan ${(result.attack_count - 10).toLocaleString()} serangan lainnya`;
                        indicesList.appendChild(more);
                    }
                    
                    attackPanel.classList.remove('hidden');
                } else {
                    attackPanel.classList.add('hidden');
                }

                batchResultContent.classList.remove('hidden');
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            batchLoading.classList.add('hidden');
            btnBatch.disabled = false;
            alert("Terjadi kesalahan jaringan.");
        }
    });

});

    // Export CSV Logic
    document.getElementById('btn-export-csv').addEventListener('click', () => {
        if (!lastBatchResult) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric,Value\n";
        csvContent += `Total Samples,${lastBatchResult.total_samples}\n`;
        csvContent += `Benign (Normal),${lastBatchResult.benign_count}\n`;
        csvContent += `Attack (DDoS),${lastBatchResult.attack_count}\n`;
        csvContent += `Threat Level (%),${lastBatchResult.attack_percentage}\n`;
        csvContent += `Inference Time (sec),${lastBatchResult.processing_time_sec}\n`;
        
        if(lastBatchResult.attack_indices && lastBatchResult.attack_indices.length > 0) {
            csvContent += `\nSample Attack Row Indices,${lastBatchResult.attack_indices.join(" | ")}\n`;
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_Deteksi_IDS_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Live Monitoring Logic
    const btnStartStream = document.getElementById('btn-start-stream');
    const btnStopStream = document.getElementById('btn-stop-stream');
    const liveFileInput = document.getElementById('live-file-input');
    const liveFileInfo = document.getElementById('live-file-info');
    const liveDashboardPanel = document.getElementById('live-dashboard-panel');
    const liveAlertBanner = document.getElementById('live-alert-banner');
    const liveStatusBadge = document.getElementById('live-status-badge');
    
    let liveSelectedFile = null;
    let liveInterval = null;
    let liveChartInstance = null;
    let liveTotalSamples = 0;
    let liveBenignTotal = 0;
    let liveAttackTotal = 0;
    
    let chartTimeLabels = [];
    let chartBenignData = [];
    let chartAttackData = [];
    const MAX_DATA_POINTS = 60; // Tampilkan 60 detik terakhir
    
    liveFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            if (!file.name.endsWith('.csv')) {
                liveFileInfo.textContent = 'Error: Format file harus .csv';
                liveFileInfo.className = 'mt-2 text-sm text-danger';
                liveFileInfo.classList.remove('hidden');
                btnStartStream.classList.add('disabled');
                btnStartStream.disabled = true;
                return;
            }
            liveSelectedFile = file;
            liveFileInfo.textContent = `File Stream: ${file.name}`;
            liveFileInfo.className = 'mt-2 text-sm text-green';
            liveFileInfo.classList.remove('hidden');
            btnStartStream.classList.remove('disabled');
            btnStartStream.disabled = false;
        }
    });
    
    btnStartStream.addEventListener('click', async () => {
        if (!liveSelectedFile) return;
        
        btnStartStream.disabled = true;
        btnStartStream.innerHTML = '<div class="radar-spinner" style="width:20px; height:20px; display:inline-block; margin-right:10px;"></div> Mempersiapkan Stream...';
        
        const formData = new FormData();
        formData.append('file', liveSelectedFile);
        
        try {
            const response = await fetch('/api/start_stream', { method: 'POST', body: formData });
            const result = await response.json();
            
            if (result.status === 'success') {
                btnStartStream.classList.add('hidden');
                btnStopStream.classList.remove('hidden');
                liveDashboardPanel.classList.remove('hidden');
                
                // Reset variables
                liveTotalSamples = 0; liveBenignTotal = 0; liveAttackTotal = 0;
                chartTimeLabels = []; chartBenignData = []; chartAttackData = [];
                document.getElementById('l-total').textContent = '0';
                document.getElementById('l-safe').textContent = '0';
                document.getElementById('l-attack').textContent = '0';
                liveAlertBanner.classList.add('hidden');
                
                initLiveChart();
                liveInterval = setInterval(pollLiveStream, 1000);
            } else {
                alert("Error start stream: " + result.message);
                btnStartStream.disabled = false;
                btnStartStream.innerHTML = '<i class="ph ph-broadcast"></i> MULAI LIVE STREAM';
            }
        } catch(e) {
            alert("Koneksi gagal.");
            btnStartStream.disabled = false;
            btnStartStream.innerHTML = '<i class="ph ph-broadcast"></i> MULAI LIVE STREAM';
        }
    });
    
    btnStopStream.addEventListener('click', () => {
        clearInterval(liveInterval);
        btnStopStream.classList.add('hidden');
        btnStartStream.classList.remove('hidden');
        btnStartStream.disabled = false;
        btnStartStream.innerHTML = '<i class="ph ph-broadcast"></i> MULAI LIVE STREAM';
    });
    
    function initLiveChart() {
        const ctx = document.getElementById('liveChart').getContext('2d');
        if (liveChartInstance) liveChartInstance.destroy();
        
        liveChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartTimeLabels,
                datasets: [
                    {
                        label: 'Normal Traffic/sec',
                        data: chartBenignData,
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'DDoS Attacks/sec',
                        data: chartAttackData,
                        borderColor: '#ff4757',
                        backgroundColor: 'rgba(255, 71, 87, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 }, // matikan animasi agar responsif saat polling
                scales: {
                    x: { ticks: { color: '#8b9bb4' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#8b9bb4' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
                },
                plugins: {
                    legend: { labels: { color: '#8b9bb4' } }
                }
            }
        });
    }
    
    async function pollLiveStream() {
        try {
            const response = await fetch('/api/poll_stream');
            const result = await response.json();
            
            if (result.status === 'eof') {
                clearInterval(liveInterval);
                btnStopStream.click();
                alert("Simulasi Selesai: Semua baris data dari file CSV telah dialirkan.");
                return;
            }
            
            if (result.status === 'success') {
                // Update total angkanya
                liveTotalSamples += (result.benign_count + result.attack_count);
                liveBenignTotal += result.benign_count;
                liveAttackTotal += result.attack_count;
                
                document.getElementById('l-total').textContent = liveTotalSamples.toLocaleString();
                document.getElementById('l-safe').textContent = liveBenignTotal.toLocaleString();
                document.getElementById('l-attack').textContent = liveAttackTotal.toLocaleString();
                
                // Update Alert Banner & Status
                if (result.attack_count > 0) {
                    liveAlertBanner.classList.remove('hidden');
                    liveStatusBadge.className = 'status-badge danger';
                    liveStatusBadge.innerHTML = '<i class="ph-fill ph-warning-octagon"></i> KRITIS';
                } else {
                    liveAlertBanner.classList.add('hidden');
                    liveStatusBadge.className = 'status-badge safe';
                    liveStatusBadge.innerHTML = '<i class="ph-fill ph-shield-check"></i> AMAN';
                }
                
                // Update Line Chart
                const now = new Date();
                const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                                now.getMinutes().toString().padStart(2, '0') + ':' + 
                                now.getSeconds().toString().padStart(2, '0');
                                
                chartTimeLabels.push(timeStr);
                chartBenignData.push(result.benign_count);
                chartAttackData.push(result.attack_count);
                
                // Jika titik data lebih dari 60 (1 menit), geser (shift) ke kiri
                if (chartTimeLabels.length > MAX_DATA_POINTS) {
                    chartTimeLabels.shift();
                    chartBenignData.shift();
                    chartAttackData.shift();
                }
                
                liveChartInstance.update();
                
                if (result.is_eof) {
                    clearInterval(liveInterval);
                    btnStopStream.click();
                    alert("Simulasi Selesai: Ujung file (End of File) telah dicapai.");
                }
            }
        } catch(e) {
            console.error("Polling stream gagal:", e);
        }
    }
