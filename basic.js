// Load settings when popup opens
document.addEventListener("DOMContentLoaded", async () => {
  // Load only basic settings
  const settings = await chrome.storage.sync.get({
    birthdate: "",
    expectancy: 80,
    fontFamily: "Graduate",
  });

  // Populate form fields
  document.getElementById("birthdate").value = settings.birthdate;
  document.getElementById("expectancy").value = settings.expectancy;
  document.getElementById("fontFamily").value =
    settings.fontFamily || "Graduate";

  // Save settings
  document
    .getElementById("saveSettings")
    .addEventListener("click", async () => {
      // Get existing settings first to avoid overwriting other categories
      const existingSettings = await chrome.storage.sync.get(null);

      const newSettings = {
        ...existingSettings,
        birthdate: document.getElementById("birthdate").value,
        expectancy: parseInt(document.getElementById("expectancy").value) || 80,
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

  // Navigation buttons
  document.getElementById("toAppearance").addEventListener("click", () => {
    chrome.action.setPopup({ popup: "appearance.html" });
    window.location.href = "appearance.html";
  });

  document.getElementById("toQuotes").addEventListener("click", () => {
    chrome.action.setPopup({ popup: "quotes.html" });
    window.location.href = "quotes.html";
  });
});
