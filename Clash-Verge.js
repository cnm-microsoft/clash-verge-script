
// Clash Verge 覆写脚本 - 整合 Clash-Verge-simple.js 代理组配置
// 该脚本将原始YAML配置转换为JavaScript格式，便于动态配置和自定义

function main(config) {
    // **=============================== 代理配置 ===============================**

    // 代理提供者通用配置模板
    const proxyProviderTemplate = {
        type: "http",
        udp: true,
        interval: 86400,
        lazy: true,
        "health-check": {
            enable: true,
            url: "https://cp.cloudflare.com/generate_204",
            interval: 600,
            timeout: 5,
            lazy: true,
            "expected-status": "204",
            method: "HEAD"
        },
        smux: {
            enabled: true,
            padding: true,
            protocol: "smux"
        }
    };

    // **=============================== 节点信息 ===============================**
    config.proxies = [
        { name: "DIRECTLY", type: "direct", udp: true },
        { name: "REJECT", type: "reject" }
    ];

    // **=============================== DNS 配置 ===============================**
    config.dns = {
        enable: true,
        ipv6: true,
        listen: "0.0.0.0:1053",
        "prefer-h3": false,
        "respect-rules": true,
        "cache-algorithm": "arc",
        "cache-size": 2048,
        "use-hosts": false,
        "use-system-hosts": false,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-filter-mode": "blacklist",
        "fake-ip-filter": [
            "private_domain",
            "cn_domain",
            "geosite:connectivity-check",
            "geosite:private",
            "fake_ip_filter_DustinWin"
        ],
        "default-nameserver": [
            "1.1.1.1",
            "8.8.8.8"
        ],
        nameserver: [
            "https://1.1.1.1/dns-query",
            "https://dns.google/dns-query",
            "1.1.1.1",
            "8.8.8.8"
        ],
        "nameserver-policy": {
            "geosite:cn,private": [
                "https://223.5.5.5/dns-query",
                "https://doh.pub/dns-query",
                "223.5.5.5",
                "119.29.29.29"
            ],
            "geo:cn": [
                "https://223.5.5.5/dns-query",
                "https://doh.pub/dns-query",
                "223.5.5.5",
                "119.29.29.29"
            ],
            "geosite:gfw": [
                "https://1.1.1.1/dns-query",
                "https://dns.google/dns-query",
                "1.1.1.1",
                "8.8.8.8"
            ],
            "geosite:geolocation-!cn": [
                "https://1.1.1.1/dns-query",
                "https://dns.google/dns-query",
                "1.1.1.1",
                "8.8.8.8"
            ]
        },
        fallback: [
            "1.1.1.1",
            "8.8.8.8"
        ],
        "proxy-server-nameserver": [
            "https://1.1.1.1/dns-query",
            "https://dns.google/dns-query",
            "1.1.1.1",
            "8.8.8.8"
        ]
    };

    // **控制面板**
    config["external-controller"] = "127.0.0.1:9090";
    config.secret = "123465."; // 建议使用更复杂密码
    config["external-ui"] = "./ui";
    config["external-ui-url"] = "https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip";

    // **=============================== 全局设置 ===============================**
    config.port = 7890;
    config["socks-port"] = 7891;
    config["redir-port"] = 7892;
    config["mixed-port"] = 7893;
    config["tproxy-port"] = 7894;
    config["allow-lan"] = true;
    config.mode = "rule";
    config["bind-address"] = "*";
    config.ipv6 = true;
    config["unified-delay"] = true;
    config["tcp-concurrent"] = true;
    config["log-level"] = "warning";
    config["find-process-mode"] = "strict";
    config["global-client-fingerprint"] = "chrome";
    config["keep-alive-idle"] = 600;
    config["keep-alive-interval"] = 15;
    config["disable-keep-alive"] = false;

    config.profile = {
        "store-selected": true,
        "store-fake-ip": true,
        "auto-close-delay": 300
    };

    // **=============================== 流量嗅探配置 ===============================**
    config.sniffer = {
        enable: true,
        sniff: {
            HTTP: {
                ports: [80, "8080-8880"],
                "override-destination": true
            },
            TLS: {
                ports: [443, 8443]
            },
            QUIC: {
                ports: [443, 8443]
            }
        },
        "force-domain": [
            "+.v2ex.com"
        ],
        "skip-domain": [
            "+.baidu.com",
            "+.bilibili.com"
        ]
    };

    // **=============================== TUN 配置 ===============================**
    config.tun = {
        enable: true,
        stack: "mixed",
        "auto-route": true,
        "auto-redirect": true,
        "auto-detect-interface": true,
        "strict-route": true,
        "dns-hijack": [
            "any:53",
            "tcp://any:53"
        ],
        mtu: 1500,
        gso: true,
        "gso-max-size": 65536,
        "udp-timeout": 300
    };

    // **=============================== GEO 数据库配置 ===============================**
    config["geodata-mode"] = true;
    config["geodata-loader"] = "memconservative";
    config["geo-auto-update"] = true;
    config["geo-update-interval"] = 48;
    config["geox-url"] = {
        geoip: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat",
        geosite: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat"
    };

    // **=============================== 代理组设置 ===============================**

    // 主用订阅组引用
    const allProviders = ["1.p1", "2.p2", "3.p3", "4.p4"];

    config["proxy-groups"] = [
        // === 从 Clash-Verge-simple.js 移植的核心代理组 ===
        {
            name: "✈️ 起飞",
            type: "select",
            proxies: ["⚡ 低延迟", "🔧 自建", "👆🏻 指定"],
            icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png"
        },
        {
            name: "⚡ 低延迟",
            type: "url-test",
            use: allProviders,
            url: "https://www.gstatic.com/generate_204",
            interval: 300,
            tolerance: 100,
            timeout: 2000,
            "include-all": true,
            "exclude-filter": "EDT|Enzu|天书",
            icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Speedtest.png"
        },
        {
            name: "👆🏻 指定",
            type: "select",
            use: allProviders,
            filter: "专线|超速|CN2",
            "include-all": true,
            "exclude-filter": "Enzu|天书",
            proxies: [],
            icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Static.png"
        },
        {
            name: "🔧 自建",
            type: "select",
            use: allProviders,
            filter: "自建",
            "include-all": true,
            proxies: [],
            icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Server.png"
        },

        // === 功能性策略组 ===
        {
            name: "🛩️ 墙内",
            type: "select",
            proxies: ["DIRECTLY", "REJECT"],
            icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
        },
        {
            name: "💩 广告",
            type: "select",
            proxies: ["REJECT", "DIRECTLY"],
            icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png"
        },
        {
            name: "🤖 AI",
            type: "select",
            use: allProviders,
            filter: "US|拼好鸡|CN2|美国",
            "include-all": true,
            "exclude-filter": "Enzu",
            proxies: [],
            icon: "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/ai.png"
        },
        {
            name: "🌐 未知站点",
            type: "select",
            proxies: ["✈️ 起飞", "🛩️ 墙内"],
            icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png"
        }
    ];

    // **=============================== 规则设置 ===============================**
    config.rules = [
        // --- 广告拦截 (最高优先级) ---
        "RULE-SET,AWAvenue_Ads_Rule,💩 广告",

        // --- 自建服务直连 ---
        "DOMAIN-SUFFIX,040726.xyz,DIRECTLY",
        "DOMAIN-SUFFIX,nzh-nas.top,DIRECTLY",
        "DOMAIN-SUFFIX,nzh-nas.me,DIRECTLY",
        "DOMAIN-SUFFIX,uk.nzh-cloud.me,DIRECTLY",

        // --- 精确的 IP / ASN 规则 (强制 no-resolve，防DNS泄漏) ---
        "RULE-SET,cn_ip,DIRECTLY,no-resolve",
        "RULE-SET,geoip_cloudfront,DIRECTLY,no-resolve",
        "RULE-SET,telegram_ip,✈️ 起飞,no-resolve",
        "RULE-SET,Telegram_No_Resolve,✈️ 起飞,no-resolve",
        "RULE-SET,geoip_netflix,✈️ 起飞,no-resolve",

        // --- Telegram 规则 ---
        "PROCESS-NAME-REGEX,.*telegram.*,✈️ 起飞",
        "RULE-SET,telegram_domain,✈️ 起飞",

        // --- AI 服务规则 ---
        "DOMAIN-SUFFIX,lingq.com,🤖 AI",
        "DOMAIN-SUFFIX,youglish.com,🤖 AI",
        "DOMAIN-SUFFIX,deepl.com,🤖 AI",
        "DOMAIN-SUFFIX,chat.openai.com,🤖 AI",
        "DOMAIN-SUFFIX,grammarly.com,🤖 AI",
        "DOMAIN-KEYWORD,sci-hub,🤖 AI",
        "RULE-SET,ai,🤖 AI",

        // --- 学习平台 ---
        "DOMAIN-SUFFIX,edclub.com,✈️ 起飞",
        "DOMAIN-SUFFIX,typingclub.com,✈️ 起飞",
        "DOMAIN-SUFFIX,edclub-cdn.typingclub.com,✈️ 起飞",
        "DOMAIN-SUFFIX,typingclub-cdn.typingclub.com,✈️ 起飞",
        "DOMAIN-KEYWORD,typingclub,✈️ 起飞",

        // --- 媒体服务 ---
        "RULE-SET,youtube_domain,✈️ 起飞",
        "RULE-SET,tiktok_domain,✈️ 起飞",
        "RULE-SET,netflix_domain,✈️ 起飞",
        "RULE-SET,disney_domain,✈️ 起飞",

        // --- 服务类 ---
        "RULE-SET,onedrive_domain,✈️ 起飞",
        "RULE-SET,speedtest_domain,✈️ 起飞",

        // --- Apple 直连 ---
        "DOMAIN-SUFFIX,apple.com,DIRECTLY",
        "DOMAIN-SUFFIX,icloud.com,DIRECTLY",
        "DOMAIN-SUFFIX,cdn-apple.com,DIRECTLY",
        "RULE-SET,apple_cn_domain,DIRECTLY",
        "DOMAIN-SUFFIX,ls.apple.com,DIRECTLY",

        // --- 精确的直连域名规则 ---
        "DOMAIN-SUFFIX,julebu.co,DIRECTLY",
        "RULE-SET,blackmatrix7_direct,DIRECTLY",
        "RULE-SET,private_domain,DIRECTLY",
        "RULE-SET,cn_domain,DIRECTLY",

        // --- 通用代理规则 ---
        "RULE-SET,gfw_domain,✈️ 起飞",
        "RULE-SET,geolocation-!cn,✈️ 起飞",
        "RULE-SET,proxy,✈️ 起飞",

        // --- Tracker / BT 下载 ---
        "RULE-SET,trackerslist,DIRECTLY",

        // --- 最终回退规则 ---
        "MATCH,🌐 未知站点"
    ];

    // **=============================== 规则提供者 ===============================**

    // 规则提供者通用配置模板
    const ruleTemplates = {
        ip: {
            type: "http",
            interval: 86400,
            behavior: "ipcidr",
            format: "mrs"
        },
        domain: {
            type: "http",
            interval: 86400,
            behavior: "domain",
            format: "mrs"
        },
        yaml: {
            type: "http",
            interval: 86400,
            behavior: "domain",
            format: "yaml"
        },
        classical_yaml: {
            type: "http",
            interval: 86400,
            behavior: "classical",
            format: "yaml"
        }
    };

    config["rule-providers"] = {
        // 广告过滤
        AWAvenue_Ads_Rule: {
            ...ruleTemplates.yaml,
            path: "./ruleset/AWAvenue_Ads_Rule_Clash.yaml",
            url: "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash.yaml"
        },

        // fake-ip 过滤
        fake_ip_filter_DustinWin: {
            ...ruleTemplates.domain,
            path: "./ruleset/fake_ip_filter_DustinWin.mrs",
            url: "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/fakeip-filter.mrs"
        },

        // 直连类规则
        blackmatrix7_direct: {
            ...ruleTemplates.yaml,
            path: "./ruleset/blackmatrix7_direct.yaml",
            url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Direct/Direct.yaml"
        },
        private_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/private_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs"
        },
        cn_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/cn_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs"
        },
        cn_ip: {
            ...ruleTemplates.ip,
            path: "./ruleset/cn_ip.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs"
        },

        // BT 下载隐私类
        trackerslist: {
            ...ruleTemplates.domain,
            path: "./ruleset/trackerslist.mrs",
            url: "https://github.com/DustinWin/ruleset_geodata/raw/refs/heads/mihomo-ruleset/trackerslist.mrs"
        },

        // 代理类规则
        proxy: {
            ...ruleTemplates.domain,
            path: "./ruleset/proxy.mrs",
            url: "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/proxy.mrs"
        },
        gfw_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/gfw_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/gfw.mrs"
        },
        "geolocation-!cn": {
            ...ruleTemplates.domain,
            path: "./ruleset/geolocation-!cn.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/geolocation-!cn.mrs"
        },

        // 学术类
        ai: {
            ...ruleTemplates.domain,
            path: "./ruleset/ai.mrs",
            url: "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/ai.mrs"
        },

        // cloudflare
        geoip_cloudflare: {
            ...ruleTemplates.ip,
            path: "./ruleset/geoip_cloudflare.mrs",
            url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/cloudflare.mrs"
        },

        // 国外媒体
        youtube_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/youtube_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs"
        },
        tiktok_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/tiktok_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/tiktok.mrs"
        },
        netflix_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/netflix_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/netflix.mrs"
        },
        disney_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/disney_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/disney.mrs"
        },
        geoip_netflix: {
            ...ruleTemplates.ip,
            path: "./ruleset/geoip_netflix.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/netflix.mrs"
        },

        // Telegram
        telegram_domain: {
            ...ruleTemplates.yaml,
            path: "./ruleset/telegram_domain.yaml",
            url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Telegram/Telegram.yaml"
        },
        telegram_ip: {
            ...ruleTemplates.ip,
            path: "./ruleset/telegram_ip.mrs",
            url: "https://github.com/DustinWin/ruleset_geodata/raw/refs/heads/mihomo-ruleset/telegramip.mrs"
        },
        Telegram_No_Resolve: {
            ...ruleTemplates.classical_yaml,
            path: "./ruleset/Telegram_No_Resolve.yaml",
            url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Telegram/Telegram_No_Resolve.yaml"
        },

        // Apple
        apple_cn_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/apple_cn_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/apple-cn.mrs"
        },

        // 微软
        onedrive_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/onedrive_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/onedrive.mrs"
        },
        speedtest_domain: {
            ...ruleTemplates.domain,
            path: "./ruleset/speedtest_domain.mrs",
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/ookla-speedtest.mrs"
        }
    };

    return config;
}