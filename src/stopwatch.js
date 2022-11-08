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
var results = Array();

function dateToString(unix_timestamp) {
  const d = new Date(unix_timestamp);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  const ms = String(d.getUTCMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
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
  startAt = Date.now();
  run_stopwatch();
});

// ストップボタンがクリックされたら時間を止める
stopButton.addEventListener("click", function () {
  startButton.disabled = false;
  lapButton.disabled = true;
  stopButton.disabled = true;
  resetButton.disabled = false;
  clearTimeout(timeoutID);
  elapsedTimeAtLastStopped += Date.now() - startAt;
});

// リセットボタンがクリックされたら時間を0に戻す
resetButton.addEventListener("click", function () {
  startButton.disabled = false;
  lapButton.disabled = false;
  stopButton.disabled = true;
  resetButton.disabled = true;
  time.textContent = "00:00:00.000";
  elapsedTimeAtLastStopped = 0;
  results = Array();

  // delete table
  while (table.rows.length > 1) table.deleteRow(table.rows.length - 1);
});

function lapping(runnerName) {
  const lapTime = startAt ? Date.now() - startAt + elapsedTimeAtLastStopped : 0;
  var result = new Array();
  result.push(runnerName);
  result.push(dateToString(lapTime));
  results.push(result);
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${runnerName}</td>
    <td>${dateToString(lapTime)}</td>`;
  table.appendChild(row);
  console.log(results.toString());
}

lapButton.addEventListener("click", function () {
  lapping("anonymous");
});

downloadButton.addEventListener("click", function () {
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
  var blob = new Blob([outputStr], { type: "text/csv" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "results.csv";
  link.click();
});

addButton.addEventListener("click", function () {
  runnerName = document.getElementById("runner").value;
  var button = document.createElement("input");
  button.type = "button";
  button.value = runnerName;
  button.onclick = function () {
    lapping(button.value);
  };
  runnersContainer.appendChild(button);
});
