document.addEventListener("DOMContentLoaded", async () => {
  // Load only appearance settings
  const settings = await chrome.storage.sync.get({
    theme: "dark",
    bgImage: "default",
    customBgUrl: "",
    textColor: "#ffffff",
    labelColor: "#b0b0b0",
  });

  // Populate form fields
  document.getElementById("theme").value = settings.theme;
  document.getElementById("bgImage").value = settings.bgImage;
  document.getElementById("customBgUrl").value = settings.customBgUrl;
  document.getElementById("textColor").value = settings.textColor;
  document.getElementById("labelColor").value = settings.labelColor;

  // Show/hide custom background URL field and local upload field
  document.getElementById("customBgUrlContainer").style.display =
    settings.bgImage === "custom" ? "block" : "none";
  document.getElementById("localBgContainer").style.display =
    settings.bgImage === "local" ? "block" : "none";

  // Load local image preview if exists
  if (settings.localBgData) {
    showImagePreview(settings.localBgData);
  }

  // Background image type change handler
  document.getElementById("bgImage").addEventListener("change", (e) => {
    document.getElementById("customBgUrlContainer").style.display =
      e.target.value === "custom" ? "block" : "none";
    document.getElementById("localBgContainer").style.display =
      e.target.value === "local" ? "block" : "none";
  });

  // File upload handling
  const fileInput = document.getElementById("localBgFile");
  const uploadTrigger = document.getElementById("uploadTrigger");
  const removeBtn = document.getElementById("removeImage");

  fileInput.addEventListener("change", handleFileSelect);
  uploadTrigger.addEventListener("click", () => fileInput.click());
  removeBtn.addEventListener("click", removeLocalImage);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        showImagePreview(e.target.result);
        // Store the image data
        chrome.storage.local.set({ localBgData: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  function showImagePreview(dataUrl) {
    const preview = document.getElementById("uploadPreview");
    const img = document.getElementById("imagePreview");
    img.src = dataUrl;
    preview.style.display = "block";
  }

  function removeLocalImage() {
    const preview = document.getElementById("uploadPreview");
    const img = document.getElementById("imagePreview");
    preview.style.display = "none";
    img.src = "";
    chrome.storage.local.remove("localBgData");
    fileInput.value = "";
  }

  // Save settings
  document
    .getElementById("saveSettings")
    .addEventListener("click", async () => {
      // Get existing settings first to avoid overwriting other categories
      const existingSettings = await chrome.storage.sync.get(null);

      const newSettings = {
        ...existingSettings,
        theme: document.getElementById("theme").value,
        bgImage: document.getElementById("bgImage").value,
        customBgUrl: document.getElementById("customBgUrl").value,
        textColor: document.getElementById("textColor").value,
        labelColor: document.getElementById("labelColor").value,
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

  document.getElementById("toQuotes").addEventListener("click", () => {
    chrome.action.setPopup({ popup: "quotes.html" });
    window.location.href = "quotes.html";
  });
});
