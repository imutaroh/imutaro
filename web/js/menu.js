// スマホのヘッダーのメニュー。開け閉めそのものは <details> がするので、JS が無くても開ける。
// ここでは <details> に無い閉じ方を足す: 中のリンクを押したとき(同じページの中へ移るときに開きっぱなしに
// ならないように)、外を押したとき、Esc キー。

document.querySelectorAll('[data-menu]').forEach((menu) => {
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) menu.open = false;
  });

  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
});
