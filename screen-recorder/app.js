function init() {
    // DOM要素の取得
    const btnStartRecord = document.getElementById('btn-start-record');
    const btnStopRecord = document.getElementById('btn-stop-record');
    const recordingStatus = document.getElementById('recording-status');
    const recordTimer = document.getElementById('record-timer');

    const gifConvertGroup = document.getElementById('gif-convert-group');
    const paramGifFps = document.getElementById('param-gif-fps');
    const paramGifWidth = document.getElementById('param-gif-width');
    const paramTrimStart = document.getElementById('param-trim-start');
    const paramTrimEnd = document.getElementById('param-trim-end');
    const valTrimStart = document.getElementById('val-trim-start');
    const valTrimEnd = document.getElementById('val-trim-end');
    const btnConvertGif = document.getElementById('btn-convert-gif');

    const videoPlaceholder = document.getElementById('video-placeholder');
    const recordedVideo = document.getElementById('recorded-video');
    const videoDownloadBar = document.getElementById('video-download-bar');
    const btnDownloadVideo = document.getElementById('btn-download-video');

    const cardGifPreview = document.getElementById('card-gif-preview');
    const gifPlaceholder = document.getElementById('gif-placeholder');
    const gifProgressContainer = document.getElementById('gif-progress-container');
    const gifProgressFill = document.getElementById('gif-progress-fill');
    const gifPreviewImg = document.getElementById('gif-preview-img');
    const gifDownloadBar = document.getElementById('gif-download-bar');
    const btnDownloadGif = document.getElementById('btn-download-gif');

    const proStatusBtn = document.getElementById('pro-status-btn');
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // アプリ状態
    let isRecording = false;
    let mediaStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let videoUrl = null;
    let videoBlob = null;
    let videoDuration = 0;
    
    let timerIntervalId = null;
    let elapsedSeconds = 0;
    
    let generatedGifBlob = null;

    let isProUnlocked = false;
    try {
        isProUnlocked = localStorage.getItem('t9s_pro_unlocked') === 'true';
    } catch (e) {
        console.warn('localStorage access failed:', e);
    }
    const PRO_KEY = 'T9S-PC-FUND-2026';

    // 1. Proアンロック状態の表示更新
    function updateProUI() {
        if (isProUnlocked) {
            proStatusBtn.innerHTML = '💎 Pro Unlocked';
            proStatusBtn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
            proStatusBtn.style.color = '#000';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'none';
            });
            // 各種高度な設定のロック解除
            paramGifFps.removeAttribute('disabled');
            paramGifWidth.removeAttribute('disabled');
            paramTrimStart.removeAttribute('disabled');
            paramTrimEnd.removeAttribute('disabled');
        } else {
            proStatusBtn.innerHTML = '💎 Get Pro';
            proStatusBtn.style.background = '';
            proStatusBtn.style.color = '';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'inline-block';
            });
            paramGifFps.setAttribute('disabled', 'true');
            paramGifWidth.setAttribute('disabled', 'true');
            paramTrimStart.setAttribute('disabled', 'true');
            paramTrimEnd.setAttribute('disabled', 'true');
        }
    }
    updateProUI();

    // トースト通知の表示
    function showToast(message) {
        toastNotification.textContent = message;
        toastNotification.classList.remove('hidden');
        toastNotification.style.opacity = 1;
        setTimeout(() => {
            toastNotification.style.opacity = 0;
            setTimeout(() => {
                toastNotification.classList.add('hidden');
            }, 300);
        }, 2500);
    }

    // 2. 録画時間タイマー制御
    function startTimer() {
        elapsedSeconds = 0;
        updateTimerText();
        timerIntervalId = setInterval(() => {
            elapsedSeconds++;
            updateTimerText();
        }, 1000);
    }

    function stopTimer() {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
    }

    function updateTimerText() {
        const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
        const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
        recordTimer.textContent = `${mins}:${secs}`;
    }

    // 3. 画面録画の開始・停止
    btnStartRecord.addEventListener('click', async () => {
        recordedChunks = [];
        try {
            // 画面共有ストリーム取得
            mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    frameRate: { ideal: 30 }
                },
                audio: false
            });

            // 録画停止イベントのハンドリング（ブラウザのUIから「共有を停止」が押されたとき等）
            mediaStream.getVideoTracks()[0].onended = () => {
                if (isRecording) {
                    stopRecordingProcess();
                }
            };

            mediaRecorder = new MediaRecorder(mediaStream, {
                mimeType: 'video/webm;codecs=vp9' // 高画質WebM
            });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                processRecordedVideo();
            };

            // 録画開始
            mediaRecorder.start();
            isRecording = true;

            // UI切り替え
            btnStartRecord.classList.add('hidden');
            btnStopRecord.classList.remove('hidden');
            recordingStatus.classList.remove('hidden');
            startTimer();

            showToast('🎥 録画を開始しました。');

        } catch (err) {
            console.error('getDisplayMedia failed:', err);
            showToast('❌ 画面キャプチャの開始に失敗しました。');
        }
    });

    btnStopRecord.addEventListener('click', () => {
        stopRecordingProcess();
    });

    function stopRecordingProcess() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        isRecording = false;
        
        btnStartRecord.classList.remove('hidden');
        btnStopRecord.classList.add('hidden');
        recordingStatus.classList.add('hidden');
        stopTimer();
    }

    // 4. 録画された動画の処理とロード
    function processRecordedVideo() {
        videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }
        videoUrl = URL.createObjectURL(videoBlob);
        
        videoPlaceholder.classList.add('hidden');
        recordedVideo.classList.remove('hidden');
        recordedVideo.src = videoUrl;
        videoDownloadBar.classList.remove('hidden');
        
        // GIF変換エリアを表示
        gifConvertGroup.style.display = 'block';
        cardGifPreview.style.display = 'flex';
        gifPlaceholder.classList.remove('hidden');
        gifPreviewImg.classList.add('hidden');
        gifDownloadBar.classList.add('hidden');

        // トリミングスライダーの初期化 (メタデータ読み込み後に最大値を設定)
        recordedVideo.onloadedmetadata = () => {
            videoDuration = recordedVideo.duration;
            
            // トリミング範囲スライダーの設定
            paramTrimStart.max = Math.max(0, videoDuration - 0.5).toFixed(1);
            paramTrimStart.value = 0;
            valTrimStart.textContent = '0.0s';
            
            paramTrimEnd.max = videoDuration.toFixed(1);
            paramTrimEnd.value = videoDuration.toFixed(1);
            valTrimEnd.textContent = videoDuration.toFixed(1) + 's';
        };

        showToast('✔️ 動画の読み込みが完了しました。エフェクト・GIF変換が可能です。');
    }

    // 5. トリミングスライダー変更時の連携
    paramTrimStart.addEventListener('input', (e) => {
        const startVal = parseFloat(e.target.value);
        valTrimStart.textContent = startVal.toFixed(1) + 's';
        
        // 開始時間が終了時間を超えないように制御
        const endVal = parseFloat(paramTrimEnd.value);
        if (startVal >= endVal) {
            paramTrimEnd.value = (startVal + 0.5).toFixed(1);
            valTrimEnd.textContent = paramTrimEnd.value + 's';
        }
    });

    paramTrimEnd.addEventListener('input', (e) => {
        const endVal = parseFloat(e.target.value);
        valTrimEnd.textContent = endVal.toFixed(1) + 's';
        
        // 終了時間が開始時間を下回らないように制御
        const startVal = parseFloat(paramTrimStart.value);
        if (endVal <= startVal) {
            paramTrimStart.value = Math.max(0, endVal - 0.5).toFixed(1);
            valTrimStart.textContent = paramTrimStart.value + 's';
        }
    });

    // 6. GIF変換エンジン (gifshot)
    btnConvertGif.addEventListener('click', () => {
        if (!videoUrl) {
            showToast('⚠️ 録画された動画データがありません。');
            return;
        }

        gifPlaceholder.classList.add('hidden');
        gifProgressContainer.classList.remove('hidden');
        gifPreviewImg.classList.add('hidden');
        gifDownloadBar.classList.add('hidden');
        gifProgressFill.style.width = '0%';
        btnConvertGif.disabled = true;

        // トリミングパラメータ（Pro版アンロック時のみ適用）
        const trimStart = isProUnlocked ? parseFloat(paramTrimStart.value) : 0;
        const trimEnd = isProUnlocked ? parseFloat(paramTrimEnd.value) : Math.min(5.0, videoDuration); // Freeは最初の最大5秒のみ

        const width = isProUnlocked ? parseInt(paramGifWidth.value) : 320; // Freeは320px固定
        const fps = isProUnlocked ? parseInt(paramGifFps.value) : 10; // Freeは10FPS固定
        const duration = trimEnd - trimStart;

        // プログレスバーのモック進行アニメーション (gifshotは詳細な割合が取れないため完了間際で90%で維持)
        let progress = 0;
        const intervalId = setInterval(() => {
            progress += 5;
            if (progress > 90) {
                clearInterval(intervalId);
            } else {
                gifProgressFill.style.width = progress + '%';
            }
        }, 300);

        // gifshotによるGIF生成
        gifshot.createGIF({
            video: videoUrl,
            gifWidth: width,
            interval: 1 / fps,
            numFrames: Math.ceil(duration * fps),
            offset: trimStart,
            sampleInterval: 10,
            numWorkers: 2
        }, (obj) => {
            clearInterval(intervalId);
            btnConvertGif.disabled = false;
            
            if (!obj.error) {
                const base64Image = obj.image;
                
                // base64をBlobに変換
                fetch(base64Image)
                    .then(res => res.blob())
                    .then(blob => {
                        generatedGifBlob = blob;
                        
                        gifProgressContainer.classList.add('hidden');
                        gifPreviewImg.classList.remove('hidden');
                        gifPreviewImg.src = URL.createObjectURL(generatedGifBlob);
                        gifDownloadBar.classList.remove('hidden');
                        showToast('🎉 GIF画像への変換が完了しました！');
                    });
            } else {
                console.error('gifshot error:', obj.error);
                gifProgressContainer.classList.add('hidden');
                gifPlaceholder.classList.remove('hidden');
                showToast('❌ GIFへの変換中にエラーが発生しました。');
            }
        });
    });

    // 7. ダウンロード処理
    btnDownloadVideo.addEventListener('click', () => {
        if (!videoBlob) return;
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `t9s-screenrecord-${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    btnDownloadGif.addEventListener('click', () => {
        if (!generatedGifBlob) return;
        const url = URL.createObjectURL(generatedGifBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `t9s-gif-${Date.now()}.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 8. Proアンロックモーダル
    function openProModal() {
        proModal.classList.add('active');
    }

    function closeProModal() {
        proModal.classList.remove('active');
        keyErrorMsg.classList.add('hidden');
        proKeyInput.value = '';
    }

    proStatusBtn.addEventListener('click', () => {
        if (!isProUnlocked) {
            openProModal();
        } else {
            showToast('💎 Pro機能はすでにアンロックされています！');
        }
    });

    closeModalBtn.addEventListener('click', closeProModal);
    
    proModal.addEventListener('click', (e) => {
        if (e.target === proModal) {
            closeProModal();
        }
    });

    // キー適用
    btnSubmitKey.addEventListener('click', () => {
        const inputKey = proKeyInput.value.trim().toUpperCase();
        if (inputKey === PRO_KEY) {
            isProUnlocked = true;
            try {
                localStorage.setItem('t9s_pro_unlocked', 'true');
            } catch (e) {
                console.warn('localStorage save failed:', e);
            }
            updateProUI();
            closeProModal();
            showToast('🎉 Pro機能が正常にアンロックされました！');
        } else {
            keyErrorMsg.classList.remove('hidden');
        }
    });
}

// 安全なDOM読み込み監視イニシャライザ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
