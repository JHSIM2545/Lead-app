// 소개영업 서비스워커: 앱 설치(PWA) + 푸시 알림
var CACHE = 'referral-shell-v4';
var SHELL = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', function (e) { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); })); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});

// 화면 파일은 항상 최신(네트워크 우선), 오프라인이면 저장본으로 표시. 데이터(Supabase 등 외부 요청)는 건드리지 않음.
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).then(function (res) {
    var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
    return res;
  }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match('./index.html'); }); }));
});

self.addEventListener('push', function (event) {
  var d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  var title = d.title || '소개영업';
  var lid = (d.tag || '').replace(/^lead-(new-)?/, '');
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    var vis = list.filter(function (c) { return c.visibilityState === 'visible'; });
    if (vis.length) {   // 앱이 열려 있으면 상단 알림창으로 표시
      vis.forEach(function (c) { c.postMessage({ type: 'push-foreground', title: title, body: d.body || '', lead_id: lid }); });
      return;
    }
    return self.registration.showNotification(title, {
    body: d.body || '안건 진행상황이 갱신되었습니다.',
    tag: d.tag || 'referral-update',
    renotify: true,
    icon: d.icon || undefined,
    data: { url: d.url || self.registration.scope }
    });
  }));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(self.registration.scope) === 0 && 'focus' in list[i]) return list[i].focus();
    }
    return self.clients.openWindow(url);
  }));
});
