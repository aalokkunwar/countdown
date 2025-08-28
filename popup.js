// Default settings
const defaultSettings = {
  birthdate: "",
  expectancy: 80,
  theme: "dark",
  bgImage: "default",
  customBgUrl: "",
  textColor: "#ffffff",
  labelColor: "#b0b0b0",
  showQuotes: "no",
  customQuote: "Make today count.",
  fontFamily: "Graduate",
};

// Load settings when popup opens
document.addEventListener("DOMContentLoaded", async () => {
  // Load saved settings
  const settings = await chrome.storage.sync.get(defaultSettings);

  // Populate form fields
  document.getElementById("birthdate").value = settings.birthdate;
  document.getElementById("expectancy").value = settings.expectancy;
  document.getElementById("theme").value = settings.theme;
  document.getElementById("bgImage").value = settings.bgImage;
  document.getElementById("customBgUrl").value = settings.customBgUrl;
  document.getElementById("textColor").value = settings.textColor;
  document.getElementById("labelColor").value = settings.labelColor;
  document.getElementById("showQuotes").value = settings.showQuotes;
  document.getElementById("customQuote").value = settings.customQuote;
  document.getElementById("fontFamily").value =
    settings.fontFamily || "Graduate";

  // Add font preview functionality
  const fontSelect = document.getElementById("fontFamily");
  fontSelect.addEventListener("change", (e) => {
    e.target.style.fontFamily = e.target.value;
  });

  // Show/hide custom background URL field
  document.getElementById("customBgUrlContainer").style.display =
    settings.bgImage === "custom" ? "block" : "none";

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab and its content
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Background image type change handler
  document.getElementById("bgImage").addEventListener("change", (e) => {
    document.getElementById("customBgUrlContainer").style.display =
      e.target.value === "custom" ? "block" : "none";
  });

  // Save settings
  document
    .getElementById("saveSettings")
    .addEventListener("click", async () => {
      const newSettings = {
        birthdate: document.getElementById("birthdate").value,
        expectancy: parseInt(document.getElementById("expectancy").value) || 80,
        theme: document.getElementById("theme").value,
        bgImage: document.getElementById("bgImage").value,
        customBgUrl: document.getElementById("customBgUrl").value,
        textColor: document.getElementById("textColor").value,
        labelColor: document.getElementById("labelColor").value,
        showQuotes: document.getElementById("showQuotes").value,
        customQuote: document.getElementById("customQuote").value,
        fontFamily: document.getElementById("fontFamily").value,
      };

      await chrome.storage.sync.set(newSettings);

      // Show success message
      const successMessage = document.getElementById("successMessage");
      successMessage.style.display = "block";
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 1500);

      // Notify the active tab to update
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { type: "SETTINGS_UPDATED" });
      }
    });

  // Reset settings
  document.getElementById("reset").addEventListener("click", async () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      await chrome.storage.sync.set(defaultSettings);
      location.reload();
    }
  });
});
