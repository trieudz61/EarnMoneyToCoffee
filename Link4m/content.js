// =============================================
// EXTENSION TỰ ĐỘNG LẤY MÃ KHUYẾN MÃI
// =============================================

// Biến theo dõi trạng thái
let hasExecuted = false;
let currentScrollInterval = null;

// =============================================
// HÀM HIỂN THỊ ALERT THÀNH CÔNG
// =============================================
function showSuccessAlert(code) {
    // Tạo custom alert dialog
    const alertOverlay = document.createElement('div');
    alertOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    const codeDisplay = document.createElement('div');
    codeDisplay.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-size: 24px;
        font-weight: bold;
        margin: 20px 0;
        letter-spacing: 2px;
        font-family: 'Courier New', monospace;
    `;
    codeDisplay.textContent = code;
    
    const message = document.createElement('div');
    message.style.cssText = `
        color: #333;
        margin-bottom: 20px;
        font-size: 16px;
    `;
    message.innerHTML = `🎉 <strong>ĐÃ LẤY MÃ THÀNH CÔNG!</strong><br>Thời gian: ${new Date().toLocaleTimeString()}`;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    `;
    
    const copyButton = document.createElement('button');
    copyButton.style.cssText = `
        background: linear-gradient(135deg, #27ae60, #219a52);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        flex: 1;
        transition: all 0.3s ease;
    `;
    copyButton.textContent = '📋 COPY MÃ';
    copyButton.onmouseover = () => {
        copyButton.style.transform = 'scale(1.05)';
        copyButton.style.boxShadow = '0 5px 15px rgba(39, 174, 96, 0.4)';
    };
    copyButton.onmouseout = () => {
        copyButton.style.transform = 'scale(1)';
        copyButton.style.boxShadow = 'none';
    };
    
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        flex: 1;
        transition: all 0.3s ease;
    `;
    closeButton.textContent = '❌ THOÁT';
    closeButton.onmouseover = () => {
        closeButton.style.transform = 'scale(1.05)';
        closeButton.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.4)';
    };
    closeButton.onmouseout = () => {
        closeButton.style.transform = 'scale(1)';
        closeButton.style.boxShadow = 'none';
    };
    
    // Xử lý sự kiện copy
    copyButton.onclick = () => {
        navigator.clipboard.writeText(code).then(() => {
            copyButton.textContent = '✅ ĐÃ COPY!';
            copyButton.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            copyButton.disabled = true;
            
            // Tự động đóng sau 2 giây
            setTimeout(() => {
                document.body.removeChild(alertOverlay);
            }, 2000);
        }).catch(err => {
            copyButton.textContent = '❌ LỖI COPY';
            copyButton.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        });
    };
    
    // Xử lý sự kiện thoát
    closeButton.onclick = () => {
        document.body.removeChild(alertOverlay);
    };
    
    // Thêm các phần vào dialog
    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(closeButton);
    
    alertBox.appendChild(message);
    alertBox.appendChild(codeDisplay);
    alertBox.appendChild(buttonContainer);
    alertOverlay.appendChild(alertBox);
    
    // Thêm vào body
    document.body.appendChild(alertOverlay);
    
    console.log('✅ Đã hiển thị alert thành công');
}

// =============================================
// HÀM AUTO SCROLL RANDOM
// =============================================
function startAutoScroll() {
    console.log('🔄 Bắt đầu auto scroll random giống người thật...');
    
    let scrollDirection = Math.random() > 0.5 ? 1 : -1;
    let scrollPosition = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    currentScrollInterval = setInterval(() => {
        // Random khoảng cách scroll (50-200px)
        const scrollDistance = Math.floor(Math.random() * 150) + 50;
        
        // Random thời gian scroll (300-800ms)
        const scrollDuration = Math.floor(Math.random() * 500) + 300;
        
        // Random có đổi hướng không (10% cơ hội)
        const shouldChangeDirection = Math.random() < 0.1;
        
        if (shouldChangeDirection) {
            scrollDirection = -scrollDirection;
            console.log('🔄 Đổi hướng scroll!');
        }
        
        // Tính vị trí scroll mới
        let newPosition = scrollPosition + (scrollDistance * scrollDirection);
        
        // Giới hạn trong phạm vi trang
        if (newPosition >= scrollHeight) {
            newPosition = scrollHeight;
            scrollDirection = -1;
            console.log('⬆️ Đã chạm đáy, scroll lên');
        } else if (newPosition <= 0) {
            newPosition = 0;
            scrollDirection = 1;
            console.log('⬇️ Đã chạm đỉnh, scroll xuống');
        }
        
        // Thực hiện scroll mượt mà
        const startTime = performance.now();
        const startPosition = scrollPosition;
        
        function smoothScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / scrollDuration, 1);
            
            // Easing function để scroll mượt hơn
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            scrollPosition = startPosition + (newPosition - startPosition) * easeProgress;
            
            window.scrollTo({
                top: scrollPosition,
                behavior: 'auto'
            });
            
            if (progress < 1) {
                requestAnimationFrame(smoothScroll);
            }
        }
        
        requestAnimationFrame(smoothScroll);
        
        console.log(`📜 Scroll: ${scrollDistance}px ${scrollDirection > 0 ? 'xuống' : 'lên'}`);
        
    }, 1000);
    
    return currentScrollInterval;
}

// =============================================
// HÀM DỪNG AUTO SCROLL
// =============================================
function stopAutoScroll() {
    if (currentScrollInterval) {
        clearInterval(currentScrollInterval);
        currentScrollInterval = null;
        console.log('🛑 Đã dừng auto scroll');
    }
}

// =============================================
// HÀM KIỂM TRA KÍCH HOẠT AUTO
// =============================================
function shouldAutoActivate() {
    return new Promise((resolve) => {
        console.log('🔍 Đang kiểm tra icon-x64.png...');
        
        let checkCount = 0;
        const maxChecks = 10;
        
        const checkInterval = setInterval(() => {
            checkCount++;
            const hasIcon = document.querySelector('img[src*="icon-x64.png"]');
            
            if (hasIcon) {
                console.log('✅ Tìm thấy icon-x64.png!');
                clearInterval(checkInterval);
                resolve(true);
                return;
            }
            
            console.log(`🔍 Lần ${checkCount}: Chưa thấy icon-x64.png...`);
            
            if (checkCount >= maxChecks) {
                console.log('❌ Không tìm thấy icon-x64.png sau 5 giây');
                clearInterval(checkInterval);
                resolve(false);
            }
        }, 500);
    });
}

// =============================================
// HÀM CLICK BUTTON LẤY MÃ
// =============================================
function clickButton() {
    try {
        console.log('🔍 Đang tìm img có icon-x64.png...');
        
        // Tìm img có chứa icon-x64.png trong src
        const img = document.querySelector('img[src*="icon-x64.png"]');
        
        if (!img) {
            console.log('❌ Không tìm thấy img có icon-x64.png');
            return false;
        }
        
        console.log('✅ Tìm thấy image:', img);
        
        // Tìm phần tử cha có thể click
        let element = img;
        let clickableElement = null;
        
        // Đi lên 3 levels để tìm element clickable
        for (let i = 0; i < 3; i++) {
            element = element.parentElement;
            if (!element) break;
            
            console.log(`🔍 Level ${i + 1}:`, element.tagName);
            
            // Kiểm tra nếu element có thể click
            if (element.click || 
                element.onclick || 
                element.hasAttribute('onclick') ||
                element.tagName === 'BUTTON' ||
                element.tagName === 'A' ||
                window.getComputedStyle(element).cursor === 'pointer') {
                clickableElement = element;
                break;
            }
        }
        
        if (clickableElement) {
            console.log('🎯 Clickable element tìm thấy:', clickableElement);
            
            // Thử click
            try {
                clickableElement.click();
                console.log('🖱️ Click thành công!');
                setTimeout(3000)
                return true;
            } catch (error) {
                console.log('⚠️ Click thất bại:', error);
                
                // Thử dispatch event
                try {
                    const event = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    clickableElement.dispatchEvent(event);
                    console.log('🖱️ Dispatch event thành công!');
                    return true;
                } catch (e) {
                    console.log('⚠️ Dispatch event thất bại:', e);
                }
            }
        }
        
        console.log('❌ Không thể click được');
        return false;
        
    } catch (error) {
        console.error('💥 Lỗi tìm/click image:', error);
        return false;
    }
}

// =============================================
// HÀM LẤY MÃ KHUYẾN MÃI
// =============================================
function getPromoCode() {
    try {
        console.log('🔍 Đang tìm mã khuyến mãi...');
        
        const kmElement = document.querySelector('div[style*="rgb(237, 28, 36)"]');
        
        if (kmElement) {
            const text = kmElement.textContent.trim();
            console.log('📝 Text tìm thấy:', text);
            
            // Tách mã khuyến mãi
            const kmCode = text.split(': ')[1];
            
            if (kmCode) {
                console.log('✅ Mã KM:', kmCode);
                return kmCode;
            } else {
                console.log('❌ Không thể tách mã từ text');
                return null;
            }
        } else {
            console.log('❌ Không tìm thấy element có background màu đỏ');
            
            // Thử tìm bằng cách khác
            const redElements = document.querySelectorAll('div');
            for (let element of redElements) {
                const style = window.getComputedStyle(element);
                if (style.backgroundColor === 'rgb(237, 28, 36)' || 
                    style.backgroundColor === '#ed1c24') {
                    console.log('✅ Tìm thấy element đỏ bằng computed style:', element);
                    const text = element.textContent.trim();
                    const kmCode = text.split(': ')[1];
                    return kmCode || null;
                }
            }
            
            return null;
        }
    } catch (error) {
        console.error('💥 Lỗi lấy mã khuyến mãi:', error);
        return null;
    }
}

// =============================================
// HÀM TÌM VÀ ĐỢI DATA-TIME MỚI
// =============================================
function waitForDataTime() {
    return new Promise((resolve) => {
        console.log('⏳ Đang đợi data-time xuất hiện...');
        
        let checkCount = 0;
        const maxChecks = 40;
        
        const checkInterval = setInterval(() => {
            checkCount++;
            
            // Tìm data-time MỚI mỗi lần kiểm tra
            const countdownElements = document.querySelectorAll('[data-time]');
            console.log(`📊 Lần ${checkCount}: Tìm thấy ${countdownElements.length} elements có data-time`);
            
            for (let element of countdownElements) {
                const dataTime = element.getAttribute('data-time');
                const dataClick = element.getAttribute('data-click');
                console.log(`🔍 Kiểm tra element: data-time="${dataTime}", data-click="${dataClick}"`);
                
                if (dataTime && dataClick === 'true') {
                    const time = parseInt(dataTime);
                    if (time > 0 && time <= 120) {
                        console.log(`✅ Tìm thấy data-time MỚI: ${time} giây`);
                        clearInterval(checkInterval);
                        resolve(time);
                        return;
                    }
                }
            }
            
            // Cũng thử tìm trong div màu đỏ
            const redDivs = document.querySelectorAll('div[style*="rgb(237, 28, 36)"]');
            for (let div of redDivs) {
                const text = div.textContent.trim();
                if (text.includes('Lấy mã sau') && text.includes('s')) {
                    const secondsMatch = text.match(/Lấy mã sau\s*(\d+)\s*s/);
                    if (secondsMatch) {
                        const seconds = parseInt(secondsMatch[1]);
                        console.log(`✅ Tìm thấy countdown từ text: ${seconds} giây`);
                        clearInterval(checkInterval);
                        resolve(seconds);
                        return;
                    }
                }
            }
            
            console.log(`⏰ Chưa thấy data-time, đợi thêm... (${checkCount}/${maxChecks})`);
            
            if (checkCount >= maxChecks) {
                console.log('❌ Không tìm thấy data-time sau 20 giây');
                clearInterval(checkInterval);
                resolve(null);
            }
        }, 500);
    });
}

// =============================================
// HÀM CHỜ COUNTDOWN
// =============================================
function waitForCountdown() {
    return new Promise(async (resolve) => {
        console.log('🚀 Bắt đầu quy trình tìm data-time MỚI...');
        
        // Sử dụng hàm mới để đợi data-time xuất hiện
        const countdownTime = await waitForDataTime();
        
        if (countdownTime !== null) {
            console.log(`🎯 Đã xác định countdown MỚI: ${countdownTime} giây`);
            
            // Đợi đúng countdownTime + 3 giây buffer
            const waitTime = (countdownTime + 3) * 1000;
            console.log(`⏰ Đợi ${countdownTime + 3} giây để lấy mã...`);
            
            // BẮT ĐẦU AUTO SCROLL
            startAutoScroll();
            
            setTimeout(() => {
                // DỪNG AUTO SCROLL
                stopAutoScroll();
                resolve(countdownTime);
            }, waitTime);
        } else {
            console.log('❌ Không tìm thấy data-time');
            resolve(null);
        }
    });
}

// =============================================
// HÀM TỰ ĐỘNG F5 TRANG
// =============================================
function autoRefreshPage() {
    console.log('🔄 Tự động refresh trang để tìm data-time mới...');
    
    // Dừng scroll trước khi F5
    stopAutoScroll();
    
    // Đợi 2 giây rồi refresh
    setTimeout(() => {
        console.log('🎯 Đang refresh trang...');
        location.reload();
    }, 2000);
}

// =============================================
// HÀM MÔ PHỎNG GÕ PHÍM NGƯỜI DÙNG
// =============================================
function humanTypeToInput(inputElement, text) {
    return new Promise(async (resolve) => {
        console.log('👆 Bắt đầu mô phỏng gõ phím...');
        
        // Focus
        inputElement.focus();
        await delay(100);
        
        // Click
        inputElement.click();
        await delay(150);
        
        // Clear nếu có dữ liệu cũ
        if (inputElement.value) {
            inputElement.value = '';
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            await delay(200);
        }
        
        // Gõ từng ký tự
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
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
            await delay(80 + Math.random() * 70);
        }
        
        // Kết thúc
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(500);
        inputElement.blur();
        
        console.log('✅ Hoàn thành gõ phím');
        resolve();
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================
// HÀM NHẬP MÃ VÀO INPUT (CHO TRANG LINK4M.COM)
// =============================================
async function typeCodeToInput(code) {
    console.log('⌨️ Đang nhập mã vào input:', code);
    
    try {
        // Tìm input password
        const passwordInput = document.querySelector('input[name="password"][type="text"], input#password, input.password, input[name="password"][type="password"]');
        
        if (!passwordInput) {
            console.log('❌ Không tìm thấy input password');
            return false;
        }
        
        console.log('✅ Tìm thấy input:', passwordInput);
        
        // Gọi hàm humanTypeToInput
        await humanTypeToInput(passwordInput, code);
        console.log('✅ Đã nhập mã thành công');
        return true;
        
    } catch (error) {
        console.error('💥 Lỗi khi nhập mã:', error);
        return false;
    }
}

// =============================================
// HÀM TÌM VÀ NHẬP MÃ VÀO TRANG LINK4M
// =============================================
async function typeCodeToLink4m(code) {
    return new Promise(async (resolve) => {
        console.log('🔍 Đang tìm tab https://link4m.com/...');
        
        try {
            // Gửi message đến background script để tìm và chuyển tab
            const response = await chrome.runtime.sendMessage({
                action: 'switchToLink4mTab',
                code: code
            });
            
            if (response && response.success) {
                console.log('✅ Đã chuyển sang tab link4m.com và nhập mã thành công');
                console.log('🗑️ Tất cả tab khác đã được đóng, chỉ giữ lại tab link4m.com');
                resolve(true);
            } else {
                console.log('❌ Không thể chuyển tab hoặc nhập mã:', response?.error);
                resolve(false);
            }
            
        } catch (error) {
            console.error('💥 Lỗi trong quá trình chuyển tab và nhập mã:', error);
            resolve(false);
        }
    });
}

// =============================================
// HÀM ĐÓNG TAB HIỆN TẠI (TAB NHẬN MÃ)
// =============================================
async function closeCurrentTab() {
    try {
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (currentTab) {
            await chrome.tabs.remove(currentTab.id);
            console.log('✅ Đã đóng tab nhận mã');
        }
    } catch (error) {
        console.error('❌ Lỗi khi đóng tab:', error);
    }
}

// =============================================
// HÀM TỰ ĐỘNG CHÍNH
// =============================================
async function autoGetPromoCode() {
    console.log('🚀 Bắt đầu quy trình tự động...');
    
    // Bước 1: Click button LẤY MÃ
    console.log('🖱️ Đang click button LẤY MÃ...');
    const clickSuccess = clickButton();
    
    if (clickSuccess) {
        console.log('✅ Click thành công, bắt đầu tìm data-time MỚI...');
        
        // Đợi 2 giây để trang xử lý click
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            // Bước 2: Tìm và chờ countdown MỚI
            const countdownTime = await waitForCountdown();
            
            if (countdownTime !== null) {
                console.log(`🎉 Countdown MỚI ${countdownTime} giây đã kết thúc, lấy mã...`);
                
                // Lấy mã
                const code = getPromoCode();
                if (code) {
                    console.log('🎉 Tự động lấy mã thành công:', code);
                    
                    // HIỂN THỊ ALERT THÀNH CÔNG
                    showSuccessAlert(code);
                    
                    // Lưu mã vào storage
                    chrome.storage.local.set({ 
                        'autoPromoCode': code, 
                        'autoTime': new Date().toLocaleString()
                    });
                    
                    // THÊM: Tự động chuyển sang link4m.com và nhập mã
                    console.log('🔄 Tự động chuyển sang link4m.com để nhập mã...');
                    
                    // Đợi 3 giây để user thấy mã
                    setTimeout(async () => {
                        const typeSuccess = await typeCodeToLink4m(code);
                        
                        if (typeSuccess) {
                            // Đóng tab hiện tại sau khi nhập mã thành công
                            setTimeout(() => {
                                closeCurrentTab();
                            }, 2000);
                        }
                    }, 3000);
                    
                } else {
                    console.log('❌ Không tìm thấy mã sau countdown, F5 để thử lại...');
                    autoRefreshPage();
                }
            } else {
                console.log('❌ Không tìm thấy data-time, F5 để thử lại...');
                autoRefreshPage();
            }
            
        } catch (error) {
            console.error('💥 Lỗi trong quá trình chờ:', error);
            autoRefreshPage();
        }
    } else {
        console.log('❌ Không thể click button, F5 để thử lại...');
        autoRefreshPage();
    }
}

// =============================================
// KHỞI CHẠY EXTENSION
// =============================================
console.log('🔄 Content script loaded, checking for activation...');

async function startAutoExecution() {
    // Đảm bảo chỉ chạy 1 lần sau mỗi lần F5
    if (hasExecuted) {
        console.log('⏭️ Đã chạy rồi, không chạy lại');
        return;
    }
    
    hasExecuted = true;
    console.log('🔍 Đang kiểm tra trang:', window.location.href);
    
    // Đợi thêm 2 giây để trang load hoàn toàn
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // CHỈ kích hoạt auto nếu trang có icon-x64.png
    const shouldActivate = await shouldAutoActivate();
    
    if (shouldActivate) {
        console.log('🎯 Trang có icon-x64.png, kích hoạt auto...');
        setTimeout(() => {
            console.log('🔄 Bắt đầu thử click tự động...');
            autoGetPromoCode();
        }, 1000);
    } else {
        console.log('⏭️ Trang không có icon-x64.png, KHÔNG kích hoạt auto');
    }
}

// =============================================
// EVENT LISTENERS
// =============================================

// Chạy auto khi trang ready - RESET BIẾN KHI F5
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Reset biến khi trang load mới
        hasExecuted = false;
        startAutoExecution();
    });
} else {
    // Reset biến khi trang đã load
    hasExecuted = false;
    startAutoExecution();
}

// Lắng nghe messages từ popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📨 Nhận message:', request.action);
    
    let response = {};
    
    try {
        if (request.action === 'clickButton') {
            const success = clickButton();
            response = { success: success };
        }
        else if (request.action === 'getPromoCode') {
            const code = getPromoCode();
            response = { 
                success: true, 
                code: code 
            };
        }
        // THÊM CASE MỚI
        else if (request.action === 'typePromoCode') {
            // Gọi hàm nhập mã vào link4m.com
            typeCodeToInput(request.code).then(success => {
                response = { success: success };
                sendResponse(response);
            });
            return true; // Giữ kết nối mở cho async
        }
        
        console.log('📤 Gửi response:', response);
        sendResponse(response);
        
    } catch (error) {
        console.error('💥 Lỗi xử lý message:', error);
        sendResponse({ success: false, error: error.message });
    }
    
    return true;
});

console.log('🚀 Content script loaded successfully');