function init() {
    // DOM要素の取得
    const sizeBtns = document.querySelectorAll('.grid-buttons button');
    const toolBtns = document.querySelectorAll('.tool-buttons button[id^="tool-"]');
    const paramGridLines = document.getElementById('param-grid-lines');
    const presetPalette = document.getElementById('preset-palette');
    const colorCustom = document.getElementById('color-custom');
    
    const frameContainer = document.getElementById('frame-container');
    const btnAddFrame = document.getElementById('btn-add-frame');
    const btnDeleteFrame = document.getElementById('btn-delete-frame');
    const paramFps = document.getElementById('param-fps');
    const valFps = document.getElementById('val-fps');
    const btnTogglePlay = document.getElementById('btn-toggle-play');

    const imageExtractorInput = document.getElementById('image-extractor-input');
    const btnTriggerExtractor = document.getElementById('btn-trigger-extractor');
    
    const paintCanvas = document.getElementById('paint-canvas');
    const paintCtx = paintCanvas.getContext('2d');
    const gridCanvas = document.getElementById('grid-canvas');
    const gridCtx = gridCanvas.getContext('2d');
    const canvasIndicator = document.getElementById('canvas-indicator');

    const btnExportSprite = document.getElementById('btn-export-sprite');
    const btnExportFrame = document.getElementById('btn-export-frame');

    const proStatusBtn = document.getElementById('pro-status-btn');
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // アプリ状態
    let gridSize = 8; // デフォルト 8x8
    let currentTool = 'pen'; // 'pen', 'eraser', 'bucket'
    let selectedColor = '#8b5cf6';
    let frames = []; // フレームデータの配列 [ [color1, color2, ...], ... ]
    let currentFrameIndex = 0;
    let isDrawing = false;
    let isPlaying = false;
    let playIntervalId = null;

    let isProUnlocked = false;
    try {
        isProUnlocked = localStorage.getItem('t9s_pro_unlocked') === 'true';
    } catch (e) {
        console.warn('localStorage access failed:', e);
    }
    const PRO_KEY = 'T9S-PC-FUND-2026';

    // プリセットカラーパレット (レトロ16色)
    const presetColors = [
        '#000000', '#ffffff', '#888888', '#c0c0c0',
        '#ef4444', '#f97316', '#fbbf24', '#22c55e',
        '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
        '#ec4899', '#78350f', '#451a03', '#1e293b'
    ];

    // 1. Proアンロック状態の表示更新
    function updateProUI() {
        if (isProUnlocked) {
            proStatusBtn.innerHTML = '💎 Pro Unlocked';
            proStatusBtn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
            proStatusBtn.style.color = '#000';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'none';
            });
        } else {
            proStatusBtn.innerHTML = '💎 Get Pro';
            proStatusBtn.style.background = '';
            proStatusBtn.style.color = '';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'inline-block';
            });
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

    // 2. パレット生成とバインド
    function buildPalette(colors) {
        presetPalette.innerHTML = '';
        colors.forEach((color, idx) => {
            const tile = document.createElement('div');
            tile.className = 'color-tile';
            tile.style.backgroundColor = color;
            tile.dataset.color = color;
            if (color.toLowerCase() === selectedColor.toLowerCase()) {
                tile.classList.add('active');
            }
            tile.addEventListener('click', () => {
                document.querySelectorAll('.color-tile').forEach(t => t.classList.remove('active'));
                tile.classList.add('active');
                selectedColor = color;
                colorCustom.value = color;
            });
            presetPalette.appendChild(tile);
        });
    }
    buildPalette(presetColors);

    colorCustom.addEventListener('input', (e) => {
        selectedColor = e.target.value;
        // プリセットの選択状態を解除
        document.querySelectorAll('.color-tile').forEach(t => t.classList.remove('active'));
    });

    // 3. アプリ初期化・リセット
    function initEditor() {
        paintCanvas.width = gridSize;
        paintCanvas.height = gridSize;
        gridCanvas.width = gridSize * 20; // ズームしたグリッド用
        gridCanvas.height = gridSize * 20;

        // 空フレーム作成
        frames = [createEmptyFrameData()];
        currentFrameIndex = 0;
        
        drawFrame();
        drawGrid();
        updateFramesUI();
        updateIndicator();
    }

    function createEmptyFrameData() {
        return new Array(gridSize * gridSize).fill(null);
    }

    // 4. キャンバス描画
    function drawFrame() {
        paintCtx.clearRect(0, 0, gridSize, gridSize);
        const data = frames[currentFrameIndex];
        if (!data) return;

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const color = data[y * gridSize + x];
                if (color) {
                    paintCtx.fillStyle = color;
                    paintCtx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    // グリッド線描画
    function drawGrid() {
        gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        if (!paramGridLines.checked) return;

        const cellSize = 20; // キャンバス表示の倍率に合わせる
        gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        gridCtx.lineWidth = 0.5;

        // 縦線
        for (let i = 0; i <= gridSize; i++) {
            gridCtx.beginPath();
            gridCtx.moveTo(i * cellSize, 0);
            gridCtx.lineTo(i * cellSize, gridCanvas.height);
            gridCtx.stroke();
        }
        // 横線
        for (let j = 0; j <= gridSize; j++) {
            gridCtx.beginPath();
            gridCtx.moveTo(0, j * cellSize);
            gridCtx.lineTo(gridCanvas.width, j * cellSize);
            gridCtx.stroke();
        }
    }

    paramGridLines.addEventListener('change', drawGrid);

    // インジケータの更新
    function updateIndicator() {
        canvasIndicator.textContent = `Frame ${currentFrameIndex + 1} / ${frames.length} (${gridSize}x${gridSize})`;
    }

    // 5. グリッドサイズ切り替え
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('グリッドサイズを変更すると現在のドット絵はリセットされます。よろしいですか？')) {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gridSize = parseInt(btn.dataset.size);
                
                // 再初期化
                if (isPlaying) {
                    btnTogglePlay.click();
                }
                initEditor();
            }
        });
    });

    // 6. ツール切り替え
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'tool-clear') {
                if (confirm('現在のフレームをクリアしますか？')) {
                    frames[currentFrameIndex].fill(null);
                    drawFrame();
                    updateFramesUI();
                }
                return;
            }
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.id.replace('tool-', '');
        });
    });

    // 7. マウスドラッグ描画インタラクション
    function getMouseCoords(e) {
        const rect = paintCanvas.getBoundingClientRect();
        // 実際のCSSサイズ（通常400px）とのスケール比
        const scaleX = paintCanvas.width / rect.width;
        const scaleY = paintCanvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        return { x, y };
    }

    function setPixel(x, y, color) {
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
        const idx = y * gridSize + x;
        frames[currentFrameIndex][idx] = color;
    }

    function drawPixelAtEvent(e) {
        if (isPlaying) return; // 再生中は描画不可
        const coords = getMouseCoords(e);
        
        if (currentTool === 'pen') {
            setPixel(coords.x, coords.y, selectedColor);
            drawFrame();
        } else if (currentTool === 'eraser') {
            setPixel(coords.x, coords.y, null);
            drawFrame();
        } else if (currentTool === 'bucket' && e.type === 'mousedown') {
            // バケツツール（塗りつぶし）は mousedown 時の一回のみ起動
            const targetIndex = coords.y * gridSize + coords.x;
            const targetColor = frames[currentFrameIndex][targetIndex];
            if (targetColor !== selectedColor) {
                floodFill(coords.x, coords.y, targetColor, selectedColor);
                drawFrame();
            }
        }
    }

    // シードフィル（Flood Fill）アルゴリズム
    function floodFill(startX, startY, targetColor, replacementColor) {
        const queue = [{ x: startX, y: startY }];
        const visited = new Set();
        const data = frames[currentFrameIndex];

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            visited.add(key);

            if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;

            const idx = y * gridSize + x;
            if (data[idx] === targetColor) {
                data[idx] = replacementColor;
                queue.push({ x: x + 1, y });
                queue.push({ x: x - 1, y });
                queue.push({ x, y: y + 1 });
                queue.push({ x, y: y - 1 });
            }
        }
    }

    paintCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        drawPixelAtEvent(e);
    });

    window.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            drawPixelAtEvent(e);
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            updateFramesUI(); // サムネイルの即時更新
        }
    });

    // 8. アニメーションフレーム管理
    function updateFramesUI() {
        frameContainer.innerHTML = '';
        frames.forEach((frameData, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `frame-thumb ${idx === currentFrameIndex ? 'active' : ''}`;
            
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = gridSize;
            thumbCanvas.height = gridSize;
            const thumbCtx = thumbCanvas.getContext('2d');

            // ミニチュア描画
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const color = frameData[y * gridSize + x];
                    if (color) {
                        thumbCtx.fillStyle = color;
                        thumbCtx.fillRect(x, y, 1, 1);
                    }
                }
            }

            thumb.appendChild(thumbCanvas);
            
            const span = document.createElement('span');
            span.textContent = idx + 1;
            thumb.appendChild(span);

            thumb.addEventListener('click', () => {
                if (isPlaying) {
                    btnTogglePlay.click();
                }
                currentFrameIndex = idx;
                drawFrame();
                updateIndicator();
                
                // アクティブ表示の切り替え
                document.querySelectorAll('.frame-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });

            frameContainer.appendChild(thumb);
        });
    }

    btnAddFrame.addEventListener('click', () => {
        // フレーム追加制限チェック ⭐Pro
        if (frames.length >= 3 && !isProUnlocked) {
            openProModal();
            return;
        }

        // 現在アクティブなフレームをコピーして新しいフレームとして挿入（使いやすさの向上）
        const currentData = frames[currentFrameIndex];
        const newData = [...currentData];
        frames.splice(currentFrameIndex + 1, 0, newData);
        currentFrameIndex++;
        
        drawFrame();
        updateFramesUI();
        updateIndicator();
    });

    btnDeleteFrame.addEventListener('click', () => {
        if (frames.length <= 1) {
            showToast('⚠️ これ以上フレームを削除できません。');
            return;
        }

        frames.splice(currentFrameIndex, 1);
        currentFrameIndex = Math.max(0, currentFrameIndex - 1);
        
        drawFrame();
        updateFramesUI();
        updateIndicator();
    });

    // アニメーション再生制御
    paramFps.addEventListener('input', (e) => {
        valFps.textContent = e.target.value + ' FPS';
        if (isPlaying) {
            stopAnimLoop();
            startAnimLoop();
        }
    });

    btnTogglePlay.addEventListener('click', () => {
        if (isPlaying) {
            isPlaying = false;
            btnTogglePlay.innerHTML = '▶️ Play Animation';
            btnTogglePlay.classList.remove('btn-secondary');
            btnTogglePlay.classList.add('btn-primary');
            stopAnimLoop();
        } else {
            if (frames.length < 2) {
                showToast('⚠️ アニメーションさせるにはフレームが2つ以上必要です。');
                return;
            }
            isPlaying = true;
            btnTogglePlay.innerHTML = '⏹️ Stop Animation';
            btnTogglePlay.classList.remove('btn-primary');
            btnTogglePlay.classList.add('btn-secondary');
            startAnimLoop();
        }
    });

    function startAnimLoop() {
        const fps = parseInt(paramFps.value);
        playIntervalId = setInterval(() => {
            currentFrameIndex = (currentFrameIndex + 1) % frames.length;
            drawFrame();
            updateIndicator();
            // サムネイルのアクティブクラス更新
            document.querySelectorAll('.frame-thumb').forEach((t, i) => {
                if (i === currentFrameIndex) {
                    t.classList.add('active');
                    t.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    t.classList.remove('active');
                }
            });
        }, 1000 / fps);
    }

    function stopAnimLoop() {
        if (playIntervalId) {
            clearInterval(playIntervalId);
            playIntervalId = null;
        }
    }

    // 9. 画像からパレット自動抽出 (Pro)
    btnTriggerExtractor.addEventListener('click', () => {
        if (!isProUnlocked) {
            openProModal();
        } else {
            imageExtractorInput.click();
        }
    });

    imageExtractorInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // 画像から色を抽出する処理
                extractColorsFromImage(img);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function extractColorsFromImage(img) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 100; // 処理軽量化のため縮小してピクセル取得
        tempCanvas.height = 100;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0, 100, 100);

        const imgData = tempCtx.getImageData(0, 0, 100, 100).data;
        const colorCounts = {};

        // 16進数カラーをカウント
        for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i+1];
            const b = imgData[i+2];
            const a = imgData[i+3];
            
            if (a < 50) continue; // 透明ピクセルは無視
            
            // 16進数文字列へ
            const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        // 頻出順にソート
        const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
        
        // 最大16色をパレットにセット
        const extractedPalette = sortedColors.slice(0, 16);
        if (extractedPalette.length > 0) {
            buildPalette(extractedPalette);
            showToast('🎨 画像からパレットを自動抽出しました！');
        } else {
            showToast('⚠️ 有効な色が抽出できませんでした。');
        }
    }

    // 10. 画像書き出し (スプライトシート ＆ フレームPNG)
    // 拡大してドット絵がぼやけないようにする処理
    function renderScaledTestCanvas(frameData, size) {
        const scaleCanvas = document.createElement('canvas');
        const scale = 512 / size; // 512pxに拡大
        scaleCanvas.width = 512;
        scaleCanvas.height = 512;
        const scaleCtx = scaleCanvas.getContext('2d');
        
        // image-rendering を無効化（ブラウザ引き伸ばしでなくfillRectで論理的にドットを描くのでぼやけない）
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const color = frameData[y * size + x];
                if (color) {
                    scaleCtx.fillStyle = color;
                    scaleCtx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
        return scaleCanvas;
    }

    btnExportFrame.addEventListener('click', () => {
        const currentData = frames[currentFrameIndex];
        const scaledCanvas = renderScaledTestCanvas(currentData, gridSize);
        
        const url = scaledCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `t9s-frame-${currentFrameIndex+1}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('🖼️ 現在のフレームをPNG画像でエクスポートしました！');
    });

    btnExportSprite.addEventListener('click', () => {
        // 全フレームを横一列に並べたスプライトシート
        const count = frames.length;
        const spriteCanvas = document.createElement('canvas');
        const scale = Math.round(512 / gridSize); // ドットあたり拡大比率

        spriteCanvas.width = gridSize * count * scale;
        spriteCanvas.height = gridSize * scale;
        const spriteCtx = spriteCanvas.getContext('2d');

        frames.forEach((frameData, frameIdx) => {
            const offsetX = frameIdx * gridSize * scale;
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const color = frameData[y * gridSize + x];
                    if (color) {
                        spriteCtx.fillStyle = color;
                        spriteCtx.fillRect(offsetX + (x * scale), y * scale, scale, scale);
                    }
                }
            }
        });

        const url = spriteCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `t9s-spritesheet-${count}f-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`💾 スプライトシート (${count}フレーム) をエクスポートしました！`);
    });

    // 11. Proアンロックモーダル
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
            updateFramesUI(); // アニメーションフレーム制限解除に伴うUI更新
            showToast('🎉 Pro機能が正常にアンロックされました！');
        } else {
            keyErrorMsg.classList.remove('hidden');
        }
    });

    // 初期化起動
    initEditor();
}

// 安全なDOM読み込み監視イニシャライザ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
