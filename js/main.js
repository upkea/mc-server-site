/* ============================================================
   纯净生存服务器 · 宣传站脚本
   ------------------------------------------------------------
   ★ 想修改服务器信息（地址/版本/群号）？
   只需修改下方 SERVER 对象，页面上的对应文字会自动同步。
   ============================================================ */

var SERVER = {
  address: 'play.simpfun.cn:19573', // 服务器地址（含端口）
  version: 'Java 版 1.20 – 1.21.8',  // 游戏版本（服务器实测支持范围）
  group: '1107711066'               // QQ 群号
};

var GROUP = {
  uin: SERVER.group,
  // 手机端一键加群跳转（无需 key，打开群卡片后点「申请加入」）
  mobileUrl: 'mqqapi://card/show_pslcard?src_type=internal&version=1&uin=' + SERVER.group,
  // 官方加群链接（群管理 → 加群设置 → 加群链接 生成，qm.qq.com 或 qun.qq.com 均可）
  // 填了之后所有设备都会直接跳转官方加群页；链接失效时重新生成替换即可
  officialUrl: 'https://qun.qq.com/universal-share/share?ac=1&authKey=yl%2BgEDRbTe%2FP06c%2FSRcxj%2BootHd3ba2ce%2BgNr7cZTyzfCy%2FfOma1l2J8c2TLLiPh&busi_data=eyJncm91cENvZGUiOiIxMTA3NzExMDY2IiwidG9rZW4iOiI3STd3aEZpdjRlSUpxVkswUzhNUkVUdnNxcklucno3SVN2dEpkSENpdmxUM0pKZmV6V3NWZjlHSHBZWmwvOTIzIiwidWluIjoiMTk1NDQ5NTM5MiJ9&data=A3tvyKbE9Tn2HPwtYas1UdySpJ_4fcueKZMwAnxHsi9JNzzqNQu4xy9VF4_PyJkWHcsDvcYhNmnL6wbZNuim6Q&svctype=4&tempid=h5_group_info'
};

(function () {
  'use strict';

  /* ---------- 1. 用 SERVER 配置同步页面文字 ---------- */
  var FILL = { address: SERVER.address, version: SERVER.version, group: SERVER.group };

  document.querySelectorAll('[data-fill]').forEach(function (el) {
    var key = el.getAttribute('data-fill');
    if (FILL[key]) el.textContent = FILL[key];
  });

  // 复制按钮的复制值也来自 SERVER（页面只需写 data-copy-key）
  document.querySelectorAll('[data-copy-key]').forEach(function (el) {
    var key = el.getAttribute('data-copy-key');
    if (FILL[key]) el.setAttribute('data-copy', FILL[key]);
  });

  /* ---------- 2. 复制到剪贴板（带反馈） ---------- */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function flash(btn, copied) {
    var label = btn.getAttribute('data-label') || btn.textContent;
    btn.classList.add('is-copied');
    btn.textContent = copied;
    setTimeout(function () {
      btn.classList.remove('is-copied');
      btn.textContent = label;
    }, 1600);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    if (!text) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
    flash(btn, btn.getAttribute('data-copied') || '已复制 ✓');
  });

  /* ---------- 2.5 一键加群 ---------- */
  document.querySelectorAll('[data-join-group-key]').forEach(function (el) {
    el.setAttribute('data-join-group', SERVER.group);
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-join-group]');
    if (!btn) return;

    var ua = navigator.userAgent || '';
    var isMobile = /Android|iPhone|iPad|iPod|Windows Phone|MQQBrowser|MicroMessenger/i.test(ua);

    if (GROUP.officialUrl) {
      // 官方加群链接：手机端当前页跳转（更稳），电脑端新标签打开
      if (isMobile) { window.location.href = GROUP.officialUrl; }
      else { window.open(GROUP.officialUrl, '_blank', 'noopener'); }
      return;
    }

    if (isMobile) {
      // 手机端：跳转 QQ 群卡片（打开后点「申请加入」）
      window.location.href = GROUP.mobileUrl;
      return;
    }

    // 电脑端：复制群号，提示到 QQ 搜索加群
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(GROUP.uin).catch(function () { fallbackCopy(GROUP.uin); });
    } else {
      fallbackCopy(GROUP.uin);
    }
    flash(btn, '群号已复制 ✓');
  });

  /* ---------- 3. 服务器在线状态（双接口比赛制 + 60s 缓存，秒级出结果） ---------- */
  function renderStatus(state, extra) {
    var badge = document.getElementById('statusBadge');
    var statusText = document.getElementById('statusText');
    var statusText2 = document.getElementById('statusText2');
    var maxEl = document.getElementById('maxText2');
    if (!badge) return;

    if (state === 'online') {
      var online = (extra && extra.players && extra.players.online) || 0;
      var max = (extra && extra.players && extra.players.max) || '-';
      badge.setAttribute('data-state', 'online');
      statusText.textContent = '在线 · ' + online + ' 人游玩';
      if (statusText2) statusText2.textContent = '🟢 在线';
      if (maxEl) maxEl.textContent = String(max);
    } else if (state === 'offline') {
      badge.setAttribute('data-state', 'offline');
      statusText.textContent = '未检测到开服';
      if (statusText2) statusText2.textContent = '❓ 未检测到';
      if (maxEl) maxEl.textContent = '-';
    } else {
      badge.setAttribute('data-state', 'unknown');
      statusText.textContent = '检测服务暂不可用';
      if (statusText2) statusText2.textContent = '⚪ 检测失败';
      if (maxEl) maxEl.textContent = '-';
    }
  }

  function fetchJson(url, timeoutMs) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs || 5000);
    return fetch(url, ctrl ? { signal: ctrl.signal } : {})
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .catch(function (err) {
        clearTimeout(timer);
        throw err;
      });
  }

  /* 结果写本地缓存（60 秒），方便重复访问时瞬间显示 */
  var statusCacheKey = 'mc_status_' + SERVER.address;
  function renderAndCache(state, extra) {
    try {
      localStorage.setItem(statusCacheKey, JSON.stringify({
        t: Date.now(),
        state: state,
        players: extra && extra.players ? { online: extra.players.online, max: extra.players.max } : null
      }));
    } catch (e) { /* 隐私模式等场景忽略 */ }
    renderStatus(state, extra && extra.players
      ? { players: { online: extra.players.online, max: extra.players.max } }
      : null);
  }

  function fetchStatus() {
    // 比赛制双接口：mcstatus.io（响应快）排前，mcsrvstat.us 交叉验证兜底。
    // 任一接口确认在线就立刻显示，不等待慢的那个；两个都离线才显示离线。
    var urls = [
      'https://api.mcstatus.io/v2/status/java/' + encodeURIComponent(SERVER.address),
      'https://api.mcsrvstat.us/3/' + encodeURIComponent(SERVER.address)
    ];
    var finished = false;
    var settled = 0;
    var responded = 0;

    function settle() {
      settled++;
      if (settled === urls.length && !finished) {
        // 两个请求都有结论：收到过正常响应且都离线 → 离线；全部网络失败 → 未知
        renderAndCache(responded > 0 ? 'offline' : 'unknown', null);
        finished = true;
      }
    }

    urls.forEach(function (u) {
      fetchJson(u, 5000).then(function (data) {
        if (finished) return;
        if (data && data.online) {
          finished = true;
          renderAndCache('online', data);
          return;
        }
        responded++;
        settle();
      }).catch(function () {
        settle();
      });
    });
  }

  // 说明：本服务器未开启状态协议，自动状态检测已停用；
  // 页面状态以「能否进入」为准（见 index.html 文案）。

  /* ---------- 4. 顶部导航：滚动阴影 + 移动端菜单 ---------- */
  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  function onScroll() {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.textContent = open ? '✕' : '☰';
    });
    mainNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      }
    });
  }

  /* ---------- 5. 滚动显现动画 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 6. 页脚年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
