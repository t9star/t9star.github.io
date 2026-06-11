document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const regexPattern = document.getElementById('regex-pattern');
    const flagG = document.getElementById('flag-g');
    const flagI = document.getElementById('flag-i');
    const flagM = document.getElementById('flag-m');
    const regexSyntaxError = document.getElementById('regex-syntax-error');
    
    const testText = document.getElementById('test-text');
    const highlightBackdrop = document.getElementById('highlight-backdrop');
    const highlightOverlay = document.getElementById('highlight-overlay');
    const matchCountBadge = document.getElementById('match-count-badge');

    const templateBtns = document.querySelectorAll('.tpl-btn');
    
    // Pro要素 (Explainer)
    const explainerContainer = document.getElementById('explainer-container');
    const explainerLock = document.getElementById('explainer-lock');
    const btnUnlockExplainer = document.getElementById('btn-unlock-explainer');

    // Pro要素 (AI)
    const aiGeneratorLock = document.getElementById('ai-generator-lock');
    const aiGeneratorContent = document.getElementById('ai-generator-content');
    const btnUnlockAi = document.getElementById('btn-unlock-ai');
    const aiPromptInput = document.getElementById('ai-prompt-input');
    const btnAiGenerate = document.getElementById('btn-ai-generate');
    const aiResultBox = document.getElementById('ai-result-box');
    const aiResultPattern = document.getElementById('ai-result-pattern');
    const aiResultExplain = document.getElementById('ai-result-explain');
    const btnUseAiPattern = document.getElementById('btn-use-ai-pattern');

    // モーダル・トースト
    const proStatusBtn = document.getElementById('pro-status-btn');
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // アプリ状態
    let isProUnlocked = localStorage.getItem('t9s_pro_unlocked') === 'true';
    const PRO_KEY = 'T9S-PC-FUND-2026';

    // 1. Proアンロック状態の表示更新
    function updateProUI() {
        if (isProUnlocked) {
            proStatusBtn.innerHTML = '💎 Pro Unlocked';
            proStatusBtn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
            proStatusBtn.style.color = '#000';
            
            // ロックオーバーレイの非表示
            if (explainerLock) explainerLock.classList.add('hidden');
            if (aiGeneratorLock) aiGeneratorLock.classList.add('hidden');
            if (aiGeneratorContent) aiGeneratorContent.classList.remove('hidden');

            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'none';
            });
            // 解説表示を更新
            updateExplainer(regexPattern.value);
        } else {
            proStatusBtn.innerHTML = '💎 Get Pro';
            proStatusBtn.style.background = '';
            proStatusBtn.style.color = '';
            if (explainerLock) explainerLock.classList.remove('hidden');
            if (aiGeneratorLock) aiGeneratorLock.classList.remove('hidden');
            if (aiGeneratorContent) aiGeneratorContent.classList.add('hidden');
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

    // 2. HTMLエスケープヘルパー
    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 3. リアルタイムマッチング ＆ レイヤードハイライト
    function handleInput() {
        const text = testText.value;
        const pattern = regexPattern.value;
        
        if (!pattern) {
            highlightOverlay.innerHTML = escapeHtml(text);
            matchCountBadge.textContent = '0 matches';
            return;
        }

        try {
            let flags = '';
            if (flagG.checked) flags += 'g';
            if (flagI.checked) flags += 'i';
            if (flagM.checked) flags += 'm';

            const regex = new RegExp(pattern, flags);
            regexSyntaxError.classList.add('hidden');
            
            let matchCount = 0;
            let html = '';
            
            if (flags.includes('g')) {
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    // 無限ループ防止 (パターンが空文字マッチする可能性がある場合)
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    matchCount++;
                    html += escapeHtml(text.slice(lastIndex, match.index));
                    html += `<mark>${escapeHtml(match[0])}</mark>`;
                    lastIndex = regex.lastIndex;
                }
                html += escapeHtml(text.slice(lastIndex));
            } else {
                const match = regex.exec(text);
                if (match) {
                    matchCount = 1;
                    html += escapeHtml(text.slice(0, match.index));
                    html += `<mark>${escapeHtml(match[0])}</mark>`;
                    html += escapeHtml(text.slice(match.index + match[0].length));
                } else {
                    html = escapeHtml(text);
                }
            }

            // レイヤードエディタの末尾の改行ズレを防止するためのハック
            highlightOverlay.innerHTML = html.replace(/\n$/, '\n\n');
            matchCountBadge.textContent = `${matchCount} match${matchCount !== 1 ? 'es' : ''}`;
            
            // Pro解説をリアルタイムに更新
            if (isProUnlocked) {
                updateExplainer(pattern);
            }

        } catch (err) {
            regexSyntaxError.textContent = err.message;
            regexSyntaxError.classList.remove('hidden');
            highlightOverlay.innerHTML = escapeHtml(text);
            matchCountBadge.textContent = '0 matches';
        }
    }

    // スクロールの同期
    testText.addEventListener('scroll', () => {
        highlightBackdrop.scrollTop = testText.scrollTop;
        highlightBackdrop.scrollLeft = testText.scrollLeft;
    });

    // イベントバインド
    regexPattern.addEventListener('input', handleInput);
    testText.addEventListener('input', handleInput);
    flagG.addEventListener('change', handleInput);
    flagI.addEventListener('change', handleInput);
    flagM.addEventListener('change', handleInput);

    // 4. テンプレート読み込み
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pattern = btn.dataset.pattern;
            const flags = btn.dataset.flags;
            const text = btn.dataset.text;

            regexPattern.value = pattern;
            flagG.checked = flags.includes('g');
            flagI.checked = flags.includes('i');
            flagM.checked = flags.includes('m');
            testText.value = text;

            handleInput();
            showToast('📋 テンプレートを読み込みました。');
        });
    });

    // 5. 正規表現のビジュアル解説 (Explainer) - Pro機能
    function updateExplainer(pattern) {
        if (!isProUnlocked) return;

        // 既存の解説をクリア (ロックオーバーレイ以外を消去)
        const existingList = explainerContainer.querySelector('.explainer-list');
        if (existingList) existingList.remove();

        const explanations = [];

        // 簡易正規表現パース＆解説エンジン
        let i = 0;
        while (i < pattern.length) {
            const char = pattern[i];

            if (char === '^') {
                explanations.push({ code: '^', text: '文字列の先頭 (Line Start) に一致します。' });
                i++;
            } else if (char === '$') {
                explanations.push({ code: '$', text: '文字列の末尾 (Line End) に一致します。' });
                i++;
            } else if (char === '\\') {
                // エスケープシーケンスの解析
                const nextChar = pattern[i + 1];
                if (nextChar === 'd') {
                    explanations.push({ code: '\\d', text: '数字 (0〜9 のいずれか1文字) に一致します。' });
                } else if (nextChar === 'w') {
                    explanations.push({ code: '\\w', text: '英数字およびアンダースコア (a-z, A-Z, 0-9, _) に一致します。' });
                } else if (nextChar === 's') {
                    explanations.push({ code: '\\s', text: '空白文字 (スペース、タブ、改行等) に一致します。' });
                } else if (nextChar === 'b') {
                    explanations.push({ code: '\\b', text: '単語の境界 (文字とスペースの境界位置など) に一致します。' });
                } else {
                    explanations.push({ code: '\\' + nextChar, text: `文字 '${nextChar}' 自体に一致します。` });
                }
                i += 2;
            } else if (char === '[') {
                // 文字クラスの解析
                let inner = '';
                let j = i + 1;
                let isNegated = false;
                if (pattern[j] === '^') {
                    isNegated = true;
                    j++;
                }
                while (j < pattern.length && pattern[j] !== ']') {
                    inner += pattern[j];
                    j++;
                }
                const name = isNegated ? '以外の文字クラス' : '文字クラス';
                const desc = isNegated ? '指定された文字「以外」のいずれか1文字に一致します。' : '括弧内のいずれか1文字に一致します。';
                explanations.push({ code: `[${isNegated ? '^' : ''}${inner}]`, text: `${name}: ${desc} (中身: ${inner})` });
                i = j + 1;
            } else if (char === '+' || char === '*' || char === '?') {
                const prev = explanations[explanations.length - 1];
                const prevCode = prev ? prev.code : '直前の要素';
                if (char === '+') {
                    explanations.push({ code: '+', text: `直前の要素「${prevCode}」の 1回以上の繰り返し に一致します。` });
                } else if (char === '*') {
                    explanations.push({ code: '*', text: `直前の要素「${prevCode}」の 0回以上の繰り返し に一致します。` });
                } else {
                    explanations.push({ code: '?', text: `直前の要素「${prevCode}」が 0回または1回のみ存在すること に一致します。` });
                }
                i++;
            } else if (char === '{') {
                let range = '';
                let j = i + 1;
                while (j < pattern.length && pattern[j] !== '}') {
                    range += pattern[j];
                    j++;
                }
                const prev = explanations[explanations.length - 1];
                const prevCode = prev ? prev.code : '直前の要素';
                explanations.push({ code: `{${range}}`, text: `直前の要素「${prevCode}」が指定回数 (${range}回) 繰り返すことに一致します。` });
                i = j + 1;
            } else if (char === '(') {
                let group = '';
                let j = i + 1;
                let isNonCapturing = false;
                if (pattern[j] === '?' && pattern[j+1] === ':') {
                    isNonCapturing = true;
                    j += 2;
                }
                // ネストは簡易無視して閉じ括弧を探す
                let openCount = 1;
                while (j < pattern.length && openCount > 0) {
                    if (pattern[j] === '(') openCount++;
                    if (pattern[j] === ')') openCount--;
                    if (openCount > 0) group += pattern[j];
                    j++;
                }
                const gType = isNonCapturing ? '非キャプチャグループ' : 'キャプチャグループ';
                explanations.push({ code: `(${isNonCapturing ? '?:' : ''}${group})`, text: `${gType}: サブパターン「${group}」をグループ化します。` });
                i = j;
            } else if (char === '|') {
                explanations.push({ code: '|', text: '「OR (または)」の論理式。左側または右側のパターンのいずれかに一致します。' });
                i++;
            } else {
                explanations.push({ code: char, text: `文字 '${char}' 自体に一致します。` });
                i++;
            }
        }

        // 解説リストを表示
        const listEl = document.createElement('div');
        listEl.className = 'explainer-list';

        // 表示するステップを最大6個に絞る (多すぎると重なるため)
        const displaySteps = explanations.slice(0, 6);
        displaySteps.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'explainer-item';
            itemEl.innerHTML = `<code>${escapeHtml(item.code)}</code><span>${escapeHtml(item.text)}</span>`;
            listEl.appendChild(itemEl);
        });

        if (explanations.length > 6) {
            const moreEl = document.createElement('div');
            moreEl.className = 'explainer-item';
            moreEl.style.borderLeftColor = 'var(--secondary)';
            moreEl.innerHTML = `<code>...</code><span>他 ${explanations.length - 6} 個のステップ分解があります。</span>`;
            listEl.appendChild(moreEl);
        }

        explainerContainer.appendChild(listEl);
    }

    // 6. AI Regex Prompt Generator (Pro) - モック挙動
    btnAiGenerate.addEventListener('click', () => {
        const prompt = aiPromptInput.value.trim().toLowerCase();
        if (!prompt) return;

        showToast('🤖 AI が正規表現を構築中...');
        btnAiGenerate.disabled = true;

        setTimeout(() => {
            let pattern = '';
            let explanation = '';

            if (prompt.includes('郵便') || prompt.includes('zip')) {
                pattern = '^\\d{3}-\\d{4}$';
                explanation = '日本の郵便番号 (3桁の数字、ハイフン、4桁の数字) に文字列全体が完全に一致します。';
            } else if (prompt.includes('ip') || prompt.includes('アイピー')) {
                pattern = '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$';
                explanation = 'IPv4 アドレス形式 (1〜3桁の数字とドットの3回繰り返し ＋ 1〜3桁の数字) に一致します。';
            } else if (prompt.includes('数字') && prompt.includes('のみ')) {
                pattern = '^\\d+$';
                explanation = '1文字以上の半角数字のみで構成された文字列全体に一致します。';
            } else if (prompt.includes('英語') || prompt.includes('アルファベット')) {
                pattern = '^[a-zA-Z]+$';
                explanation = '1文字以上の半角英字 (大文字・小文字) のみに一致します。';
            } else {
                // 汎用フォールバック
                pattern = '^' + prompt.replace(/[^a-zA-Z0-9]/g, '') + '$';
                explanation = `入力されたプロンプトから生成された簡易パターンです。本格的な生成には OpenAI API の設定を推奨します。`;
            }

            aiResultPattern.textContent = pattern;
            aiResultExplain.textContent = `解説: ${explanation}`;
            aiResultBox.classList.remove('hidden');
            btnAiGenerate.disabled = false;
            showToast('✨ パターンを生成しました！');
        }, 1200);
    });

    btnUseAiPattern.addEventListener('click', () => {
        const pattern = aiResultPattern.textContent;
        regexPattern.value = pattern;
        handleInput();
        showToast('✔️ 生成された正規表現を適用しました！');
    });

    // 7. Proモーダルハンドリング
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

    btnUnlockExplainer.addEventListener('click', openProModal);
    btnUnlockAi.addEventListener('click', openProModal);
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
            handleInput(); // UI更新してハイライト・解説描画
            showToast('🎉 Pro機能が正常にアンロックされました！');
        } else {
            keyErrorMsg.classList.remove('hidden');
        }
    });

    // 初期生成
    handleInput();
});
