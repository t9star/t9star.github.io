function init() {
    // DOM要素の取得
    const styleTabBtns = document.querySelectorAll('#style-tabs .tab-btn');
    const paramsGlass = document.getElementById('params-glass');
    const paramsShadow = document.getElementById('params-shadow');
    const paramsNeumorphic = document.getElementById('params-neumorphic');

    // Glass parameters
    const paramGlassBlur = document.getElementById('param-glass-blur');
    const paramGlassOpacity = document.getElementById('param-glass-opacity');
    const paramGlassBorder = document.getElementById('param-glass-border');
    const colorGlassBg = document.getElementById('color-glass-bg');
    const valGlassBlur = document.getElementById('val-glass-blur');
    const valGlassOpacity = document.getElementById('val-glass-opacity');
    const valGlassBorder = document.getElementById('val-glass-border');

    // Shadow parameters
    const paramShadowLayers = document.getElementById('param-shadow-layers');
    const paramShadowBlur = document.getElementById('param-shadow-blur');
    const paramShadowSpread = document.getElementById('param-shadow-spread');
    const colorShadowBase = document.getElementById('color-shadow-base');
    const valShadowLayers = document.getElementById('val-shadow-layers');
    const valShadowBlur = document.getElementById('val-shadow-blur');
    const valShadowSpread = document.getElementById('val-shadow-spread');

    // Neumorphic parameters
    const colorNeuBase = document.getElementById('color-neu-base');
    const paramNeuSize = document.getElementById('param-neu-size');
    const paramNeuBlur = document.getElementById('param-neu-blur');
    const paramNeuShape = document.getElementById('param-neu-shape');
    const paramNeuAngle = document.getElementById('param-neu-angle');
    const valNeuSize = document.getElementById('val-neu-size');
    const valNeuBlur = document.getElementById('val-neu-blur');
    const valNeuAngle = document.getElementById('val-neu-angle');

    // Backgrounds
    const bgOptions = document.querySelectorAll('.bg-option');
    const previewStage = document.getElementById('preview-stage');
    const bgOptionNeu = document.getElementById('bg-option-neu');

    // Preview Targets
    const demoBox = document.getElementById('demo-box');
    const proTemplateLayout = document.getElementById('pro-template-layout');
    const demoSidebar = document.getElementById('demo-sidebar');
    const demoWidget1 = document.getElementById('demo-widget-1');
    const demoWidget2 = document.getElementById('demo-widget-2');

    // Code Output
    const codeTabs = document.querySelectorAll('.code-tab');
    const codeTextarea = document.getElementById('code-textarea');
    const btnCopyCode = document.getElementById('btn-copy-code');
    const tabTwBadge = document.getElementById('tab-tw-badge');

    const proStatusBtn = document.getElementById('pro-status-btn');
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // アプリ状態
    let currentStyle = 'glass'; // 'glass', 'shadow', 'neumorphic'
    let currentBg = 'gradient-mesh';
    let currentLang = 'css'; // 'css', 'tailwind'

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
            // ロック解除
            paramNeuShape.removeAttribute('disabled');
            paramNeuAngle.removeAttribute('disabled');
            if (tabTwBadge) tabTwBadge.style.display = 'none';

            // Pro用の複数カードプレビューに切り替え
            demoBox.classList.add('hidden');
            proTemplateLayout.classList.remove('hidden');
        } else {
            proStatusBtn.innerHTML = '💎 Get Pro';
            proStatusBtn.style.background = '';
            proStatusBtn.style.color = '';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'inline-block';
            });
            paramNeuShape.setAttribute('disabled', 'true');
            paramNeuAngle.setAttribute('disabled', 'true');
            if (tabTwBadge) tabTwBadge.style.display = 'inline-block';

            // 通常プレビュー
            demoBox.classList.remove('hidden');
            proTemplateLayout.classList.add('hidden');
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

    // 2. スタイルタブ切り替え
    styleTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            styleTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;

            // パラメータパネル切り替え
            paramsGlass.classList.add('hidden');
            paramsShadow.classList.add('hidden');
            paramsNeumorphic.classList.add('hidden');
            bgOptionNeu.style.display = 'none';

            if (currentStyle === 'glass') {
                paramsGlass.classList.remove('hidden');
                // 背景をグラデーションメッシュに戻す
                if (currentBg === 'neu-solid') {
                    bgOptions[0].click();
                }
            } else if (currentStyle === 'shadow') {
                paramsShadow.classList.remove('hidden');
                if (currentBg === 'neu-solid') {
                    bgOptions[0].click();
                }
            } else {
                paramsNeumorphic.classList.remove('hidden');
                // Neumorphic の場合は背景を専用のソリッドグレーに変更
                bgOptionNeu.style.display = 'block';
                bgOptionNeu.click();
            }
            updateStyles();
        });
    });

    // 3. パラメータ変更のリアルタイム更新
    const inputs = [
        paramGlassBlur, paramGlassOpacity, paramGlassBorder, colorGlassBg,
        paramShadowLayers, paramShadowBlur, paramShadowSpread, colorShadowBase,
        colorNeuBase, paramNeuSize, paramNeuBlur, paramNeuShape, paramNeuAngle
    ];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateLabels();
            updateStyles();
        });
        input.addEventListener('change', () => {
            updateLabels();
            updateStyles();
        });
    });

    function updateLabels() {
        valGlassBlur.textContent = paramGlassBlur.value + 'px';
        valGlassOpacity.textContent = paramGlassOpacity.value + '%';
        valGlassBorder.textContent = paramGlassBorder.value + '%';

        valShadowLayers.textContent = paramShadowLayers.value;
        valShadowBlur.textContent = paramShadowBlur.value + 'px';
        valShadowSpread.textContent = paramShadowSpread.value + 'px';

        valNeuSize.textContent = paramNeuSize.value + 'px';
        valNeuBlur.textContent = paramNeuBlur.value + 'px';
        
        // 角度に応じた向きのテキスト表示
        const angle = parseInt(paramNeuAngle.value);
        let dir = '';
        if (angle >= 337.5 || angle < 22.5) dir = '右';
        else if (angle >= 22.5 && angle < 67.5) dir = '右下';
        else if (angle >= 67.5 && angle < 112.5) dir = '下';
        else if (angle >= 112.5 && angle < 157.5) dir = '左下';
        else if (angle >= 157.5 && angle < 202.5) dir = '左';
        else if (angle >= 202.5 && angle < 247.5) dir = '左上';
        else if (angle >= 247.5 && angle < 292.5) dir = '上';
        else if (angle >= 292.5 && angle < 337.5) dir = '右上';
        valNeuAngle.textContent = `${angle}° (${dir})`;
    }

    // 4. 背景オプション切り替え
    bgOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            bgOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            
            currentBg = opt.dataset.bg;
            
            // ステージのクラス更新
            previewStage.className = 'preview-card-bg ' + currentBg;
            
            // Neumorphicベース色の同期
            if (currentBg === 'neu-solid' && currentStyle === 'neumorphic') {
                previewStage.style.backgroundColor = colorNeuBase.value;
            } else {
                previewStage.style.backgroundColor = '';
            }
        });
    });

    // 5. CSS/Tailwind 生成コアロジック
    function hexToRgba(hex, alpha) {
        if (!hex.startsWith('#')) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Neumorphic用のカラーシェード計算
    function adjustColorBrightness(hex, percent) {
        let R = parseInt(hex.substring(1, 3), 16);
        let G = parseInt(hex.substring(3, 5), 16);
        let B = parseInt(hex.substring(5, 7), 16);

        R = parseInt((R * (100 + percent)) / 100);
        G = parseInt((G * (100 + percent)) / 100);
        B = parseInt((B * (100 + percent)) / 100);

        R = R < 255 ? R : 255;
        G = G < 255 ? G : 255;
        B = B < 255 ? B : 255;

        R = R > 0 ? R : 0;
        G = G > 0 ? G : 0;
        B = B > 0 ? B : 0;

        const rHex = R.toString(16).padStart(2, '0');
        const gHex = G.toString(16).padStart(2, '0');
        const bHex = B.toString(16).padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
    }

    function updateStyles() {
        let cssStyle = {};
        let cssCode = '';
        let tailwindCode = '';

        if (currentStyle === 'glass') {
            const blur = parseInt(paramGlassBlur.value);
            const opacity = parseInt(paramGlassOpacity.value) / 100;
            const borderOpacity = parseInt(paramGlassBorder.value) / 100;
            const bgColor = hexToRgba(colorGlassBg.value, opacity);
            const borderColor = hexToRgba('#ffffff', borderOpacity);

            cssStyle = {
                background: bgColor,
                backdropFilter: `blur(${blur}px)`,
                webkitBackdropFilter: `blur(${blur}px)`,
                border: `1px solid ${borderColor}`,
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                color: '#ffffff'
            };

            cssCode = `background: ${bgColor};\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid ${borderColor};\nbox-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);`;
            
            // Tailwind CSS
            const rHex = colorGlassBg.value.toLowerCase();
            tailwindCode = `bg-[${rHex}]/[${opacity}] backdrop-blur-[${blur}px] border border-white/[${borderOpacity}] shadow-2xl`;

        } else if (currentStyle === 'shadow') {
            const layers = parseInt(paramShadowLayers.value);
            const blur = parseInt(paramShadowBlur.value);
            const spread = parseInt(paramShadowSpread.value);
            const baseColor = colorShadowBase.value;

            // 多重レイヤーシャドウの構築
            const shadowParts = [];
            const twShadowParts = [];
            for (let i = 1; i <= layers; i++) {
                const dy = i * 2;
                const dBlur = Math.round(blur * (i / layers));
                const dSpread = Math.round(spread * (i / layers));
                const opacity = (0.12 / layers).toFixed(3);
                const color = hexToRgba(baseColor, opacity);
                
                shadowParts.push(`0 ${dy}px ${dBlur}px ${dSpread}px ${color}`);
                twShadowParts.push(`0_${dy}px_${dBlur}px_${dSpread}px_rgba(${parseInt(baseColor.slice(1,3),16)},${parseInt(baseColor.slice(3,5),16)},${parseInt(baseColor.slice(5,7),16)},${opacity})`);
            }
            const shadowStr = shadowParts.join(',\n  ');
            const twShadowStr = twShadowParts.join(',');

            cssStyle = {
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: shadowStr,
                color: '#ffffff'
            };

            cssCode = `background: #1e293b;\nborder: 1px solid rgba(255, 255, 255, 0.05);\nbox-shadow: ${shadowStr};`;
            
            tailwindCode = `bg-slate-800 border border-white/5 shadow-[${twShadowStr}]`;

        } else {
            // Neumorphic
            const baseColor = colorNeuBase.value;
            const size = parseInt(paramNeuSize.value);
            const blur = parseInt(paramNeuBlur.value);
            const shape = paramNeuShape.value; // Pro
            const angle = parseInt(paramNeuAngle.value);

            // 光源角度から影の向き dx, dy を計算
            const rad = angle * Math.PI / 180;
            const dx = Math.round(Math.cos(rad) * size);
            const dy = Math.round(Math.sin(rad) * size);

            // 明暗のカラーコード計算
            const lightColor = adjustColorBrightness(baseColor, 15); // 少し明るく
            const darkColor = adjustColorBrightness(baseColor, -12); // 少し暗く

            const shadowStr = `${dx}px ${dy}px ${blur}px ${darkColor}, \n  -${dx}px -${dy}px ${blur}px ${lightColor}`;
            const twShadowStr = `${dx}px_${dy}px_${blur}px_${darkColor},-${dx}px_-${dy}px_${blur}px_${lightColor}`;

            // 形状グラデーション (Pro)
            let bgStyle = baseColor;
            let twBgStyle = `bg-[${baseColor}]`;
            if (isProUnlocked) {
                if (shape === 'concave') {
                    // 内側凹み
                    bgStyle = `linear-gradient(145deg, ${darkColor}, ${lightColor})`;
                    twBgStyle = `bg-gradient-to-br from-[${darkColor}] to-[${lightColor}]`;
                } else if (shape === 'convex') {
                    // 外側膨らみ
                    bgStyle = `linear-gradient(145deg, ${lightColor}, ${darkColor})`;
                    twBgStyle = `bg-gradient-to-br from-[${lightColor}] to-[${darkColor}]`;
                }
            }

            cssStyle = {
                background: bgStyle,
                boxShadow: shadowStr,
                color: '#333333', // グレー背景用の黒系テキスト
                border: 'none'
            };

            cssCode = `background: ${bgStyle};\nbox-shadow: ${shadowStr};`;
            
            tailwindCode = `${twBgStyle} shadow-[${twShadowStr}]`;

            // Neumorphic の場合は背景ステージをベース色に同調
            if (currentBg === 'neu-solid') {
                previewStage.style.backgroundColor = baseColor;
            }
        }

        // プレビューにインラインCSSを注入
        applyCssToPreview(cssStyle);

        // テキストエリアへの出力
        if (currentLang === 'css') {
            codeTextarea.value = cssCode;
        } else {
            codeTextarea.value = tailwindCode;
        }
    }

    // プレビューカード群にCSSを適用
    function applyCssToPreview(styles) {
        const targets = [demoBox, demoSidebar, demoWidget1, demoWidget2];
        targets.forEach(el => {
            if (!el) return;
            // 一旦クリア
            el.style.background = '';
            el.style.backdropFilter = '';
            el.style.webkitBackdropFilter = '';
            el.style.border = '';
            el.style.boxShadow = '';
            el.style.color = '';

            // スタイルコピー
            for (const [key, value] of Object.entries(styles)) {
                el.style[key] = value;
            }
        });
    }

    // 6. コード言語タブ切り替え
    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const lang = tab.dataset.lang;
            if (lang === 'tailwind' && !isProUnlocked) {
                openProModal();
                return;
            }
            codeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentLang = lang;
            updateStyles();
        });
    });

    // 7. コピー機能
    btnCopyCode.addEventListener('click', () => {
        const code = codeTextarea.value;
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            showToast(`📋 ${currentLang.toUpperCase()} コードをコピーしました！`);
        }).catch(() => {
            showToast('❌ コピーに失敗しました。');
        });
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
            updateStyles();
            showToast('🎉 Pro機能が正常にアンロックされました！');
        } else {
            keyErrorMsg.classList.remove('hidden');
        }
    });

    // 初期化
    updateLabels();
    updateStyles();
}

// 安全なDOM読み込み監視イニシャライザ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
