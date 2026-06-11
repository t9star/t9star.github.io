function init() {
    // DOM要素の取得
    const sourceTabBtns = document.querySelectorAll('.tab-btn');
    const sourceSynthGroup = document.getElementById('source-synth-group');
    const sourceMicGroup = document.getElementById('source-mic-group');
    const proStatusBtn = document.getElementById('pro-status-btn');

    // シンセパラメータ
    const paramWaveform = document.getElementById('param-waveform');
    const paramFrequency = document.getElementById('param-frequency');
    const valFrequency = document.getElementById('val-frequency');
    
    // ADSR
    const paramAdsrA = document.getElementById('param-adsr-a');
    const paramAdsrD = document.getElementById('param-adsr-d');
    const paramAdsrS = document.getElementById('param-adsr-s');
    const paramAdsrR = document.getElementById('param-adsr-r');
    const valAdsrA = document.getElementById('val-adsr-a');
    const valAdsrD = document.getElementById('val-adsr-d');
    const valAdsrS = document.getElementById('val-adsr-s');
    const valAdsrR = document.getElementById('val-adsr-r');

    // マイクパラメータ
    const btnRecordMic = document.getElementById('btn-record-mic');
    const recordTimer = document.getElementById('record-timer');
    const recordProgressContainer = document.getElementById('record-progress-container');
    const recordProgressFill = document.getElementById('record-progress-fill');
    const sampleInfoBox = document.getElementById('sample-info-box');
    const sampleDuration = document.getElementById('sample-duration');

    // 共通エフェクト
    const durationSliderField = document.getElementById('duration-slider-field');
    const paramDuration = document.getElementById('param-duration');
    const valDuration = document.getElementById('val-duration');
    
    const paramPitch = document.getElementById('param-pitch');
    const valPitch = document.getElementById('val-pitch');
    
    const paramDelay = document.getElementById('param-delay');
    const valDelay = document.getElementById('val-delay');
    const paramFeedback = document.getElementById('param-feedback');
    const valFeedback = document.getElementById('val-feedback');

    const paramFilterType = document.getElementById('param-filter-type');
    const paramCutoff = document.getElementById('param-cutoff');
    const valCutoff = document.getElementById('val-cutoff');

    const paramDistortion = document.getElementById('param-distortion');
    const valDistortion = document.getElementById('val-distortion');

    const paramReverse = document.getElementById('param-reverse');

    // アクションボタン
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');
    const btnDownloadWav = document.getElementById('btn-download-wav');
    const randomButtons = document.querySelectorAll('.random-buttons button[data-random]');
    const btnRandomize = document.getElementById('btn-randomize');

    // プリセット
    const presetNameInput = document.getElementById('preset-name-input');
    const btnSavePreset = document.getElementById('btn-save-preset');
    const selectPresets = document.getElementById('select-presets');

    // モーダル・トースト
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // ビジュアライザー Canvas
    const canvas = document.getElementById('visualizer-canvas');
    const canvasCtx = canvas.getContext('2d');

    // アプリ状態
    let currentSourceType = 'synth'; // 'synth' or 'mic'
    let isProUnlocked = false;
    try {
        isProUnlocked = localStorage.getItem('t9s_pro_unlocked') === 'true';
    } catch (e) {
        console.warn('localStorage access failed:', e);
    }
    const PRO_KEY = 'T9S-PC-FUND-2026';

    // 音声バッファ (マイク録音用)
    let recordedAudioBuffer = null;
    let micStream = null;
    let mediaRecorder = null;
    let recordingInterval = null;
    let recordedChunks = [];
    let isRecording = false;

    // Web Audio API 再生用
    let audioCtx = null;
    let currentSourceNode = null;
    let currentGainNode = null;
    let currentDelayNode = null;
    let currentFeedbackNode = null;
    let animationFrameId = null;

    // 1. Proアンロック状態の表示更新
    function updateProUI() {
        if (isProUnlocked) {
            proStatusBtn.innerHTML = '💎 Pro Unlocked';
            proStatusBtn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
            proStatusBtn.style.color = '#000';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'none';
            });
            // プリセットUIを有効化
            presetNameInput.removeAttribute('disabled');
            btnSavePreset.removeAttribute('disabled');
            selectPresets.removeAttribute('disabled');
        } else {
            proStatusBtn.innerHTML = '💎 Get Pro';
            proStatusBtn.style.background = '';
            proStatusBtn.style.color = '';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'inline-block';
            });
            presetNameInput.setAttribute('disabled', 'true');
            btnSavePreset.setAttribute('disabled', 'true');
            selectPresets.setAttribute('disabled', 'true');
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

    // Canvas の解像度フィット
    function resizeCanvas() {
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height || 250;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Canvas背景グリッド描画
    function drawGrid() {
        canvasCtx.fillStyle = '#060913';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        canvasCtx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
        canvasCtx.lineWidth = 1;
        
        // 縦線
        for (let i = 0; i < canvas.width; i += 40) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(i, 0);
            canvasCtx.lineTo(i, canvas.height);
            canvasCtx.stroke();
        }
        
        // 横線
        for (let j = 0; j < canvas.height; j += 40) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, j);
            canvasCtx.lineTo(canvas.width, j);
            canvasCtx.stroke();
        }

        // 中心線
        canvasCtx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, canvas.height / 2);
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
    drawGrid();

    // 2. タブ切り替え
    sourceTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sourceTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSourceType = btn.dataset.source;

            if (currentSourceType === 'synth') {
                sourceSynthGroup.classList.remove('hidden');
                sourceMicGroup.classList.add('hidden');
                durationSliderField.classList.remove('hidden');
            } else {
                sourceSynthGroup.classList.add('hidden');
                sourceMicGroup.classList.remove('hidden');
                durationSliderField.classList.add('hidden'); // マイク録音はサンプル自体の長さがベース
            }
        });
    });

    // 3. パラメータ変更のリアルタイム検知
    paramFrequency.addEventListener('input', (e) => {
        valFrequency.textContent = e.target.value + ' Hz';
    });
    paramAdsrA.addEventListener('input', (e) => {
        valAdsrA.textContent = e.target.value + 's';
    });
    paramAdsrD.addEventListener('input', (e) => {
        valAdsrD.textContent = e.target.value + 's';
    });
    paramAdsrS.addEventListener('input', (e) => {
        valAdsrS.textContent = e.target.value + '%';
    });
    paramAdsrR.addEventListener('input', (e) => {
        valAdsrR.textContent = e.target.value + 's';
    });
    paramDuration.addEventListener('input', (e) => {
        valDuration.textContent = e.target.value + 's';
    });
    paramPitch.addEventListener('input', (e) => {
        valPitch.textContent = e.target.value + 'x';
    });
    paramDelay.addEventListener('input', (e) => {
        valDelay.textContent = e.target.value + 's';
    });
    paramFeedback.addEventListener('input', (e) => {
        valFeedback.textContent = e.target.value + '%';
    });
    paramCutoff.addEventListener('input', (e) => {
        valCutoff.textContent = e.target.value + 'Hz';
    });
    paramDistortion.addEventListener('input', (e) => {
        valDistortion.textContent = e.target.value + '%';
    });

    // Pro機能制限チェック
    paramReverse.addEventListener('change', (e) => {
        if (e.target.checked && !isProUnlocked) {
            e.target.checked = false;
            openProModal();
        }
    });

    // AudioContext の取得（必要に応じて初期化）
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // 4. マイク録音ロジック
    btnRecordMic.addEventListener('click', async () => {
        const ctx = getAudioContext();
        if (isRecording) {
            // 録音停止
            stopRecording();
        } else {
            // 録音開始
            startRecording();
        }
    });

    async function startRecording() {
        recordedChunks = [];
        isRecording = true;
        btnRecordMic.innerHTML = '⏹️ Stop Recording';
        btnRecordMic.style.background = '#ef4444';
        recordProgressContainer.classList.remove('hidden');
        sampleInfoBox.classList.add('hidden');

        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(micStream);
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                const arrayBuffer = await blob.arrayBuffer();
                
                // AudioBuffer へデコード
                getAudioContext().decodeAudioData(arrayBuffer, (decodedBuffer) => {
                    recordedAudioBuffer = decodedBuffer;
                    sampleInfoBox.classList.remove('hidden');
                    sampleDuration.textContent = decodedBuffer.duration.toFixed(2) + 's';
                    showToast('🎙️ 音声サンプリングが成功しました！');
                }, (err) => {
                    console.error('Decode audio data failed:', err);
                    showToast('❌ 音声デコードに失敗しました。');
                });

                // ストリームのクローズ
                micStream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();

            // プログレスバーとタイマーの同期
            let elapsed = 0;
            const limit = 10; // 10秒制限
            recordProgressFill.style.width = '0%';
            recordTimer.textContent = '0.0s';

            recordingInterval = setInterval(() => {
                elapsed += 0.1;
                recordTimer.textContent = elapsed.toFixed(1) + 's';
                recordProgressFill.style.width = (elapsed / limit) * 100 + '%';

                if (elapsed >= limit) {
                    stopRecording();
                }
            }, 100);

        } catch (err) {
            console.error('Mic access failed:', err);
            showToast('❌ マイクへのアクセスが拒否されました。');
            resetRecordUI();
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        resetRecordUI();
    }

    function resetRecordUI() {
        isRecording = false;
        btnRecordMic.innerHTML = '⏺️ Record (最大10秒)';
        btnRecordMic.style.background = '';
        recordProgressContainer.classList.add('hidden');
        if (recordingInterval) {
            clearInterval(recordingInterval);
        }
    }

    // 5. ディストーション用ウェーブシェーパーカーブ生成
    function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    // 6. 音波ビジュアライザー起動
    function setupVisualizer(analyserNode) {
        analyserNode.fftSize = 512;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        function draw() {
            animationFrameId = requestAnimationFrame(draw);
            analyserNode.getByteTimeDomainData(dataArray);

            drawGrid();

            canvasCtx.lineWidth = 2.5;
            canvasCtx.strokeStyle = 'var(--neon-blue)';
            canvasCtx.shadowColor = 'var(--primary)';
            canvasCtx.shadowBlur = 8;
            canvasCtx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0; // 0.0 〜 2.0
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
            canvasCtx.shadowBlur = 0; // シャドウをオフに戻す
        }
        draw();
    }

    // 7. 再生エンジン (Web Audio API)
    function playSound() {
        stopSound(); // 多重再生防止

        const ctx = getAudioContext();
        const startTime = ctx.currentTime;

        // ノード構築
        let sourceNode = null;
        let playDuration = 0;

        // 共通エフェクトパラメータ取得
        const pitchFactor = parseFloat(paramPitch.value);
        const delayTime = parseFloat(paramDelay.value);
        const feedbackVal = parseInt(paramFeedback.value) / 100;
        const filterType = paramFilterType.value;
        const cutoffVal = parseInt(paramCutoff.value);
        const distortionVal = parseInt(paramDistortion.value);
        const isReversed = paramReverse.checked && isProUnlocked;

        if (currentSourceType === 'synth') {
            // 1) シンセサイザー音源
            sourceNode = ctx.createOscillator();
            sourceNode.type = paramWaveform.value;
            sourceNode.frequency.setValueAtTime(parseFloat(paramFrequency.value), startTime);
            playDuration = parseFloat(paramDuration.value);
        } else {
            // 2) マイク録音サンプリング音源
            if (!recordedAudioBuffer) {
                showToast('⚠️ サンプリング音声がありません。まず録音してください。');
                return;
            }

            sourceNode = ctx.createBufferSource();
            
            // 逆再生 ⭐Pro
            if (isReversed) {
                const numChannels = recordedAudioBuffer.numberOfChannels;
                const sampleRate = recordedAudioBuffer.sampleRate;
                const length = recordedAudioBuffer.length;
                
                // 新しいリバースバッファを作成
                const reversedBuffer = ctx.createBuffer(numChannels, length, sampleRate);
                for (let c = 0; c < numChannels; c++) {
                    const channelData = recordedAudioBuffer.getChannelData(c);
                    const reversedData = reversedBuffer.getChannelData(c);
                    for (let i = 0; i < length; i++) {
                        reversedData[i] = channelData[length - 1 - i];
                    }
                }
                sourceNode.buffer = reversedBuffer;
            } else {
                sourceNode.buffer = recordedAudioBuffer;
            }

            // ピッチ（速度）調整
            sourceNode.playbackRate.setValueAtTime(pitchFactor, startTime);
            playDuration = recordedAudioBuffer.duration / pitchFactor;
        }

        // 3) ボリュームADSRゲイン設定
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, startTime);

        if (currentSourceType === 'synth') {
            const attack = parseFloat(paramAdsrA.value);
            const decay = parseFloat(paramAdsrD.value);
            const sustain = parseInt(paramAdsrS.value) / 100;
            const release = parseFloat(paramAdsrR.value);

            // ADSRのエンベロープスケジュール
            gainNode.gain.linearRampToValueAtTime(0.8, startTime + attack);
            gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain * 0.8), startTime + attack + decay);
            
            // リリース時間を考慮した合計長
            playDuration = playDuration + release;
        } else {
            // マイクの場合は単純な音量維持
            gainNode.gain.setValueAtTime(0.8, startTime);
        }

        // 4) ディストーション
        let distortionNode = null;
        if (distortionVal > 0) {
            distortionNode = ctx.createWaveShaper();
            distortionNode.curve = makeDistortionCurve(distortionVal * 2.5); // 歪み量を増強
            distortionNode.oversample = '4x';
        }

        // 5) フィルター
        let filterNode = null;
        if (filterType !== 'none') {
            filterNode = ctx.createBiquadFilter();
            filterNode.type = filterType;
            filterNode.frequency.setValueAtTime(cutoffVal, startTime);
        }

        // 6) エコー/ディレイ
        let delayNode = null;
        let feedbackNode = null;
        if (delayTime > 0) {
            delayNode = ctx.createDelay(2.0);
            delayNode.delayTime.setValueAtTime(delayTime, startTime);

            feedbackNode = ctx.createGain();
            feedbackNode.gain.setValueAtTime(feedbackVal, startTime);

            // フィードバックループ接続
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode);
        }

        // 7) アナライザー (ビジュアライザー用)
        const analyserNode = ctx.createAnalyser();

        // エフェクトチェーンの直列接続
        let currentNode = sourceNode;

        currentNode.connect(gainNode);
        currentNode = gainNode;

        if (distortionNode) {
            currentNode.connect(distortionNode);
            currentNode = distortionNode;
        }

        if (filterNode) {
            currentNode.connect(filterNode);
            currentNode = filterNode;
        }

        if (delayNode) {
            // エコーありの場合は並列気味に直接音とディレイ音をブレンド
            const mergerNode = ctx.createGain();
            currentNode.connect(mergerNode); // 直接音
            currentNode.connect(delayNode);  // ディレイインプット
            
            delayNode.connect(mergerNode);   // ディレイアウト
            currentNode = mergerNode;
        }

        currentNode.connect(analyserNode);
        analyserNode.connect(ctx.destination);

        // 再生開始
        sourceNode.start(startTime);

        // 終了タイマー設定 (Synth の場合は ADSR リリーススケジュール)
        if (currentSourceType === 'synth') {
            const release = parseFloat(paramAdsrR.value);
            const stopTime = startTime + parseFloat(paramDuration.value);
            
            // Release の減衰をスケジュール
            gainNode.gain.setValueAtTime(gainNode.gain.value, stopTime);
            gainNode.gain.cancelScheduledValues(stopTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime + release);
            
            sourceNode.stop(stopTime + release);
        } else {
            sourceNode.stop(startTime + playDuration);
        }

        // ビジュアライザーのバインド
        setupVisualizer(analyserNode);

        // 状態保存
        currentSourceNode = sourceNode;
        currentGainNode = gainNode;
        if (delayNode) currentDelayNode = delayNode;
        if (feedbackNode) currentFeedbackNode = feedbackNode;
    }

    function stopSound() {
        if (currentSourceNode) {
            try {
                currentSourceNode.stop();
            } catch (e) {}
            currentSourceNode = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        drawGrid(); // 波形をクリアしてグリッドに戻す
    }

    btnPlay.addEventListener('click', () => {
        getAudioContext();
        playSound();
    });

    btnStop.addEventListener('click', stopSound);

    // 8. WAV出力ロジック (OfflineAudioContext による高速レンダリング)
    btnDownloadWav.addEventListener('click', async () => {
        const ctx = getAudioContext();
        
        let rawDuration = 0.5;
        if (currentSourceType === 'synth') {
            rawDuration = parseFloat(paramDuration.value) + parseFloat(paramAdsrR.value);
        } else {
            if (!recordedAudioBuffer) {
                showToast('⚠️ ダウンロードする音声がありません。');
                return;
            }
            rawDuration = recordedAudioBuffer.duration / parseFloat(paramPitch.value);
        }

        // ディレイ時間（最大フィードバックを考慮して2秒追加）を加算したトータル時間
        const delayTime = parseFloat(paramDelay.value);
        const totalDuration = rawDuration + (delayTime > 0 ? delayTime * 3 : 0);
        
        const sampleRate = 44100;
        const renderLength = Math.ceil(totalDuration * sampleRate);
        const channels = 2; // ステレオ出力

        // オフラインコンテキスト
        const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(channels, renderLength, sampleRate);
        const startTime = 0;

        // ノード構築 (offlineCtx上)
        let sourceNode = null;
        const pitchFactor = parseFloat(paramPitch.value);
        const feedbackVal = parseInt(paramFeedback.value) / 100;
        const filterType = paramFilterType.value;
        const cutoffVal = parseInt(paramCutoff.value);
        const distortionVal = parseInt(paramDistortion.value);
        const isReversed = paramReverse.checked && isProUnlocked;

        if (currentSourceType === 'synth') {
            sourceNode = offlineCtx.createOscillator();
            sourceNode.type = paramWaveform.value;
            sourceNode.frequency.setValueAtTime(parseFloat(paramFrequency.value), startTime);
        } else {
            sourceNode = offlineCtx.createBufferSource();
            if (isReversed) {
                const numChannels = recordedAudioBuffer.numberOfChannels;
                const length = recordedAudioBuffer.length;
                const reversedBuffer = offlineCtx.createBuffer(numChannels, length, sampleRate);
                for (let c = 0; c < numChannels; c++) {
                    const channelData = recordedAudioBuffer.getChannelData(c);
                    const reversedData = reversedBuffer.getChannelData(c);
                    for (let i = 0; i < length; i++) {
                        reversedData[i] = channelData[length - 1 - i];
                    }
                }
                sourceNode.buffer = reversedBuffer;
            } else {
                sourceNode.buffer = recordedAudioBuffer;
            }
            sourceNode.playbackRate.setValueAtTime(pitchFactor, startTime);
        }

        const gainNode = offlineCtx.createGain();
        gainNode.gain.setValueAtTime(0, startTime);

        if (currentSourceType === 'synth') {
            const attack = parseFloat(paramAdsrA.value);
            const decay = parseFloat(paramAdsrD.value);
            const sustain = parseInt(paramAdsrS.value) / 100;
            const release = parseFloat(paramAdsrR.value);

            gainNode.gain.linearRampToValueAtTime(0.8, startTime + attack);
            gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain * 0.8), startTime + attack + decay);
            
            const stopTime = startTime + parseFloat(paramDuration.value);
            gainNode.gain.setValueAtTime(gainNode.gain.value, stopTime);
            gainNode.gain.cancelScheduledValues(stopTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime + release);
            
            sourceNode.start(startTime);
            sourceNode.stop(stopTime + release);
        } else {
            gainNode.gain.setValueAtTime(0.8, startTime);
            sourceNode.start(startTime);
            sourceNode.stop(startTime + rawDuration);
        }

        let distortionNode = null;
        if (distortionVal > 0) {
            distortionNode = offlineCtx.createWaveShaper();
            distortionNode.curve = makeDistortionCurve(distortionVal * 2.5);
            distortionNode.oversample = '4x';
        }

        let filterNode = null;
        if (filterType !== 'none') {
            filterNode = offlineCtx.createBiquadFilter();
            filterNode.type = filterType;
            filterNode.frequency.setValueAtTime(cutoffVal, startTime);
        }

        let delayNode = null;
        let feedbackNode = null;
        if (delayTime > 0) {
            delayNode = offlineCtx.createDelay(2.0);
            delayNode.delayTime.setValueAtTime(delayTime, startTime);
            feedbackNode = offlineCtx.createGain();
            feedbackNode.gain.setValueAtTime(feedbackVal, startTime);
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode);
        }

        let currentNode = sourceNode;
        currentNode.connect(gainNode);
        currentNode = gainNode;

        if (distortionNode) {
            currentNode.connect(distortionNode);
            currentNode = distortionNode;
        }

        if (filterNode) {
            currentNode.connect(filterNode);
            currentNode = filterNode;
        }

        if (delayNode) {
            const mergerNode = offlineCtx.createGain();
            currentNode.connect(mergerNode);
            currentNode.connect(delayNode);
            delayNode.connect(mergerNode);
            currentNode = mergerNode;
        }

        currentNode.connect(offlineCtx.destination);

        showToast('⚙️ WAV書き出しの計算中...');

        try {
            const renderedBuffer = await offlineCtx.startRendering();
            const wavBlob = bufferToWav(renderedBuffer);
            const url = URL.createObjectURL(wavBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `t9s-sfx-${Date.now()}.wav`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('💾 WAV ファイルを保存しました！');
        } catch (err) {
            console.error('Offline rendering failed:', err);
            showToast('❌ WAVファイルの生成に失敗しました。');
        }
    });

    // AudioBuffer を 16-bit PCM WAV (RIFF) へエンコードする関数
    function bufferToWav(buffer) {
        let numOfChan = buffer.numberOfChannels,
            length = buffer.length * numOfChan * 2 + 44,
            bufferArr = new ArrayBuffer(length),
            view = new DataView(bufferArr),
            channels = [], i, sample,
            offset = 0,
            pos = 0;

        // RIFF ヘッダー書き込み
        writeString('RIFF');
        view.setUint32(4, length - 8, true);
        writeString('WAVE');
        writeString('fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM Format
        view.setUint16(22, numOfChan, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
        view.setUint16(32, numOfChan * 2, true);
        view.setUint16(34, 16, true); // 16-bit
        writeString('data');
        view.setUint32(40, length - 44, true);

        function writeString(s) {
            for (let i = 0; i < s.length; i++) {
                view.setUint8(44 + pos++, s.charCodeAt(i));
            }
        }

        for (i = 0; i < numOfChan; i++) {
            channels.push(buffer.getChannelData(i));
        }

        pos = 44;
        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }
        return new Blob([view], { type: 'audio/wav' });
    }

    // 9. レトロゲーム風 SE ランダム生成アルゴリズム (Randomizer)
    randomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.random;
            generatePresetSFX(type);
        });
    });

    btnRandomize.addEventListener('click', () => {
        generatePresetSFX('random');
    });

    function generatePresetSFX(type) {
        getAudioContext();
        stopSound();

        // 入力をシンセに切り替え
        sourceTabBtns[0].click();

        // 各種デフォルトリセット
        paramPitch.value = 1.0;
        valPitch.textContent = '1.0x';
        paramDelay.value = 0.0;
        valDelay.textContent = '0.0s';
        paramFeedback.value = 0;
        valFeedback.textContent = '0%';
        paramFilterType.value = 'none';
        paramCutoff.value = 2000;
        valCutoff.textContent = '2000Hz';
        paramDistortion.value = 0;
        valDistortion.textContent = '0%';
        paramReverse.checked = false;

        if (type === 'laser') {
            // ⚡ レーザー音
            paramWaveform.value = Math.random() > 0.5 ? 'sawtooth' : 'square';
            const baseFreq = 800 + Math.random() * 800;
            paramFrequency.value = Math.round(baseFreq);
            valFrequency.textContent = paramFrequency.value + ' Hz';

            paramDuration.value = 0.2 + Math.random() * 0.15;
            valDuration.textContent = paramDuration.value + 's';

            paramAdsrA.value = 0.0;
            paramAdsrD.value = 0.15;
            paramAdsrS.value = 10;
            paramAdsrR.value = 0.1;

            // ディストーションで少しノイジーに
            paramDistortion.value = 15;
            valDistortion.textContent = '15%';

            // 再生開始、かつ周波数スライド用スウィープを実行
            playCustomSweep(baseFreq, 100, parseFloat(paramDuration.value));

        } else if (type === 'coin') {
            // 🪙 コイン取得音
            paramWaveform.value = 'square';
            const baseFreq = 950 + Math.random() * 150;
            paramFrequency.value = Math.round(baseFreq);
            valFrequency.textContent = paramFrequency.value + ' Hz';

            paramDuration.value = 0.35;
            valDuration.textContent = '0.35s';

            paramAdsrA.value = 0.0;
            paramAdsrD.value = 0.1;
            paramAdsrS.value = 30;
            paramAdsrR.value = 0.15;

            // コインのアルペジオ（0.08秒後にオクターブ上げる）
            playCoinArpeggio(baseFreq, baseFreq * 1.35);

        } else if (type === 'explosion') {
            // 💥 爆発音
            paramWaveform.value = 'sawtooth';
            const baseFreq = 80 + Math.random() * 100;
            paramFrequency.value = Math.round(baseFreq);
            valFrequency.textContent = paramFrequency.value + ' Hz';

            paramDuration.value = 0.6 + Math.random() * 0.4;
            valDuration.textContent = paramDuration.value + 's';

            paramAdsrA.value = 0.01;
            paramAdsrD.value = 0.3;
            paramAdsrS.value = 20;
            paramAdsrR.value = 0.4;

            // 強力なディストーションとローパスフィルター
            paramDistortion.value = 85;
            valDistortion.textContent = '85%';
            paramFilterType.value = 'lowpass';
            paramCutoff.value = 400;
            valCutoff.textContent = '400Hz';

            // エコーを追加して重低音の余韻
            paramDelay.value = 0.15;
            valDelay.textContent = '0.15s';
            paramFeedback.value = 40;
            valFeedback.textContent = '40%';

            playCustomSweep(baseFreq, 20, parseFloat(paramDuration.value));

        } else if (type === 'jump') {
            // 🦘 ジャンプ音
            paramWaveform.value = 'triangle';
            const baseFreq = 150 + Math.random() * 100;
            paramFrequency.value = Math.round(baseFreq);
            valFrequency.textContent = paramFrequency.value + ' Hz';

            paramDuration.value = 0.2 + Math.random() * 0.1;
            valDuration.textContent = paramDuration.value + 's';

            paramAdsrA.value = 0.03;
            paramAdsrD.value = 0.15;
            paramAdsrS.value = 0;
            paramAdsrR.value = 0.1;

            playCustomSweep(baseFreq, baseFreq * 3.5, parseFloat(paramDuration.value));

        } else if (type === 'random') {
            // 🔀 完全ランダム合成
            const waveForms = ['sine', 'square', 'triangle', 'sawtooth'];
            paramWaveform.value = waveForms[Math.floor(Math.random() * waveForms.length)];
            
            paramFrequency.value = Math.round(80 + Math.random() * 1500);
            valFrequency.textContent = paramFrequency.value + ' Hz';

            paramDuration.value = (0.15 + Math.random() * 1.5).toFixed(2);
            valDuration.textContent = paramDuration.value + 's';

            paramAdsrA.value = (Math.random() * 0.3).toFixed(2);
            paramAdsrD.value = (0.05 + Math.random() * 0.5).toFixed(2);
            paramAdsrS.value = Math.round(Math.random() * 80);
            paramAdsrR.value = (0.05 + Math.random() * 1.0).toFixed(2);

            // エフェクトもランダムにセット
            if (Math.random() > 0.6) {
                paramDelay.value = (0.05 + Math.random() * 0.5).toFixed(2);
                valDelay.textContent = paramDelay.value + 's';
                paramFeedback.value = Math.round(Math.random() * 60);
                valFeedback.textContent = paramFeedback.value + '%';
            }
            if (Math.random() > 0.7) {
                const types = ['none', 'lowpass', 'highpass'];
                paramFilterType.value = types[Math.floor(Math.random() * types.length)];
                paramCutoff.value = Math.round(200 + Math.random() * 5000);
                valCutoff.textContent = paramCutoff.value + 'Hz';
            }
            if (Math.random() > 0.5) {
                paramDistortion.value = Math.round(Math.random() * 70);
                valDistortion.textContent = paramDistortion.value + '%';
            }

            // ADSRテキスト同期
            valAdsrA.textContent = paramAdsrA.value + 's';
            valAdsrD.textContent = paramAdsrD.value + 's';
            valAdsrS.textContent = paramAdsrS.value + '%';
            valAdsrR.textContent = paramAdsrR.value + 's';

            playSound();
            showToast('🎲 ランダムSEを自動合成しました！');
        }
    }

    // 周波数をスイープさせながら再生するヘルパー
    function playCustomSweep(startFreq, endFreq, durationVal) {
        playSound();
        // playSoundで作成された oscillatorNode の周波数を上書きしてスイープさせる
        if (currentSourceNode && currentSourceNode.frequency) {
            const ctx = getAudioContext();
            const startTime = ctx.currentTime;
            currentSourceNode.frequency.setValueAtTime(startFreq, startTime);
            currentSourceNode.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), startTime + durationVal);
        }
    }

    // アルペジオ（コイン音など）のスケジューラー
    function playCoinArpeggio(freq1, freq2) {
        playSound();
        if (currentSourceNode && currentSourceNode.frequency) {
            const ctx = getAudioContext();
            const startTime = ctx.currentTime;
            currentSourceNode.frequency.setValueAtTime(freq1, startTime);
            currentSourceNode.frequency.setValueAtTime(freq2, startTime + 0.08); // 80ms後に次の音符へ
        }
    }

    // 10. 自作プリセットマネージャー (Pro)
    const PRESET_STORAGE_KEY = 't9s_sfx_presets';

    function loadSavedPresets() {
        if (!isProUnlocked) return;
        
        // セレクトボックスを一旦クリア
        selectPresets.innerHTML = '<option value="">-- Saved Presets --</option>';
        
        try {
            const raw = localStorage.getItem(PRESET_STORAGE_KEY);
            if (raw) {
                const presets = JSON.parse(raw);
                presets.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.name;
                    opt.textContent = p.name;
                    selectPresets.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('Load presets failed:', e);
        }
    }
    loadSavedPresets();

    btnSavePreset.addEventListener('click', () => {
        if (!isProUnlocked) {
            openProModal();
            return;
        }

        const name = presetNameInput.value.trim();
        if (!name) {
            showToast('⚠️ プリセット名を入力してください。');
            return;
        }

        const presetData = {
            name: name,
            params: {
                sourceType: currentSourceType,
                waveform: paramWaveform.value,
                frequency: paramFrequency.value,
                adsrA: paramAdsrA.value,
                adsrD: paramAdsrD.value,
                adsrS: paramAdsrS.value,
                adsrR: paramAdsrR.value,
                duration: paramDuration.value,
                pitch: paramPitch.value,
                delay: paramDelay.value,
                feedback: paramFeedback.value,
                filterType: paramFilterType.value,
                cutoff: paramCutoff.value,
                distortion: paramDistortion.value,
                reverse: paramReverse.checked
            }
        };

        try {
            const raw = localStorage.getItem(PRESET_STORAGE_KEY);
            let presets = raw ? JSON.parse(raw) : [];
            
            // 重複チェック・上書き
            presets = presets.filter(p => p.name !== name);
            presets.push(presetData);
            
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
            showToast(`🎉 プリセット「${name}」を保存しました！`);
            presetNameInput.value = '';
            
            loadSavedPresets();
        } catch (e) {
            console.error('Save preset failed:', e);
            showToast('❌ プリセットの保存に失敗しました。');
        }
    });

    selectPresets.addEventListener('change', (e) => {
        const name = e.target.value;
        if (!name) return;

        try {
            const raw = localStorage.getItem(PRESET_STORAGE_KEY);
            if (raw) {
                const presets = JSON.parse(raw);
                const found = presets.find(p => p.name === name);
                if (found) {
                    applyPresetParams(found.params);
                    showToast(`✔️ プリセット「${name}」をロードしました。`);
                    playSound();
                }
            }
        } catch (e) {
            console.error('Apply preset failed:', e);
        }
    });

    function applyPresetParams(params) {
        // タブ切り替え
        if (params.sourceType === 'synth') {
            sourceTabBtns[0].click();
        } else {
            sourceTabBtns[1].click();
        }

        paramWaveform.value = params.waveform;
        paramFrequency.value = params.frequency;
        valFrequency.textContent = params.frequency + ' Hz';

        paramAdsrA.value = params.adsrA;
        valAdsrA.textContent = params.adsrA + 's';
        paramAdsrD.value = params.adsrD;
        valAdsrD.textContent = params.adsrD + 's';
        paramAdsrS.value = params.adsrS;
        valAdsrS.textContent = params.adsrS + '%';
        paramAdsrR.value = params.adsrR;
        valAdsrR.textContent = params.adsrR + 's';

        paramDuration.value = params.duration;
        valDuration.textContent = params.duration + 's';

        paramPitch.value = params.pitch;
        valPitch.textContent = params.pitch + 'x';

        paramDelay.value = params.delay;
        valDelay.textContent = params.delay + 's';
        paramFeedback.value = params.feedback;
        valFeedback.textContent = params.feedback + '%';

        paramFilterType.value = params.filterType;
        paramCutoff.value = params.cutoff;
        valCutoff.textContent = params.cutoff + 'Hz';

        paramDistortion.value = params.distortion;
        valDistortion.textContent = params.distortion + '%';

        paramReverse.checked = params.reverse;
    }

    // 11. Proモーダルハンドリング
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
            loadSavedPresets();
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
