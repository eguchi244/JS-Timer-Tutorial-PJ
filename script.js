/* ==========================================
 * DOM参照
 * ========================================*/
const display  = document.getElementById('display');
const btnStart = document.getElementById('btnStart');
const btnStop  = document.getElementById('btnStop');
const btnReset = document.getElementById('btnReset');

/* ==========================================
 * 状態変数
 * ========================================*/
let status     = 'idle'; // 'idle' | 'running' | 'paused'
let intervalId = null;
let elapsedSec = 0;

/* ==========================================
 * ユーティリティ
 * ========================================*/

/**
 * 秒数を HH:MM:SS 文字列に変換する
 *
 * @param {number} totalSec - 変換する秒数（0以上の整数を想定。負値・小数は丸めていない）
 * @returns {string} `00:00:00` 形式の文字列（各桁は2桁に0埋め）
 */
function formatTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

/**
 * 経過秒数を1つ進めて表示へ反映する
 * 
 * NOTE: setInterval から1秒ごとに呼ばれる  
 */
function tick() {
  elapsedSec++;
  updateDisplay();
}

/* ==========================================
 * 表示・ボタン更新
 * ========================================*/

/**
 * 現在の経過秒数を HH:MM:SS 形式で表示欄へ書き出す
 */
function updateDisplay() {
  display.textContent = formatTime(elapsedSec);
}

/**
 * 現在の status に応じて3つのボタンの活性・非活性を切り替える
 */
function updateButtons() {
  btnStart.disabled = (status === 'running');
  btnStop.disabled = (status !== 'running');
  btnReset.disabled = (status === 'idle');
}

/* ==========================================
 * タイマー操作(開始・停止・リセット)
 * ========================================*/

/**
 * 計測を開始・再開する
 */
function startTimer() {
  intervalId = setInterval(tick, 1000);
  status = 'running';
  updateButtons();
}

/**
 * 計測を一時停止する（経過秒数は保持したまま計測だけを止める）
 */
function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
  status = 'paused';
  updateButtons();
}

/**
 * 計測を止めて初期状態(idle)へ戻す 
 */
function resetTimer() {
  clearInterval(intervalId);
  intervalId = null;
  status = 'idle';
  elapsedSec = 0;
  updateButtons();
  updateDisplay();
}

/* ==========================================
 * イベントリスナー
 * ========================================*/
btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnReset.addEventListener('click', resetTimer);

/* ==========================================
 * 初期描画
 * ========================================*/
updateDisplay();
updateButtons();
