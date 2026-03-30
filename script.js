// ========================================
// 설정값 - env.js에서 주입됩니다
// ========================================
const CONFIG = {
  KAKAO_APP_KEY: (typeof ENV !== 'undefined' && ENV.KAKAO_APP_KEY) || '',
  GOTCHA_URL: (typeof ENV !== 'undefined' && ENV.GOTCHA_URL) || '',

  PRANK_TITLE: '💸 친구가 나에게 1,000,000원을 보냈어요!',
  PRANK_DESC: '카카오페이 머니가 도착했습니다. 지금 바로 확인하세요.',
  PRANK_IMAGE: 'https://t1.kakaocdn.net/kakaopay/static/images/kakaopay_og.png',
};

// ========================================
// 카카오 SDK 초기화
// ========================================
function initKakao(appKey) {
  if (!window.Kakao) {
    alert('카카오 SDK 로드에 실패했습니다. 인터넷 연결을 확인해주세요.');
    return false;
  }
  if (!Kakao.isInitialized()) {
    Kakao.init(appKey);
  }
  return Kakao.isInitialized();
}

// ========================================
// 카카오톡 공유 (april-fool.html)
// ========================================
function sendKakaoShare() {
  const appKey = CONFIG.KAKAO_APP_KEY;

  if (!appKey) {
    alert('env.js에 KAKAO_APP_KEY가 설정되지 않았습니다.\nenv.example.js를 복사해 env.js를 만들고 키를 입력해주세요.');
    return;
  }

  const gotchaUrl = CONFIG.GOTCHA_URL;
  if (!gotchaUrl) {
    alert('env.js에 GOTCHA_URL이 설정되지 않았습니다.\n배포 후 lion.html의 전체 URL을 입력해주세요.');
    return;
  }

  if (!initKakao(appKey)) {
    alert('카카오 SDK 초기화에 실패했습니다. 앱 키를 다시 확인해주세요.');
    return;
  }

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: CONFIG.PRANK_TITLE,
      description: CONFIG.PRANK_DESC,
      imageUrl: CONFIG.PRANK_IMAGE,
      link: {
        webUrl: gotchaUrl,
        mobileWebUrl: gotchaUrl,
      },
    },
    buttons: [
      {
        title: '받기 💰',
        link: {
          webUrl: gotchaUrl,
          mobileWebUrl: gotchaUrl,
        },
      },
    ],
    installTalk: true,
  });
}

// ========================================
// lion.html 초기화
// ========================================
function initGotchaPage() {
  // URL 파라미터에서 발신자 이름 읽기 (?from=이름)
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');
  if (from) {
    const senderInfo = document.getElementById('senderInfo');
    const senderName = document.getElementById('senderName');
    if (senderInfo && senderName) {
      senderInfo.style.display = 'block';
      senderName.textContent = decodeURIComponent(from);
    }
  }

  // 2.5초 가짜 로딩 후 reveal
  setTimeout(() => {
    const loading = document.getElementById('fake-loading');
    const reveal = document.getElementById('reveal');
    if (loading) loading.classList.add('hidden');
    if (reveal) {
      reveal.classList.remove('hidden');
      startConfetti();
    }
  }, 2500);
}

// ========================================
// 콘페티 파티 효과 (Canvas API)
// ========================================
function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FEE500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 7 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: Math.random() * 3 + 1.5,
    drift: Math.random() * 2 - 1,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));

  let running = true;

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      }

      ctx.restore();

      p.y += p.speed;
      p.x += p.drift;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(draw);
  }

  draw();

  // 5초 후 콘페티 중단
  setTimeout(() => { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }, 5000);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ========================================
// 유틸리티
// ========================================
function goToShare() {
  window.location.href = 'april-fool.html';
}

// ========================================
// 페이지 라우팅
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('gotcha-page')) {
    initGotchaPage();
  }
});
