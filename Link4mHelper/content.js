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

// Hàm trích xuất kmCode từ direct link (trường hợp mới)
function extractKmCodeFromDirectLink(directLink) {
  try {
    const urlObj = new URL(directLink);
    
    // Tìm tham số kmCode trong URL
    const kmCode = urlObj.searchParams.get('kmCode') || 
                   urlObj.searchParams.get('code') || 
                   urlObj.searchParams.get('promo') || 
                   urlObj.searchParams.get('voucher');
    
    return kmCode;
  } catch (error) {
    console.error('Lỗi khi trích xuất kmCode từ direct link:', error);
    return null;
  }
}

// Cập nhật hàm extractDataAndSearch
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
      
      // Trích xuất kmCode từ direct link nếu có
      const kmCode = extractKmCodeFromDirectLink(directLink);
      console.log('💰 KM Code từ direct link:', kmCode);
      
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