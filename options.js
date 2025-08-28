function $(id) {
  return document.getElementById(id);
}

function load() {
  chrome.storage.sync.get(
    {
      birthdate: "",
      expectancy: 80,
      motto: "Make today count.",
      theme: "dark",
    },
    ({ birthdate, expectancy, motto, theme }) => {
      $("birthdate").value = birthdate || "";
      $("expectancy").value = expectancy;
      $("motto").value = motto || "";
      $("theme").value = theme || "dark";
    }
  );
}

function save() {
  const birthdate = $("birthdate").value;
  const expectancy = Number($("expectancy").value || 80);
  const motto = $("motto").value.trim() || "Make today count.";
  const theme = $("theme").value;

  chrome.storage.sync.set({ birthdate, expectancy, motto, theme }, () => {
    $("save").textContent = "Saved ✓";
    setTimeout(() => ($("save").textContent = "Save"), 1200);
  });
}

function reset() {
  chrome.storage.sync.clear(() => load());
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  $("save").addEventListener("click", save);
  $("reset").addEventListener("click", reset);
});
