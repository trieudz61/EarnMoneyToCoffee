from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

def advanced_bypass_with_cdp(url, timer_element_locator):
    """Sử dụng Chrome DevTools Protocol để bypass nâng cao"""
    
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
    
    try:
        # Sử dụng CDP để override
        driver.execute_cdp_cmd('Runtime.evaluate', {
            'expression': '''
                // Override Page Lifecycle API
                Object.defineProperty(document, 'visibilityState', {value: 'visible'});
                Object.defineProperty(document, 'hidden', {value: false});
                
                // Freeze timestamps để tránh detection dựa trên time delta
                let fixedTime = Date.now();
                Date.now = () => fixedTime + performance.now();
                
                // Override performance.now() để tránh detection
                const originalPerfNow = performance.now;
                let perfOffset = 0;
                performance.now = function() {
                    perfOffset += 16.67; // ~60fps
                    return originalPerfNow.call(performance) + perfOffset;
                };
                
                console.log("CDP Bypass activated");
            '''
        })
        
        driver.get(url)

        WebDriverWait(driver, 999).until(
            EC.presence_of_element_located(timer_element_locator)
        )
        
        initial_value = driver.find_element(*timer_element_locator).text
        print(f"Initial: {initial_value}")
        
        # Ẩn trình duyệt
        driver.minimize_window()
        time.sleep(30)
        driver.maximize_window()
        
        final_value = driver.find_element(*timer_element_locator).text
        print(f"Final: {final_value}")
        
        return initial_value != final_value
        
    finally:
        driver.quit()

# Ví dụ sử dụng
if __name__ == "__main__":
    test_url = "https://www.google.com/search?q=k%C3%A8o+nh%C3%A0+c%C3%A1i&sca_esv=9bd0e26604fdbc2f&sxsrf=AE3TifMXIa2CLhLJ7I-E1NNYaEDXKhmeDQ%3A1763754557978&source=hp&ei=PcIgadaEOpDi2roPyb2jyQg&iflsig=AOw8s4IAAAAAaSDQTZqxmh82Dxwb_t05hnpoGOYzDL5y&ved=0ahUKEwiWl5ffgYSRAxUQsVYBHcneKIkQ4dUDCBg&uact=5&oq=k%C3%A8o+nh%C3%A0+c%C3%A1i&gs_lp=Egdnd3Mtd2l6Ig5rw6hvIG5ow6AgY8OhaTIKECMYgAQYJxiKBTIKECMYgAQYJxiKBTILEAAYgAQYsQMYgwEyBRAAGIAEMgsQABiABBixAxiDATIOEAAYgAQYsQMYgwEYigUyCxAAGIAEGLEDGIMBMhAQABiABBixAxiDARiKBRgKMgUQABiABDIFEAAYgARIpwVQAFgAcAB4AJABAJgBVKABVKoBATG4AQPIAQD4AQL4AQGYAgGgAliYAwCSBwExoAfmB7IHATG4B1jCBwMyLTHIBwM&sclient=gws-wiz"
    timer_locator = (By.ID, "timer")
    print("\n🚀 Thử phương pháp nâng cao với CDP...")
    advanced_result = advanced_bypass_with_cdp(test_url, timer_locator)
    print(f"📊 Kết quả nâng cao: {'Thành công' if advanced_result else 'Thất bại'}")