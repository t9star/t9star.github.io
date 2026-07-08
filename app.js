// T9S Studio Localization Engine
const translations = {
    ja: {
        "nav-web": "Webツール",
        "nav-mobile": "モバイルアプリ",
        "nav-support": "☕ プロジェクトを支援",
        "hero-title": "余計なサーバー処理は不要。<br><span class=\"gradient-text\">あなたのデバイス上で完結。</span>",
        "hero-subtitle": "T9S Studio のツールは、データを外部のサーバーに送信せず、すべてブラウザ内（WebAssembly/IndexedDB）またはローカルデバイス上で動作します。安全、超高速、そして完全無料。",
        "fund-badge": "🎯 PROJECT GOAL",
        "fund-title": "新しい開発用PC基金 (High-Spec Dev Workstation Fund)",
        "fund-desc": "現在、より重いコンパイル処理やオンデバイスAI開発を快適に行うための「新しい開発用PC」の購入資金を募っています。もしツールが役に立ったと感じたら、開発者にコーヒーを奢っていただけると非常に嬉しいです！",
        "fund-raised": "支援額: <strong>$185</strong> (約28,000円)",
        "fund-target": "目標: <strong>$1,200</strong>",
        "fund-note": "※ $3以上の支援で、ツールの「Pro版アンロックキー」を入手できます！",
        "section-web-title": "Web Utilities <span class=\"section-subtitle\">(ブラウザ完結型Webツール)</span>",
        "section-mobile-title": "Mobile Applications <span class=\"section-subtitle\">(Androidネイティブアプリ)</span>",
        "footer-text": "&copy; 2026 T9S Studio. All rights reserved. Built with pride using vanilla client-side technologies.",
        "footer-privacy": "すべてのデータはユーザーのローカル環境でのみ安全に保存・処理されます。サーバーへの自動送信はありません。",
        "launch-tool": "ツールを起動する",
        "download-play": "Google Play で入手",
        "show-usage": "💡 使い方を表示",

        // Web Tools
        "tool-mockup-title": "Mockup Studio",
        "tool-mockup-desc": "スクリーンショットをアップロードするだけで、iPhoneやMacBookなどの洗練された3D風デバイスフレームに合成できるモックアップジェネレーター。",
        "tool-mockup-tag1": "ブラウザ処理",
        "tool-mockup-tag2": "PNG出力",
        "tool-mockup-tag3": "Pro版キー対応",
        "tool-mockup-step1": "スクリーンショット画像をアップロードするか、ドラッグ＆ドロップします。",
        "tool-mockup-step2": "デバイスフレーム（iPhone/MacBookなど）やベゼルのカラー（Space Gray/Goldなど）を選択します。",
        "tool-mockup-step3": "必要に応じてキャプション（文字サイズ・色）を設定し、ダウンロードボタンで画像を書き出します。",

        "tool-git-title": "Git Visualizer",
        "tool-git-desc": "インタラクティブにGitコマンドを打ち込み、ブランチツリーやコミットグラフがどのように動くかをビジュアルで学習できるシミュレータ。",
        "tool-git-tag1": "Git学習",
        "tool-git-tag2": "インタラクティブ",
        "tool-git-tag3": "Sandbox",
        "tool-git-step1": "左メニューから「レッスン」を選択するか、「Sandbox（自由入力）」モードを開始します。",
        "tool-git-step2": "右上のターミナル疑似入力欄に `git commit` や `git checkout` などのコマンドを入力します。",
        "tool-git-step3": "コミットツリーが動的に変化し、ブランチやHEADの概念をアニメーションで視覚的に学習できます。",

        "tool-oss-title": "OSS Alternatives",
        "tool-oss-desc": "有名な商用ソフトウェアやSaaSの代わりとなる、プライバシー重視でオープンソースの優れた代替ツールを発見できるキュレーションデータベース。",
        "tool-oss-tag1": "代替ソフト",
        "tool-oss-tag2": "OSS推奨",
        "tool-oss-tag3": "GitHub連携",
        "tool-oss-step1": "検索バーに代替を探したいソフト名（例: Photoshop, Slack）を入力するか、カテゴリ一覧をクリックします。",
        "tool-oss-step2": "各OSSプロジェクトのGitHub Star数や最終更新日、ライセンス情報がリアルタイムに表示されます。",
        "tool-oss-step3": "「Website」リンクから各ツールの公式サイトへアクセスし、自分に合った代替ツールを選択します。",

        "tool-pixel-title": "Pixel Art Editor",
        "tool-pixel-desc": "レイヤー機能、カスタムカラーパレット、アニメーション書き出し機能を備え、ブラウザ上で直感的にドット絵を作成・編集できるエディタ。",
        "tool-pixel-tag1": "画像編集",
        "tool-pixel-tag2": "ドット絵",
        "tool-pixel-tag3": "GIF書き出し",
        "tool-pixel-step1": "キャンバスサイズ（例: 16x16, 32x32）を設定し、描画を開始します。",
        "tool-pixel-step2": "カラーパレットから色を選び、鉛筆、バケツ、消しゴムツールでドットを打ちます。",
        "tool-pixel-step3": "「Export」ボタンから、拡大したPNG画像やアニメーションGIFとしてローカルに保存します。",

        "tool-screen-title": "Screen Recorder",
        "tool-screen-desc": "外部サーバーを一切介さず、完全ローカル（ブラウザ内）で画面録画、マイク音声・システム音声のキャプチャ、およびWebM形式の保存ができるツール。",
        "tool-screen-tag1": "画面録画",
        "tool-screen-tag2": "音声キャプチャ",
        "tool-screen-tag3": "ブラウザ完結",
        "tool-screen-step1": "録画対象（画面全体、特定のウィンドウ、またはブラウザのタブ）を選択します。",
        "tool-screen-step2": "マイク音声やシステム音声を録音に含めるかトグルスイッチで選択します。",
        "tool-screen-step3": "録画停止後、内蔵プレビューで確認し、「Save WebM」ボタンでPCにダウンロードします。",

        "tool-css-title": "CSS Generator",
        "tool-css-desc": "グラデーション、フレックスボックス、グリッド、ネオン影などのモダンなCSSスタイルを視覚的なスライダーで調整し、コードをコピーできる開発ツール。",
        "tool-css-tag1": "フロントエンド",
        "tool-css-tag2": "CSS生成",
        "tool-css-tag3": "効率化",
        "tool-css-step1": "調整したいCSS効果（例: Box Shadow, Flexbox Layout）を左メニューから選択します。",
        "tool-css-step2": "スライダーやカラーピッカーを動かし、右側のライブプレビューを見ながら調整します。",
        "tool-css-step3": "生成されたCSSコードを「Copy Code」ボタンでワンクリックコピーし、プロジェクトに貼り付けます。",

        "tool-prompt-title": "Prompt Sandbox",
        "tool-prompt-desc": "複雑なプロンプトのテンプレートに変数をバインドし、動的に入力フォームを生成して最終的なプロンプトを合成・コピーできるLLM用Sandbox。",
        "tool-prompt-tag1": "AI・LLM",
        "tool-prompt-tag2": "効率化",
        "tool-prompt-tag3": "テンプレート",
        "tool-prompt-step1": "「Template Library」からプリセットを選択するか、エディタに変数を表す `{{変数名}}` を含むプロンプトを入力します。",
        "tool-prompt-step2": "自動生成されたフォームに入力値（ペルソナ、出力フォーマットなど）を入力すると、下のプレビューに瞬時に反映されます。",
        "tool-prompt-step3": "「Copy Prompt」ボタンで合成済みの最終テキストをコピーしてAIチャット等に貼り付けて使用します。",

        "tool-svg-title": "SVG Wave & Blob Generator",
        "tool-svg-desc": "頂点数や複雑さをスライダーで変化させ、美しい波形（Wave）や有機的なBlob（アメーバ）図形のSVGコードをランダム生成・ダウンロードできるWebツール。",
        "tool-svg-tag1": "SVG生成",
        "tool-svg-tag2": "ランダム",
        "tool-svg-tag3": "ベクター出力",
        "tool-svg-step1": "生成したい図形タイプ（Wave または Blob）を選択します。",
        "tool-svg-step2": "スライダーで頂点数、複雑さ、グラデーションの色をカスタマイズします。",
        "tool-svg-step3": "「Randomize」で形状をランダムに変化させ、気に入った形状のSVGコードをコピーまたはダウンロードします。",

        "tool-se-title": "SE Generator",
        "tool-se-desc": "正弦波、矩形波、三角波、マイク入力などをサンプリングし、ピッチ調整やエコーを適用して好みの効果音（SE）を生成・再生・ダウンロードできるツール。",
        "tool-se-tag1": "音声合成",
        "tool-se-tag2": "効果音",
        "tool-se-tag3": "録音",
        "tool-se-step1": "音源（正弦波、矩形波、三角波、またはマイク録音）を選択します。",
        "tool-se-step2": "再生時間、ピッチ変化、エコー（ディレイ）などのエフェクトパラメータを調整します。",
        "tool-se-step3": "「Play」で試聴し、ランダム機能で面白い音を発見し、「Download WAV」で書き出します。",

        // Mobile Apps
        "app-zen-title": "禅禅 (Zen Zen)",
        "app-zen-desc": "泡プチプチ、枯山水シミュレーション、リアルな風とチャイムなど、五感で楽しむオンデバイス完結型リラクゼーションアプリ。",
        "app-zen-tag1": "Jetpack Compose",
        "app-zen-tag2": "触覚フィードバック",
        "app-zen-tag3": "AdMob搭載",

        "app-netbash-title": "NetBash (HackerOS)",
        "app-netbash-desc": "ターミナル風インターフェースでコード入力やコマンドを駆使し、テクノロジー研究やボットネット構築を行って世界を支配するハッカーシミュレーター。",
        "app-netbash-tag1": "Jetpack Compose",
        "app-netbash-tag2": "シミュレーション",
        "app-netbash-tag3": "Play Games Sync",

        "app-nosavecrop-title": "NoSaveCrop",
        "app-nosavecrop-desc": "画面をワンタップでキャプチャし、クリップボードに即時保存。メモリ上でのみ処理し、端末内やサーバーに一切画像を保存しないプライバシー特化スクリーンショットツール。",
        "app-nosavecrop-tag1": "Android Utility",
        "app-nosavecrop-tag2": "MediaProjection",
        "app-nosavecrop-tag3": "プライバシー保護",

        "app-spin-title": "Singularity Spin",
        "app-spin-desc": "重力を操り、自機の軌道を曲げて危険な障害物やレーザーを避けるSF/宇宙テーマの反射神経サバイバルアクションゲーム。",
        "app-spin-tag1": "Jetpack Compose",
        "app-spin-tag2": "ワールドランキング",
        "app-spin-tag3": "実績解除",

        "app-dopa-title": "DopaClicker",
        "app-dopa-desc": "画面をタップするたびに極上の快音と美しいパーティクルが炸裂。10〜10000コンボで特別なファンファーレが脳裏に響く、ドパミン全開の爽快クリッカーゲーム。",
        "app-dopa-tag1": "低遅延PCM合成",
        "app-dopa-tag2": "コンボシステム",
        "app-dopa-tag3": "快感特化",

        "app-fan-title": "electricfan2",
        "app-fan-desc": "レトロでリアルな電気扇風機の動作や、心地よい風の音（ホワイトノイズ）を楽しめるリラクゼーション・シミュレーター。タイマー機能や風量調整を搭載。",
        "app-fan-tag1": "リラクゼーション",
        "app-fan-tag2": "環境音シミュレータ",
        "app-fan-tag3": "タイマー搭載"
    },
    en: {
        "nav-web": "Web Tools",
        "nav-mobile": "Mobile Apps",
        "nav-support": "☕ Support Project",
        "hero-title": "No server processing required.<br><span class=\"gradient-text\">Everything runs on your device.</span>",
        "hero-subtitle": "T9S Studio's tools run entirely within your browser (WebAssembly/IndexedDB) or local device without sending data to external servers. Safe, fast, and completely free.",
        "fund-badge": "🎯 PROJECT GOAL",
        "fund-title": "High-Spec Dev Workstation Fund",
        "fund-desc": "We are currently raising funds for a new development PC to comfortably handle heavy compilation tasks and on-device AI development. If you find our tools useful, buying the developer a coffee would be highly appreciated!",
        "fund-raised": "Raised: <strong>$185</strong>",
        "fund-target": "Target: <strong>$1,200</strong>",
        "fund-note": "* Support of $3 or more unlocks the Pro version key for our tools!",
        "section-web-title": "Web Utilities <span class=\"section-subtitle\">(Browser-only Web Tools)</span>",
        "section-mobile-title": "Mobile Applications <span class=\"section-subtitle\">(Android Native Apps)</span>",
        "footer-text": "&copy; 2026 T9S Studio. All rights reserved. Built with pride using vanilla client-side technologies.",
        "footer-privacy": "All data is safely stored and processed only in the user's local environment. No automatic transmission to servers.",
        "launch-tool": "Launch Tool",
        "download-play": "Get it on Google Play",
        "show-usage": "💡 Show Usage",

        // Web Tools
        "tool-mockup-title": "Mockup Studio",
        "tool-mockup-desc": "A mockup generator that wraps your screenshots in sleek 3D-style device frames like iPhone and MacBook.",
        "tool-mockup-tag1": "Browser-only",
        "tool-mockup-tag2": "PNG Output",
        "tool-mockup-tag3": "Pro Key Support",
        "tool-mockup-step1": "Upload or drag and drop your screenshot image.",
        "tool-mockup-step2": "Select device frame (iPhone/MacBook etc.) and bezel color (Space Gray/Gold etc.).",
        "tool-mockup-step3": "Configure captions (font size, color) if needed, and download the exported image.",

        "tool-git-title": "Git Visualizer",
        "tool-git-desc": "An interactive simulator to learn how Git commands modify the branch tree and commit graph visually.",
        "tool-git-tag1": "Git Learning",
        "tool-git-tag2": "Interactive",
        "tool-git-tag3": "Sandbox",
        "tool-git-step1": "Select 'Lessons' from the left menu or start 'Sandbox' mode.",
        "tool-git-step2": "Type commands like `git commit` or `git checkout` in the terminal input.",
        "tool-git-step3": "Watch the commit tree dynamically animate to visually understand branches and HEAD.",

        "tool-oss-title": "OSS Alternatives",
        "tool-oss-desc": "A curated database to discover excellent, privacy-focused open source alternatives to popular commercial software and SaaS.",
        "tool-oss-tag1": "Alternatives",
        "tool-oss-tag2": "OSS Focus",
        "tool-oss-tag3": "GitHub API",
        "tool-oss-step1": "Type the software name (e.g., Photoshop, Slack) in the search bar or select a category.",
        "tool-oss-step2": "View GitHub stars, last update dates, and license info in real-time.",
        "tool-oss-step3": "Visit the tool's official website via the link to find the best match for you.",

        "tool-pixel-title": "Pixel Art Editor",
        "tool-pixel-desc": "An intuitive web-based editor to create and edit pixel art, featuring layer support, custom palettes, and GIF animation export.",
        "tool-pixel-tag1": "Image Editor",
        "tool-pixel-tag2": "Pixel Art",
        "tool-pixel-tag3": "GIF Export",
        "tool-pixel-step1": "Select canvas size (e.g., 16x16, 32x32) and start drawing.",
        "tool-pixel-step2": "Pick colors and draw using pencil, bucket, and eraser tools.",
        "tool-pixel-step3": "Click 'Export' to save your art as an enlarged PNG or animated GIF.",

        "tool-screen-title": "Screen Recorder",
        "tool-screen-desc": "A browser-only tool to record your screen, microphone, and system audio entirely locally without external servers, exporting as WebM.",
        "tool-screen-tag1": "Screen Recorder",
        "tool-screen-tag2": "Audio Capture",
        "tool-screen-tag3": "Browser-only",
        "tool-screen-step1": "Select what to record (entire screen, application window, or browser tab).",
        "tool-screen-step2": "Choose whether to include microphone or system audio.",
        "tool-screen-step3": "After stopping, preview the recording and download it as WebM.",

        "tool-css-title": "CSS Generator",
        "tool-css-desc": "A developer utility to visually design CSS gradients, flexbox layouts, grids, and shadows using sliders, and copy the code.",
        "tool-css-tag1": "Front-end",
        "tool-css-tag2": "CSS Gen",
        "tool-css-tag3": "Productive",
        "tool-css-step1": "Select the CSS effect (e.g., Box Shadow, Flexbox) from the menu.",
        "tool-css-step2": "Adjust sliders and colors while watching the live preview.",
        "tool-css-step3": "Click 'Copy Code' to copy the generated CSS and paste it into your stylesheet.",

        "tool-prompt-title": "Prompt Sandbox",
        "tool-prompt-desc": "An LLM prompt sandbox that binds variables to templates, auto-generates input forms, and exports compiled prompts.",
        "tool-prompt-tag1": "AI & LLM",
        "tool-prompt-tag2": "Productive",
        "tool-prompt-tag3": "Templates",
        "tool-prompt-step1": "Select a preset from the template library or type a custom prompt containing `{{variables}}`.",
        "tool-prompt-step2": "Fill in the generated input fields (persona, format, etc.) to see updates in the preview.",
        "tool-prompt-step3": "Click 'Copy Prompt' to copy the compiled text and use it with ChatGPT, Claude, etc.",

        "tool-svg-title": "SVG Wave & Blob Generator",
        "tool-svg-desc": "A web tool to randomly generate and download beautiful SVG waves and organic blob shapes by adjusting complexity sliders.",
        "tool-svg-tag1": "SVG Gen",
        "tool-svg-tag2": "Randomize",
        "tool-svg-tag3": "Vector Export",
        "tool-svg-step1": "Select the shape type (Wave or Blob).",
        "tool-svg-step2": "Use sliders to customize complexity, vertices, and gradient colors.",
        "tool-svg-step3": "Click 'Randomize' to morph the shape and copy/download the SVG code.",

        // Mobile Apps
        "app-zen-title": "Zen Zen - Satisfying Fidgets",
        "app-zen-desc": "An on-device relaxation app featuring bubble wrap, zen gardens, realistic wind chimes, and tactile sensory experiences.",
        "app-zen-tag1": "Jetpack Compose",
        "app-zen-tag2": "Haptic Feedback",
        "app-zen-tag3": "AdMob Integrated",

        "app-netbash-title": "NetBash: Idle Terminal",
        "app-netbash-desc": "A hacker simulator utilizing a terminal-style command interface to research tech, build botnets, and conquer the cyber world.",
        "app-netbash-tag1": "Jetpack Compose",
        "app-netbash-tag2": "Simulation",
        "app-netbash-tag3": "Play Games Sync",

        "app-nosavecrop-title": "NoSaveCrop - Capture & Paste",
        "app-nosavecrop-desc": "A privacy-first screenshot utility that captures screens to the clipboard, processing data solely in memory without local or cloud saves.",
        "app-nosavecrop-tag1": "Android Utility",
        "app-nosavecrop-tag2": "MediaProjection",
        "app-nosavecrop-tag3": "Privacy First",

        "app-spin-title": "Singularity Spin",
        "app-spin-desc": "A sci-fi space action game where you manipulate gravity to bend your orbit and survive lasers and planetary debris.",
        "app-spin-tag1": "Jetpack Compose",
        "app-spin-tag2": "Leaderboards",
        "app-spin-tag3": "Achievements",

        "app-dopa-title": "DopaClicker",
        "app-dopa-desc": "A dopamine-boosting clicker game triggering satisfying haptics, particle explosions, and synthesized milestone fanfares up to 10k combos.",
        "app-dopa-tag1": "Low-latency PCM",
        "app-dopa-tag2": "Combo System",
        "app-dopa-tag3": "Dopamine",

        "app-fan-title": "electricfan2",
        "app-fan-desc": "A relaxation simulator recreating retro fan movements and soothing white noise breeze, equipped with timers and speed controls.",
        "app-fan-tag1": "Relaxation",
        "app-fan-tag2": "Ambient Sound",
        "app-fan-tag3": "Timer Equipped"
    }
};

// 安全なlocalStorage読み書きラッパー
function getSavedLanguage() {
    try {
        return localStorage.getItem("selected_lang");
    } catch (e) {
        console.warn("Storage access denied:", e);
        return null;
    }
}

function saveLanguage(lang) {
    try {
        localStorage.setItem("selected_lang", lang);
    } catch (e) {
        console.warn("Storage write denied:", e);
    }
}

// 言語のデフォルト検出
function detectDefaultLanguage() {
    const saved = getSavedLanguage();
    if (saved && (saved === "ja" || saved === "en")) {
        return saved;
    }
    const systemLang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (systemLang && systemLang.toLowerCase().startsWith("ja")) {
        return "ja";
    }
    return "en";
}

// ページの翻訳適用
function applyTranslations(lang) {
    const dict = translations[lang] || translations.en;

    // 1. data-i18n 属性の翻訳
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // 2. data-i18n-html 属性の翻訳
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const key = el.getAttribute("data-i18n-html");
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    // 3. Webツールカードの動的翻訳（インデックス順マッピング）
    const webCards = document.querySelectorAll("#web-tools .app-card");
    const webKeys = ["mockup", "git", "oss", "pixel", "screen", "css", "prompt", "svg", "se"];
    webCards.forEach((card, idx) => {
        const key = webKeys[idx];
        if (!key) return;
        
        const titleEl = card.querySelector(".card-header-row h4");
        if (titleEl) titleEl.textContent = dict[`tool-${key}-title`] || titleEl.textContent;
        
        const descEl = card.querySelector(".card-desc");
        if (descEl) descEl.textContent = dict[`tool-${key}-desc`] || descEl.textContent;
        
        const tags = card.querySelectorAll(".card-tags .tag");
        tags.forEach((tag, tIdx) => {
            if (dict[`tool-${key}-tag${tIdx+1}`]) {
                tag.textContent = dict[`tool-${key}-tag${tIdx+1}`];
            }
        });
        
        const summary = card.querySelector(".usage-summary");
        if (summary) summary.innerHTML = `💡 ${dict["show-usage"] || "Show Usage"}`;
        
        const steps = card.querySelectorAll(".usage-steps li");
        steps.forEach((step, sIdx) => {
            if (dict[`tool-${key}-step${sIdx+1}`]) {
                step.textContent = dict[`tool-${key}-step${sIdx+1}`];
            }
        });
        
        const btn = card.querySelector(".card-actions .btn");
        if (btn) btn.textContent = dict["launch-tool"] || btn.textContent;
    });

    // 4. モバイルアプリカードの動的翻訳（インデックス順マッピング）
    const mobileCards = document.querySelectorAll("#mobile-apps .app-card");
    const mobileKeys = ["zen", "netbash", "nosavecrop", "spin", "dopa", "fan"];
    mobileCards.forEach((card, idx) => {
        const key = mobileKeys[idx];
        if (!key) return;
        
        const titleEl = card.querySelector(".card-header-row h4");
        if (titleEl) titleEl.textContent = dict[`app-${key}-title`] || titleEl.textContent;
        
        const descEl = card.querySelector(".card-desc");
        if (descEl) descEl.textContent = dict[`app-${key}-desc`] || descEl.textContent;
        
        const tags = card.querySelectorAll(".card-tags .tag");
        tags.forEach((tag, tIdx) => {
            if (dict[`app-${key}-tag${tIdx+1}`]) {
                tag.textContent = dict[`app-${key}-tag${tIdx+1}`];
            }
        });
        
        const btn = card.querySelector(".card-actions .btn");
        if (btn) btn.textContent = dict["download-play"] || btn.textContent;
    });

    // 5. ドキュメントメタ情報の書き換え
    document.title = lang === "ja" 
        ? "T9S Studio - ブラウザ完結型ツール＆モバイルアプリ" 
        : "T9S Studio - Serverless Web Utilities & Mobile Apps";
        
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", lang === "ja"
            ? "T9S Studioが開発する、プライバシー第一で超高速に動作するWebユーティリティおよびモバイルアプリのポートフォリオハブです。"
            : "Portfolio hub of high-performance, privacy-first web utilities and Android mobile applications built by T9S Studio."
        );
    }

    // 6. 言語選択ボタンのトグル状態の変更
    document.querySelectorAll(".btn-lang").forEach(btn => {
        btn.classList.remove("active");
    });
    const activeBtn = document.getElementById(`btn-lang-${lang}`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }

    // 7. HTMLタグのlang属性を変更
    document.documentElement.setAttribute("lang", lang);
}

// 言語セット処理
window.setLanguage = function(lang) {
    saveLanguage(lang);
    applyTranslations(lang);
};

// DOMContentLoaded による安全な初期化
function initLocalization() {
    const defaultLang = detectDefaultLanguage();
    applyTranslations(defaultLang);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocalization);
} else {
    initLocalization();
}
