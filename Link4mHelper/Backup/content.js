// Hàm chờ đợi element xuất hiện
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkElement() {
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Timeout waiting for element: ${selector}`));
      } else {
        setTimeout(checkElement, 100);
      }
    }
    
    checkElement();
  });
}

// Hàm chờ đợi cho đến khi xuất hiện term cần lấy
function waitForTerms(timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkTerms() {
      // THỬ LẤY DIRECT LINK TRƯỚC (trường hợp mới)
      const directLink = extractDirectLinkFromStep1();
      
      if (directLink) {
        console.log('✅ Đã tìm thấy direct link từ Bước 1');
        resolve({ 
          directLink: directLink,
          searchTerm: null,
          targetUrl: null
        });
      } else {
        // TRƯỜNG HỢP CŨ: có search term và target URL
        const searchTerm = extractSearchTermFromStep2();
        const targetUrl = extractTargetUrlFromStep3();
        
        if (searchTerm && targetUrl) {
          console.log('✅ Đã tìm thấy đầy đủ terms cần lấy (trường hợp cũ)');
          resolve({ 
            directLink: null,
            searchTerm: searchTerm, 
            targetUrl: targetUrl 
          });
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for terms to appear'));
        } else {
          console.log('⏳ Đang chờ terms xuất hiện...');
          setTimeout(checkTerms, 1000);
        }
      }
    }
    
    checkTerms();
  });
}

// Hàm chờ trang load hoàn toàn
function waitForPageLoad(timeout = 15000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkLoad() {
      if (document.readyState === 'complete') {
        const importantElement = document.querySelector('#advertise-html-wrapper') || document.body;
        if (importantElement) {
          resolve();
          return;
        }
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error('Page load timeout'));
      } else {
        setTimeout(checkLoad, 100);
      }
    }
    
    if (document.readyState === 'complete') {
      const importantElement = document.querySelector('#advertise-html-wrapper') || document.body;
      if (importantElement) {
        resolve();
        return;
      }
    }
    
    checkLoad();
  });
}

// Hàm reload trang
function reloadPage() {
  console.log('🔄 Không tìm thấy dữ liệu, tiến hành reload trang...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Hàm trích xuất DIRECT LINK từ BƯỚC 1 (trường hợp mới)
function extractDirectLinkFromStep1() {
  try {
    const advertiseWrapper = document.querySelector('#advertise-html-wrapper');
    if (!advertiseWrapper) {
      return null;
    }
    
    const paragraphs = advertiseWrapper.querySelectorAll('p');
    
    for (const p of paragraphs) {
      const text = p.textContent;
      
      // Tìm paragraph chứa "Bước 1:" và có link trực tiếp
      if (text.includes('Bước 1:') || text.includes('Bước 1 :')) {
        
        // Tìm span.red trong bước 1 (đây có thể là direct link)
        const redSpans = p.querySelectorAll('span.red');
        
        for (const span of redSpans) {
          const spanText = span.textContent.trim();
          
          // Kiểm tra nếu đây là một URL/domain (không phải hướng dẫn tìm kiếm)
          if (spanText && 
              (spanText.includes('.') || spanText.includes('/')) && 
              !spanText.includes('tìm kiếm') && 
              !spanText.includes('google.com') &&
              !spanText.includes('search')) {
            
            console.log('🔗 Tìm thấy direct link từ Bước 1:', spanText);
            
            // Chuẩn hóa URL - thêm http:// nếu cần
            let finalUrl = spanText;
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
              finalUrl = 'https://' + finalUrl;
            }
            
            return finalUrl;
          }
        }
        
        // Nếu không tìm thấy span.red, thử tìm trong text content
        const urlMatch = text.match(/([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g);
        if (urlMatch) {
          for (const domain of urlMatch) {
            // Loại bỏ các domain không phải link trực tiếp
            if (!domain.includes('google.com') && 
                !domain.includes('link4m.com') && 
                domain.includes('.') &&
                !text.includes('tìm kiếm')) {
              
              console.log('🔗 Tìm thấy direct link từ text Bước 1:', domain);
              
              // Chuẩn hóa URL
              let finalUrl = domain;
              if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                finalUrl = 'https://' + finalUrl;
              }
              
              return finalUrl;
            }
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Lỗi khi extract direct link:', error);
    return null;
  }
}

// Hàm trích xuất search term từ BƯỚC 2 (trường hợp cũ)
function extractSearchTermFromStep2() {
  try {
    const advertiseWrapper = document.querySelector('#advertise-html-wrapper');
    if (!advertiseWrapper) {
      return null;
    }
    
    const paragraphs = advertiseWrapper.querySelectorAll('p');
    
    for (const p of paragraphs) {
      const text = p.textContent;
      
      // Tìm paragraph chứa "Bước 2:" và từ khóa
      if (text.includes('Bước 2:') || text.includes('Bước 2 :')) {
        
        // Tìm span.red trong bước 2 (đây là search term)
        const redSpans = p.querySelectorAll('span.red');
        
        for (const span of redSpans) {
          const spanText = span.textContent.trim();
          // Loại bỏ các từ không phải search term
          if (spanText && spanText !== 'google.com' && !spanText.includes('trang')) {
            return spanText;
          }
        }
        
        // Nếu không tìm thấy span.red, thử tìm trong text content
        const searchMatch = text.match(/tìm kiếm\s+(.+?)\s+trên/i);
        if (searchMatch && searchMatch[1]) {
          return searchMatch[1].trim();
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Lỗi khi extract search term:', error);
    return null;
  }
}

// Hàm trích xuất target URL từ BƯỚC 3 (trường hợp cũ)
function extractTargetUrlFromStep3() {
  try {
    const advertiseWrapper = document.querySelector('#advertise-html-wrapper');
    if (!advertiseWrapper) {
      return null;
    }
    
    const paragraphs = advertiseWrapper.querySelectorAll('p');
    
    for (const p of paragraphs) {
      const text = p.textContent;
      
      // Tìm paragraph chứa "Bước 3:" và website
      if (text.includes('Bước 3:') || text.includes('Bước 3 :') || text.includes('website')) {
        
        // Tìm span.red trong bước 3 (đây là target URL)
        const redSpans = p.querySelectorAll('span.red');
        
        for (const span of redSpans) {
          const spanText = span.textContent.trim();
          // Tìm URL có dạng domain.***.com
          if (spanText && (spanText.includes('.***.com') || spanText.includes('.'))) {
            return spanText;
          }
        }
        
        // Nếu không tìm thấy span.red, thử tìm trong text content
        const urlMatch = text.match(/([a-zA-Z0-9]+\.\*{3}\.[a-zA-Z]{2,})/);
        if (urlMatch && urlMatch[1]) {
          return urlMatch[1];
        }
        
        // Tìm các domain pattern khác
        const domainMatch = text.match(/([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g);
        if (domainMatch) {
          for (const domain of domainMatch) {
            if (domain.includes('*') || domain.includes('...')) {
              return domain;
            }
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Lỗi khi extract target URL:', error);
    return null;
  }
}

// Hàm chính để trích xuất dữ liệu
async function extractDataAndSearch() {
  try {
    console.log('🚀 Bắt đầu trích xuất dữ liệu từ Link4m...');
    
    // CHỜ TRANG LOAD HOÀN TOÀN TRƯỚC KHI XỬ LÝ
    console.log('⏳ Đang chờ trang load hoàn toàn...');
    await waitForPageLoad();
    console.log('✅ Trang đã load hoàn toàn');
    
    // CHỜ PHẦN HƯỚNG DẪN LOAD CỤ THỂ
    console.log('⏳ Đang chờ phần hướng dẫn load...');
    await waitForElement('#advertise-html-wrapper');
    console.log('✅ Phần hướng dẫn đã load');
    
    // CHỜ CHO ĐẾN KHI XUẤT HIỆN TERMS CẦN LẤY
    console.log('⏳ Đang chờ terms cần lấy xuất hiện...');
    const { directLink, searchTerm, targetUrl } = await waitForTerms();
    
    console.log('🔍 Kết quả trích xuất:');
    console.log('Direct Link (từ Bước 1):', directLink);
    console.log('Search Term (từ Bước 2):', searchTerm);
    console.log('Target URL (từ Bước 3):', targetUrl);
    
    if (directLink) {
      // TRƯỜNG HỢP MỚI: Có direct link từ Bước 1
      console.log('🎉 Đã tìm thấy direct link! Mở trực tiếp...');
      
      // Gửi thông tin đến background script để mở direct link
      chrome.runtime.sendMessage({
        action: "openDirectLink",
        directLink: directLink
      });
      
    } else if (searchTerm && targetUrl) {
      // TRƯỜNG HỢP CŨ: Có search term và target URL
      console.log('🎉 Đã lấy đủ dữ liệu từ hướng dẫn (trường hợp cũ)!');
      
      // Gửi thông tin đến background script để tìm kiếm Google
      chrome.runtime.sendMessage({
        action: "openGoogleSearch",
        searchTerm: searchTerm,
        targetUrl: targetUrl
      });
    } else {
      console.error('❌ Không thể lấy đầy đủ dữ liệu từ hướng dẫn');
      console.log('🔄 Tiến hành reload trang để thử lại...');
      reloadPage();
    }
    
  } catch (error) {
    console.error('💥 Lỗi nghiêm trọng:', error);
    console.log('🔄 Tiến hành reload trang do lỗi...');
    reloadPage();
  }
}

// Khởi động quá trình khi trang ready
async function init() {
  try {
    console.log('🔧 Khởi tạo extension trên Link4m...');
    
    // Chờ trang load hoàn toàn trước khi bắt đầu
    await waitForPageLoad();
    console.log('✅ Trang đã sẵn sàng, bắt đầu trích xuất dữ liệu');
    
    // Bắt đầu quá trình trích xuất
    extractDataAndSearch();
    
  } catch (error) {
    console.error('💥 Lỗi khởi tạo:', error);
    console.log('🔄 Thử reload trang...');
    reloadPage();
  }
}

// Bắt đầu khi trang ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}