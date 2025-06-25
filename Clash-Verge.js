/**
 * Clash Verge 扩展脚本
 * * @author cnm-microsoft (由 Gemini 审查和修复)
 * @description
 * 此脚本用于自定义 Clash Verge 的配置。
 * 它定义了一系列代理组、规则提供者和路由规则，
 * 以实现广告拦截、国内外流量分流、特定服务（如 AI）优化等功能。
 * * 修复说明:
 * 1. 修正了原始脚本的结构错误，将所有逻辑都包含在 main 函数内。
 * 2. 将 DNS 配置正确合并到主配置对象中。
 * 3. 清理了配置中的冗余项并增加了注释。
 */
function main(config) {
  // --- 1. 自定义代理组 (Proxy Groups) ---
  // 这里定义了用户在 Clash Verge UI 中看到的各种策略组。
  const customProxyGroups = [
    {
      name: '✈️ ‍起飞',
      type: 'select',
      proxies: ['⚡ ‍低延迟', '🔧 ‍自建', '🕹️ EDT', '👆🏻 指定', '📜 天书'],
    },
    {
      name: '⚡ ‍低延迟',
      type: 'url-test',
      url: 'https://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 100,
      timeout: 2000,
      'include-all': true, // 包括订阅中的所有节点
      'exclude-filter': '天书' // 排除名称中包含 "天书" 的节点
    },
    {
      name: '👆🏻 指定',
      type: 'select',
      filter: '专线|超速|CN2',
      'include-all': true,
      proxies: []
    },
    {
      name: '📜 天书',
      type: 'url-test',
      url: 'https://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 100,
      timeout: 2000,
      filter: '天书', // 仅筛选名称包含 "天书" 的节点
      'include-all': true,
      proxies: []
    },
    {
      name: '🕹️ EDT',
      type: 'url-test',
      url: 'https://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 100,
      timeout: 2000,
      filter: 'EDT', // 仅筛选名称包含 "EDT" 的节点
      'include-all': true,
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
      proxies: ['REJECT', '🛩️ ‍墙内', '✈️ ‍起飞'], // 广告流量，优先拦截
    },
    {
      name: '🤖 ‍AI',
      type: 'select',
      // 注意: 'x' 是一个占位符，请根据你的节点名称修改此处的 filter。
      // 例如，如果你的 AI 专用节点包含 "美国" 或 "GPT"，可以改为 '美国|GPT'
      filter: 'x',
      'include-all': true,
      proxies: [],
    },
    {
      name: '🌐 ‍未知站点',
      type: 'select',
      proxies: ['✈️ ‍起飞', '🛩️ ‍墙内', '💩 ‍广告'], // 未匹配规则的流量的最终去向
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
    // AI 服务规则 (例如 Gemini)
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
  const customRules = [
    // 自建服务直连
    'DOMAIN-SUFFIX,040726.xyz,DIRECT',
    'DOMAIN-SUFFIX,nzh-nas.top,DIRECT',
    'DOMAIN-SUFFIX,nzh-nas.me,DIRECT',
    // 广告拦截
    'RULE-SET,reject,💩 ‍广告,no-resolve',
    'RULE-SET,AD,💩 ‍广告,no-resolve',
    // 国内/直连服务
    'RULE-SET,LoyalDirect,DIRECT,no-resolve',
    'RULE-SET,LoyalLanCIDR,DIRECT,no-resolve',
    'RULE-SET,LoyalCnCIDR,DIRECT,no-resolve',
    'GEOIP,CN,DIRECT,no-resolve',
    'RULE-SET,applications,DIRECT,no-resolve',
    // 代理规则
    'RULE-SET,AI,🤖 ‍AI,no-resolve',
    'RULE-SET,Google,🤖 ‍AI,no-resolve',
    'RULE-SET,ProxyGFWlist,✈️ ‍起飞,no-resolve',
    // 最终匹配规则：所有未匹配到的流量都走这个规则
    'MATCH,🌐 ‍未知站点,no-resolve'
  ];

  // --- 4. 自定义 DNS 配置 ---
  // 这是脚本的核心部分之一，用于防止 DNS 污染和实现更快的解析。
  const customDns = {
    enable: true,
    listen: '0.0.0.0:53',
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-filter-mode': 'blacklist',
    'prefer-h3': false,
    'respect-rules': false,
    'use-hosts': false,
    'use-system-hosts': false,
    ipv6: true,
    'fake-ip-filter': [
      '*.lan',
      '*.local',
      '*.arpa',
      'time.*.com',
      'ntp.*.com',
      '+.market.xiaomi.com',
      'localhost.ptlogin2.qq.com',
      '*.msftncsi.com',
      'www.msftconnecttest.com'
    ],
    'default-nameserver': [
      'system',      // 优先使用系统 DNS
      '223.6.6.6',   // AliDNS
      '8.8.8.8',     // Google DNS
      '2400:3200::1',// AliDNS IPv6
      '2001:4860:4860::8888' // Google DNS IPv6
    ],
    nameserver: [
      '8.8.8.8', // 用于 Fake-IP 的上游 DNS
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query'
    ],
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
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query',
      'tls://223.5.5.5'
    ]
  };

  // --- 5. 合并配置 ---
  // 将上面定义的自定义配置覆盖到原始配置中。
  config['proxy-groups'] = customProxyGroups;
  config['rule-providers'] = customRuleProviders;
  config['rules'] = customRules;
  config['dns'] = customDns;

  // 返回修改后的完整配置对象
  return config;
}
