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
  } else if (request.action === "searchCompleted") {
    // Xử lý kết quả tìm kiếm Google
    console.log('🎊 Kết quả tìm kiếm Google:');
    console.log('💰 KM Code:', request.kmCode);
    console.log('✅ Tìm thấy:', request.found);
    
    if (!request.found) {
      console.log('❌ Không tìm thấy kết quả phù hợp sau 3 trang');
      // Có thể thêm xử lý thông báo hoặc ghi log ở đây
    }
  }
  
  sendResponse({ received: true });
});