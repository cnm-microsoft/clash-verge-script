/**
 * Clash Verge 扩展脚本
 *
 * @description 根据提供的自定义规则，转换为 Clash Verge 支持的扩展脚本格式。
 * @author cnm-microsoft
 * @version 2025-06-16
 */
function main(config) {
  // 代理组配置
  const customProxyGroups = [
    {
      name: '✈️ ‍起飞',
      type: 'select',
      proxies: ['⚡ ‍低延迟', '🔧 ‍自建','🕹️ EDT', '📜 天书'],
    },
    {
      name: '⚡ ‍低延迟',
      type: 'url-test',
      url: 'https://i.ytimg.com/generate_204',
      interval: 300,
      tolerance: 100,
      timeout: 2000,
      'include-all': true,
      'exclude-filter': '天书' // <--- 使用这个！更简单、更明确、更可靠
    },
    {
      name: '📜 天书',
      type: 'url-test',
      url: 'https://i.ytimg.com/generate_204',
      interval: 300,
      tolerance: 100,
      timeout: 2000,
      filter: '天书',
      'include-all': true,
      proxies: []
    },
    {
      name: '🕹️ EDT',
      type: 'url-test',
      url: 'https://i.ytimg.com/generate_204',
      interval: 300,
      tolerance: 100,
      timeout: 2000,
      filter: 'EDT',
      'include-all': true,
      proxies: []
    },
    {
      name: '🔧 ‍自建',
      type: 'select',
      filter: '自建', // 筛选包含 '自建' 字符的节点
      'include-all': true,
      proxies: [] // 显式定义空数组以保持结构
    },
    {
      name: '🛩️ ‍墙内',
      type: 'select',
      proxies: ['DIRECT', 'REJECT'],
    },
    {
      name: '💩 ‍广告',
      type: 'select',
      proxies: ['REJECT', '🛩️ ‍墙内', '✈️ ‍起飞'],
    },
    {
      name: '🤖 ‍AI',
      type: 'select',
      filter: 'x',
      'include-all': true,
      proxies: [],
    },
    {
      name: '🌐 ‍未知站点',
      type: 'select',
      proxies: ['✈️ ‍起飞', '🛩️ ‍墙内', '💩 ‍广告'],
    },
  ];

  // 规则集提供者配置
  const customRuleProviders = {
    //封锁
    ProxyGFWlist: {
      type: 'http',
      behavior: 'domain',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
      path: './ruleset/ProxyGFWlist.yaml',
      interval: 86400,
    },
    //直连域名和ip
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
    //局域网
    LoyalLanCIDR: {
      type: 'http',
      behavior: 'ipcidr',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
      path: './ruleset/loyalsoldier-lancidr.yaml',
      interval: 86400,
    },
    //广告
    reject: {
      type: 'http',
      behavior: 'domain',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
      path: './ruleset/reject.yaml',
      interval: 86400,
    },
    AI: {
      type: 'http',
      behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Ruleset/AI.yaml',
      path: './ruleset/AI.yaml',
      interval: 86400,
    },
    //需要直连的常见软件列表
    applications: {
      type: 'http',
      behavior: 'classical',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt',
      path: './ruleset/applications.yaml',
      interval: 86400,
    },
  };

  const customRules = [
    //自建服务
    'DOMAIN-SUFFIX,040726.xyz,DIRECT',
    'DOMAIN-SUFFIX,nzh-nas.top,DIRECT',
    'DOMAIN-SUFFIX,nzh-nas.me,DIRECT',
    //广告
    'RULE-SET,reject,💩 ‍广告,no-resolve',
    //直连服务
    'RULE-SET,LoyalDirect,DIRECT,no-resolve',
    'RULE-SET,LoyalLanCIDR,DIRECT,no-resolve',
    'RULE-SET,LoyalCnCIDR,DIRECT,no-resolve',
    'GEOIP,CN,DIRECT,no-resolve',
    'RULE-SET,applications,DIRECT,no-resolve',

    // 代理规则
    'RULE-SET,AI,🤖 ‍AI,no-resolve',
    'RULE-SET,ProxyGFWlist,✈️ ‍起飞,no-resolve',
    // 最终匹配规则
    'MATCH,🌐 ‍未知站点,no-resolve'
  ];

  // 覆盖原始配置
  config['proxy-groups'] = customProxyGroups;
  config['rule-providers'] = customRuleProviders;
  config['rules'] = customRules;

  // 返回修改后的配置
  return config;
}
