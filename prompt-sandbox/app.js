function init() {
    // DOM要素の取得
    const selectLibraryTemplate = document.getElementById('select-library-template');
    const templateEditorTextarea = document.getElementById('template-editor-textarea');
    const variableFormsContainer = document.getElementById('variable-forms-container');
    const formsPlaceholder = document.getElementById('forms-placeholder');

    const customPresetName = document.getElementById('custom-preset-name');
    const btnSaveCustomPreset = document.getElementById('btn-save-custom-preset');
    const selectCustomPresets = document.getElementById('select-custom-presets');

    const finalPromptTextarea = document.getElementById('final-prompt-textarea');
    const counterDisplay = document.getElementById('counter-display');
    const badgeTokenPro = document.getElementById('badge-token-pro');
    const btnCopyPrompt = document.getElementById('btn-copy-prompt');

    const proStatusBtn = document.getElementById('pro-status-btn');
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // アプリ状態
    let variables = []; // 検出された変数リスト ['Role', 'Format', ...]
    let variableValues = {}; // ユーザーの入力値キャッシュ { 'Role': 'エンジニア', ... }
    
    let isProUnlocked = false;
    try {
        isProUnlocked = localStorage.getItem('t9s_pro_unlocked') === 'true';
    } catch (e) {
        console.warn('localStorage access failed:', e);
    }
    const PRO_KEY = 'T9S-PC-FUND-2026';

    // プリセットライブラリデータ
    const libraryPresets = {
        persona: `あなたは{{分野}}の専門家である{{ペルソナ役割}}です。{{対象読者}}に向けて、{{トピック}}に関する実践的なアドバイスを{{トーン}}な口調で提供してください。`,
        prep: `以下の主張について、PREP法（Point, Reason, Example, Point）に則って論理的な文章を作成してください。\n\n【結論 (Point)】\n{{結論}}\n\n【理由 (Reason)】\n{{理由}}\n\n【具体例 (Example)】\n{{具体例}}\n\n【結論の再主張 (Point)】\n{{結論の再主張}}`,
        'code-review': `以下の{{プログラミング言語}}のコードについて、セキュリティ脆弱性、パフォーマンスボトルネック、およびクリーンコードの観点から査読を行ってください。改善可能な箇所がある場合は、具体的な修正コードの提案を含めてください。\n\n\`\`\`{{プログラミング言語}}\n{{ソースコード}}\n\`\`\``,
        summary: `以下の文章を読み、{{要約文字数}}程度で簡潔に要約した上で、重要なポイントを{{箇条書きの数}}つの箇条書きでまとめてください。\n\n【対象の文章】\n{{要約対象のテキスト}}`
    };

    // 1. Proアンロック状態の表示更新
    function updateProUI() {
        if (isProUnlocked) {
            proStatusBtn.innerHTML = '💎 Pro Unlocked';
            proStatusBtn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
            proStatusBtn.style.color = '#000';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'none';
            });
            // テンプレートマネージャ有効化
            customPresetName.removeAttribute('disabled');
            btnSaveCustomPreset.removeAttribute('disabled');
            selectCustomPresets.removeAttribute('disabled');
            if (badgeTokenPro) badgeTokenPro.style.display = 'none';
        } else {
            proStatusBtn.innerHTML = '💎 Get Pro';
            proStatusBtn.style.background = '';
            proStatusBtn.style.color = '';
            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.style.display = 'inline-block';
            });
            customPresetName.setAttribute('disabled', 'true');
            btnSaveCustomPreset.setAttribute('disabled', 'true');
            selectCustomPresets.setAttribute('disabled', 'true');
            if (badgeTokenPro) badgeTokenPro.style.display = 'inline-block';
        }
        synthesizePrompt(); // 表示更新に伴うカウンター更新
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

    // 2. 変数の動的抽出とフォーム生成
    function parseTemplateVariables() {
        const text = templateEditorTextarea.value;
        const regex = /\{\{([^}]+)\}\}/g;
        let match;
        const foundVars = [];

        while ((match = regex.exec(text)) !== null) {
            const varName = match[1].trim();
            if (varName && !foundVars.includes(varName)) {
                foundVars.push(varName);
            }
        }

        variables = foundVars;
        generateVariableInputs();
        synthesizePrompt();
    }

    templateEditorTextarea.addEventListener('input', parseTemplateVariables);

    // インプットフォーム要素の動的生成
    function generateVariableInputs() {
        // 現在のインプットデータを一時退避
        const currentInputs = {};
        variableFormsContainer.querySelectorAll('input, textarea').forEach(el => {
            currentInputs[el.dataset.var] = el.value;
        });

        // コンテナクリア
        variableFormsContainer.innerHTML = '';

        if (variables.length === 0) {
            variableFormsContainer.appendChild(formsPlaceholder);
            return;
        }

        variables.forEach(varName => {
            const field = document.createElement('div');
            field.className = 'form-field';

            const label = document.createElement('label');
            label.textContent = varName;
            field.appendChild(label);

            // ソースコードや長い文章向けの簡易サイズ判定
            let inputEl;
            if (varName.includes('テキスト') || varName.includes('ソースコード') || varName.includes('文章')) {
                inputEl = document.createElement('textarea');
                inputEl.rows = 3;
            } else {
                inputEl = document.createElement('input');
                inputEl.type = 'text';
            }

            inputEl.dataset.var = varName;
            inputEl.placeholder = `${varName} の値を入力...`;
            
            // 退避しておいたキャッシュ、または状態があれば復元
            if (currentInputs[varName] !== undefined) {
                inputEl.value = currentInputs[varName];
                variableValues[varName] = currentInputs[varName];
            } else if (variableValues[varName] !== undefined) {
                inputEl.value = variableValues[varName];
            } else {
                variableValues[varName] = '';
            }

            // イベントバインド
            inputEl.addEventListener('input', (e) => {
                variableValues[varName] = e.target.value;
                synthesizePrompt();
            });

            field.appendChild(inputEl);
            variableFormsContainer.appendChild(field);
        });
    }

    // 3. プロンプト合成 ＆ 簡易トークンカウント
    function synthesizePrompt() {
        let finalPrompt = templateEditorTextarea.value;
        
        variables.forEach(varName => {
            const userValue = variableValues[varName] || `[${varName}]`;
            // 全置換 (RegExpエスケープ処理をして安全に置換)
            const escapedVar = varName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const replaceRegex = new RegExp(`\\{\\{\\s*${escapedVar}\\s*\\}\\}`, 'g');
            finalPrompt = finalPrompt.replace(replaceRegex, userValue);
        });

        finalPromptTextarea.value = finalPrompt;

        // 文字数カウント
        const charCount = finalPrompt.length;
        let counterText = `Characters: ${charCount}`;

        // トークン数カウンター ⭐Pro
        if (isProUnlocked) {
            // 日本語の文字数
            const jpCount = (finalPrompt.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf]/g) || []).length;
            // 英語の単語数
            const enWords = finalPrompt.replace(/[\u3000-\u9faf]/g, '').split(/\s+/).filter(w => w.length > 0).length;
            // 推定トークン (日本語は1文字≒1.1トークン, 英語は1単語≒1.3トークンとして計算)
            const estimatedTokens = Math.round(jpCount * 1.1 + enWords * 1.3);
            
            counterText += ` | Est. Tokens: ~${estimatedTokens}`;
        }

        counterDisplay.textContent = counterText;
    }

    // 4. テンプレートライブラリ選択
    selectLibraryTemplate.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            templateEditorTextarea.value = '';
        } else if (libraryPresets[val]) {
            templateEditorTextarea.value = libraryPresets[val];
        }
        variableValues = {}; // プリセット切り替え時は値をリセット
        parseTemplateVariables();
    });

    // 5. コピー機能
    btnCopyPrompt.addEventListener('click', () => {
        const finalPrompt = finalPromptTextarea.value.trim();
        if (!finalPrompt) {
            showToast('⚠️ コピーするプロンプトがありません。');
            return;
        }

        navigator.clipboard.writeText(finalPrompt).then(() => {
            showToast('📋 合成されたプロンプトをコピーしました！');
        }).catch(() => {
            showToast('❌ コピーに失敗しました。');
        });
    });

    // 6. カスタムテンプレートマネージャー (Pro)
    const STORAGE_KEY = 't9s_prompt_presets';

    function loadCustomPresets() {
        if (!isProUnlocked) return;

        selectCustomPresets.innerHTML = '<option value="">-- Saved Custom Presets --</option>';
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const presets = JSON.parse(raw);
                presets.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.name;
                    opt.textContent = p.name;
                    selectCustomPresets.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('Load custom presets failed:', e);
        }
    }
    loadCustomPresets();

    btnSaveCustomPreset.addEventListener('click', () => {
        if (!isProUnlocked) {
            openProModal();
            return;
        }

        const name = customPresetName.value.trim();
        const template = templateEditorTextarea.value.trim();

        if (!name) {
            showToast('⚠️ プリセット名を入力してください。');
            return;
        }
        if (!template) {
            showToast('⚠️ テンプレートが空です。');
            return;
        }

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            let presets = raw ? JSON.parse(raw) : [];

            // 重複排除・上書き
            presets = presets.filter(p => p.name !== name);
            presets.push({ name, template });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
            showToast(`🎉 テンプレート「${name}」を保存しました！`);
            customPresetName.value = '';
            
            loadCustomPresets();
        } catch (e) {
            console.error('Save custom preset failed:', e);
            showToast('❌ 保存に失敗しました。');
        }
    });

    selectCustomPresets.addEventListener('change', (e) => {
        const name = e.target.value;
        if (!name) return;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const presets = JSON.parse(raw);
                const found = presets.find(p => p.name === name);
                if (found) {
                    selectLibraryTemplate.value = 'custom';
                    templateEditorTextarea.value = found.template;
                    variableValues = {};
                    parseTemplateVariables();
                    showToast(`✔️ テンプレート「${name}」をロードしました。`);
                }
            }
        } catch (e) {
            console.error('Load custom preset selection failed:', e);
        }
    });

    // 7. Proアンロックモーダル
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
            loadCustomPresets();
            showToast('🎉 Pro機能が正常にアンロックされました！');
        } else {
            keyErrorMsg.classList.remove('hidden');
        }
    });

    // 初期起動時の変数抽出
    parseTemplateVariables();
}

// 安全なDOM読み込み監視イニシャライザ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
