/**
 * Clash Verge 扩展脚本
 * @author cnm-microsoft
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
    // 7. 特定直连规则
    geoip_cloudfront: {
  type: 'http',
  behavior: 'classical',
  url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cloudfront.mrs',
  path: './ruleset/geoip_cloudfront.yaml',
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
    'RULE-SET,geoip_cloudfront,DIRECT,no-resolve',

    // 4. 国内服务和应用程序直连
    'RULE-SET,applications,DIRECT,no-resolve',
    'RULE-SET,LoyalDirect,DIRECT,no-resolve',

    // 5. AI服务专用代理（优先级高于一般代理）
    'DOMAIN-SUFFIX,openai.com,🤖 ‍AI',
    'DOMAIN-SUFFIX,anthropic.com,🤖 ‍AI',
    'DOMAIN-SUFFIX,claude.ai,🤖 ‍AI',
    'DOMAIN-SUFFIX,gemini.google.com,🤖 ‍AI',
    'RULE-SET,AI,🤖 ‍AI,no-resolve',

    // 6. 特定代理服务
    'DOMAIN-SUFFIX,api.iturrit.com,✈️ ‍起飞',
    'DOMAIN-SUFFIX,www.lxc.wiki,✈️ ‍起飞',

    // 7. 通用代理规则
    'RULE-SET,Google,✈️ ‍起飞,no-resolve',
    'RULE-SET,Telegram,✈️ ‍起飞,no-resolve',
    'PROCESS-NAME-REGEX,.*telegram.*,✈️ ‍起飞',
    'RULE-SET,ProxyGFWlist,✈️ ‍起飞,no-resolve',

    // 8. 国内IP段直连（放在后面避免误判）
    'RULE-SET,LoyalCnCIDR,DIRECT,no-resolve',
    'GEOIP,CN,DIRECT,no-resolve',

    // 9. 最终匹配规则
    'MATCH,🌐 ‍未知站点,no-resolve'
  ];

  // --- 4. 自定义 DNS 配置 ---
  // 优化后的DNS配置：提升性能，减少兼容性问题，增强稳定性
  const customDns = {
    enable: true, // 启用 DNS 功能
    ipv6: true,
    listen: '0.0.0.0:1053', // 监听地址和端口
    'prefer-h3': false,     // 如果DNS服务器支持DoH3会优先使用h3，提升性能
    'respect-rules': false,  // 让 DNS 解析遵循 Clash 的路由规则（设为false避免循环依赖）

    'use-hosts': false,        // 使用hosts
    'use-system-hosts': false, // 使用系统hosts

    // 启用 Fake-IP 模式，这是强制劫持所有 DNS 请求的关键。
    'enhanced-mode': 'fake-ip',       // 设置增强模式为 fake-ip 模式，提高解析速度和连接性能
    'fake-ip-range': '198.18.0.1/16', // fake-ip 地址范围
    // Fake-IP 过滤器：确保国内域名不被 Fake-IP 转换。
    'fake-ip-filter': [
      '*.lan',
      '*.local',
      '*.arpa',
      'time.*.com',
      'ntp.*.com',
      '*.market.xiaomi.com',
      'localhost.ptlogin2.qq.com',
      '*.msftncsi.com',
      'www.msftconnecttest.com',
      '*.apple.com',
      '*.icloud.com',
      '*.mzstatic.com',
      '*.crashlytics.com',
      '*.googleapis.com'
    ],

    'default-nameserver': [
      '1.1.1.1',                    // Cloudflare Public DNS (UDP)
      '8.8.8.8'                     // Google Public DNS (UDP)
      // 为配合rules中的IP-CIDR注释掉，防止dns泄露（启用就泄露）
      // '223.5.5.5',                 // 阿里（国内）
      // '119.29.29.29',              // 腾讯（国内）
      // 'system' // 系统 DNS (保留以防万一)
    ],

    // \`nameserver-policy\` 精准分流与严格兜底。**
    // 确保国内域名走国内 DNS，境外域名走境外 DNS。这是解决问题的关键。
    // 这是 Clash 进行主要 DNS 查询时使用的服务器列表。
    nameserver: [ // 默认 DNS，供所有请求使用，支持 DoH3 的在前面
      'https://1.1.1.1/dns-query',     // Cloudflare（支持 H3）
      'https://dns.google/dns-query',  // Google（支持 H3）
      '1.1.1.1',                      // Cloudflare Public DNS (UDP)
      '8.8.8.8'                       // Google Public DNS (UDP)
      // 为配合rules中的IP-CIDR注释掉，防止dns泄露（启用就泄露）
      // 'https://dns.alidns.com/dns-query',  // 阿里（国内稳定）
      // 'https://doh.pub/dns-query'  // 腾讯 (境内，DoH，可作为备选)
    ],

    'nameserver-policy': {
      '+.cn': [ // 国内域名强制走国内 DNS
        'https://223.5.5.5/dns-query',  // 阿里
        'https://doh.pub/dns-query',    // 腾讯
        '223.5.5.5',                   // 阿里 UDP
        '119.29.29.29'                // 腾讯 UDP
      ],
      '+.google.com': [                 // Google 域名走国外 DNS
        'https://1.1.1.1/dns-query',
        'https://dns.google/dns-query',
        '1.1.1.1',
        '8.8.8.8'
      ],
      '+.openai.com': [                 // OpenAI 域名走国外 DNS
        'https://1.1.1.1/dns-query',
        'https://dns.google/dns-query',
        '1.1.1.1',
        '8.8.8.8'
      ]
    },

    // 当 nameserver 中的 DNS 服务器解析失败时，Clash 会尝试这里的 DNS。
    fallback: [
      '1.1.1.1', // Cloudflare DNS备用
      '8.8.8.8'  // Google DNS备用
    ],
    
    // fallback 过滤器配置
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

    // \`proxy-server-nameserver\`: 用于代理服务器自身的 DNS 解析，仅包含国外 DNS。
    'proxy-server-nameserver': [          // 当请求通过代理（即国外站）时使用
      'https://1.1.1.1/dns-query',      // Cloudflare，DoH3
      'https://dns.google/dns-query',   // Google，DoH3
      '1.1.1.1',
      '8.8.8.8'
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
    'log-level': 'warning',  // 日志级别设置为warning，减少日志输出
    'external-controller': '0.0.0.0:9090',
    // 性能优化设置
    'unified-delay': true,  // 更换延迟计算方式，去除握手等额外延迟
    'tcp-concurrent': true,  // 启用 TCP 并发连接，提高网络性能和连接速度
    // 进程和指纹设置
    'find-process-mode': 'strict',  // 设置进程查找模式为严格模式，更精确地识别和匹配网络流量来源的进程
    'global-client-fingerprint': 'chrome',  // 设置全局客户端指纹为 Chrome，增强隐私性和绕过某些网站的指纹检测
    // 连接保持设置
    'keep-alive-idle': 600,  // 设置保持连接的空闲时间（秒）
    'keep-alive-interval': 15,  // 设置保持连接的间隔时间（秒）
    'disable-keep-alive': false  // 启用保持连接功能
  });

  // 返回修改后的完整配置对象
  return config;
}
