// Script này sẽ chạy trên trang Google
async function clickMatchingLink() {
  try {
    // Lấy thông tin từ storage
    const result = await chrome.storage.local.get(['targetUrl']);
    let targetUrl = result.targetUrl;
    
    if (!targetUrl) {
      console.error('Không tìm thấy targetUrl trong storage');
      await sendResultToBackground(null);
      return;
    }

    console.log('🎯 Target URL cần tìm (từ Bước 3):', targetUrl);
    
    // Tìm và click link phù hợp
    const found = await findAndClickMatchingLink(targetUrl);
    
    if (!found) {
      console.log('❌ Không tìm thấy link phù hợp sau 3 trang tìm kiếm');
      await sendResultToBackground(null);
    }
    
  } catch (error) {
    console.error('Lỗi khi click link:', error);
    await sendResultToBackground(null);
  }
}

// Hàm gửi kết quả về background script
async function sendResultToBackground(kmCode) {
  try {
    console.log('📤 Gửi kết quả về background:', kmCode);
    
    await chrome.runtime.sendMessage({
      action: "searchCompleted",
      kmCode: kmCode,
      found: kmCode !== null
    });
    
    // Xóa dữ liệu tạm thời
    await chrome.storage.local.remove(['targetUrl']);
    
  } catch (error) {
    console.error('Lỗi khi gửi kết quả:', error);
  }
}

// Hàm chính tìm và click link
async function findAndClickMatchingLink(targetUrl) {
  const startTime = Date.now();
  const timeout = 5000; // 5 giây
  let currentPage = 1;
  const maxPages = 3; // Tối đa 3 trang
  
  // Chuẩn hóa targetUrl
  targetUrl = targetUrl.replace('www.', '');
  console.log('🔧 Target URL đã chuẩn hóa:', targetUrl);
  
  while (Date.now() - startTime < timeout && currentPage <= maxPages) {
    console.log(`🔍 Đang tìm kiếm trên trang ${currentPage}...`);
    
    // Chờ kết quả load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Tìm tất cả các link kết quả
    const links = document.querySelectorAll('a[href]');
    let foundLink = null;
    
    for (const link of links) {
      const href = link.href;
      
      // Bỏ qua các link không phải kết quả tìm kiếm
      if (!isSearchResultLink(href)) continue;
      
      // Kiểm tra link có khớp với target URL không
      if (isMatchingLink(href, targetUrl)) {
        foundLink = link;
        console.log('✅ Tìm thấy link phù hợp:', getHostname(href));
        
        // Trích xuất kmCode từ URL nếu có
        const kmCode = extractKmCode(href);
        console.log('💰 KM Code:', kmCode);
        
        // Click vào link
        foundLink.click();
        
        // Gửi kết quả thành công về background
        await sendResultToBackground(kmCode);
        return true;
      }
    }
    
    console.log(`❌ Không tìm thấy trên trang ${currentPage}`);
    
    // Chuyển sang trang tiếp theo nếu chưa hết thời gian
    if (currentPage < maxPages && Date.now() - startTime < timeout - 1000) {
      const nextPageFound = await goToNextPage();
      if (nextPageFound) {
        currentPage++;
      } else {
        console.log('📄 Không còn trang tiếp theo');
        break;
      }
    } else {
      break;
    }
  }
  
  return false;
}

// Hàm trích xuất kmCode từ URL
function extractKmCode(url) {
  try {
    const urlObj = new URL(url);
    
    // Tìm tham số kmCode trong URL
    const kmCode = urlObj.searchParams.get('kmCode') || 
                   urlObj.searchParams.get('code') || 
                   urlObj.searchParams.get('promo') || 
                   urlObj.searchParams.get('voucher');
    
    return kmCode;
  } catch (error) {
    console.error('Lỗi khi trích xuất kmCode:', error);
    return null;
  }
}

// Kiểm tra link có khớp với target URL không
function isMatchingLink(href, targetUrl) {
  try {
    const hrefHostname = new URL(href).hostname.replace('www.', '');
    
    // Chỉ sử dụng phương pháp tìm phần trước và sau ***
    if (targetUrl.includes('***')) {
      const targetBefore = targetUrl.split('***')[0]; // Phần trước ***
      const targetAfter = targetUrl.split('***')[1];  // Phần sau ***
      
      // Kiểm tra nếu hostname chứa phần trước và phần sau ***
      const hasBefore = targetBefore ? hrefHostname.includes(targetBefore) : true;
      const hasAfter = targetAfter ? hrefHostname.includes(targetAfter) : true;
      
      if (hasBefore && hasAfter) {
        console.log(`✅ Khớp: "${hrefHostname}" có "${targetBefore}"*"${targetAfter}"`);
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    return false;
  }
}

// Chuyển sang trang tiếp theo
async function goToNextPage() {
  try {
    // Tìm link "Tiếp theo" hoặc "Next" của Google
    const nextSelectors = [
      '#pnnext',
      'a[aria-label*="Next"]',
      'a[aria-label*="Tiếp"]',
      'a:contains("Next")',
      'a:contains("Tiếp theo")',
      '.fl:last-child a'
    ];
    
    let nextLink = null;
    for (const selector of nextSelectors) {
      nextLink = document.querySelector(selector);
      if (nextLink) break;
    }
    
    if (nextLink && nextLink.href) {
      console.log('➡️ Chuyển sang trang tiếp theo');
      nextLink.click();
      // Chờ trang mới load
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Lỗi khi chuyển trang:', error);
    return false;
  }
}

// Kiểm tra link có phải kết quả tìm kiếm không
function isSearchResultLink(href) {
  const excludedPatterns = [
    'google.com',
    'gstatic.com',
    'googleadservices',
    '/settings/',
    '/preferences',
    '/advanced_search',
    '/search?',
    'webcache.googleusercontent.com',
    'accounts.google.com',
    'support.google.com'
  ];
  
  const isExcluded = excludedPatterns.some(pattern => href.includes(pattern));
  const isHttp = href.startsWith('http');
  
  return !isExcluded && isHttp;
}

// Lấy hostname từ URL
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// Chạy khi trang Google đã load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', clickMatchingLink);
} else {
  clickMatchingLink();
}