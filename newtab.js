const $ = (id) => document.getElementById(id);

const pad = (n) => String(n).padStart(2, "0");

function diffBreakdown(ms) {
  if (ms <= 0)
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
  const s = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10); // Convert to 2 digits (0-99)
  const minutes = Math.floor(s / 60);
  const hours = Math.floor(minutes / 60);
  const daysTotal = Math.floor(hours / 24);
  const years = Math.floor(daysTotal / 365.2425);
  const remainingDays = daysTotal - Math.floor(years * 365.2425);
  const months = Math.floor(remainingDays / 30.436875); // Average days in a month
  const days = Math.floor(remainingDays % 30.436875);
  return {
    years,
    months,
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: s % 60,
    milliseconds,
  };
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        birthdate: "",
        expectancy: 80,
        motto: "Make today count.",
        theme: "dark",
        bgImage: "default",
        customBgUrl: "",
        textColor: "#ffffff",
        labelColor: "#b0b0b0",
        showQuotes: "no",
        customQuote: "Make today count.",
        fontFamily: "Graduate",
      },
      resolve
    );
  });
}

// Apply visual settings to the page
function applySettings(settings) {
  // Apply theme
  document.body.classList.remove("light", "dark");
  document.body.classList.add(settings.theme);

  // Apply background image
  if (settings.bgImage === "custom" && settings.customBgUrl) {
    document.body.style.backgroundImage = `url('${settings.customBgUrl}')`;
  } else if (settings.bgImage === "local") {
    // Get local image data
    chrome.storage.local.get(["localBgData"], (result) => {
      if (result.localBgData) {
        document.body.style.backgroundImage = `url('${result.localBgData}')`;
      } else {
        document.body.style.backgroundImage = "url('assets/bg.jpg')";
      }
    });
  } else {
    document.body.style.backgroundImage = "url('assets/bg.jpg')";
  }

  // Apply text colors
  document.documentElement.style.setProperty("--fg", settings.textColor);
  document.documentElement.style.setProperty("--muted", settings.labelColor);

  // Apply font family
  document.documentElement.style.setProperty(
    "--font-family",
    settings.fontFamily || "Graduate"
  );
  document.body.style.fontFamily = `var(--font-family), serif`;

  // Apply quote if enabled
  const quoteText = settings.showQuotes === "yes" ? settings.customQuote : "";
  if ($("customQuote")) {
    $("customQuote").textContent = quoteText;
  }
}

function render(diff, deathDate, motto) {
  $("years").textContent = pad(diff.years);
  $("months").textContent = pad(diff.months);
  $("days").textContent = diff.days;
  $("hours").textContent = pad(diff.hours);
  $("minutes").textContent = pad(diff.minutes);
  $("seconds").textContent = pad(diff.seconds);
  $("milliseconds").textContent = pad(diff.milliseconds); // Will show 00-99
  $("etaText").textContent = deathDate
    ? `Estimated final day: ${deathDate.toLocaleDateString()}`
    : `Set your birthdate & life expectancy`;
}

async function init() {
  const settings = await loadSettings();
  applySettings(settings);

  let deathDate = null;
  if (settings.birthdate) {
    const b = new Date(settings.birthdate);
    deathDate = new Date(b);
    deathDate.setFullYear(
      deathDate.getFullYear() + Number(settings.expectancy || 80)
    );
  }

  function tick() {
    const now = new Date();
    const ms = deathDate ? deathDate - now : 0;
    const diff = diffBreakdown(ms);
    render(diff, deathDate, settings.customQuote);
  }

  tick();
  setInterval(tick, 16); // Run approximately every 16ms for smooth milliseconds updates
}

// Listen for settings updates from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SETTINGS_UPDATED") {
    init(); // Reinitialize everything with new settings
  }
});

init();
