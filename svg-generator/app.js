document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const shapeTabBtns = document.querySelectorAll('.tab-btn');
    const paramsBlob = document.getElementById('params-blob');
    const paramsWave = document.getElementById('params-wave');
    const svgPreviewContainer = document.getElementById('svg-preview-container');
    const proStatusBtn = document.getElementById('pro-status-btn');

    // Blob パラメータ
    const paramBlobEdges = document.getElementById('param-blob-edges');
    const paramBlobGrowth = document.getElementById('param-blob-growth');
    const valBlobEdges = document.getElementById('val-blob-edges');
    const valBlobGrowth = document.getElementById('val-blob-growth');

    // Wave パラメータ
    const paramWaveComplexity = document.getElementById('param-wave-complexity');
    const paramWaveHeight = document.getElementById('param-wave-height');
    const paramWaveLayers = document.getElementById('param-wave-layers');
    const valWaveComplexity = document.getElementById('val-wave-complexity');
    const valWaveHeight = document.getElementById('val-wave-height');

    // 共通スタイルパラメータ
    const paramFillType = document.getElementById('param-fill-type');
    const solidColorGroup = document.getElementById('solid-color-group');
    const gradientColorGroup = document.getElementById('gradient-color-group');
    const colorSolid = document.getElementById('color-solid');
    const colorGradStart = document.getElementById('color-grad-start');
    const colorGradEnd = document.getElementById('color-grad-end');
    const paramAnimate = document.getElementById('param-animate');

    // ボタン類
    const btnGenerate = document.getElementById('btn-generate');
    const btnCopyCode = document.getElementById('btn-copy-code');
    const btnDownloadSvg = document.getElementById('btn-download-svg');
    const btnDownloadPng = document.getElementById('btn-download-png');

    // モーダル・トースト
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // アプリ状態
    let currentShapeType = 'blob'; // 'blob' or 'wave'
    let isProUnlocked = localStorage.getItem('t9s_pro_unlocked') === 'true';
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

    // 2. タブ切り替え
    shapeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            shapeTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentShapeType = btn.dataset.type;

            if (currentShapeType === 'blob') {
                paramsBlob.classList.remove('hidden');
                paramsWave.classList.add('hidden');
            } else {
                paramsBlob.classList.add('hidden');
                paramsWave.classList.remove('hidden');
            }
            generateShape();
        });
    });

    // 3. パラメータ変更のリアルタイム検知
    paramBlobEdges.addEventListener('input', (e) => {
        valBlobEdges.textContent = e.target.value;
        generateShape();
    });
    paramBlobGrowth.addEventListener('input', (e) => {
        valBlobGrowth.textContent = e.target.value + '%';
        generateShape();
    });
    paramWaveComplexity.addEventListener('input', (e) => {
        valWaveComplexity.textContent = e.target.value;
        generateShape();
    });
    paramWaveHeight.addEventListener('input', (e) => {
        valWaveHeight.textContent = e.target.value + 'px';
        generateShape();
    });

    paramFillType.addEventListener('change', (e) => {
        if (e.target.value === 'solid') {
            solidColorGroup.style.display = 'flex';
            gradientColorGroup.style.display = 'none';
        } else {
            solidColorGroup.style.display = 'none';
            gradientColorGroup.style.display = 'flex';
        }
        generateShape();
    });

    colorSolid.addEventListener('input', generateShape);
    colorGradStart.addEventListener('input', generateShape);
    colorGradEnd.addEventListener('input', generateShape);

    // Pro機能制限チェック
    paramWaveLayers.addEventListener('change', (e) => {
        if (e.target.checked && !isProUnlocked) {
            e.target.checked = false;
            openProModal();
        } else {
            generateShape();
        }
    });

    paramAnimate.addEventListener('change', (e) => {
        if (e.target.checked && !isProUnlocked) {
            e.target.checked = false;
            openProModal();
        } else {
            generateShape();
        }
    });

    btnGenerate.addEventListener('click', generateShape);

    // 4. SVG/Blob生成のコアアルゴリズム
    function generateShape() {
        let svgContent = '';
        const size = 400; // キャンバスサイズ (400x400)
        
        // グラデーション/塗りの定義
        let defs = '';
        let fillAttr = '';
        if (paramFillType.value === 'gradient') {
            defs = `
    <defs>
        <linearGradient id="shape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colorGradStart.value}" />
            <stop offset="100%" stop-color="${colorGradEnd.value}" />
        </linearGradient>
    </defs>`;
            fillAttr = 'url(#shape-grad)';
        } else {
            fillAttr = colorSolid.value;
        }

        if (currentShapeType === 'blob') {
            const numPoints = parseInt(paramBlobEdges.value);
            const growth = parseInt(paramBlobGrowth.value);
            
            // 形状のパスを計算 (アニメーション用に2つ作る場合も)
            const path1 = createBlobPathData(numPoints, growth, size);
            
            let animateTag = '';
            if (paramAnimate.checked && isProUnlocked) {
                const path2 = createBlobPathData(numPoints, growth, size);
                const path3 = createBlobPathData(numPoints, growth, size);
                animateTag = `<animate dur="7s" repeatCount="indefinite" attributeName="d" values="${path1};${path2};${path3};${path1}" />`;
            }

            svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">${defs}
    <path d="${path1}" fill="${fillAttr}">${animateTag}</path>
</svg>`;

        } else {
            // Wave生成
            const complexity = parseInt(paramWaveComplexity.value);
            const height = parseInt(paramWaveHeight.value);
            const multiLayer = paramWaveLayers.checked && isProUnlocked;
            
            if (multiLayer) {
                // マルチレイヤーWaveの作成 (3層重ね)
                const layerColors = [
                    adjustColorAlpha(colorGradStart.value, 0.4),
                    adjustColorAlpha(colorGradEnd.value, 0.6),
                    fillAttr // 最前面
                ];

                let pathsHtml = '';
                for (let i = 0; i < 3; i++) {
                    const waveHeightOffset = height - (i * 30);
                    const pathD = createWavePathData(complexity, waveHeightOffset, size);
                    
                    let animateTag = '';
                    if (paramAnimate.checked && isProUnlocked) {
                        const pathD2 = createWavePathData(complexity, waveHeightOffset + 15, size);
                        const pathD3 = createWavePathData(complexity, waveHeightOffset - 15, size);
                        animateTag = `<animate dur="${6 + i * 2}s" repeatCount="indefinite" attributeName="d" values="${pathD};${pathD2};${pathD3};${pathD}" />`;
                    }
                    
                    // 各レイヤーに定義された色を適用
                    let currentFill = layerColors[i];
                    if (i === 2 && paramFillType.value === 'gradient') {
                        currentFill = 'url(#shape-grad)';
                    }
                    pathsHtml += `\n    <path d="${pathD}" fill="${currentFill}">${animateTag}</path>`;
                }

                svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">${defs}${pathsHtml}\n</svg>`;
            } else {
                // シングルレイヤー
                const path1 = createWavePathData(complexity, height, size);
                
                let animateTag = '';
                if (paramAnimate.checked && isProUnlocked) {
                    const path2 = createWavePathData(complexity, height + 20, size);
                    const path3 = createWavePathData(complexity, height - 20, size);
                    animateTag = `<animate dur="6s" repeatCount="indefinite" attributeName="d" values="${path1};${path2};${path3};${path1}" />`;
                }

                svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">${defs}
    <path d="${path1}" fill="${fillAttr}">${animateTag}</path>
</svg>`;
            }
        }

        svgPreviewContainer.innerHTML = svgContent;
    }

    // 16進数カラーに透過度を追加・調整するヘルパー
    function adjustColorAlpha(hex, alpha) {
        // グラデーション定義が直接入ってきた場合などの簡易フォールバック
        if (!hex.startsWith('#')) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Blob パスデータ作成
    function createBlobPathData(numPoints, growth, size) {
        const center = size / 2;
        const baseRadius = size * 0.3;
        const maxOffset = baseRadius * (growth / 100);
        const points = [];

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            // ランダムオフセット
            const offset = (Math.random() - 0.5) * maxOffset;
            const r = baseRadius + offset;
            
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            points.push({ x, y });
        }

        return getBezierCurvePath(points, true);
    }

    // Wave パスデータ作成
    function createWavePathData(complexity, height, size) {
        const points = [];
        const step = size / (complexity - 1);
        const baseY = size - height;

        // 開始位置 (左端)
        points.push({ x: 0, y: baseY + (Math.random() - 0.5) * 60 });

        for (let i = 1; i < complexity - 1; i++) {
            const x = i * step;
            const y = baseY + (Math.random() - 0.5) * 80;
            points.push({ x, y });
        }

        // 終了位置 (右端)
        points.push({ x: size, y: baseY + (Math.random() - 0.5) * 60 });

        // 波形を閉じるため、右下を経由して左下に戻るパスを追加
        let path = getBezierCurvePath(points, false);
        path += ` L ${size} ${size} L 0 ${size} Z`;
        return path;
    }

    // スプライン曲線を補間してパス文字列を作成 (Cubic Bezier)
    function getBezierCurvePath(points, isClosed) {
        if (points.length < 2) return '';

        let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
        const len = points.length;

        if (isClosed) {
            for (let i = 0; i < len; i++) {
                const p0 = points[(i - 1 + len) % len];
                const p1 = points[i];
                const p2 = points[(i + 1) % len];
                const p3 = points[(i + 2) % len];

                // 制御点 (Catmull-Rom スプラインの補正)
                const cp1x = p1.x + (p2.x - p0.x) * 0.15;
                const cp1y = p1.y + (p2.y - p0.y) * 0.15;
                const cp2x = p2.x - (p3.x - p1.x) * 0.15;
                const cp2y = p2.y - (p3.y - p1.y) * 0.15;

                path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
            }
        } else {
            // 開いたパス (Wave用)
            for (let i = 0; i < len - 1; i++) {
                const p0 = i > 0 ? points[i - 1] : points[i];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = i < len - 2 ? points[i + 2] : p2;

                const cp1x = p1.x + (p2.x - p0.x) * 0.15;
                const cp1y = p1.y + (p2.y - p0.y) * 0.15;
                const cp2x = p2.x - (p3.x - p1.x) * 0.15;
                const cp2y = p2.y - (p3.y - p1.y) * 0.15;

                path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
            }
        }
        return path;
    }

    // 5. アクションハンドラ (コピー & ダウンロード)
    btnCopyCode.addEventListener('click', () => {
        const svgCode = svgPreviewContainer.innerHTML;
        navigator.clipboard.writeText(svgCode).then(() => {
            showToast('📋 SVG Code をクリップボードにコピーしました！');
        }).catch(() => {
            showToast('❌ コピーに失敗しました。');
        });
    });

    btnDownloadSvg.addEventListener('click', () => {
        const svgCode = svgPreviewContainer.innerHTML;
        const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `t9s-${currentShapeType}-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('💾 SVG ファイルをダウンロードしました！');
    });

    btnDownloadPng.addEventListener('click', () => {
        const svgElement = svgPreviewContainer.querySelector('svg');
        if (!svgElement) return;

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 800; // 高解像度出力用
            canvas.height = 800;
            const context = canvas.getContext('2d');
            
            // 背景透過で描画
            context.clearRect(0, 0, 800, 800);
            context.drawImage(image, 0, 0, 800, 800);
            
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `t9s-${currentShapeType}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobURL);
            showToast('🖼️ PNG 画像をエクスポートしました！');
        };
        image.src = blobURL;
    });

    // 6. Proモーダルハンドリング
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
    
    // 背景クリックで閉じる
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
            localStorage.setItem('t9s_pro_unlocked', 'true');
            updateProUI();
            closeProModal();
            generateShape(); // Pro機能適用して再描画
            showToast('🎉 Pro機能が正常にアンロックされました！');
        } else {
            keyErrorMsg.classList.remove('hidden');
        }
    });

    // 初期生成
    generateShape();
});
