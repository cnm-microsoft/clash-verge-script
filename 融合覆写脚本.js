
/**
 * Clash Verge 融合覆写脚本
 * @author cnm-microsoft (融合版本)
 * @description 融合了 Clash-Verge-simple.js 的自定义代理组、自建服务直连和 ld.config 的其余部分
 */
function main(config) {
    // --- 1. 自定义代理组 (来自 Clash-Verge-simple.js) ---
    const customProxyGroups = [
        {
            name: '✈️ ‍起飞',
            type: 'select',
            proxies: ['⚡ ‍低延迟', '🔧 ‍自建', '👆🏻 指定'],
        },
        {
            name: '⚡ ‍低延迟',
            type: 'url-test',
            url: 'https://www.gstatic.com/generate_204',
            interval: 300,
            tolerance: 100,
            timeout: 2000,
            'include-all': true,
            'exclude-filter': 'EDT|Enzu|天书'
        },
        {
            name: '👆🏻 指定',
            type: 'select',
            filter: '专线|超速|CN2',
            'include-all': true,
            'exclude-filter': 'Enzu|天书',
            proxies: []
        },
        {
            name: '🔧 ‍自建',
            type: 'select',
            filter: '自建',
            'include-all': true,
            proxies: []
        },
        {
            name: '🛩️ ‍墙内',
            type: 'select',
            proxies: ['DIRECT', 'REJECT'],
        },
        {
            name: '💩 ‍广告',
            type: 'select',
            proxies: ['REJECT', 'DIRECT'],
        },
        {
            name: '🤖 ‍AI',
            type: 'select',
            filter: 'US|自建|CN2|美国',
            'include-all': true,
            'exclude-filter': 'Enzu',
            proxies: [],
        },
        {
            name: '🌐 ‍未知站点',
            type: 'select',
            proxies: ['✈️ ‍起飞', '🛩️ ‍墙内'],
        }
    ];

    // --- 2. 自定义规则集提供者 (融合两个文件的规则) ---
    const customRuleProviders = {
        // 来自 Clash-Verge-simple.js 的规则
        ProxyGFWlist: {
            type: 'http',
            behavior: 'domain',
            url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
            path: './ruleset/ProxyGFWlist.yaml',
            interval: 86400,
        },
        LoyalDirect: {
            type: 'http',
            behavior: 'domain',
            url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
            path: './ruleset/loyalsoldier-direct.yaml',
            interval: 86400,
        },
        LoyalCnCIDR: {
            type: 'http',
            behavior: 'ipcidr',
            url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
            path: './ruleset/loyalsoldier-cncidr.yaml',
            interval: 86400,
        },
        LoyalLanCIDR: {
            type: 'http',
            behavior: 'ipcidr',
            url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
            path: './ruleset/loyalsoldier-lancidr.yaml',
            interval: 86400,
        },
        reject: {
            type: 'http',
            behavior: 'domain',
            url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
            path: './ruleset/reject.yaml',
            interval: 86400,
        },
        AWAvenue_Ads_Rule: {
            type: 'http',
            behavior: 'domain',
            url: 'https://script.cx.ms/awavenue/AWAvenue-Ads-Rule-Clash.yaml',
            path: './ruleset/AWAvenue-Ads-Rule-Clash.yaml',
            interval: 86400,
        },
        Google: {
            type: 'http',
            behavior: 'classical',
            url: 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Ruleset/Google.yaml',
            path: './ruleset/Google.yaml',
            interval: 86400,
        },
        Telegram: {
            type: 'http',
            behavior: 'classical',
            url: 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Ruleset/Telegram.yaml',
            path: './ruleset/Telegram.yaml',
            interval: 86400,
        },
        applications: {
            type: 'http',
            behavior: 'classical',
            url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt',
            path: './ruleset/applications.yaml',
            interval: 86400,
        },
        cn_ip: {
            type: 'http',
            interval: 86400,
            behavior: 'ipcidr',
            format: 'mrs',
            path: './ruleset/cn_ip.mrs',
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
        },
        cn_domain: {
            type: 'http',
            interval: 86400,
            behavior: 'domain',
            format: 'mrs',
            path: './ruleset/cn_domain.mrs',
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
        },
        gfw_domain: {
            type: 'http',
            interval: 86400,
            behavior: 'domain',
            format: 'mrs',
            path: './ruleset/gfw_domain.mrs',
            url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/gfw.mrs",
        },
        ai: {
            type: 'http',
            interval: 86400,
            behavior: 'domain',
            format: 'mrs',
            path: './ruleset/ai',
            url: "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/ai.mrs",
        }
    };

    // --- 3. 自定义路由规则 (融合两个文件的规则) ---
    const customRules = [
        // 自建服务直连 (来自 Clash-Verge-simple.js)
        'DOMAIN-SUFFIX,040726.xyz,DIRECT',
        'DOMAIN-SUFFIX,nzh-nas.top,DIRECT',
        'DOMAIN-SUFFIX,nzh-nas.me,DIRECT',
        'DOMAIN-SUFFIX,uk.nzh-cloud.me,DIRECT',
        // 直连规则
        'DOMAIN-SUFFIX,api.qnaigc.com,DIRECT',
        'DOMAIN-SUFFIX,bing.com,DIRECT',

        // 广告拦截
        'RULE-SET,reject,💩 ‍广告,no-resolve',
        'RULE-SET,AWAvenue_Ads_Rule,💩 ‍广告,no-resolve',
        'RULE-SET,AWAvenue_Ads_Rule,REJECT',

        // 国内/直连服务
        'RULE-SET,LoyalDirect,DIRECT,no-resolve',
        'RULE-SET,LoyalLanCIDR,DIRECT,no-resolve',
        'RULE-SET,LoyalCnCIDR,DIRECT,no-resolve',
        'RULE-SET,cn_ip,DIRECT,no-resolve',
        'RULE-SET,cn_domain,DIRECT',
        'GEOIP,CN,DIRECT,no-resolve',
        'RULE-SET,applications,DIRECT,no-resolve',

        // 自用代理规则
        'DOMAIN-SUFFIX,api.iturrit.com,✈️ ‍起飞',
        'DOMAIN-SUFFIX,www.lxc.wiki,✈️ ‍起飞',

        // AI 服务规则
        'DOMAIN-SUFFIX,lingq.com,🤖 ‍AI',
        'DOMAIN-SUFFIX,youglish.com,🤖 ‍AI',
        'DOMAIN-SUFFIX,deepl.com,🤖 ‍AI',
        'DOMAIN-SUFFIX,chat.openai.com,🤖 ‍AI',
        'DOMAIN-SUFFIX,grammarly.com,🤖 ‍AI',
        'DOMAIN-KEYWORD,sci-hub,🤖 ‍AI',
        'RULE-SET,ai,🤖 ‍AI,no-resolve',

        // 代理规则
        'RULE-SET,ProxyGFWlist,✈️ ‍起飞,no-resolve',
        'RULE-SET,gfw_domain,✈️ ‍起飞,no-resolve',
        'RULE-SET,Telegram,✈️ ‍起飞,no-resolve',

        // 最终匹配规则
        'MATCH,🌐 ‍未知站点,no-resolve'
    ];

    // --- 4. 自定义 DNS 配置 (融合两个文件的 DNS 设置) ---
    const customDns = {
        enable: true,
        ipv6: true,
        listen: '0.0.0.0:1053',
        'enhanced-mode': 'fake-ip',
        'fake-ip-range': '198.18.0.1/16',
        'fake-ip-filter-mode': 'blacklist',
        'prefer-h3': false,
        'respect-rules': true,
        'use-hosts': false,
        'use-system-hosts': false,
        'cache-algorithm': 'arc',
        'cache-size': 2048,
        'fake-ip-filter': [
            '*.lan',
            '*.local',
            '*.arpa',
            'time.*.com',
            'ntp.*.com',
            '+.market.xiaomi.com',
            'localhost.ptlogin2.qq.com',
            '*.msftncsi.com',
            'www.msftconnecttest.com',
            'geosite:connectivity-check',
            'geosite:private'
        ],
        'default-nameserver': [
            '1.1.1.1',
            '8.8.8.8',
            '223.6.6.6',
            '2400:3200::1',
            '2001:4860:4860::8888'
        ],
        nameserver: [
            'https://1.1.1.1/dns-query',
            'https://dns.google/dns-query',
            '1.1.1.1',
            '8.8.8.8',
            'https://doh.pub/dns-query',
            'https://dns.alidns.com/dns-query'
        ],
        'nameserver-policy': {
            "geosite:cn": [
                'https://223.5.5.5/dns-query',
                'https://doh.pub/dns-query',
                '223.5.5.5',
                '119.29.29.29'
            ],
            "geosite:private": [
                'https://223.5.5.5/dns-query',
                'https://doh.pub/dns-query',
                '223.5.5.5',
                '119.29.29.29'
            ],
            "geo:cn": [
                'https://223.5.5.5/dns-query',
                'https://doh.pub/dns-query',
                '223.5.5.5',
                '119.29.29.29'
            ],
            "geosite:gfw": [
                'https://1.1.1.1/dns-query',
                'https://dns.google/dns-query',
                '1.1.1.1',
                '8.8.8.8'
            ],
            "geosite:geolocation-!cn": [
                'https://1.1.1.1/dns-query',
                'https://dns.google/dns-query',
                '1.1.1.1',
                '8.8.8.8'
            ]
        },
        'direct-nameserver-follow-policy': false,
        'fallback-filter': {
            geoip: true,
            'geoip-code': 'CN',
            ipcidr: [
                '240.0.0.0/4',
                '0.0.0.0/32'
            ],
            domain: [
                '+.google.com',
                '+.facebook.com',
                '+.youtube.com'
            ]
        },
        'proxy-server-nameserver': [
            'https://1.1.1.1/dns-query',
            'https://dns.google/dns-query',
            '1.1.1.1',
            '8.8.8.8'
        ]
    };

    // --- 5. 其他配置 (来自 ld.config) ---
    const otherConfigs = {
        // 全局设置
        port: 7890,
        'socks-port': 7891,
        'redir-port': 7892,
        'mixed-port': 7893,
        'tproxy-port': 7894,
        'allow-lan': true,
        mode: 'rule',
        'bind-address': '*',
        'unified-delay': true,
        'tcp-concurrent': true,
        'log-level': 'warning',
        'find-process-mode': 'strict',
        'global-client-fingerprint': 'chrome',
        'keep-alive-idle': 600,
        'keep-alive-interval': 15,
        'disable-keep-alive': false,

        // 控制面板
        'external-controller': '127.0.0.1:9090',
        secret: '2101764004',
        'external-ui': './ui',
        'external-ui-url': 'https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip',

        // Profile 设置
        profile: {
            'store-selected': true,
            'store-fake-ip': true
        },

        // 流量嗅探
        sniffer: {
            enable: true,
            sniff: {
                HTTP: {
                    ports: [80, '8080-8880'],
                    'override-destination': true
                },
                TLS: {
                    ports: [443, 8443]
                },
                QUIC: {
                    ports: [443, 8443]
                }
            },
            'force-domain': ['+.v2ex.com'],
            'skip-domain': ['+.baidu.com', '+.bilibili.com']
        },

        // TUN 配置
        tun: {
            enable: true,
            stack: 'mixed',
            'auto-route': true,
            'auto-redirect': true,
            'auto-detect-interface': true,
            'strict-route': true,
            'dns-hijack': ['any:53', 'tcp://any:53'],
            mtu: 1500,
            gso: true,
            'gso-max-size': 65536,
            'udp-timeout': 300
        },

        // GEO 数据库配置
        'geodata-mode': true,
        'geodata-loader': 'memconservative',
        'geo-auto-update': true,
        'geo-update-interval': 48,
        'geox-url': {
            geoip: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat",
            geosite: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
            mmdb: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.metadb"
        }
    };

    // --- 6. 合并配置 ---
    Object.assign(config, otherConfigs, {
        'proxy-groups': customProxyGroups,
        'rule-providers': customRuleProviders,
        rules: customRules,
        dns: customDns,
    });

    return config;
}