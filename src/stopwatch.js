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
let runner2results = {};
let runner2lapTimes = {};

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
  time.textContent = "00:00:00.000";
  elapsedTimeAtLastStopped = 0;
  results = Array();

  // delete table
  while (table.rows.length > 1) table.deleteRow(table.rows.length - 1);
});

function lapping(runnerName) {
  const elapsedTimeFromStart = startAt
    ? Date.now() - startAt + elapsedTimeAtLastStopped
    : 0;
  // var result = new Array();
  // result.push(runnerName);
  // result.push(dateToString(lapTime));
  // results.push(result);
  if (!(runnerName in runner2results)) {
    runner2results[runnerName] = [
      {
        runnerName: runnerName,
        elapsed: elapsedTimeFromStart,
        lap: 1,
        lapTime: 0,
        avgLapTime: undefined,
      },
    ];
    runner2lapTimes[runnerName] = [];
    console.log(runner2results[runnerName]);
  } else {
    const pre =
      runner2results[runnerName][runner2results[runnerName].length - 1];
    result = {
      runnerName: runnerName,
      elapsed: elapsedTimeFromStart,
      lap: pre["lap"] + 1,
      lapTime: elapsedTimeFromStart - pre["elapsed"],
    };
    runner2lapTimes[runnerName].push(elapsedTimeFromStart - pre["elapsed"]);
    const lapTimes = runner2lapTimes[runnerName];
    result["avgLapTime"] =
      lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length || 0;
    runner2results[runnerName].push(result);
  }
  const row = document.createElement("tr");
  const cur = runner2results[runnerName][runner2results[runnerName].length - 1];
  row.innerHTML = `
    <td>${runnerName}</td>
    <td>${cur["lap"].toString()}</td>
    <td>${dateToString(cur["elapsed"])}</td>
    <td>${dateToString(cur["lapTime"])}</td>`;
  table.appendChild(row);
}

lapButton.addEventListener("click", function () {
  lapping("anonymous");
});

downloadButton.addEventListener("click", function () {
  // TODO: implement
  outputStr = "name, time\n";
  for (var i = 0; i < results.length; i++) {
    for (var j = 0; j < results[i].length; j++) {
      outputStr += results[i][j];
      if (j == results[i].length - 1) {
        break;
      }
      outputStr += ", ";
    }
    outputStr += "\n";
  }
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
  textbox = document.getElementById("runner");
  if (textbox.value == "") return;
  var button = document.createElement("input");
  button.type = "button";
  button.value = textbox.value;
  button.onclick = function () {
    lapping(button.value);
  };
  runnersContainer.appendChild(button);
  textbox.value = "";
});
