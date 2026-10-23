// クリックした所に火花を散らす(トップページのみ)。
// 描くのは画面に固定した canvas(spark.css)。火花が尽きたら描画のループを止めるので、
// 何もしていない間は1フレームも描かない(常に動くアニメは入れない、というサイトの方針)。

const canvas = document.querySelector('[data-spark]');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  const COLOR = '#0087a8';
  const SIZE = 9; // 火花の線の長さ(px)
  const RADIUS = 16; // 飛ぶ距離(px)
  const COUNT = 8; // 1回のクリックで出す本数
  const DURATION = 400; // 消えるまで(ms)

  let sparks = [];
  let running = false;

  // canvas の大きさは画面に合わせる。リサイズは連続で来るので、止まってから合わせる
  function resize() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });
  resize();

  // ease-out
  const ease = (t) => t * (2 - t);

  function draw(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks = sparks.filter((s) => {
      const elapsed = now - s.startTime;
      if (elapsed >= DURATION) return false;

      const eased = ease(elapsed / DURATION);
      const distance = eased * RADIUS;
      const length = SIZE * (1 - eased);
      const x1 = s.x + distance * Math.cos(s.angle);
      const y1 = s.y + distance * Math.sin(s.angle);
      const x2 = s.x + (distance + length) * Math.cos(s.angle);
      const y2 = s.y + (distance + length) * Math.sin(s.angle);

      ctx.strokeStyle = COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      return true;
    });

    // 火花が尽きたらループを止める(次のクリックで再開)
    if (sparks.length === 0) {
      running = false;
      return;
    }
    requestAnimationFrame(draw);
  }

  document.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();
    for (let i = 0; i < COUNT; i++) {
      sparks.push({ x, y, angle: (2 * Math.PI * i) / COUNT, startTime: now });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(draw);
    }
  });
}
