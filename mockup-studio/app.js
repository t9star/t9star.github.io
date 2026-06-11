document.addEventListener('DOMContentLoaded', () => {
    // DOM要素
    const dropZone = document.getElementById('drop-zone');
    const uploadPrompt = document.getElementById('upload-prompt');
    const fileInput = document.getElementById('file-input');
    const canvas = document.getElementById('mockup-canvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('download-btn');
    const toast = document.getElementById('toast');

    // コントロール要素
    const frameTypeButtons = document.querySelectorAll('#frame-type-group .toggle-btn');
    const ratioButtons = document.querySelectorAll('#ratio-group .toggle-btn');
    const bgPresets = document.querySelectorAll('.bg-preset');
    const customColorIndicator = document.getElementById('custom-color-indicator');
    const customColorPicker = document.getElementById('custom-color-picker');
    
    // スライダー
    const paddingSlider = document.getElementById('padding-slider');
    const radiusSlider = document.getElementById('radius-slider');
    const shadowSlider = document.getElementById('shadow-slider');
    const tiltSlider = document.getElementById('tilt-slider');

    const paddingValue = document.getElementById('padding-value');
    const radiusValue = document.getElementById('radius-value');
    const shadowValue = document.getElementById('shadow-value');
    const tiltValue = document.getElementById('tilt-value');

    // アプリ状態
    let uploadedImage = null;
    let frameType = 'browser';
    let ratio = '16-9';
    let bgType = 'gradient';
    let bgValue = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    let padding = 60;
    let radius = 12;
    let shadow = 30;
    let tilt = 0;

    // Proアンロック状態＆DOM
    let isPro = localStorage.getItem('t9s_pro_unlocked') === 'true';
    let pendingFrame = null;
    const proModal = document.getElementById('pro-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const sidebarUnlockTrigger = document.getElementById('sidebar-unlock-trigger');
    const proKeyInput = document.getElementById('pro-key-input');
    const proVerifyBtn = document.getElementById('pro-verify-btn');

    // 新カラー・キャプション設定DOM & 状態
    const deviceColorContainer = document.getElementById('device-color-container');
    const deviceColorButtons = document.querySelectorAll('#device-color-group .toggle-btn');
    const captionInput = document.getElementById('caption-input');
    const captionSizeSlider = document.getElementById('caption-size-slider');
    const captionSizeValue = document.getElementById('caption-size-value');
    const captionColorPicker = document.getElementById('caption-color-picker');

    let deviceColor = '#1e293b'; // デフォルト：スペースグレイ
    let captionText = '';
    let captionSize = 36;
    let captionColor = '#ffffff';

    // トースト表示関数
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ドラッグ＆ドロップイベント
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        dropZone.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    dropZone.addEventListener('click', (e) => {
        // コントロールパネルのクリックを無視するため、アップロードプロンプトが表示されているか、プレビューセクション本体のクリックのみ反応させる
        if (e.target === dropZone || uploadPrompt.contains(e.target) || e.target === canvas) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // ファイル処理
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('画像ファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                uploadPrompt.style.display = 'none';
                canvas.style.display = 'block';
                draw();
                showToast('画像を読み込みました！');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // コントロールイベントの設定
    frameTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isProFrame = btn.dataset.pro === 'true';
            if (isProFrame && !isPro) {
                // Proロック機能タップ時
                pendingFrame = btn;
                openProModal();
                return;
            }
            selectFrame(btn);
        });
    });

    function selectFrame(btn) {
        frameTypeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        frameType = btn.dataset.value;
        
        // デバイスカラーコンテナの表示切替
        if (frameType === 'iphone' || frameType === 'macbook') {
            deviceColorContainer.style.display = 'block';
        } else {
            deviceColorContainer.style.display = 'none';
        }
        
        draw();
    }

    // デバイスカラー切替
    deviceColorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            deviceColorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            deviceColor = btn.dataset.value;
            draw();
        });
    });

    // テキストキャプション変更
    captionInput.addEventListener('input', (e) => {
        captionText = e.target.value.trim();
        draw();
    });

    captionSizeSlider.addEventListener('input', (e) => {
        captionSize = parseInt(e.target.value);
        captionSizeValue.textContent = `${captionSize}px`;
        draw();
    });

    captionColorPicker.addEventListener('input', (e) => {
        captionColor = e.target.value;
        draw();
    });

    // モーダル制御関数
    function openProModal() {
        proModal.classList.add('show');
    }

    function closeProModal() {
        proModal.classList.remove('show');
        pendingFrame = null;
        proKeyInput.value = '';
    }

    modalCloseBtn.addEventListener('click', closeProModal);
    proModal.addEventListener('click', (e) => {
        if (e.target === proModal) closeProModal();
    });

    if (sidebarUnlockTrigger) {
        sidebarUnlockTrigger.addEventListener('click', () => {
            if (isPro) {
                showToast('すでにPro機能がアンロックされています！');
            } else {
                openProModal();
            }
        });
    }

    // キー検証
    proVerifyBtn.addEventListener('click', () => {
        const key = proKeyInput.value.trim();
        if (key.toUpperCase() === 'T9S-PC-FUND-2026') {
            isPro = true;
            localStorage.setItem('t9s_pro_unlocked', 'true');
            showToast('⭐ Pro機能が有効化されました！ご支援ありがとうございます！');
            
            // サイドバーのアンロック表示更新
            if (sidebarUnlockTrigger) {
                sidebarUnlockTrigger.textContent = '✅ Pro版アンロック済み';
                sidebarUnlockTrigger.disabled = true;
            }
            
            closeProModal();
            
            if (pendingFrame) {
                selectFrame(pendingFrame);
            }
        } else {
            showToast('キーが正しくありません。正しいキーを入力してください。');
        }
    });

    // 初期化時のPro状態のUI反映
    if (isPro && sidebarUnlockTrigger) {
        sidebarUnlockTrigger.textContent = '✅ Pro版アンロック済み';
        sidebarUnlockTrigger.disabled = true;
    }

    ratioButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ratio = btn.dataset.value;
            draw();
        });
    });

    bgPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            bgPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            
            bgType = preset.dataset.type;
            if (bgType === 'gradient') {
                bgValue = preset.dataset.value;
            } else if (bgType === 'custom') {
                customColorPicker.click();
            }
            draw();
        });
    });

    customColorPicker.addEventListener('input', (e) => {
        bgType = 'custom';
        bgValue = e.target.value;
        customColorIndicator.style.background = bgValue;
        draw();
    });

    // スライダー連動
    paddingSlider.addEventListener('input', (e) => {
        padding = parseInt(e.target.value);
        paddingValue.textContent = `${padding}px`;
        draw();
    });

    radiusSlider.addEventListener('input', (e) => {
        radius = parseInt(e.target.value);
        radiusValue.textContent = `${radius}px`;
        draw();
    });

    shadowSlider.addEventListener('input', (e) => {
        shadow = parseInt(e.target.value);
        shadowValue.textContent = `${shadow}px`;
        draw();
    });

    tiltSlider.addEventListener('input', (e) => {
        tilt = parseInt(e.target.value);
        tiltValue.textContent = `${tilt}°`;
        draw();
    });

    // キャンバス描画メイン関数
    function draw() {
        if (!uploadedImage) return;

        // 1. キャンバスの解像度決定 (高解像度で出力)
        let targetWidth = 1200;
        let targetHeight = 675; // 16:9 default

        if (ratio === '4-3') {
            targetHeight = 900;
        } else if (ratio === '1-1') {
            targetWidth = 1000;
            targetHeight = 1000;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // 2. 背景描画
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        if (bgType === 'gradient') {
            // グラデーションパース & 描画
            const gradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
            
            if (bgValue.includes('#667eea')) {
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
            } else if (bgValue.includes('#ff9a9e')) {
                gradient.addColorStop(0, '#ff9a9e');
                gradient.addColorStop(0.5, '#fecfef');
                gradient.addColorStop(1, '#fecfef');
            } else if (bgValue.includes('#f093fb')) {
                gradient.addColorStop(0, '#f093fb');
                gradient.addColorStop(1, '#f5576c');
            } else if (bgValue.includes('#4facfe')) {
                gradient.addColorStop(0, '#4facfe');
                gradient.addColorStop(1, '#00f2fe');
            } else if (bgValue.includes('#0ba360')) {
                gradient.addColorStop(0, '#0ba360');
                gradient.addColorStop(1, '#3cba92');
            } else {
                gradient.addColorStop(0, '#434343');
                gradient.addColorStop(1, '#000000');
            }
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = bgValue;
        }
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 3. 画像とデバイスフレームの配置座標計算
        ctx.save();

        // 傾きの適用
        if (tilt !== 0) {
            ctx.translate(targetWidth / 2, targetHeight / 2);
            ctx.rotate((tilt * Math.PI) / 180);
            ctx.translate(-targetWidth / 2, -targetHeight / 2);
        }

        // 余白を考慮した最大描画可能エリア
        const availableW = targetWidth - (padding * 2);
        const availableH = targetHeight - (padding * 2);

        // 画像のフィット比率算出
        let imgW = uploadedImage.width;
        let imgH = uploadedImage.height;
        let frameHeaderH = 0;
        let frameFooterH = 0;
        let frameBezelW = 0;

        // 各フレームタイプに応じた調整
        if (frameType === 'browser') {
            frameHeaderH = 36; // ブラウザヘッダー高さ
        } else if (frameType === 'iphone') {
            frameBezelW = 12; // ベゼル幅
            frameHeaderH = 24; // 上部ベゼル
            frameFooterH = 24; // 下部ベゼル
        } else if (frameType === 'macbook') {
            frameBezelW = 16;
            frameHeaderH = 16;
            frameFooterH = 36; // 下部のキーボードトレー
        }

        // デバイスのトータルサイズ
        let devW = imgW + (frameBezelW * 2);
        let devH = imgH + frameHeaderH + frameFooterH;

        // 最大エリア内に収めるスケール計算
        const scaleX = availableW / devW;
        const scaleY = availableH / devH;
        const scale = Math.min(scaleX, scaleY, 1.0); // 最大100%

        const finalDevW = devW * scale;
        const finalDevH = devH * scale;

        // 中央配置のための座標
        let x = (targetWidth - finalDevW) / 2;
        let y = (targetHeight - finalDevH) / 2;

        // キャプションテキストが存在する場合、デバイスを下方向にオフセット
        if (captionText) {
            y += captionSize * 0.4;
        }

        // 影の設定 (Canvas shadow properties)
        if (shadow > 0) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = shadow;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = shadow / 2;
        }

        // 4. デバイスフレームと画像の描画
        if (frameType === 'browser') {
            drawBrowserFrame(x, y, finalDevW, finalDevH, scale, radius);
        } else if (frameType === 'iphone') {
            drawIPhoneFrame(x, y, finalDevW, finalDevH, scale, radius);
        } else if (frameType === 'macbook') {
            drawMacBookFrame(x, y, finalDevW, finalDevH, scale, radius);
        } else {
            // なし（画像そのまま）
            ctx.beginPath();
            roundRect(ctx, x, y, finalDevW, finalDevH, radius);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(uploadedImage, x, y, finalDevW, finalDevH);
        }

        ctx.restore();

        // 5. テキストキャプションの描画 (傾きさせず水平に描画)
        if (captionText) {
            ctx.save();
            ctx.fillStyle = captionColor;
            ctx.font = `bold ${captionSize}px 'Outfit', sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3;
            
            // テキストのY座標（上部余白の中央あたり）
            const textY = Math.max(captionSize + 15, padding - 5);
            ctx.fillText(captionText, targetWidth / 2, textY);
            ctx.restore();
        }
    }

    // 角丸長方形描画ヘルパー
    function roundRect(ctx, x, y, width, height, radius) {
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    }

    // 1. Browser Frame
    function drawBrowserFrame(x, y, w, h, scale, rad) {
        const headerH = 36 * scale;
        
        ctx.save();
        // 全体のクリップと背景
        ctx.beginPath();
        roundRect(ctx, x, y, w, h, rad);
        ctx.closePath();
        ctx.fillStyle = '#1e1e24';
        ctx.fill();

        // 影無効化して中身描画
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // ヘッダーバーの描画
        ctx.fillStyle = '#2a2b36';
        ctx.beginPath();
        roundRect(ctx, x, y, w, headerH, {tl: rad, tr: rad, bl: 0, br: 0});
        ctx.fill();

        // 3つのボタン（赤・黄・緑）
        const dotRadius = 5 * scale;
        const dotGap = 8 * scale;
        const startDotX = x + 16 * scale;
        const dotY = y + headerH / 2;

        const colors = ['#ff5f56', '#ffbd2e', '#27c93f'];
        colors.forEach((color, idx) => {
            ctx.beginPath();
            ctx.arc(startDotX + idx * (dotRadius * 2 + dotGap), dotY, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });

        // アドレスバー
        const addrW = w * 0.6;
        const addrH = 20 * scale;
        const addrX = x + (w - addrW) / 2;
        const addrY = y + (headerH - addrH) / 2;
        ctx.beginPath();
        roundRect(ctx, addrX, addrY, addrW, addrH, 4 * scale);
        ctx.fillStyle = '#17181f';
        ctx.fill();

        // 画像描画
        ctx.beginPath();
        roundRect(ctx, x, y + headerH, w, h - headerH, {tl: 0, tr: 0, bl: rad, br: rad});
        ctx.clip();
        ctx.drawImage(uploadedImage, x, y + headerH, w, h - headerH);
        ctx.restore();
    }

    // 2. iPhone Frame
    function drawIPhoneFrame(x, y, w, h, scale, rad) {
        const bezel = 12 * scale;
        
        ctx.save();
        // 本体（外縁枠カラー）の描画
        ctx.beginPath();
        roundRect(ctx, x, y, w, h, rad);
        ctx.fillStyle = deviceColor;
        ctx.fill();

        // 影無効化
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // 内ベゼル (少し小さくして黒に)
        const innerBezel = 2 * scale;
        ctx.beginPath();
        roundRect(ctx, x + innerBezel, y + innerBezel, w - innerBezel * 2, h - innerBezel * 2, rad - innerBezel);
        ctx.fillStyle = '#080810';
        ctx.fill();

        // スクリーン部分のクリッピング
        ctx.beginPath();
        roundRect(ctx, x + bezel, y + bezel, w - bezel * 2, h - bezel * 2, Math.max(0, rad - bezel));
        ctx.clip();
        ctx.drawImage(uploadedImage, x + bezel, y + bezel, w - bezel * 2, h - bezel * 2);
        ctx.restore();

        // ダイナミックアイランド (上に重ねる)
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        const diW = 90 * scale;
        const diH = 22 * scale;
        const diX = x + (w - diW) / 2;
        const diY = y + bezel + 8 * scale;
        ctx.beginPath();
        roundRect(ctx, diX, diY, diW, diH, diH / 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.restore();
    }

    // 3. MacBook Frame
    function drawMacBookFrame(x, y, w, h, scale, rad) {
        const bezel = 16 * scale;
        const keyboardH = 24 * scale;
        const screenH = h - keyboardH;

        ctx.save();
        // スクリーンケース（黒ベゼル）の描画
        ctx.beginPath();
        roundRect(ctx, x, y, w, screenH, rad);
        ctx.fillStyle = '#0a0a0f';
        ctx.fill();

        // 影無効化
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // スクリーンの中身（画像）
        ctx.beginPath();
        roundRect(ctx, x + bezel, y + bezel, w - bezel * 2, screenH - bezel * 2, Math.max(0, rad - bezel));
        ctx.clip();
        ctx.drawImage(uploadedImage, x + bezel, y + bezel, w - bezel * 2, screenH - bezel * 2);
        ctx.restore();

        // キーボードベース（底面）の描画
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // アルミ風底面プレート (deviceColorを使用)
        ctx.fillStyle = deviceColor;
        ctx.beginPath();
        const bottomY = y + screenH;
        ctx.moveTo(x + 10 * scale, bottomY);
        ctx.lineTo(x + w - 10 * scale, bottomY);
        ctx.lineTo(x + w, bottomY + keyboardH - 4 * scale);
        ctx.quadraticCurveTo(x + w, bottomY + keyboardH, x + w - 8 * scale, bottomY + keyboardH);
        ctx.lineTo(x + 8 * scale, bottomY + keyboardH);
        ctx.quadraticCurveTo(x, bottomY + keyboardH, x, bottomY + keyboardH - 4 * scale);
        ctx.closePath();
        ctx.fill();

        // ディスプレイ接続ヒンジ
        ctx.fillStyle = '#1e293b';
        const hingeW = w * 0.25;
        ctx.fillRect(x + (w - hingeW) / 2, bottomY, hingeW, 4 * scale);

        // ディスプレイを開くためのへこみ（ノッチ）
        ctx.fillStyle = '#0f172a';
        const notchW = 70 * scale;
        const notchH = 6 * scale;
        ctx.beginPath();
        roundRect(ctx, x + (w - notchW) / 2, bottomY, notchW, notchH, {tl: 0, tr: 0, bl: 4 * scale, br: 4 * scale});
        ctx.fill();

        ctx.restore();
    }

    // PNGダウンロード機能
    downloadBtn.addEventListener('click', () => {
        if (!uploadedImage) {
            showToast('まずは画像をアップロードしてください。');
            return;
        }

        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `mockup-studio-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('画像をダウンロードしました！');
        } catch (e) {
            console.error(e);
            showToast('画像の書き出しに失敗しました。');
        }
    });
});
