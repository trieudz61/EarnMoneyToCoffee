chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openGoogleSearch") {
    // Mở tab mới với tìm kiếm Google
    chrome.tabs.create({
      url: `https://www.google.com/search?q=${encodeURIComponent(request.searchTerm)}`
    }, (tab) => {
      // Lưu thông tin để content script sử dụng sau
      chrome.storage.local.set({
        targetUrl: request.targetUrl
      });
    });
  }
  
  sendResponse({ received: true });
});