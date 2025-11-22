chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openGoogleSearch") {
    // TRƯỜNG HỢP CŨ: Mở tab mới với tìm kiếm Google
    chrome.tabs.create({
      url: `https://www.google.com/search?q=${encodeURIComponent(request.searchTerm)}`
    }, (tab) => {
      // Lưu thông tin để content script sử dụng sau
      chrome.storage.local.set({
        targetUrl: request.targetUrl
      });
    });
  } else if (request.action === "openDirectLink") {
    // TRƯỜNG HỢP MỚI: Mở tab mới với direct link từ Bước 1
    console.log('🔗 Mở direct link:', request.directLink);
    chrome.tabs.create({
      url: request.directLink
    });
  }
  
  sendResponse({ received: true });
});