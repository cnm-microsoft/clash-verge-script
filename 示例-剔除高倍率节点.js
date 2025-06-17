// 代理组最大倍率
const multipliers = { "低倍率分组名称(自行修改)": 1.0, "中倍率分组名称(自行增删)": 2.5 };
// 剔除代理节点名称中不含倍率信息的节点
const multipliersOnly = false;
// 正则表达式
const regex = /(\d+(\.\d*)?) *?([xX✕✖⨉]|倍率?)/m;

function main(config) {
  const removed = []; // 过滤后不含任何节点将被移除的group
  config["proxy-groups"] = (config["proxy-groups"] ?? [])
    .map(group => {
      if (multipliers[group?.name]) {
        group["proxies"] = (group["proxies"] ?? []).filter(proxy => {
          const multiplier = regex.exec(proxy)?.[1];
          return multipliersOnly
            ? multiplier !== undefined && Number(multiplier) <= multipliers[group.name]
            : multiplier === undefined || Number(multiplier) <= multipliers[group.name];
        });
        if (group["proxies"]?.length > 0) {
          return group;
        }
        removed.push(group.name);
      } else {
        return group;
      }
    })
    .filter(Boolean);
  if (removed.length > 0) {
    // 移除代理组的引用
    config["proxy-groups"].forEach(group => {group["proxies"] = group["proxies"].filter(proxy => !removed.includes(proxy));});
    // 移除规则的引用
    config["rules"] = (config["rules"] ?? []).filter(rule => rule && removed.every(name => !rule.endsWith(name) && !rule.endsWith(`${name},no-resolve`)));
  }
  return config;
}