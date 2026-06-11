document.addEventListener('DOMContentLoaded', () => {
    // DOM要素
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');
    const terminalLog = document.querySelector('.terminal-log');
    const terminalClickArea = document.getElementById('terminal-click-area');
    const resetBtn = document.getElementById('reset-btn');
    const scenarioItems = document.querySelectorAll('.scenario-item');
    const cmdRefItems = document.querySelectorAll('.cmd-ref-item');
    
    // SVG要素
    const svg = document.getElementById('git-svg');
    const svgLinks = document.getElementById('git-links');
    const svgNodes = document.getElementById('git-nodes');

    // 動的ツールチップの作成・初期化
    let tooltip = document.getElementById('git-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'git-tooltip';
        tooltip.className = 'git-tooltip';
        document.body.appendChild(tooltip);
    }

    function showCommitTooltip(e, commit) {
        tooltip.innerHTML = `
            <div class="tooltip-sha">commit ${commit.sha}</div>
            <div class="tooltip-branch">Branch: <span style="color:${colors[commit.branch] || '#cbd5e1'}">${commit.branch}</span></div>
            <div class="tooltip-msg">${commit.message}</div>
        `;
        tooltip.classList.add('show');
        positionTooltip(e);
    }

    function positionTooltip(e) {
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
    }

    function hideCommitTooltip() {
        tooltip.classList.remove('show');
    }

    svg.addEventListener('mousemove', (e) => {
        if (tooltip.classList.contains('show')) {
            positionTooltip(e);
        }
    });

    // Git状態シミュレータ
    let commits = {};     // sha -> commitObj
    let branches = {};    // name -> sha
    let currentBranch = 'main';
    let headSha = null;
    let commitCount = 0;
    let branchLanes = { 'main': 0 }; // branchName -> laneIndex (X座標決定用)
    let nextLaneIndex = 1;
    let depthCount = 1;

    // ブランチ色
    const colors = {
        main: '#38bdf8',     // 水色
        feature: '#a855f7',  // 紫
        hotfix: '#f43f5e',   // 赤
        dev: '#22c55e'       // 緑
    };

    // Proアンロック状態＆DOM
    let isPro = localStorage.getItem('t9s_pro_unlocked') === 'true';
    let pendingScenario = null;
    const proModal = document.getElementById('pro-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const sidebarUnlockTrigger = document.getElementById('sidebar-unlock-trigger');
    const proKeyInput = document.getElementById('pro-key-input');
    const proVerifyBtn = document.getElementById('pro-verify-btn');
    const toast = document.getElementById('toast');

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ターミナルログ追加
    function logToTerminal(type, text) {
        const row = document.createElement('div');
        row.className = `log-row ${type}`;
        row.textContent = text;
        terminalLog.appendChild(row);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // ターミナルクリック時にフォーカス
    terminalClickArea.addEventListener('click', () => {
        terminalInput.focus();
    });

    // コマンドリファレンスクリック
    cmdRefItems.forEach(item => {
        item.addEventListener('click', () => {
            terminalInput.value = item.dataset.cmd;
            terminalInput.focus();
        });
    });

    // シナリオ切替
    scenarioItems.forEach(item => {
        item.addEventListener('click', () => {
            const isProScenario = item.dataset.pro === 'true';
            if (isProScenario && !isPro) {
                pendingScenario = item;
                openProModal();
                return;
            }
            selectScenario(item);
        });
    });

    function selectScenario(item) {
        scenarioItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        loadScenario(item.dataset.scenario);
    }

    // モーダル制御関数
    function openProModal() {
        proModal.classList.add('show');
    }

    function closeProModal() {
        proModal.classList.remove('show');
        pendingScenario = null;
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
            
            if (pendingScenario) {
                selectScenario(pendingScenario);
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

    // 初期化ボタン
    resetBtn.addEventListener('click', () => {
        const activeScenario = document.querySelector('.scenario-item.active');
        const scenario = activeScenario ? activeScenario.dataset.scenario : 'basic';
        loadScenario(scenario);
    });

    // コマンド入力イベント
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = terminalInput.value.trim();
            terminalInput.value = '';
            
            if (rawCmd) {
                logToTerminal('command', `git-terminal $ ${rawCmd}`);
                executeGitCommand(rawCmd);
            }
        }
    });

    // Git仮想マシンのコアロジック
    function executeGitCommand(commandStr) {
        const parts = commandStr.replace(/\s+/g, ' ').split(' ');
        
        if (parts[0] !== 'git') {
            logToTerminal('error', `Error: コマンドは 'git' で始まる必要があります。`);
            return;
        }

        const action = parts[1];

        if (!action) {
            logToTerminal('error', `Error: 有効なgitアクションを指定してください。例: git commit, git checkout`);
            return;
        }

        if (action === 'commit') {
            // git commit [-m "message"]
            let message = `Commit ${commitCount + 1}`;
            const mIndex = parts.indexOf('-m');
            if (mIndex !== -1 && parts[mIndex + 1]) {
                // クォート除去
                message = parts.slice(mIndex + 1).join(' ').replace(/['"]/g, '');
            }
            createCommit(message);
        }
        else if (action === 'branch') {
            // git branch <branch-name>
            const branchName = parts[2];
            if (!branchName) {
                // ブランチ一覧表示
                const list = Object.keys(branches).map(b => b === currentBranch ? `* ${b}` : `  ${b}`).join('\n');
                logToTerminal('output', list);
                return;
            }
            if (branches[branchName]) {
                logToTerminal('error', `Error: ブランチ '${branchName}' は既に存在します。`);
                return;
            }
            createBranch(branchName);
        }
        else if (action === 'checkout') {
            // git checkout [-b] <branch-name>
            const isNew = parts[2] === '-b';
            const branchName = isNew ? parts[3] : parts[2];

            if (!branchName) {
                logToTerminal('error', `Error: ブランチ名を指定してください。`);
                return;
            }

            if (isNew) {
                if (branches[branchName]) {
                    logToTerminal('error', `Error: ブランチ '${branchName}' は既に存在します。`);
                    return;
                }
                createBranch(branchName);
                switchBranch(branchName);
            } else {
                if (!branches[branchName]) {
                    logToTerminal('error', `Error: ブランチ '${branchName}' は存在しません。`);
                    return;
                }
                switchBranch(branchName);
            }
        }
        else if (action === 'merge') {
            // git merge <branch-name>
            const target = parts[2];
            if (!target) {
                logToTerminal('error', `Error: マージ対象のブランチを指定してください。`);
                return;
            }
            if (!branches[target]) {
                logToTerminal('error', `Error: ブランチ '${target}' は存在しません。`);
                return;
            }
            if (target === currentBranch) {
                logToTerminal('error', `Error: 自分自身をマージすることはできません。`);
                return;
            }
            mergeBranch(target);
        }
        else if (action === 'rebase') {
            // git rebase <branch-name>
            const target = parts[2];
            if (!target) {
                logToTerminal('error', `Error: リベース対象のブランチを指定してください。`);
                return;
            }
            if (!branches[target]) {
                logToTerminal('error', `Error: ブランチ '${target}' は存在しません。`);
                return;
            }
            rebaseBranch(target);
        }
        else if (action === 'reset') {
            // git reset [--hard] <commit>
            const isHard = parts[2] === '--hard';
            const target = isHard ? parts[3] : parts[2];
            
            if (!target) {
                logToTerminal('error', `Error: リセット先のコミットを指定してください。例: git reset --hard HEAD~1`);
                return;
            }

            let targetSha = null;
            if (target === 'HEAD~1') {
                if (headSha && commits[headSha] && commits[headSha].parent) {
                    targetSha = commits[headSha].parent;
                } else {
                    logToTerminal('error', `Error: 親コミットが存在しません。`);
                    return;
                }
            } else {
                // SHAを検索
                const match = Object.keys(commits).find(sha => sha.toLowerCase() === target.toLowerCase());
                if (match) {
                    targetSha = match;
                } else {
                    logToTerminal('error', `Error: コマンドの対象となるコミット '${target}' が見つかりません。`);
                    return;
                }
            }

            // ブランチのポインタを更新
            branches[currentBranch] = targetSha;
            headSha = targetSha;
            
            logToTerminal('output', `Reset branch '${currentBranch}' to commit ${targetSha}`);
            updateGraph();
        }
        else {
            logToTerminal('error', `Error: サポートされていないコマンドです: '${action}'`);
        }
    }

    // コミットの作成
    function createCommit(message) {
        commitCount++;
        const sha = Math.random().toString(16).substring(2, 6); // 簡易ハッシュ
        const parent = headSha;

        const branch = currentBranch;
        const lane = branchLanes[branch] || 0;

        const newCommit = {
            sha: sha,
            parent: parent,
            message: message,
            branch: branch,
            lane: lane,
            x: 100 + lane * 120,
            y: 50 + depthCount * 70
        };

        commits[sha] = newCommit;
        branches[branch] = sha;
        headSha = sha;
        depthCount++;

        logToTerminal('output', `[${branch} ${sha}] ${message}`);
        updateGraph();
    }

    // ブランチの作成
    function createBranch(name) {
        branches[name] = headSha;
        if (typeof branchLanes[name] === 'undefined') {
            branchLanes[name] = nextLaneIndex;
            nextLaneIndex++;
        }
        logToTerminal('output', `Branch '${name}' created at commit ${headSha || 'initial'}`);
        updateGraph();
    }

    // ブランチの切替
    function switchBranch(name) {
        currentBranch = name;
        headSha = branches[name];
        logToTerminal('output', `Switched to branch '${name}'`);
        updateGraph();
    }

    // マージの実行
    function mergeBranch(targetBranch) {
        const targetSha = branches[targetBranch];
        const currentSha = branches[currentBranch];

        if (targetSha === currentSha) {
            logToTerminal('output', 'Already up-to-date.');
            return;
        }

        // 簡易的マージコミット作成
        commitCount++;
        const sha = Math.random().toString(16).substring(2, 6);
        
        const lane = branchLanes[currentBranch] || 0;
        const newCommit = {
            sha: sha,
            parent: currentSha,
            mergeParent: targetSha, // マージ元
            message: `Merge branch '${targetBranch}' into ${currentBranch}`,
            branch: currentBranch,
            lane: lane,
            x: 100 + lane * 120,
            y: 50 + depthCount * 70
        };

        commits[sha] = newCommit;
        branches[currentBranch] = sha;
        headSha = sha;
        depthCount++;

        logToTerminal('output', `Merged '${targetBranch}' into '${currentBranch}' via merge commit ${sha}`);
        updateGraph();
    }

    // リベースの実行（簡易実装）
    function rebaseBranch(targetBranch) {
        const targetSha = branches[targetBranch];
        const currentSha = branches[currentBranch];

        if (targetSha === currentSha) {
            logToTerminal('output', 'Already up-to-date.');
            return;
        }

        // リベース対象コミット（分岐点からのコミット）を探す
        // 簡単にするため、currentBranch内のコミットで、targetBranchの履歴にないものを複製
        const targetHistory = getHistory(targetSha);
        const currentCommitsToReplay = [];

        let curr = currentSha;
        while (curr && !targetHistory.includes(curr)) {
            const c = commits[curr];
            if (c) {
                currentCommitsToReplay.unshift(c); // 時系列順にするため先頭へ
                curr = c.parent;
            } else {
                break;
            }
        }

        if (currentCommitsToReplay.length === 0) {
            // すでに先頭にある場合はFast-Forward
            branches[currentBranch] = targetSha;
            headSha = targetSha;
            logToTerminal('output', `Fast-forwarded '${currentBranch}' to '${targetBranch}'`);
            updateGraph();
            return;
        }

        // コミットの再適用
        let newParent = targetSha;
        for (const c of currentCommitsToReplay) {
            commitCount++;
            const newSha = Math.random().toString(16).substring(2, 6);
            const lane = branchLanes[currentBranch];

            const replayedCommit = {
                sha: newSha,
                parent: newParent,
                message: `${c.message} (rebased)`,
                branch: currentBranch,
                lane: lane,
                x: 100 + lane * 120,
                y: 50 + depthCount * 70
            };

            commits[newSha] = replayedCommit;
            newParent = newSha;
            depthCount++;
        }

        branches[currentBranch] = newParent;
        headSha = newParent;

        logToTerminal('output', `Successfully rebased and updated refs/heads/${currentBranch}.`);
        updateGraph();
    }

    // 特定コミットからの親子履歴SHAリストを逆引き取得
    function getHistory(startSha) {
        const history = [];
        let curr = startSha;
        while (curr) {
            history.push(curr);
            const c = commits[curr];
            curr = c ? c.parent : null;
        }
        return history;
    }

    // SVGグラフの更新描画
    function updateGraph() {
        svgLinks.innerHTML = '';
        svgNodes.innerHTML = '';

        // 1. リンク（ブランチライン）の描画
        Object.values(commits).forEach(c => {
            // プライマリ親リンク
            if (c.parent && commits[c.parent]) {
                drawLink(commits[c.parent], c, false);
            }
            // マージ元親リンク
            if (c.mergeParent && commits[c.mergeParent]) {
                drawLink(commits[c.mergeParent], c, true);
            }
        });

        // 2. コミットノードの描画
        Object.values(commits).forEach(c => {
            drawNode(c);
        });

        // 3. ブランチ・HEADタグの描画
        drawLabels();
    }

    // リンク描画 (ベジェ曲線)
    function drawLink(parent, child, isMerge) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // 開始点・終了点
        const x1 = parent.x;
        const y1 = parent.y;
        const x2 = child.x;
        const y2 = child.y;

        // ベジェ曲線のコントロールポイント設定で鉄道線路のようにうねるラインを描く
        const midY = (y1 + y2) / 2;
        let d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        
        // 色設定
        const strokeColor = colors[child.branch] || '#64748b';
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', '3');
        
        if (isMerge) {
            path.setAttribute('stroke-dasharray', '5,5');
            path.setAttribute('stroke', '#64748b');
        }

        path.setAttribute('marker-end', 'url(#arrow)');
        svgLinks.appendChild(path);
    }

    // コミットノード描画
    function drawNode(c) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // 円の描画
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', c.x);
        circle.setAttribute('cy', c.y);
        circle.setAttribute('r', '8');
        
        const nodeColor = colors[c.branch] || '#64748b';
        circle.setAttribute('fill', nodeColor);
        circle.setAttribute('stroke', '#070913');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('data-sha', c.sha);

        // ホバーツールチップのイベント追加
        circle.addEventListener('mouseenter', (e) => {
            showCommitTooltip(e, c);
        });
        circle.addEventListener('mouseleave', () => {
            hideCommitTooltip();
        });
        
        group.appendChild(circle);

        // コミットSHAテキスト
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', c.x - 16);
        text.setAttribute('y', c.y + 4);
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '10px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'end');
        text.textContent = c.sha;
        group.appendChild(text);

        // コミットメッセージのホバーツールチップ風プレビュー
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `[${c.sha}] ${c.message}`;
        group.appendChild(title);

        svgNodes.appendChild(group);
    }

    // ブランチリファレンスとHEADのタグ描画
    function drawLabels() {
        // 各ブランチがどのSHAにいるかを集計
        const shaToLabels = {};
        Object.entries(branches).forEach(([branchName, sha]) => {
            if (!sha) return;
            if (!shaToLabels[sha]) shaToLabels[sha] = [];
            shaToLabels[sha].push(branchName);
        });

        Object.entries(shaToLabels).forEach(([sha, labelNames]) => {
            const commit = commits[sha];
            if (!commit) return;

            let labelOffset = 24;
            labelNames.forEach(name => {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                
                // タグの背景枠
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', commit.x + labelOffset);
                rect.setAttribute('y', commit.y - 12);
                rect.setAttribute('height', '24');
                rect.setAttribute('rx', '4');
                rect.setAttribute('ry', '4');
                
                // 現在のアクティブブランチなら明るく強調
                const isActive = name === currentBranch;
                const strokeCol = isActive ? '#ffffff' : 'transparent';
                const bgCol = colors[name] || '#64748b';
                
                rect.setAttribute('fill', bgCol);
                rect.setAttribute('stroke', strokeCol);
                rect.setAttribute('stroke-width', '1.5');

                // 文字
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', commit.x + labelOffset + 8);
                text.setAttribute('y', commit.y + 4);
                text.setAttribute('fill', isActive ? '#000000' : '#ffffff');
                text.setAttribute('font-size', '11px');
                text.setAttribute('font-weight', 'bold');
                text.textContent = name;
                
                // 動的幅調整
                const charWidth = 7;
                const rectW = name.length * charWidth + 16;
                rect.setAttribute('width', rectW);

                group.appendChild(rect);
                group.appendChild(text);

                // HEADポインタ (現在のアクティブブランチの場合)
                if (isActive) {
                    const headGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    const headRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    headRect.setAttribute('x', commit.x + labelOffset + rectW + 6);
                    headRect.setAttribute('y', commit.y - 12);
                    headRect.setAttribute('width', '42');
                    headRect.setAttribute('height', '24');
                    headRect.setAttribute('rx', '4');
                    headRect.setAttribute('fill', '#ec4899'); // ピンク

                    const headText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    headText.setAttribute('x', commit.x + labelOffset + rectW + 12);
                    headText.setAttribute('y', commit.y + 4);
                    headText.setAttribute('fill', '#ffffff');
                    headText.setAttribute('font-size', '10px');
                    headText.setAttribute('font-weight', 'bold');
                    headText.textContent = 'HEAD';

                    headGroup.appendChild(headRect);
                    headGroup.appendChild(headText);
                    group.appendChild(headGroup);
                    
                    labelOffset += 48; // HEADポインタの分シフト
                }

                svgNodes.appendChild(group);
                labelOffset += rectW + 8;
            });
        });
    }

    // シナリオの読み込み設定
    function loadScenario(scenarioName) {
        // 状態クリア
        commits = {};
        branches = {};
        currentBranch = 'main';
        headSha = null;
        commitCount = 0;
        branchLanes = { 'main': 0 };
        nextLaneIndex = 1;
        depthCount = 1;
        
        terminalLog.innerHTML = '';
        
        logToTerminal('system', `=== シナリオ '${scenarioName}' をロードしました ===`);

        if (scenarioName === 'basic') {
            executeGitCommand('git commit -m "C1: Initial Commit"');
            executeGitCommand('git commit -m "C2: Create index.html"');
        } 
        else if (scenarioName === 'branch') {
            executeGitCommand('git commit -m "C1: Initial Commit"');
            executeGitCommand('git commit -m "C2: Create index.html"');
            executeGitCommand('git checkout -b feature');
            executeGitCommand('git commit -m "C3: Start building UI"');
        } 
        else if (scenarioName === 'merge') {
            executeGitCommand('git commit -m "C1: Initial Commit"');
            executeGitCommand('git checkout -b feature');
            executeGitCommand('git commit -m "C2: Add styles"');
            executeGitCommand('git checkout main');
            executeGitCommand('git commit -m "C3: Hotfix analytics"');
            executeGitCommand('git merge feature');
        } 
        else if (scenarioName === 'rebase') {
            executeGitCommand('git commit -m "C1: Initial Commit"');
            executeGitCommand('git commit -m "C2: Setup server"');
            executeGitCommand('git checkout -b feature');
            executeGitCommand('git commit -m "C3: Add user auth"');
            executeGitCommand('git checkout main');
            executeGitCommand('git commit -m "C4: Update dependencies"');
            executeGitCommand('git checkout feature');
        }
    }

    // 初期起動時に基本シナリオをロード
    loadScenario('basic');
});
