function init() {
    // DOM要素の取得
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output');
    const convertTarget = document.getElementById('convert-target');
    const btnConvert = document.getElementById('btn-convert');
    
    // エディタアクション
    const btnFormat = document.getElementById('btn-format');
    const btnMinify = document.getElementById('btn-minify');
    const btnClear = document.getElementById('btn-clear');
    const btnCopy = document.getElementById('btn-copy');
    const validationError = document.getElementById('validation-error');
    const errorMessage = document.getElementById('error-message');

    // Mockオプション
    const mockConfigGroup = document.getElementById('mock-config-group');
    const mockTemplate = document.getElementById('mock-template');
    const paramMockCount = document.getElementById('param-mock-count');
    const valMockCount = document.getElementById('val-mock-count');

    // モーダル・認証関連
    const proStatusBtn = document.getElementById('pro-status-btn');
    const proModal = document.getElementById('pro-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const proKeyInput = document.getElementById('pro-key-input');
    const btnSubmitKey = document.getElementById('btn-submit-key');
    const keyErrorMsg = document.getElementById('key-error-msg');
    const toastNotification = document.getElementById('toast-notification');

    // アプリ状態
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
            // セレクトボックスの星マークを消すか置換
            Array.from(convertTarget.options).forEach(opt => {
                opt.text = opt.text.replace(' ⭐', '');
            });
        } else {
            proStatusBtn.innerHTML = '💎 Get Pro';
            proStatusBtn.style.background = '';
            proStatusBtn.style.color = '';
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

    // 2. モックオプション表示の切替
    convertTarget.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'mock') {
            mockConfigGroup.classList.remove('hidden');
        } else {
            mockConfigGroup.classList.add('hidden');
        }

        // Pro機能選択時の即時チェック
        if (['typescript', 'go', 'java', 'mock'].includes(val) && !isProUnlocked) {
            openProModal();
            // FreeのYAMLに一旦戻す
            convertTarget.value = 'yaml';
            mockConfigGroup.classList.add('hidden');
        }
    });

    paramMockCount.addEventListener('input', (e) => {
        valMockCount.textContent = e.target.value;
    });

    // 3. 基本エディタ機能
    btnFormat.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        if (!input) return;
        try {
            const parsed = JSON.parse(input);
            jsonInput.value = JSON.stringify(parsed, null, 2);
            validationError.classList.add('hidden');
        } catch (err) {
            showValidationError(err.message);
        }
    });

    btnMinify.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        if (!input) return;
        try {
            const parsed = JSON.parse(input);
            jsonInput.value = JSON.stringify(parsed);
            validationError.classList.add('hidden');
        } catch (err) {
            showValidationError(err.message);
        }
    });

    btnClear.addEventListener('click', () => {
        jsonInput.value = '';
        jsonOutput.value = '';
        validationError.classList.add('hidden');
    });

    btnCopy.addEventListener('click', () => {
        const val = jsonOutput.value.trim();
        if (!val) return;
        navigator.clipboard.writeText(val).then(() => {
            showToast('📋 出力をクリップボードにコピーしました！');
        });
    });

    function showValidationError(msg) {
        errorMessage.textContent = msg;
        validationError.classList.remove('hidden');
    }

    // 4. 変換ロジック
    btnConvert.addEventListener('click', () => {
        const target = convertTarget.value;
        
        // Pro機能ロックの最終チェック
        if (['typescript', 'go', 'java', 'mock'].includes(target) && !isProUnlocked) {
            openProModal();
            return;
        }

        // Mock Generator の場合は入力JSONを無視してダミーデータを生成
        if (target === 'mock') {
            generateMockData();
            return;
        }

        const input = jsonInput.value.trim();
        if (!input) {
            showToast('⚠️ 入力JSONが空です。');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            validationError.classList.add('hidden');

            let output = '';
            switch (target) {
                case 'yaml':
                    output = jsonToYaml(parsed);
                    break;
                case 'xml':
                    output = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n' + jsonToXml(parsed) + '\n</root>';
                    break;
                case 'csv':
                    output = jsonToCsv(parsed);
                    break;
                case 'typescript':
                    output = jsonToTypeScript(parsed);
                    break;
                case 'go':
                    output = jsonToGo(parsed);
                    break;
                case 'java':
                    output = jsonToJava(parsed);
                    break;
            }
            jsonOutput.value = output;

        } catch (err) {
            showValidationError(err.message);
            showToast('❌ JSONの解析に失敗しました。');
        }
    });

    // 文字列の先頭を大文字にするヘルパー
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // JSON to YAML 変換アルゴリズム
    function jsonToYaml(obj, indent = 0) {
        const spacing = ' '.repeat(indent);
        if (obj === null) return 'null';
        if (typeof obj === 'string') {
            if (obj.includes('\n') || obj.includes(':') || obj.includes('-')) {
                return `"${obj.replace(/"/g, '\\"')}"`;
            }
            return obj;
        }
        if (typeof obj !== 'object') return String(obj);
        
        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]';
            return obj.map(item => `${spacing}- ${jsonToYaml(item, indent + 2).trim()}`).join('\n');
        }
        
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        return keys.map(key => {
            const value = obj[key];
            if (value !== null && typeof value === 'object') {
                return `${spacing}${key}:\n${jsonToYaml(value, indent + 2)}`;
            }
            return `${spacing}${key}: ${jsonToYaml(value, indent + 2).trim()}`;
        }).join('\n');
    }

    // JSON to XML 変換アルゴリズム
    function jsonToXml(obj, nodeName = 'item') {
        if (obj === null) return '';
        if (typeof obj !== 'object') return String(obj);
        if (Array.isArray(obj)) {
            return obj.map(item => `<${nodeName}>${jsonToXml(item, 'element')}</${nodeName}>`).join('\n');
        }
        return Object.keys(obj).map(key => {
            const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
            return `<${cleanKey}>${jsonToXml(obj[key], cleanKey)}</${cleanKey}>`;
        }).join('\n');
    }

    // JSON to CSV 変換アルゴリズム
    function jsonToCsv(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
            return 'Error: Input must be an array of objects to convert to CSV.\nExample: [ {"name": "Alice", "age": 20}, {"name": "Bob", "age": 25} ]';
        }
        
        const keys = Object.keys(arr[0]);
        const header = keys.join(',');
        const rows = arr.map(obj => {
            return keys.map(key => {
                let val = obj[key];
                if (val === null || val === undefined) return '';
                if (typeof val === 'object') val = JSON.stringify(val);
                val = String(val).replace(/"/g, '""');
                if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                    return `"${val}"`;
                }
                return val;
            }).join(',');
        });
        return [header, ...rows].join('\n');
    }

    // JSON to TypeScript (Pro)
    function jsonToTypeScript(obj, interfaceName = 'RootInterface') {
        if (obj === null) return 'any';
        if (Array.isArray(obj)) {
            const subType = obj.length > 0 ? (typeof obj[0] === 'object' ? jsonToTypeScript(obj[0], 'SubItem') : typeof obj[0]) : 'any';
            return `${subType}[]`;
        }
        if (typeof obj !== 'object') {
            return typeof obj;
        }
        
        let result = `export interface ${interfaceName} {\n`;
        const childInterfaces = [];
        
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            let typeStr = '';
            if (value === null) {
                typeStr = 'any';
            } else if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                    const subName = capitalize(key) + 'Item';
                    typeStr = `${subName}[]`;
                    childInterfaces.push(jsonToTypeScript(value[0], subName));
                } else {
                    typeStr = `${value.length > 0 ? typeof value[0] : 'any'}[]`;
                }
            } else if (typeof value === 'object') {
                const subName = capitalize(key);
                typeStr = subName;
                childInterfaces.push(jsonToTypeScript(value, subName));
            } else {
                typeStr = typeof value;
            }
            result += `  ${key}: ${typeStr};\n`;
        }
        result += '}';
        return [...childInterfaces, result].join('\n\n');
    }

    // JSON to Go Struct (Pro)
    function jsonToGo(obj, structName = 'AutoGenerated') {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
            return '// Root must be a JSON object to generate Go Struct';
        }
        
        let result = `type ${structName} struct {\n`;
        const subStructs = [];
        
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            const goKey = capitalize(key).replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
            let goType = '';
            
            if (value === null) {
                goType = 'interface{}';
            } else if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                    const subName = capitalize(key) + 'Item';
                    goType = `[]${subName}`;
                    subStructs.push(jsonToGo(value[0], subName));
                } else {
                    goType = `[]${getGoType(value[0])}`;
                }
            } else if (typeof value === 'object') {
                const subName = capitalize(key);
                goType = subName;
                subStructs.push(jsonToGo(value, subName));
            } else {
                goType = getGoType(value);
            }
            result += `\t${goKey}\t${goType}\t\`json:"${key}"\`\n`;
        }
        result += '}';
        return [...subStructs, result].join('\n\n');
    }

    function getGoType(val) {
        if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float64';
        if (typeof val === 'boolean') return 'bool';
        return 'string';
    }

    // JSON to Java POJO (Pro)
    function jsonToJava(obj, className = 'RootClass') {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
            return '// Root must be a JSON object to generate Java Class';
        }

        let fields = '';
        let gettersSetters = '';
        const childClasses = [];

        for (const key of Object.keys(obj)) {
            const value = obj[key];
            const javaKey = key.replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
            let javaType = '';

            if (value === null) {
                javaType = 'Object';
            } else if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                    const subName = capitalize(key) + 'Item';
                    javaType = `List<${subName}>`;
                    childClasses.push(jsonToJava(value[0], subName));
                } else {
                    javaType = `List<${capitalize(getJavaType(value[0]))}>`;
                }
            } else if (typeof value === 'object') {
                const subName = capitalize(key);
                javaType = subName;
                childClasses.push(jsonToJava(value, subName));
            } else {
                javaType = getJavaType(value);
            }

            fields += `    private ${javaType} ${javaKey};\n`;
            
            const capKey = capitalize(javaKey);
            gettersSetters += `
    public ${javaType} get${capKey}() {
        return this.${javaKey};
    }

    public void set${capKey}(${javaType} ${javaKey}) {
        this.${javaKey} = ${javaKey};
    }\n`;
        }

        let result = `public class ${className} {\n`;
        result += fields + '\n' + gettersSetters;
        result += '}';

        return [...childClasses, result].join('\n\n');
    }

    function getJavaType(val) {
        if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double';
        if (typeof val === 'boolean') return 'boolean';
        return 'String';
    }

    // 5. Mockデータ生成 (Pro)
    function generateMockData() {
        const template = mockTemplate.value;
        const count = parseInt(paramMockCount.value);
        const data = [];

        const firstNames = ['John', 'Jane', 'David', 'Sarah', 'Alex', 'Emily', 'Michael', 'Jessica'];
        const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Taylor'];
        const domains = ['gmail.com', 'yahoo.com', 't9s.app', 'outlook.com', 'example.com'];
        
        const productsList = ['Wireless Mouse', 'Mechanical Keyboard', '4K Monitor', 'USB-C Cable', 'Noise-canceling Headphones', 'Smart Watch', 'Laptop Stand', 'Webcam'];
        const categories = ['Electronics', 'Office Supplies', 'Accessories', 'Audio'];

        for (let i = 0; i < count; i++) {
            if (template === 'users') {
                const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
                data.push({
                    id: 1000 + i,
                    name: `${fName} ${lName}`,
                    email: `${fName.toLowerCase()}.${lName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
                    role: Math.random() > 0.8 ? 'Admin' : 'User',
                    active: Math.random() > 0.1,
                    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
                });
            } else if (template === 'products') {
                const price = parseFloat((Math.random() * 500 + 10).toFixed(2));
                data.push({
                    sku: `SKU-${10000 + i}`,
                    name: productsList[Math.floor(Math.random() * productsList.length)] + ' ' + (i + 1),
                    category: categories[Math.floor(Math.random() * categories.length)],
                    price: price,
                    inStock: Math.random() > 0.2 ? Math.floor(Math.random() * 100) : 0,
                    rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1))
                });
            } else {
                data.push({
                    transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    userId: 1000 + Math.floor(Math.random() * 50),
                    amount: parseFloat((Math.random() * 1000 + 5).toFixed(2)),
                    currency: Math.random() > 0.9 ? 'EUR' : 'USD',
                    status: Math.random() > 0.05 ? 'Completed' : 'Failed',
                    timestamp: new Date(Date.now() - Math.random() * 50000000).toISOString()
                });
            }
        }

        jsonInput.value = JSON.stringify(data, null, 2);
        jsonOutput.value = JSON.stringify(data, null, 2);
        validationError.classList.add('hidden');
        showToast(`🎉 ${count}件のダミーデータを生成しました！`);
    }

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
