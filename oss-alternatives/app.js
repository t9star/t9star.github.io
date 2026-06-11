document.addEventListener('DOMContentLoaded', () => {
    const saasGrid = document.getElementById('saas-grid');
    const searchInput = document.getElementById('search-input');
    const categoryTabs = document.querySelectorAll('.tab-btn');
    const modal = document.getElementById('details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBody = document.getElementById('modal-body');
    const toast = document.getElementById('toast');

    let currentCategory = 'all';
    let searchQuery = '';

    // トースト通知を表示
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // 数値を「k」表示に変換するヘルパー
    function formatStars(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }

    // GitHubスター数を取得（キャッシュ付き）
    async function fetchGitHubStars(repo, fallback) {
        const cacheKey = `stars_${repo}`;
        const cached = localStorage.getItem(cacheKey);
        const cacheTimeKey = `stars_time_${repo}`;
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        const now = Date.now();
        // 12時間キャッシュ有効
        if (cached && cachedTime && (now - cachedTime < 12 * 60 * 60 * 1000)) {
            return parseInt(cached);
        }

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (response.ok) {
                const data = await response.json();
                const stars = data.stargazers_count;
                localStorage.setItem(cacheKey, stars);
                localStorage.setItem(cacheTimeKey, now);
                return stars;
            }
        } catch (error) {
            console.warn(`Failed to fetch stars for ${repo}:`, error);
        }
        return fallback;
    }

    // メイン描画処理
    async function render() {
        saasGrid.innerHTML = '';

        // 検索とカテゴリでのフィルタリング
        const filteredData = OSS_DATA.filter(item => {
            const matchesCategory = currentCategory === 'all' || item.saas.category === currentCategory;
            
            // 各代替アプリの中で、名前やタグが検索にヒットするかチェック
            const matchesSearch = searchQuery === '' || 
                item.saas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.alternatives.some(alt => 
                    alt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    alt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    alt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                );

            return matchesCategory && matchesSearch;
        });

        if (filteredData.length === 0) {
            saasGrid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    条件に合う代替ソフトウェアが見つかりませんでした。
                </div>
            `;
            return;
        }

        for (const item of filteredData) {
            const groupEl = document.createElement('div');
            groupEl.className = 'saas-group';

            groupEl.innerHTML = `
                <div class="saas-group-header">
                    <span class="saas-icon">${item.saas.icon}</span>
                    <h3>${item.saas.name} <span>のオープンソース代替案</span></h3>
                </div>
                <div class="alternatives-container" id="container-${item.saas.name.replace(/\s+/g, '')}"></div>
            `;

            saasGrid.appendChild(groupEl);
            const container = document.getElementById(`container-${item.saas.name.replace(/\s+/g, '')}`);

            for (const alt of item.alternatives) {
                const altCard = document.createElement('div');
                altCard.className = 'alt-card';

                // 初期状態はフォールバック数値でスターを描画
                altCard.innerHTML = `
                    <div class="alt-card-header">
                        <h4 class="alt-title">${alt.name}</h4>
                        <div class="stars-badge" id="stars-${alt.repo.replace(/\//g, '-')}">
                            <svg class="stars-icon" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            <span class="star-count">${formatStars(alt.starsFallback)}</span>
                        </div>
                    </div>
                    <p class="alt-desc">${alt.description}</p>
                    <div class="tags-container">
                        ${alt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="alt-footer">
                        <button class="btn btn-primary btn-detail-trigger" data-repo="${alt.repo}">詳細・自己ホスト</button>
                        <a href="${alt.website}" target="_blank" class="btn btn-secondary">公式サイト</a>
                    </div>
                `;

                container.appendChild(altCard);

                // 非同期でリアルタイムのGitHubスター数を取得して反映
                fetchGitHubStars(alt.repo, alt.starsFallback).then(stars => {
                    const badge = document.getElementById(`stars-${alt.repo.replace(/\//g, '-')}`);
                    if (badge) {
                        badge.querySelector('.star-count').textContent = formatStars(stars);
                    }
                });
            }
        }

        // 詳細ボタンへのイベント登録
        document.querySelectorAll('.btn-detail-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                const repo = btn.dataset.repo;
                openModal(repo);
            });
        });
    }

    // Docker Compose テンプレート生成ヘルパー
    function getDockerComposeTemplate(name) {
        const lower = name.toLowerCase();
        if (lower === 'supabase') {
            return `version: '3.8'
services:
  supabase-db:
    image: supabase/postgres:14.1.0
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: your_secure_password
      
  supabase-kong:
    image: kong:2.8.1
    ports:
      - "8000:8000"`;
        } else if (lower === 'appwrite') {
            return `version: '3.0'
services:
  appwrite:
    image: appwrite/appwrite:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - _APP_ENV=production
      - _APP_OPEN_SOURCE=enabled`;
        } else if (lower === 'gitea') {
            return `version: '3'
services:
  gitea-server:
    image: gitea/gitea:1.21.5
    environment:
      - USER_UID=1000
      - USER_GID=1000
    ports:
      - "3000:3000"
      - "222:22"
    volumes:
      - ./gitea:/data`;
        } else if (lower === 'appflowy') {
            return `version: '3'
services:
  appflowy:
    image: appflowyio/appflowy:latest
    ports:
      - "8080:8080"
    environment:
      - APPFLOWY_DATABASE_URL=postgres://user:pass@db:5432/appflowy`;
        } else {
            // 一般的なDockerテンプレート
            return `version: '3'
services:
  ${lower}:
    image: ${lower}/server:latest
    ports:
      - "8080:80"
    restart: always
    volumes:
      - ./${lower}-data:/data`;
        }
    }

    function getComparisonData(saasName, altName) {
        const data = {
            'Notion': { pricing: '$8 - $15 / 月', privacy: 'クラウド保管（ベンダー依存）', selfhost: '不可', code: '非公開 (Proprietary)' },
            'Slack': { pricing: '$7 - $12 / 月', privacy: 'クラウド保管（ベンダー依存）', selfhost: '不可', code: '非公開 (Proprietary)' },
            'Firebase': { pricing: '従量課金 (高負荷で高額化)', privacy: 'Google Cloud基準', selfhost: '不可', code: '非公開 (Proprietary)' },
            'Airtable': { pricing: '$20 - $24 / 月', privacy: 'クラウド保管（ベンダー依存）', selfhost: '不可', code: '非公開 (Proprietary)' },
            'Trello': { pricing: '$5 - $10 / 月', privacy: 'クラウド保管（ベンダー依存）', selfhost: '不可', code: '非公開 (Proprietary)' },
            'GitHub': { pricing: '$4 - $21 / 月', privacy: 'GitHub Cloud', selfhost: '一部可能 (Enterprise)', code: '非公開 (Proprietary)' },
            'Shopify': { pricing: '$39 - $399 / 月 + 手数料', privacy: 'Shopify Cloud', selfhost: '不可', code: '非公開 (Proprietary)' },
            'Salesforce': { pricing: '$25 - $300 / 月', privacy: 'Salesforce Cloud', selfhost: '不可', code: '非公開 (Proprietary)' }
        };

        const saasInfo = data[saasName] || { pricing: '有料契約必須', privacy: 'クラウド保管', selfhost: '不可', code: '非公開' };
        
        return {
            saas: saasName,
            alt: altName,
            metrics: [
                { name: 'コード開示', saas: saasInfo.code, alt: '完全オープンソース (OSS)' },
                { name: 'データ保管', saas: saasInfo.privacy, alt: '100% 自社所有（ローカル/自社サーバー）' },
                { name: 'セルフホスト', saas: saasInfo.selfhost, alt: '可能 (Docker等で簡単デプロイ)' },
                { name: '利用コスト', saas: saasInfo.pricing, alt: '無料 (サーバー代のみ。月額サブスク不要)' }
            ]
        };
    }

    // モーダルを開く
    function openModal(repo) {
        // 対象のデータを検索
        let targetAlt = null;
        let targetSaaSName = '';
        for (const item of OSS_DATA) {
            targetAlt = item.alternatives.find(a => a.repo === repo);
            if (targetAlt) {
                targetSaaSName = item.saas.name;
                break;
            }
        }

        if (!targetAlt) return;

        const dockerTemplate = getDockerComposeTemplate(targetAlt.name);
        const comparison = getComparisonData(targetSaaSName, targetAlt.name);

        modalBody.innerHTML = `
            <h2>${targetAlt.name}</h2>
            <span class="modal-license">ライセンス: ${targetAlt.license}</span>
            <p>${targetAlt.description} GitHubリポジトリ: <a href="https://github.com/${targetAlt.repo}" target="_blank" style="color: var(--primary-color); text-decoration: none;">${targetAlt.repo}</a></p>
            
            <div class="comparison-title">📊 スペック比較 (${comparison.saas} vs ${comparison.alt})</div>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>スペック項目</th>
                        <th>${comparison.saas}</th>
                        <th>${comparison.alt}</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparison.metrics.map(m => `
                        <tr>
                            <td><strong>${m.name}</strong></td>
                            <td class="compare-saas">${m.saas}</td>
                            <td class="compare-alt">${m.alt}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="docker-title" style="margin-top: 24px;">セルフホスト設定 (Docker Compose)</div>
            <div class="docker-code-container">
                <button class="copy-btn" id="copy-docker-btn">コピー</button>
                <code class="docker-code" id="docker-code-block">${dockerTemplate}</code>
            </div>

            <div class="deploy-recommend-box">
                <div class="deploy-rec-header">💡 おすすめのクラウドホスティング</div>
                <p>このOSSツールを自己ホストするための仮想サーバー(VPS)をお探しですか？DigitalOceanなら下記リンクからの登録で<strong>$200分の無料クレジット</strong>を獲得でき、低コストでセルフホスト環境を構築できます。</p>
                <a href="https://m.do.co/c/t9star-placeholder" target="_blank" class="btn btn-deploy-rec">
                    🚀 DigitalOcean を試す ($200クレジット特典付き)
                </a>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 15px;">
                <a href="https://github.com/${targetAlt.repo}" target="_blank" class="btn btn-primary" style="flex: 1; padding: 12px 0;">GitHubリポジトリ</a>
                <a href="${targetAlt.website}" target="_blank" class="btn btn-secondary" style="flex: 1; padding: 12px 0;">公式サイトへ</a>
            </div>
        `;

        modal.classList.add('open');

        // コピーイベントの登録
        const copyBtn = document.getElementById('copy-docker-btn');
        copyBtn.addEventListener('click', () => {
            const codeText = document.getElementById('docker-code-block').textContent;
            navigator.clipboard.writeText(codeText).then(() => {
                showToast('Docker Compose 設定をコピーしました！');
            }).catch(err => {
                console.error('Copy failed', err);
                showToast('コピーに失敗しました。');
            });
        });
    }

    // モーダルを閉じる
    modalCloseBtn.addEventListener('click', () => {
        modal.classList.remove('open');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });

    // 検索入力の監視
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
    });

    // カテゴリタブの切替
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            render();
        });
    });

    // 初期化
    render();
});
