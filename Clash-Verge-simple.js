/**
 * Clash Verge 扩展脚本
 * @author cnm-microsoft (由 Gemini 审查和修复)
 * @description
 */
function main(config) {
  // --- 1. 自定义代理组 (Proxy Groups) ---
  // 这里定义了用户在 Clash Verge UI 中看到的各种策略组。
  const customProxyGroups = [
    {
      name: '✈️ ‍起飞',
      type: 'select',
      // 在最前面加入链式代理选项，方便切换
      proxies: ['⚡ ‍低延迟', '🔧 ‍自建', '👆🏻 指定'],
    },
    {
      name: '⚡ ‍低延迟',
      type: 'url-test',
      url: 'https://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 100,
      timeout: 2000,
      'include-all': true, // 包括订阅中的所有节点
      'exclude-filter': 'EDT|Enzu|天书' // 排除名称中包含 "Enzu" 的节点
    },
    {
      name: '👆🏻 指定',
      type: 'select',
      filter: '专线|超速|CN2', // 筛选名称包含这些关键字的节点
      'include-all': true,
      'exclude-filter': 'Enzu|天书', // 排除名称中包含 "Enzu" 的节点
      proxies: []
    },

    {
      name: '🔧 ‍自建',
      type: 'select',
      filter: '自建', // 筛选名称包含 '自建' 字符的节点
      'include-all': true,
      proxies: []
    },
    {
      name: '🛩️ ‍墙内',
      type: 'select',
      proxies: ['DIRECT', 'REJECT'], // 国内流量，优先直连
    },
    {
      name: '💩 ‍广告',
      type: 'select',
      proxies: ['REJECT', 'DIRECT'], // 广告流量，优先拦截
    },
    {
      name: '🤖 ‍AI',
      type: 'select',
      filter: 'US|自建|CN2|美国',
      'include-all': true,
      'exclude-filter': 'Enzu', // 排除名称中包含 "Enzu" 的节点
      proxies: [],
    },
    {
      name: '🌐 ‍未知站点',
      type: 'select',
      // 未匹配任何规则的流量的最终走向
      proxies: ['✈️ ‍起飞', '🛩️ ‍墙内'],
    },
  ];

  // --- 2. 自定义规则集提供者 (Rule Providers) ---
  // 这里定义了从网络上获取的规则列表。
  const customRuleProviders = {
    // GFW 列表
    ProxyGFWlist: {
      type: 'http',
      behavior: 'domain',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
      path: './ruleset/ProxyGFWlist.yaml',
      interval: 86400, // 每天更新一次
    },
    // 直连域名列表
    LoyalDirect: {
      type: 'http',
      behavior: 'domain',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
      path: './ruleset/loyalsoldier-direct.yaml',
      interval: 86400,
    },
    // 国内 IP 段
    LoyalCnCIDR: {
      type: 'http',
      behavior: 'ipcidr',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
      path: './ruleset/loyalsoldier-cncidr.yaml',
      interval: 86400,
    },
    // 局域网 IP 段
    LoyalLanCIDR: {
      type: 'http',
      behavior: 'ipcidr',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
      path: './ruleset/loyalsoldier-lancidr.yaml',
      interval: 86400,
    },
    // 广告域名列表
    reject: {
      type: 'http',
      behavior: 'domain',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
      path: './ruleset/reject.yaml',
      interval: 86400,
    },
    // 另一个广告规则作为补充
    AD: {
      type: 'http',
      behavior: 'domain',
      url: 'https://script.cx.ms/awavenue/AWAvenue-Ads-Rule-Clash.yaml',
      path: './ruleset/AWAvenue-Ads-Rule-Clash.yaml',
      interval: 86400,
    },
    // AI 服务规则 (例如 Gemini, OpenAI)
    AI: {
      type: 'http',
      behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Ruleset/Gemini.yaml',
      path: './ruleset/Gemini.yaml',
      interval: 86400,
    },
    // Google 服务规则
    Google: {
      type: 'http',
      behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Ruleset/Google.yaml',
      path: './ruleset/Google.yaml',
      interval: 86400,
    },
    // telegram 服务规则
    Telegram: {
      type: 'http',
      behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Ruleset/Telegram.yaml',
      path: './ruleset/Telegram.yaml',
      interval: 86400,
    },
    // 常见需要直连的应用程序
    applications: {
      type: 'http',
      behavior: 'classical',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt',
      path: './ruleset/applications.yaml',
      interval: 86400,
    },
  };

  // --- 3. 自定义路由规则 (Rules) ---
  // 规则按从上到下的顺序匹配，一旦匹配成功，后续规则不再执行。
  // 优化后的规则顺序：局域网 -> 广告拦截 -> 特定直连 -> AI服务 -> 代理服务 -> 国内IP -> 兜底
  const customRules = [
    // 1. 局域网和私有地址优先直连
    'RULE-SET,LoyalLanCIDR,DIRECT,no-resolve',

    // 2. 广告拦截（放在前面提高效率）
    'RULE-SET,reject,💩 ‍广告,no-resolve',
    'RULE-SET,AD,💩 ‍广告,no-resolve',

    // 3. 特定服务直连规则
    'DOMAIN-SUFFIX,040726.xyz,DIRECT',
    'DOMAIN-SUFFIX,nzh-nas.top,DIRECT',
    'DOMAIN-SUFFIX,nzh-nas.me,DIRECT',
    'DOMAIN-SUFFIX,uk.nzh-cloud.me,DIRECT',
    'DOMAIN-SUFFIX,api.qnaigc.com,DIRECT',

    // 4. 国内服务和应用程序直连
    'RULE-SET,applications,DIRECT,no-resolve',
    'RULE-SET,LoyalDirect,DIRECT,no-resolve',

    // 5. AI服务专用代理（优先级高于一般代理）
    'RULE-SET,AI,🤖 ‍AI,no-resolve',
    'DOMAIN-SUFFIX,openai.com,🤖 ‍AI',
    'DOMAIN-SUFFIX,anthropic.com,🤖 ‍AI',
    'DOMAIN-SUFFIX,claude.ai,🤖 ‍AI',
    'DOMAIN-SUFFIX,gemini.google.com,🤖 ‍AI',

    // 6. 特定代理服务
    'DOMAIN-SUFFIX,api.iturrit.com,✈️ ‍起飞',
    'DOMAIN-SUFFIX,www.lxc.wiki,✈️ ‍起飞',

    // 7. 通用代理规则
    'RULE-SET,ProxyGFWlist,✈️ ‍起飞,no-resolve',
    'RULE-SET,Telegram,✈️ ‍起飞,no-resolve',
    'RULE-SET,Google,✈️ ‍起飞,no-resolve',

    // 8. 国内IP段直连（放在后面避免误判）
    'RULE-SET,LoyalCnCIDR,DIRECT,no-resolve',
    'GEOIP,CN,DIRECT,no-resolve',

    // 9. 最终匹配规则
    'MATCH,🌐 ‍未知站点,no-resolve'
  ];

  // --- 4. 自定义 DNS 配置 ---
  // 优化后的DNS配置：提升性能，减少兼容性问题，增强稳定性
  const customDns = {
    enable: true,
    listen: '0.0.0.0:53',
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-filter-mode': 'blacklist',
    'prefer-h3': false,
    'respect-rules': true, // 让DNS遵循路由规则
    'use-hosts': true,
    'use-system-hosts': false,
    ipv6: false, // 关闭IPv6避免兼容性问题

    // 性能优化配置
    'nameserver-timeout': 2000,
    'fallback-timeout': 1000,
    'pool-size': 10,

    // 简化fake-ip过滤列表
    'fake-ip-filter': [
      '*.lan',
      '*.local',
      '*.localhost',
      'time.*.com',
      'ntp.*.com',
      '*.msftncsi.com',
      'www.msftconnecttest.com',
      'localhost.ptlogin2.qq.com',
      '+.market.xiaomi.com',
      '*.apple.com',
      '*.icloud.com'
    ],

    // 优化默认DNS服务器
    'default-nameserver': [
      '223.5.5.5',     // 阿里DNS
      '119.29.29.29',  // 腾讯DNS
      '8.8.8.8'        // Google DNS作为备用
    ],

    // 主DNS服务器配置
    nameserver: [
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query',
      '223.5.5.5',
      '8.8.8.8'
    ],

    'direct-nameserver-follow-policy': false,
    
    // 优化分流DNS策略
    'nameserver-policy': {
      // 国内域名使用国内DNS
      'geosite:cn,private': [
        'https://doh.pub/dns-query',
        'https://dns.alidns.com/dns-query',
        '223.5.5.5'
      ],
      // 海外服务使用海外DNS
      'geosite:google,youtube,facebook,twitter,telegram,netflix,openai,anthropic': [
        'https://1.1.1.1/dns-query',
        'https://8.8.8.8/dns-query'
      ],
      // Apple服务特殊处理
      'geosite:apple,icloud': [
        'https://doh.pub/dns-query',
        '223.5.5.5'
      ],
      // 特定域名直接指定DNS
      'domain:040726.xyz,nzh-nas.top,nzh-nas.me': [
        '223.5.5.5',
        '119.29.29.29'
      ]
    },

    // 简化fallback配置
    'fallback-filter': {
      geoip: true,
      'geoip-code': 'CN',
      ipcidr: ['240.0.0.0/4'],
      domain: ['+.google.com', '+.youtube.com', '+.facebook.com']
    },

    // 代理服务器DNS配置
    'proxy-server-nameserver': [
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query'
    ]
  };

  // --- 5. 合并配置 ---
  // 将上面定义的自定义配置覆盖到原始配置中。
  // 使用 Object.assign 可以更优雅地合并对象
  Object.assign(config, {
    'proxy-groups': customProxyGroups,
    'rule-providers': customRuleProviders,
    rules: customRules,
    dns: customDns,
    // 基础运行设置
    'mixed-port': 7890,
    'allow-lan': true,
    'mode': 'rule',
    'log-level': 'info',
    'external-controller': '0.0.0.0:9090'
  });

  // 返回修改后的完整配置对象
  return config;
}
