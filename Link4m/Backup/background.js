// =============================================
// BACKGROUND SCRIPT - QUẢN LÝ TAB VÀ MESSAGES
// =============================================

// Tạo và quản lý popup window
let popupWindowId = null;

// Khi click extension icon
chrome.action.onClicked.addListener(async (tab) => {
  // Nếu popup đã mở, focus vào nó
  if (popupWindowId) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch (error) {
      // Nếu window không tồn tại, reset ID
      popupWindowId = null;
    }
  }

  // Tạo popup window mới
  const popup = await chrome.windows.create({
    url: 'popup.html',
    type: 'popup',
    width: 350,
    height: 500,
    left: Math.round(screen.width - 350),
    top: 100
  });

  popupWindowId = popup.id;

  // Theo dõi khi popup đóng
  chrome.windows.onRemoved.addListener((closedWindowId) => {
    if (closedWindowId === popupWindowId) {
      popupWindowId = null;
    }
  });
});

// =============================================
// HÀM ĐÓNG TẤT CẢ TAB KHÁC NGOÀI TAB LINK4M
// =============================================
async function closeAllTabsExceptLink4m() {
    try {
        console.log('🗑️ Đang đóng tất cả tab khác ngoài tab link4m...');
        
        // Lấy tất cả các tab
        const allTabs = await chrome.tabs.query({});
        
        // Tìm tab link4m
        const link4mTabs = allTabs.filter(tab => 
            tab.url && tab.url.includes('link4m.com')
        );
        
        if (link4mTabs.length === 0) {
            console.log('❌ Không tìm thấy tab link4m.com nào');
            return;
        }
        
        const link4mTabId = link4mTabs[0].id;
        
        // Lọc các tab cần đóng (tất cả tab trừ tab link4m)
        const tabsToClose = allTabs.filter(tab => tab.id !== link4mTabId);
        
        console.log(`📊 Tổng số tab: ${allTabs.length}`);
        console.log(`✅ Giữ lại tab link4m: ${link4mTabId}`);
        console.log(`🗑️ Số tab sẽ đóng: ${tabsToClose.length}`);
        
        // Đóng tất cả tab khác
        if (tabsToClose.length > 0) {
            const tabIdsToClose = tabsToClose.map(tab => tab.id);
            await chrome.tabs.remove(tabIdsToClose);
            console.log('✅ Đã đóng tất cả tab khác, chỉ giữ lại tab link4m');
        } else {
            console.log('ℹ️ Không có tab nào để đóng');
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi đóng tab:', error);
    }
}

// =============================================
// HÀM NHẬP MÃ VÀO INPUT (CHO TRANG LINK4M.COM)
// =============================================
async function typeCodeToInput(tabId, code) {
    console.log('⌨️ Đang nhập mã vào input:', code);
    
    try {
        // Inject script để tìm và nhập mã
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (code) => {
                return new Promise(async (resolve) => {
                    console.log('🔍 Đang tìm input#password...');
                    
                    // Tìm input password chính xác theo selector bạn cung cấp
                    const passwordInput = document.querySelector('input#password');
                    
                    if (!passwordInput) {
                        console.log('❌ Không tìm thấy input#password');
                        console.log('🔍 Đang thử tìm bằng selector khác...');
                        
                        // Thử các selector khác
                        const alternativeInput = document.querySelector('input[name="password"]') || 
                                                document.querySelector('input.password') ||
                                                document.querySelector('input[placeholder*="mã"]') ||
                                                document.querySelector('input[placeholder*="Mã"]');
                        
                        if (alternativeInput) {
                            console.log('✅ Tìm thấy input bằng selector khác:', alternativeInput);
                        } else {
                            console.log('❌ Không tìm thấy input password nào');
                            resolve(false);
                            return;
                        }
                    } else {
                        console.log('✅ Tìm thấy input#password:', passwordInput);
                    }

                    const inputElement = passwordInput || alternativeInput;
                    
                    // Hàm delay
                    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
                    
                    // Hàm gõ phím
                    async function humanTypeToInput(inputElement, text) {
                        console.log('👆 Bắt đầu mô phỏng gõ phím với mã:', text);
                        
                        try {
                            // Focus
                            console.log('🔹 Focus input');
                            inputElement.focus();
                            await delay(100);
                            
                            // Click
                            console.log('🔹 Click input');
                            inputElement.click();
                            await delay(150);
                            
                            // Clear nếu có dữ liệu cũ
                            if (inputElement.value) {
                                console.log('🔹 Clear giá trị cũ:', inputElement.value);
                                inputElement.value = '';
                                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                                await delay(200);
                            }
                            
                            // Gõ từng ký tự
                            console.log('🔹 Bắt đầu gõ từng ký tự...');
                            for (let i = 0; i < text.length; i++) {
                                const char = text[i];
                                console.log(`🔹 Gõ ký tự ${i + 1}/${text.length}: ${char}`);
                                
                                // Thêm ký tự
                                inputElement.value += char;
                                
                                // Kích hoạt events
                                const inputEvent = new Event('input', { bubbles: true });
                                const keyEvents = ['keydown', 'keypress', 'keyup'];
                                
                                keyEvents.forEach(eventType => {
                                    const event = new Event(eventType, { bubbles: true });
                                    event.key = char;
                                    inputElement.dispatchEvent(event);
                                });
                                
                                inputElement.dispatchEvent(inputEvent);
                                
                                // Delay ngẫu nhiên
                                const randomDelay = 80 + Math.random() * 70;
                                await delay(randomDelay);
                            }
                            
                            // Kết thúc
                            console.log('🔹 Kết thúc gõ phím');
                            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                            await delay(500);
                            inputElement.blur();
                            
                            console.log('✅ Hoàn thành gõ phím');
                            return true;
                            
                        } catch (error) {
                            console.error('💥 Lỗi khi gõ phím:', error);
                            return false;
                        }
                    }
                    
                    // Thực hiện gõ phím
                    try {
                        const success = await humanTypeToInput(inputElement, code);
                        
                        // Kiểm tra kết quả
                        if (success) {
                            console.log('✅ Đã nhập mã thành công. Giá trị input:', inputElement.value);
                            resolve(true);
                        } else {
                            console.log('❌ Gõ phím thất bại');
                            resolve(false);
                        }
                    } catch (error) {
                        console.error('💥 Lỗi trong quá trình gõ phím:', error);
                        resolve(false);
                    }
                });
            },
            args: [code]
        });
        
        return results[0].result;
        
    } catch (error) {
        console.error('💥 Lỗi khi nhập mã:', error);
        return false;
    }
}

// =============================================
// HÀM DEBUG KIỂM TRA INPUT TRÊN TRANG LINK4M
// =============================================
async function debugLink4mPage(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                console.log('🔍 DEBUG: Kiểm tra tất cả input trên trang...');
                
                const allInputs = document.querySelectorAll('input');
                console.log(`📊 Tổng số input: ${allInputs.length}`);
                
                allInputs.forEach((input, index) => {
                    console.log(`Input ${index + 1}:`, {
                        id: input.id,
                        name: input.name,
                        type: input.type,
                        className: input.className,
                        placeholder: input.placeholder,
                        value: input.value,
                        selector: `input#${input.id}` || `input[name="${input.name}"]`
                    });
                });
                
                // Kiểm tra input cụ thể
                const targetInput = document.querySelector('input#password');
                console.log('🎯 Input#password:', targetInput);
                
                return {
                    totalInputs: allInputs.length,
                    targetInput: targetInput ? {
                        exists: true,
                        id: targetInput.id,
                        value: targetInput.value
                    } : { exists: false }
                };
            }
        });
        
        console.log('📊 Kết quả debug:', results[0].result);
        return results[0].result;
        
    } catch (error) {
        console.error('💥 Lỗi debug:', error);
        return null;
    }
}

// =============================================
// HÀM CHUYỂN SANG TAB LINK4M VÀ NHẬP MÃ
// =============================================
async function switchToLink4mTabAndTypeCode(code) {
    try {
        console.log('🔍 Đang tìm tab https://link4m.com/...');
        
        // Tìm tab có chứa link4m.com
        const tabs = await chrome.tabs.query({ url: '*://*.link4m.com/*' });
        
        if (tabs.length === 0) {
            console.log('❌ Không tìm thấy tab link4m.com nào đang mở');
            return { success: false, error: 'No link4m tab found' };
        }
        
        const link4mTab = tabs[0];
        console.log('✅ Tìm thấy tab link4m.com:', link4mTab.id);
        
        // BƯỚC 1: ĐÓNG TẤT CẢ TAB KHÁC TRƯỚC KHI CHUYỂN
        console.log('🗑️ Đang đóng tất cả tab khác ngoài tab link4m...');
        await closeAllTabsExceptLink4m();
        
        // Đợi một chút để các tab đóng hoàn toàn
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // BƯỚC 2: CHUYỂN SANG TAB LINK4M.COM
        await chrome.tabs.update(link4mTab.id, { active: true });
        console.log('🔄 Đã chuyển sang tab link4m.com');
        
        // Đợi tab load xong
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // BƯỚC 3: DEBUG VÀ NHẬP MÃ
        console.log('🔧 Đang debug trang...');
        const debugResult = await debugLink4mPage(link4mTab.id);
        
        if (debugResult && debugResult.targetInput.exists) {
            console.log('✅ Tìm thấy input#password, bắt đầu nhập mã...');
            
            // Nhập mã vào input
            const typeSuccess = await typeCodeToInput(link4mTab.id, code);
            
            if (typeSuccess) {
                console.log('✅ Đã nhập mã vào link4m.com thành công');
                return { success: true };
            } else {
                console.log('❌ Lỗi khi nhập mã vào link4m.com');
                return { success: false, error: 'Failed to type code' };
            }
        } else {
            console.log('❌ Không tìm thấy input#password trên trang');
            return { success: false, error: 'Input not found' };
        }
        
    } catch (error) {
        console.error('💥 Lỗi trong quá trình chuyển tab và nhập mã:', error);
        return { success: false, error: error.message };
    }
}

// =============================================
// LẮNG NGHE MESSAGES
// =============================================
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📨 Background nhận message:', request.action);
    
    if (request.action === 'switchToLink4mTab') {
        // Xử lý chuyển tab và nhập mã
        switchToLink4mTabAndTypeCode(request.code).then((result) => {
            sendResponse(result);
        });
        
        return true; // Giữ kết nối cho async
    }
    
    sendResponse({ success: false, error: 'Unknown action' });
});