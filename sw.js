// [파일 다운로드용: sw.js]
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.', event);

  let data = { title: '북서울 소개영업', body: '새로운 알림이 도착했습니다.', icon: '/icon.png' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: '/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.', event);
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
