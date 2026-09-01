/* ============================================================
   纯净生存服务器 · 宣传站脚本
   ------------------------------------------------------------
   ★ 想修改服务器信息（地址/版本/群号）？
   只需修改下方 SERVER 对象，页面上的对应文字会自动同步。
   ============================================================ */

var SERVER = {
  address: 'play.simpfun.cn:19573', // 服务器地址（含端口）
  version: 'Java 版 1.20.1',        // 游戏版本
  group: '1107711066'               // QQ 群号
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

    var label = btn.getAttribute('data-label') || btn.textContent;
    var copied = btn.getAttribute('data-copied') || '已复制 ✓';
    btn.classList.add('is-copied');
    btn.textContent = copied;
    setTimeout(function () {
      btn.classList.remove('is-copied');
      btn.textContent = label;
    }, 1600);
  });

  /* ---------- 3. 服务器在线状态（mcsrvstat.us 免费 API） ---------- */
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
      statusText.textContent = '暂未开服';
      if (statusText2) statusText2.textContent = '🔴 离线';
      if (maxEl) maxEl.textContent = '-';
    } else {
      badge.setAttribute('data-state', 'unknown');
      statusText.textContent = '状态未知';
      if (statusText2) statusText2.textContent = '⚪ 无法检测';
      if (maxEl) maxEl.textContent = '-';
    }
  }

  function fetchStatus() {
    var url = 'https://api.mcsrvstat.us/3/' + encodeURIComponent(SERVER.address);
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);

    fetch(url, ctrl ? { signal: ctrl.signal } : {})
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        renderStatus(data && data.online ? 'online' : 'offline', data);
      })
      .catch(function () {
        clearTimeout(timer);
        renderStatus('unknown');
      });
  }

  fetchStatus();

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
