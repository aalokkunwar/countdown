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
  localBgData: null,
};

// Load settings when popup opens
document.addEventListener("DOMContentLoaded", async () => {
  // Set first tab as active by default
  const firstTab = document.querySelector(".tab");
  const firstContent = document.getElementById("basic");
  if (firstTab && firstContent) {
    firstTab.classList.add("active");
    firstContent.classList.add("active");
  }

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

  // Show/hide custom background URL field and local upload field
  document.getElementById("customBgUrlContainer").style.display =
    settings.bgImage === "custom" ? "block" : "none";
  document.getElementById("localBgContainer").style.display =
    settings.bgImage === "local" ? "block" : "none";

  // Load local image preview if exists
  if (settings.localBgData) {
    showImagePreview(settings.localBgData);
  }

  // Handle select animations
  document.querySelectorAll("select").forEach((select) => {
    // Wrap any remaining unwrapped selects
    if (!select.parentElement.classList.contains("select-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "select-wrapper";
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
    }

    select.addEventListener("focus", () => {
      select.parentElement.classList.add("active");
    });

    select.addEventListener("blur", () => {
      select.parentElement.classList.remove("active");
    });
  });

  // Handle tab switching
  const tabsContainer = document.querySelector(".tabs");
  if (tabsContainer) {
    tabsContainer.addEventListener("click", (event) => {
      const clickedTab = event.target.closest(".tab");
      if (!clickedTab) return;

      // Get all tabs and contents
      const tabs = document.querySelectorAll(".tab");
      const contents = document.querySelectorAll(".tab-content");

      // Remove active class from all tabs and contents
      tabs.forEach((tab) => tab.classList.remove("active"));
      contents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      clickedTab.classList.add("active");

      // Show corresponding content
      const tabId = clickedTab.getAttribute("data-tab");
      const content = document.getElementById(tabId);
      if (content) {
        content.classList.add("active");
        // Ensure content is visible
        content.style.display = "block";
        content.style.visibility = "visible";
        content.style.height = "auto";
        content.style.opacity = "1";
      }
    });
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
        chrome.storage.local.set({
          localBgData: e.target.result,
        });
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
