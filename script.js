/* ==========================================
 * DOM参照
 * ========================================*/
const countdownInput = document.getElementById('countdownInput');
const inputH         = document.getElementById('inputH');
const inputM         = document.getElementById('inputM');
const inputS         = document.getElementById('inputS');
const display        = document.getElementById('display');
const notification   = document.getElementById('notification');
const btnStart       = document.getElementById('btnStart');
const btnStop        = document.getElementById('btnStop');
const btnReset       = document.getElementById('btnReset');
const btnLap         = document.getElementById('btnLap');
const lapControls    = document.getElementById('lapControls');
const lapList        = document.getElementById('lapList');

/* ==========================================
 * 状態変数
 * ========================================*/
const state = {
  mode        : 'countdown', // 'countdown' | 'stopwatch'
  status      : 'idle',      // 'idle' | 'running' | 'paused' | 'finished'
  intervalId  : null,        // setInterval の返り値
  startTime   : null,        // Date.now() 基準点（ドリフト補正用, 一時停止のたびに巻き戻しの再計算）
  elapsedSec  : 0,           // ストップウォッチ用（経過時間）
  remainingSec: 0,           // カウントダウン用（残り時間）
  targetSec   : 0,           // カウントダウン設定値（リセット基準）
  laps        : [],          // ラップ時点の elapsedSec 一覧
};

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
  // マイナス値の混入防止
  // NOTE: カウントダウンでは計算のタイミングによって一瞬だけ負の値になることがあるため、
  //       0 未満は 0 に切り上げてから表示から表示する
  const sec = Math.max(0, Math.floor(totalSec));

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

/**
 * タイマーの状態を1秒分進めて表示へ反映する
 *
 * - countdownモード: 残り時間(remainingSec)を再計算し、0以下になったら
 *   タイマーを停止して通知を表示する
 * - stopwatchモード: 経過時間(elapsedSec)を再計算する
 *
 * NOTE: setInterval から1秒ごとに呼ばれる
 */
function tick() {
  if (state.mode === 'countdown') {
    // 残り時間 = カウントダウン設定値 - 経過時間（ドリフト補正: 開始時刻からの差分で計算）
    state.remainingSec = state.targetSec - Math.floor((Date.now() - state.startTime) / 1000);

    // カウントダウン完了時の処理
    if (state.remainingSec <= 0) {
      // タイマーのクリア
      clearInterval(state.intervalId);
      // 状態の更新
      state.intervalId = null;
      state.remainingSec = 0;
      state.status = 'finished';
      onCountdownFinished();
      // UI更新
      updateDisplay();
      updateButtons();
      // tick() の処理を終了 
      return;
    }

  } else {
    // 残り時間 = 現在時間 - 経過時間（ドリフト補正: 開始時刻からの差分で計算）
    state.elapsedSec = Math.floor((Date.now() - state.startTime) / 1000);
  }
  // UI更新
  updateDisplay();
}

/* ==========================================
 * 画面・ボタン
 * ========================================*/

/**
 * 現在のモードに応じた時間を HH:MM:SS 形式で表示欄へ書き出す
 * 
 * - countdownモード: カウントダウン用（残り時間）を表示
 * - stopwatchモード: ストップウォッチ用（経過時間）を表示
 */
function updateDisplay() {
  // 現在のモードに応じた時間を取得して表示
  const sec = state.mode === 'countdown' ? state.remainingSec : state.elapsedSec;
  display.textContent = formatTime(sec);
}

/**
 * 現在の状態に応じて4つのボタンとカウントダウン入力欄の活性・非活性を切り替える
 * 
 * NOTE: タイムアップ後は再スタート不可にする
 */
function updateButtons() {
  // 各状態を定義する
  const running  = state.status === 'running';
  const idle     = state.status === 'idle';
  const finished = state.status === 'finished';
  const noTarget = state.mode === 'countdown' && state.targetSec === 0; // カウントダウン時の時間未設定
  const inputsDisabled = state.mode === 'countdown' && !idle; // 計測中

  // ボタンの活性・非活性を切り替える
  btnStart.disabled = running || finished || noTarget;
  btnStop.disabled  = !running;
  btnReset.disabled = idle;

  // 計測中のみラップボタンを活性にする
  if (state.mode === 'stopwatch') {
    btnLap.disabled = !running;
  }

  // 計測中は入力欄を編集不可にする
  [inputH, inputM, inputS].forEach(input => {
    input.disabled = inputsDisabled;
  });
}

/* ==========================================
 * タイマー操作(開始・停止・リセット)
 * ========================================*/

/**
 * タイマーを開始・再開する
 */
function startTimer() {
  // カウントダウンで時間未指定なら何もしない
  if (state.mode === 'countdown' && state.targetSec === 0) return;

  // モードに応じた開始時間の記録（再開時の開始日時の再計算にも対応）
  if (state.mode === 'countdown') {
    // 開始時間 = 現在時間 - (カウントダウン設定値 - カウントダウン用残り時間)
    state.startTime = Date.now() - (state.targetSec - state.remainingSec) * 1000;
  } else {
    // 開始時間 = 現在時間 - ストップウォッチ用（経過時間）
    state.startTime = Date.now() - state.elapsedSec * 1000;
  }

  // タイマーを開始・再開する
  state.intervalId = setInterval(tick, 500);
  // 状態更新
  state.status = 'running';
  // UI更新
  display.classList.remove('finished');
  notification.classList.add('hidden');
  updateButtons();
}

/**
 * タイマーを一時停止する（経過秒数は保持したままタイマーだけを止める）
 */
function stopTimer() {
  // タイマーのクリア
  clearInterval(state.intervalId);
  // 状態の更新
  state.intervalId = null;
  state.status = 'paused';
  // UI更新
  updateButtons();
}

/**
 * タイマーを止めて初期状態(idle)へ戻す 
 */
function resetTimer() {
  // タイマーのクリア
  clearInterval(state.intervalId);
  // 状態の一括リセット
  state.intervalId = null;
  state.startTime = null;
  state.elapsedSec = 0;
  state.remainingSec = state.targetSec;
  state.status = 'idle';
  state.laps = [];
  // UI更新
  display.classList.remove('finished');
  notification.classList.add('hidden');
  updateDisplay();
  updateButtons();
  updateLapList();
}

/* ==========================================
 * タブ切り替え(モード)
 * ========================================*/

/**
 * タイマーの動作モードを切り替える
 *
 * NOTE: モード切り替え時は必ずタイマーを停止・状態初期化してUI描写を更新する
 * @param {string} mode - 切り替え先のモード識別子
 */
function switchMode(mode) {
  // 現在と同じモードの場合はなにもしない
  if (state.mode === mode) return;

  // 状態の更新
  state.mode = mode;

  // タイマーのクリア
  clearInterval(state.intervalId);

  // 状態の一括リセット 
  state.intervalId = null;
  state.startTime = null;
  state.elapsedSec = 0;
  state.remainingSec = 0;
  state.targetSec = 0;
  state.status = 'idle';
  state.laps = [];

  // 通知タグUIの更新　
  display.classList.remove('finished');
  notification.classList.add('hidden');

  // 現在選択されているタブだけに active を付与する
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });

  // カウントダウン選択時の初期値設定とUI描写をする
  // NOTE: ストップウォッチ選択時はカウントダウン設定欄は非表示にする
  if (state.mode === 'countdown') {
    countdownInput.classList.remove('hidden');
    lapControls.classList.add('hidden');
    lapList.classList.add('hidden');
    inputH.value = 0;
    inputM.value = 0;
    inputS.value = 0;
  } else {
    countdownInput.classList.add('hidden');
    lapControls.classList.remove('hidden');
    lapList.classList.add('hidden');
  }

  // 画面・ボタンUIの更新
  updateDisplay();
  updateButtons();
}

/* ==========================================
 * カウントダウン入力
 * ========================================*/

/**
 * カウントダウン入力欄の変更イベントハンドラ
 * 
 * NOTE: カウントダウン入力欄の値を範囲補正して状態とUIを更新する
 */
function onInputChange() {
  // 計測中・一時停止中は何もできないようにする
  if (state.status !== 'idle') return;

  /**
   * カウントダウン入力欄の値を範囲補正する
   *
   * @param {HTMLInputElement} input - 補正対象のHTML入力要素
   * @param {number} min - 許容する最小値
   * @param {number} max - 許容する最大値
   * @returns {number} 補正後の数値
   */
  const clamp = (input, min, max) => {
    let v = parseInt(input.value, 10);
    // 空文字 or 最小値未満は最小値に補正
    if (isNaN(v) || v < min) v = min;
    // 最大値より大きければ最大値に補正
    if (v > max) v = max;
    // 補正した値をHTML属性に再設定する
    input.value = v;
    // 補正後の数値を返す
    return v;
  };

  // カウントダウンの入力値を取得
  const h = clamp(inputH, 0, 99);
  const m = clamp(inputM, 0, 59);
  const s = clamp(inputS, 0, 59);

  // カウントダウン設定値の状態を更新
  state.targetSec = h * 3600 + m * 60 + s;
  // カウントダウン残り時間の状態を更新
  state.remainingSec = state.targetSec;

  // 画面・ボタンUIの更新
  updateDisplay();
  updateButtons();
}

/* ==========================================
 * タイムアップ通知
 * ========================================*/

/**
 * タイムアップ通知音
 * 
 * NOTE:　Web Audio API による非同期の通知音
 */
async function playBeep() {
  try {
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume(); // 自動再生ポリシーで suspended の場合、再開を待つ
    }
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (_) {
    // AudioContext が使えない環境・resume 失敗時は無視する
  }
}

/**
 * タイムアップ通知処理
 * 
 * NOTE: 通知音、通知アニメーション、通知非表示解除
 */
function onCountdownFinished() {
  display.classList.add('finished'); // CSS でアニメーションを当てる
  notification.classList.remove('hidden');
  playBeep(); // async 関数だが await せずに呼び出す（fire-and-forget）
}

/* ==========================================
 * ラップ
 * ========================================*/
/**
 * ラップリストのHTMLを作成する
 * 
 * NOTE:　ラップが存在しない時はラップリストを非表示にして何もしない
 */
function updateLapList() {
  // ラップが存在しない時はラップリストを非表示にして何もしない
  if (state.laps.length === 0) {
    lapList.classList.add('hidden');
    return;
  }

  // ラップが存在する時はラップリストを表示する
  lapList.classList.remove('hidden');
  // 以前に表示していた古いリストを削除する
  lapList.innerHTML = '';

  // ラップリストのHTMLを作成する
  state.laps.forEach(sec => {
    // 要素を生成する
    const li = document.createElement('li');
    const span = document.createElement('span');
    // ラップタイムを<span>タグにセットする
    span.textContent = formatTime(sec); // XSS対策（textContentを使用）
    // ol#lapList にラップリストを追加する
    li.appendChild(span);
    lapList.appendChild(li);
  });
}

/**
 * ラップタイムを記録する
 */
function addLap() {
  // 現在の経過時間を配列に保存
  state.laps.push(state.elapsedSec);
  // ラップリストのHTMLを作成する
  updateLapList();
}

/* ==========================================
 * イベントリスナー
 * ========================================*/
// --- タブ ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchMode(tab.dataset.mode));
});

// --- 開始・停止・リセットのボタン ---
btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnReset.addEventListener('click', resetTimer);

// --- カウントダウンの入力欄 ---
[inputH, inputM, inputS].forEach(input => {
  input.addEventListener('input', onInputChange);
  input.addEventListener('change', onInputChange);
});

// --- ラップ ---
btnLap.addEventListener('click', addLap);

/* ==========================================
 * 初期描画
 * ========================================*/
updateDisplay();
updateButtons();
