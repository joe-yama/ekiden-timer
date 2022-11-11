const time = document.getElementById("time");
const startButton = document.getElementById("start");
const lapButton = document.getElementById("lap");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");
const downloadButton = document.getElementById("download");
const addButton = document.getElementById("add");
const table = document.getElementById("table");
const runnersContainer = document.getElementById("runners_container");

let startAt;
let elapsedTimeAtLastStopped = 0;

let runner2id = {};
let laps = [];
let elapsedtimes = [];
let laptimes = [];
let trends = [];

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

function dateToString(unix_timestamp) {
  const d = new Date(unix_timestamp);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  const ms = String(d.getUTCMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}`;
}

function run_stopwatch() {
  const elapsedTime = Date.now() - startAt + elapsedTimeAtLastStopped;
  time.textContent = dateToString(elapsedTime);
  timeoutID = setTimeout(run_stopwatch, 10);
}

// スタートボタンがクリックされたら時間を進める
startButton.addEventListener("click", () => {
  startButton.disabled = true;
  lapButton.disabled = false;
  stopButton.disabled = false;
  resetButton.disabled = true;
  addButton.disabled = true;
  startAt = Date.now();
  run_stopwatch();
});

// ストップボタンがクリックされたら時間を止める
stopButton.addEventListener("click", function () {
  startButton.disabled = false;
  lapButton.disabled = true;
  stopButton.disabled = true;
  resetButton.disabled = false;
  addButton.disabled = false;
  clearTimeout(timeoutID);
  elapsedTimeAtLastStopped += Date.now() - startAt;
});

// リセットボタンがクリックされたら時間を0に戻す
resetButton.addEventListener("click", function () {
  startButton.disabled = false;
  lapButton.disabled = false;
  stopButton.disabled = true;
  resetButton.disabled = true;
  addButton.disabled = false;
  time.textContent = "00:00:00";
  elapsedTimeAtLastStopped = 0;

  runner2id = {};
  laps = [];
  elapsedtimes = [];
  laptimes = [];
  trends = [];

  // delete table
  while (table.rows.length > 1) table.deleteRow(table.rows.length - 1);
});

function lapping(runnerName) {
  const elapsedtime = startAt
    ? Date.now() - startAt + elapsedTimeAtLastStopped
    : 0;
  if (!(runnerName in runner2id)) {
    const runnerid = Object.keys(runner2id).length;
    runner2id[runnerName] = runnerid;
    laps[runnerid] = 0;
    elapsedtimes[runnerid] = [];
    laptimes[runnerid] = [];
    trends[runnerid] = [];
  }
  const runnerid = runner2id[runnerName];
  laps[runnerid] += 1;
  if (laps[runnerid] > 1) {
    const laptime = elapsedtime - elapsedtimes[runnerid].last();
    if (laps[runnerid] > 2) {
      const trend = Math.round((laptimes[runnerid].last() - laptime) / 1000);
      trends[runnerid].push(trend);
    }
    laptimes[runnerid].push(laptime);
  }
  elapsedtimes[runnerid].push(elapsedtime);

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${runnerName}</td>
    <td>${laps[runnerid].toString()}</td>
    <td>${dateToString(elapsedtimes[runnerid].last())}</td>
    <td>${
      laps[runnerid] > 1 ? dateToString(laptimes[runnerid].last()) : "-"
    }</td>
    <td>${laps[runnerid] > 2 ? trends[runnerid].last() : "-"}</td>`;
  table.appendChild(row);
}

lapButton.addEventListener("click", function () {
  lapping("anonymous");
});

downloadButton.addEventListener("click", function () {
  outputStr = "name, ";
  for (var i = 1; i <= Math.max(laps); i++) {
    outputStr += i.toString() + ", ";
  }
  outputStr += "\n";

  for (const [runnerName, runnerid] of Object.entries(runner2id)) {
    outputStr += runnerName + ", ";
    elapsedtimes[runnerid].forEach((elapsedtime) => {
      outputStr += dateToString(elapsedtime) + ", ";
    });
    outputStr += "\n";
  }

  // encode to sjis
  outputStrEncoded = Encoding.stringToCode(outputStr);
  outputStrSjis = Encoding.convert(outputStrEncoded, "sjis", "unicode");
  u8a = new Uint8Array(outputStrSjis);
  var blob = new Blob([u8a], { type: "text/csv" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "results.csv";
  link.click();
});

addButton.addEventListener("click", function () {
  const textbox = document.getElementById("runner");
  if (textbox.value == "") return;
  const button = document.createElement("input");
  button.type = "button";
  button.value = textbox.value;
  button.onclick = function () {
    lapping(button.value);
  };
  runnersContainer.appendChild(button);
  textbox.value = "";
});
