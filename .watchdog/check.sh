#!/usr/bin/env bash
# 简幻欢 MC 服务器「掉线哨兵」
# 运行在 GitHub Actions（云端），检测 play.simpfun.cn:19573 是否在线，
# 状态从在线变为掉线时通过 Server酱推送微信提醒。
# 首次运行只记录状态、不发提醒，避免误报。
set -euo pipefail

SERVER="play.simpfun.cn:19573"
STATE_FILE=".watchdog/state.json"
KEY="${SERVERCHAN_KEY:-}"
# ★ 腾讯云 SCF 国内探针（服务器关了状态协议，海外接口不可靠，用它做权威判断）
PROBE_URL="https://1480104501-2q81sbsai9.ap-guangzhou.tencentscf.com"

echo "== $(date '+%Y-%m-%d %H:%M:%S') 检查 ${SERVER} =="

# 多源检测：云函数探针(权威) + 海外双接口兜底；任一确认在线即视为在线
s0=$(curl -sS --max-time 12 "$PROBE_URL" 2>/dev/null || true)
s1=$(curl -sS --max-time 12 "https://api.mcstatus.io/v2/status/java/${SERVER}" 2>/dev/null || true)
s2=$(curl -sS --max-time 12 "https://api.mcsrvstat.us/3/${SERVER}" 2>/dev/null || true)

online="false"
responded="false"

if [ -n "$s0" ] && echo "$s0" | jq -e 'type == "object"' >/dev/null 2>&1; then
  responded="true"
  if echo "$s0" | jq -e '.online == true' >/dev/null 2>&1; then online="true"; fi
fi
if [ "$online" = "false" ] && [ -n "$s1" ] && echo "$s1" | jq -e 'type == "object"' >/dev/null 2>&1; then
  responded="true"
  if echo "$s1" | jq -e '.online == true' >/dev/null 2>&1; then online="true"; fi
fi
if [ "$online" = "false" ] && [ -n "$s2" ] && echo "$s2" | jq -e 'type == "object"' >/dev/null 2>&1; then
  responded="true"
  if echo "$s2" | jq -e '.online == true' >/dev/null 2>&1; then online="true"; fi
fi

if [ "$responded" = "false" ]; then
  echo "两个检测接口都不可用，跳过本次（避免误报）"
  exit 0
fi

if [ "$online" = "true" ]; then NEW="online"; else NEW="offline"; fi

PREV=""
if [ -f "$STATE_FILE" ]; then
  PREV=$(jq -r '.state // empty' "$STATE_FILE" 2>/dev/null || true)
fi

echo "状态: ${PREV:-<首次>} -> ${NEW}"

if [ "$NEW" = "$PREV" ]; then
  echo "状态未变化，结束"
  exit 0
fi

printf '{"state":"%s","time":"%s"}\n' "$NEW" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STATE_FILE"

if [ -n "$KEY" ]; then
  now=$(TZ=Asia/Shanghai date '+%m-%d %H:%M')
  if [ "$NEW" = "offline" ] && [ "$PREV" = "online" ]; then
    echo ">>> 发送掉线提醒"
    resp=$(curl -sS --max-time 15 -X POST "https://sctapi.ftqq.com/${KEY}.send" \
      --data-urlencode "title=🔴 纯净生存服务器 掉线提醒" \
      --data-urlencode "desp=**服务器 ${SERVER} 检测到未开服**（${now}）

- 当前状态：未开服 / 无法连接

请前往 **简幻欢（SimpFun）控制面板**：
如已完成今日签到，直接点击「启动」；若提示需先签到，请先完成微信小程序签到再启动。

状态详情：https://upkea.github.io/mc-server-site/") || resp="推送请求失败"
    echo "Server酱响应: ${resp:0:200}"
  elif [ "$NEW" = "online" ] && [ "$PREV" = "offline" ]; then
    echo ">>> 发送恢复提醒"
    resp=$(curl -sS --max-time 15 -X POST "https://sctapi.ftqq.com/${KEY}.send" \
      --data-urlencode "title=🟢 纯净生存服务器 已恢复" \
      --data-urlencode "desp=**服务器 ${SERVER} 已恢复在线**（${now}）

玩家现在可以正常进服啦！

状态详情：https://upkea.github.io/mc-server-site/") || resp="推送请求失败"
    echo "Server酱响应: ${resp:0:200}"
  fi
fi

# 记录最新状态（仅状态变化时产生一次提交），供下次对比
git -c user.name="server-watchdog" -c user.email="actions@users.noreply.github.com" add "$STATE_FILE"
git -c user.name="server-watchdog" -c user.email="actions@users.noreply.github.com" commit -m "watchdog: state -> ${NEW}" >/dev/null 2>&1 || true
git push >/dev/null 2>&1 || true
echo "完成"
