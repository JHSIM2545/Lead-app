// 푸시 메시지를 받았을 때 발생하는 이벤트
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.', event);

  let data = { title: '기본 제목', body: '기본 내용', icon: '/icon.png' };

  // 서버에서 보낸 데이터가 있다면 파싱
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.png', // 알림에 표시될 아이콘 경로
    badge: '/badge.png',          // 모바일 상단 바에 표시될 작은 아이콘 (선택사항)
  };

  // 사용자에게 푸시 알림 띄우기
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 사용자가 알림을 클릭했을 때의 이벤트
self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.', event);

  event.notification.close();

  // 알림을 클릭했을 때 열고 싶은 웹페이지 주소 (예: 메인 페이지)
  event.waitUntil(
    clients.openWindow('/')
  );
});
