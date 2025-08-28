document.addEventListener("DOMContentLoaded", async () => {
  // Load only quotes settings
  const settings = await chrome.storage.sync.get({
    showQuotes: "no",
    customQuote: "Make today count.",
  });

  // Populate form fields
  document.getElementById("showQuotes").value = settings.showQuotes;
  document.getElementById("customQuote").value = settings.customQuote;

  // Save settings
  document
    .getElementById("saveSettings")
    .addEventListener("click", async () => {
      // Get existing settings first to avoid overwriting other categories
      const existingSettings = await chrome.storage.sync.get(null);

      const newSettings = {
        ...existingSettings,
        showQuotes: document.getElementById("showQuotes").value,
        customQuote: document.getElementById("customQuote").value,
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
  document.getElementById("toBasic").addEventListener("click", () => {
    chrome.action.setPopup({ popup: "basic.html" });
    window.location.href = "basic.html";
  });

  document.getElementById("toAppearance").addEventListener("click", () => {
    chrome.action.setPopup({ popup: "appearance.html" });
    window.location.href = "appearance.html";
  });
});
