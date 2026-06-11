const OSS_DATA = [
    {
        saas: {
            name: "Notion",
            icon: "📝",
            category: "documents"
        },
        alternatives: [
            {
                name: "AppFlowy",
                description: "C++とFlutterで構築された、セキュリティとプライバシーを最優先にしたNotionの強力なオープンソース代替案。",
                repo: "AppFlowy-IO/AppFlowy",
                license: "AGPL-3.0",
                website: "https://www.appflowy.io/",
                starsFallback: 49000,
                tags: ["ドキュメント", "タスク管理", "オフライン対応"]
            },
            {
                name: "AFFiNE",
                description: "文書作成、ホワイトボード、データテーブルを融合させ、ローカルファーストで動作する次世代ナレッジベース。",
                repo: "toeverything/AFFiNE",
                license: "MIT",
                website: "https://affine.pro/",
                starsFallback: 35000,
                tags: ["ドキュメント", "ホワイトボード", "コラボレーション"]
            }
        ]
    },
    {
        saas: {
            name: "Slack",
            icon: "💬",
            category: "communication"
        },
        alternatives: [
            {
                name: "Mattermost",
                description: "セキュリティ要件の厳しい大企業や開発チーム向けに設計された、セルフホスト可能なチャット＆コラボレーションツール。",
                repo: "mattermost/mattermost",
                license: "AGPL-3.0 / Apache-2.0",
                website: "https://mattermost.com/",
                starsFallback: 29000,
                tags: ["チャット", "セキュリティ", "セルフホスト"]
            },
            {
                name: "Zulip",
                description: "スレッド形式のトピック会話に特化し、大規模コミュニティや非同期コミュニケーションを効率化するチャットアプリ。",
                repo: "zulip/zulip",
                license: "Apache-2.0",
                website: "https://zulip.com/",
                starsFallback: 21000,
                tags: ["チャット", "スレッド", "非同期通信"]
            }
        ]
    },
    {
        saas: {
            name: "Firebase",
            icon: "🔥",
            category: "developer"
        },
        alternatives: [
            {
                name: "Supabase",
                description: "PostgreSQLをベースとし、データベース、リアルタイムAPI、Auth、ストレージを数クリックで自動構築する最強のFirebase代替。",
                repo: "supabase/supabase",
                license: "Apache-2.0",
                website: "https://supabase.com/",
                starsFallback: 72000,
                tags: ["データベース", "Auth", "サーバーレス"]
            },
            {
                name: "Appwrite",
                description: "Docker環境で数秒で起動でき、Web・モバイル開発に必要な全バックエンド機能を包括したセキュリティ重視のSaaS代替プラットフォーム。",
                repo: "appwrite/appwrite",
                license: "BSD-3-Clause",
                website: "https://appwrite.io/",
                starsFallback: 42000,
                tags: ["API", "Auth", "Docker"]
            }
        ]
    },
    {
        saas: {
            name: "Airtable",
            icon: "📊",
            category: "database"
        },
        alternatives: [
            {
                name: "NocoDB",
                description: "任意のSQLデータベース（MySQL/PostgreSQL等）を、スマートでノーコード対応のAirtable風表計算スプレッドシートUIに変換するツール。",
                repo: "nocodb/nocodb",
                license: "AGPL-3.0",
                website: "https://nocodb.com/",
                starsFallback: 44000,
                tags: ["スプレッドシート", "ノーコード", "SQL連携"]
            },
            {
                name: "Baserow",
                description: "独自のデータベーススキーマを設計でき、大量のデータ行を軽快に処理可能なセルフホスト対応のノーコードデータベース。",
                repo: "baserow/baserow",
                license: "MIT",
                website: "https://baserow.io/",
                starsFallback: 5000,
                tags: ["ノーコード", "API連携", "リレーショナルDB"]
            }
        ]
    },
    {
        saas: {
            name: "Trello",
            icon: "📋",
            category: "management"
        },
        alternatives: [
            {
                name: "Planka",
                description: "ReactとReduxで構築された、驚くほど軽量で洗練された動作のカンバンボードツール。ガントチャートや分析機能も搭載。",
                repo: "planka-board/planka",
                license: "MIT",
                website: "https://planka.app/",
                starsFallback: 6500,
                tags: ["カンバン", "軽量", "React"]
            },
            {
                name: "Focalboard",
                description: "個人およびチームのプロジェクトを視覚的に整理するための、Mattermostに統合されたオープンソースのタスク管理ボード。",
                repo: "mattermost/focalboard",
                license: "AGPL-3.0",
                website: "https://www.focalboard.com/",
                starsFallback: 18000,
                tags: ["カンバン", "タスク管理", "マルチビュー"]
            }
        ]
    },
    {
        saas: {
            name: "GitHub",
            icon: "💻",
            category: "developer"
        },
        alternatives: [
            {
                name: "Gitea",
                description: "Go言語で書かれた、超軽量でリソース消費の少ない自己ホスト型Gitサービス。Raspberry Piでも軽快に動作可能。",
                repo: "go-gitea/gitea",
                license: "MIT",
                website: "https://gitea.io/",
                starsFallback: 43000,
                tags: ["Git", "軽量", "Go"]
            },
            {
                name: "GitLab",
                description: "CI/CDパイプライン、コンテナレジストリ、プロジェクト管理からセキュリティ監視までカバーする、エンタープライズ向けのGit総合プラットフォーム。",
                repo: "gitlabhq/gitlabhq",
                license: "MIT",
                website: "https://about.gitlab.com/",
                starsFallback: 25000,
                tags: ["Git", "CI/CD", "エンタープライズ"]
            }
        ]
    },
    {
        saas: {
            name: "Shopify",
            icon: "🛍️",
            category: "database"
        },
        alternatives: [
            {
                name: "Medusa",
                description: "Next.jsやGatsbyなどの最新フロントエンド技術と親和性の高い、ヘッドレスコマース（Eコマースバックエンド）エンジンの傑作。",
                repo: "medusajs/medusa",
                license: "MIT",
                website: "https://medusajs.com/",
                starsFallback: 24000,
                tags: ["Eコマース", "ヘッドレス", "Node.js"]
            }
        ]
    },
    {
        saas: {
            name: "Salesforce",
            icon: "👔",
            category: "management"
        },
        alternatives: [
            {
                name: "Erxes",
                description: "マーケティング、セールス、カスタマーサービスを1つのオープンソースプラットフォームに統合した、モダンな顧客体験（CX）マネージャー。",
                repo: "erxes/erxes",
                license: "AGPL-3.0",
                website: "https://erxes.io/",
                starsFallback: 3500,
                tags: ["CRM", "顧客管理", "マーケティング"]
            }
        ]
    }
];
