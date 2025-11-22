document.addEventListener('DOMContentLoaded', function() {
  const clickBtn = document.getElementById('clickBtn');
  const getCodeBtn = document.getElementById('getCodeBtn');
  const clickStatus = document.getElementById('clickStatus');
  const codeStatus = document.getElementById('codeStatus');
  const resultContainer = document.getElementById('resultContainer');
  const codeValue = document.getElementById('codeValue');
  const resultInfo = document.getElementById('resultInfo');
  const noResult = document.getElementById('noResult');
  const copyCodeBtn = document.getElementById('copyCodeBtn');

  // Hiển thị kết quả
  function showResult(code, info = '') {
    codeValue.textContent = code;
    resultInfo.textContent = info;
    resultContainer.style.display = 'block';
    noResult.style.display = 'none';
  }

  // Kiểm tra kết quả tự động
  async function checkAutoResults() {
    try {
      const result = await chrome.storage.local.get(['autoPromoCode', 'autoTime']);
      if (result.autoPromoCode) {
        showResult(result.autoPromoCode, `🤖 Tự động lấy lúc: ${result.autoTime}`);
        codeStatus.textContent = '✅ Đã tự động lấy mã!';
        codeStatus.className = 'status success';
      }
    } catch (error) {
      console.log('Không có kết quả tự động');
    }
  }

  // Khởi tạo kiểm tra kết quả tự động
  checkAutoResults();

  // Click button LẤY MÃ
  clickBtn.addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        clickStatus.textContent = 'Đang tìm và click button...';
        clickStatus.className = 'status processing';
        clickBtn.style.opacity = '0.8';
        clickBtn.style.transform = 'scale(0.98)';

        const response = await chrome.tabs.sendMessage(tab.id, { 
          action: 'clickButton' 
        });

        if (response && response.success) {
          clickStatus.textContent = '✅ Đã click button thành công!';
          clickStatus.className = 'status success';
        } else {
          clickStatus.textContent = '❌ Không tìm thấy button LẤY MÃ';
          clickStatus.className = 'status error';
        }
      }
    } catch (error) {
      console.error('Lỗi click button:', error);
      clickStatus.textContent = '❌ Lỗi khi click button';
      clickStatus.className = 'status error';
    } finally {
      setTimeout(() => {
        clickBtn.style.opacity = '1';
        clickBtn.style.transform = 'scale(1)';
      }, 300);
    }
  });

  // Lấy mã khuyến mãi
  getCodeBtn.addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        codeStatus.textContent = 'Đang tìm mã khuyến mãi...';
        codeStatus.className = 'status processing';
        getCodeBtn.style.opacity = '0.8';
        getCodeBtn.style.transform = 'scale(0.98)';

        const response = await chrome.tabs.sendMessage(tab.id, { 
          action: 'getPromoCode' 
        });

        if (response && response.success) {
          if (response.code) {
            showResult(response.code, `🕒 Lấy lúc: ${new Date().toLocaleTimeString()}`);
            codeStatus.textContent = '✅ Đã lấy mã thành công!';
            codeStatus.className = 'status success';
          } else {
            codeStatus.textContent = '❌ Không tìm thấy mã khuyến mãi';
            codeStatus.className = 'status error';
          }
        } else {
          codeStatus.textContent = '❌ Lỗi khi lấy mã';
          codeStatus.className = 'status error';
        }
      }
    } catch (error) {
      console.error('Lỗi lấy mã:', error);
      codeStatus.textContent = '❌ Lỗi khi lấy mã';
      codeStatus.className = 'status error';
    } finally {
      setTimeout(() => {
        getCodeBtn.style.opacity = '1';
        getCodeBtn.style.transform = 'scale(1)';
      }, 300);
    }
  });

  // Copy mã
  copyCodeBtn.addEventListener('click', function() {
    const code = codeValue.textContent;
    navigator.clipboard.writeText(code).then(() => {
      const originalText = resultInfo.textContent;
      resultInfo.textContent = '✅ Đã copy mã vào clipboard!';
      resultInfo.style.color = '#27ae60';
      
      setTimeout(() => {
        resultInfo.textContent = originalText;
        resultInfo.style.color = '#7f8c8d';
      }, 2000);
    }).catch(err => {
      resultInfo.textContent = '❌ Lỗi khi copy mã';
      resultInfo.style.color = '#e74c3c';
    });
  });

  // Reset animations on mouse leave
  [clickBtn, getCodeBtn].forEach(btn => {
    btn.addEventListener('mouseleave', function() {
      this.style.opacity = '1';
      this.style.transform = 'scale(1)';
    });
  });
});