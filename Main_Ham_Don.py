from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time
import requests
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import json

DOMAIN = "http://localhost:1323"
idFolder = "15042eba-b82b-4a71-9565-dce4148cff81"

# =============================================
# HÀM LẤY PROXY TỪ API
# =============================================

def get_proxy_from_api(api_url="https://api.proxyxoay.org//api/key_xoay.php?key=9QJEB6gvb2d8D9PmYXun"):
    """
    Lấy proxy từ API proxyxoay.org
    Returns:
        dict: Thông tin proxy hoặc None nếu lỗi
    """
    try:
        print(f"🔗 Đang lấy proxy từ API: {api_url}")
        
        response = requests.get(api_url, timeout=30)
        response.raise_for_status()  # Kiểm tra lỗi HTTP
        
        data = response.json()
        
        print("✅ Lấy proxy thành công!")
        print(f"📊 Thông tin proxy:")
        print(f"   - HTTP: {data.get('proxyhttp')}")
        print(f"   - SOCKS5: {data.get('proxysocks5')}")
        print(f"   - Nhà mạng: {data.get('nha_mang')}")
        print(f"   - Vị trí: {data.get('vi_tri')}")
        print(f"   - Thời gian sống: {data.get('time_die')} giây")
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Lỗi kết nối khi lấy proxy: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Lỗi parse JSON từ API: {e}")
        return None
    except Exception as e:
        print(f"❌ Lỗi không xác định khi lấy proxy: {e}")
        return None

def format_proxy_for_orbita(proxy_data, proxy_type="http"):
    """
    Định dạng proxy cho Orbita Browser
    Args:
        proxy_data (dict): Dữ liệu proxy từ API
        proxy_type (str): Loại proxy - "http" hoặc "socks5"
    Returns:
        str: Chuỗi proxy định dạng cho Orbita hoặc None nếu lỗi
    """
    if not proxy_data:
        return None
    
    try:
        if proxy_type == "http":
            proxy_string = proxy_data.get('proxyhttp')
        elif proxy_type == "socks5":
            proxy_string = proxy_data.get('proxysocks5')
        else:
            print(f"❌ Loại proxy không hợp lệ: {proxy_type}")
            return None
        
        if not proxy_string:
            print("❌ Không tìm thấy thông tin proxy trong response")
            return None
        
        # Định dạng: ip:port:username:password
        parts = proxy_string.split(':')
        if len(parts) == 4:
            ip, port, username, password = parts
            formatted_proxy = f"{ip}:{port}:{username}:{password}"
            print(f"✅ Đã định dạng proxy {proxy_type.upper()}: {formatted_proxy}")
            return formatted_proxy
        else:
            print(f"❌ Định dạng proxy không hợp lệ: {proxy_string}")
            return None
            
    except Exception as e:
        print(f"❌ Lỗi khi định dạng proxy: {e}")
        return None

def get_and_format_proxy(api_url="https://api.proxyxoay.org//api/key_xoay.php?key=9QJEB6gvb2d8D9PmYXun", proxy_type="http"):
    """
    Lấy và định dạng proxy từ API
    Args:
        api_url (str): URL API
        proxy_type (str): Loại proxy - "http" hoặc "socks5"
    Returns:
        str: Proxy đã định dạng cho Orbita hoặc None nếu lỗi
    """
    proxy_data = get_proxy_from_api(api_url)
    if proxy_data:
        return format_proxy_for_orbita(proxy_data, proxy_type)
    return None

def createProfileWithProxy():
    """
    Tạo profile với proxy tự động lấy từ API
    """
    # Lấy proxy từ API
    proxy_string = get_and_format_proxy(proxy_type="http")
    
    if not proxy_string:
        print("⚠️ Không lấy được proxy, tạo profile không proxy")
        proxy_string = ""
    
    data = {
        "audioContext": "audio-context-noise",
        "canvas": "canvas-off",
        "clientRects": "client-rects-off",
        "folderId": idFolder,
        "kernel": "windows",
        "note": "",
        "password": "",
        "proxyString": proxy_string,
        "twoFactor": "",
        "username": "",
        "webGLImage": "webgl-image-off",
        "webGLMetadata": "webgl-metadata-mask",
        "webRTC": "webrtc-on"
    }
    
    req = requests.post(DOMAIN + "/api/v3/profiles/create", json=data)
    req2 = json.loads(req.text)
    req3 = req2["data"]["id"]
    print("Profile ID:", req3)
    return req3

# =============================================
# CÁC HÀM CŨ GIỮ NGUYÊN
# =============================================

def ListFoder():
    req = requests.get(DOMAIN + "/api/v3/folders")
    req2 = json.loads(req.text)
    req3 = req2["data"]
    print(req3)
    return req

def createProfile(Proxy=""):
    data = {
        "audioContext": "audio-context-noise",
        "canvas": "canvas-off",
        "clientRects": "client-rects-off",
        "folderId": idFolder,
        "kernel": "windows",
        "note": "",
        "password": "",
        "proxyString": Proxy,
        "twoFactor": "",
        "username": "",
        "webGLImage": "webgl-image-off",
        "webGLMetadata": "webgl-metadata-mask",
        "webRTC": "webrtc-on"
    }
    req = requests.post(DOMAIN + "/api/v3/profiles/create", json=data)
    req2 = json.loads(req.text)
    req3 = req2["data"]["id"]
    print("Profile ID:", req3)
    return req3

def deleteProfile(id):
    req = requests.post(DOMAIN + "/api/v3/profiles/delete/" + id)
    req2 = json.loads(req.text)
    return req2

def startProfile(id):
    req = requests.get(DOMAIN + f"/api/v3/profiles/start/{id}?x=0&y=0&isArrange=0%2C%20true%2C%20True%2C%20TRUE&scale=1")
    req2 = json.loads(req.text)
    hwnd = req2["hwnd"]
    debugPort = req2["debugPort"]
    return hwnd, debugPort

def closeProfile(id):
    req = requests.get(DOMAIN + "/api/v3/profiles/close/" + id)
    req2 = json.loads(req.text)
    return req2

def connect_selenium_to_orbita(debugPort):
    chrome_options = Options()
    chrome_options.add_experimental_option("debuggerAddress", f"127.0.0.1:{debugPort}")
    service = Service("./chromedriver.exe")  # Thay đổi đường dẫn
    driver = webdriver.Chrome(options=chrome_options,service=service)


    return driver

def wait_for_extension_completion(driver, timeout=120):
    """
    Chờ extension hoàn thành việc lấy mã và nhập mã vào link4m
    Sử dụng phương pháp gián tiếp để theo dõi extension
    """
    print("⏳ Đang chờ extension hoàn thành...")
    
    start_time = time.time()
    extension_started = False
    
    while time.time() - start_time < timeout:
        try:
            # Phương pháp 1: Kiểm tra input password đã có giá trị chưa
            password_inputs = driver.find_elements(By.CSS_SELECTOR, 'input#password, input[name="password"], input.password, input[type="password"]')
            
            for input_field in password_inputs:
                current_value = input_field.get_attribute('value')
                if current_value and len(current_value.strip()) > 0:
                    print(f"✅ Extension đã nhập mã thành công: {current_value}")
                    return True
            
            # Phương pháp 2: Kiểm tra URL có phải là link4m.com không
            current_url = driver.current_url
            if 'link4m.com' in current_url:
                print(f"✅ Đã chuyển đến trang link4m.com: {current_url}")
                
                # Kiểm tra xem có input password trên trang link4m không
                link4m_inputs = driver.find_elements(By.CSS_SELECTOR, 'input#password, input[name="password"]')
                if link4m_inputs:
                    print("✅ Đã tìm thấy input password trên trang link4m")
                    # Extension đang làm việc, tiếp tục chờ
                    extension_started = True
            
            # Phương pháp 3: Kiểm tra console log (nếu có)
            try:
                logs = driver.get_log('browser')
                for log in logs:
                    message = log['message']
                    if any(keyword in message for keyword in ['✅', 'Đã nhập mã', 'Hoàn thành', 'extension']):
                        print(f"📝 Extension log: {message}")
                        if '✅' in message and ('nhập mã' in message or 'Hoàn thành' in message):
                            print("✅ Phát hiện extension hoàn thành qua console log")
                            return True
            except:
                pass
            
            # Phương pháp 4: Kiểm tra các tab đang mở
            if len(driver.window_handles) == 1 and 'link4m.com' in driver.current_url:
                print("✅ Chỉ còn 1 tab duy nhất là link4m.com - extension đã đóng các tab khác")
                extension_started = True
            
            # Hiển thị trạng thái
            elapsed = int(time.time() - start_time)
            if extension_started:
                print(f"🔄 Extension đang làm việc... ({elapsed}s/{timeout}s)")
            else:
                print(f"⏰ Đang chờ extension bắt đầu... ({elapsed}s/{timeout}s)")
            
            time.sleep(3)
            
        except Exception as e:
            print(f"⚠️ Lỗi khi kiểm tra extension: {e}")
            time.sleep(3)
    
    print("❌ Timeout chờ extension hoàn thành")
    return False

def check_extension_loaded(driver):
    print("🔍 Kiểm tra extension đã load...")
    
    try:
        # Thử inject script để kiểm tra extension
        result = driver.execute_script("""
            // Kiểm tra xem content script đã chạy chưa
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                return 'Extension API available';
            }
            
            // Kiểm tra các biến global của extension
            if (window.hasExecuted !== undefined) {
                return 'Extension content script loaded';
            }
            
            // Kiểm tra các element do extension tạo ra
            const extensionElements = document.querySelectorAll('[class*="extension"], [id*="extension"]');
            if (extensionElements.length > 0) {
                return 'Extension elements found';
            }
            
            return 'No extension detected';
        """)
        
        print(f"📊 Trạng thái extension: {result}")
        return 'loaded' in result.lower() or 'available' in result.lower()
        
    except Exception as e:
        print(f"⚠️ Không thể kiểm tra extension: {e}")
        return False

def trigger_extension_manually(driver):
    """
    Kích hoạt extension thủ công nếu cần
    """
    print("🔄 Thử kích hoạt extension thủ công...")
    
    try:
        # Thử tìm và click vào icon extension để kích hoạt auto
        driver.execute_script("""
            // Tìm img có icon-x64.png và click
            const icon = document.querySelector('img[src*="icon-x64.png"]');
            if (icon) {
                console.log('🎯 Tìm thấy icon extension, thử click...');
                
                // Tìm element cha có thể click
                let clickable = icon;
                for (let i = 0; i < 3; i++) {
                    clickable = clickable.parentElement;
                    if (!clickable) break;
                    
                    if (clickable.click || clickable.onclick) {
                        clickable.click();
                        console.log('✅ Đã click extension icon');
                        break;
                    }
                }
            } else {
                console.log('❌ Không tìm thấy icon extension');
            }
        """)
        
        time.sleep(2)
        return True
        
    except Exception as e:
        print(f"⚠️ Lỗi khi kích hoạt extension thủ công: {e}")
        return False

def find_and_click_captcha(driver, selector):
    """
    Tìm và nhấp vào captcha bằng selector cụ thể
    """
    print(f"Đang tìm captcha với selector: {selector}")
    
    try:
        # Chờ element có thể click và click
        captcha_element = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
        )
        print("Tìm thấy captcha! Đang nhấp vào...")
        captcha_element.click()
        
        # THÊM PHÍM TAB VẬT LÝ NGAY SAU KHI CLICK CAPTCHA
        actions = ActionChains(driver)
        actions.send_keys(Keys.TAB)
        actions.perform()
        time.sleep(1)
        actions = ActionChains(driver)
        actions.send_keys(Keys.TAB)
        actions.perform()
        time.sleep(1)
        actions = ActionChains(driver)
        actions.send_keys(Keys.ENTER)
        actions.perform()
        print("Đã nhấn phím Tab vật lý!")
        
        print("Đã nhấp vào captcha thành công!")
        return True
        
    except TimeoutException:
        print(f"Không tìm thấy captcha với selector: {selector} trong thời gian chờ")
        return False
    except Exception as e:
        print(f"Lỗi khi click captcha: {e}")
        return False

def check_and_click_continue_button(driver, timeout=30):
    """
    Kiểm tra và click vào nút tiếp tục với nhiều phương pháp linh hoạt
    """
    print("🔍 Đang kiểm tra nút 'Click vào đây để tiếp tục'...")
    
    # DANH SÁCH CÁC SELECTOR CÓ THỂ SỬ DỤNG
    selectors = [
        # Phương pháp 1: Theo class và text
        "//a[contains(@class, 'btn-success') and contains(text(), 'Click vào đây để tiếp tục')]",  
    ]
    
    for i, selector in enumerate(selectors, 1):
        try:
            print(f"🔧 Thử phương pháp {i}: {selector}")
            
            element = WebDriverWait(driver, timeout/len(selectors)).until(
                EC.element_to_be_clickable((By.XPATH, selector))
            )
            
            if element.is_displayed() and element.is_enabled():
                print(f"✅ Tìm thấy nút với phương pháp {i}!")
                
                # Scroll và click
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
                time.sleep(1)
                element.click()
                
                print("✅ Đã click vào nút tiếp tục thành công!")
                return True
                
        except TimeoutException:
            print(f"⏰ Không tìm thấy với phương pháp {i}")
            continue
        except Exception as e:
            print(f"⚠️ Lỗi với phương pháp {i}: {e}")
            continue
    
    print("❌ Không tìm thấy nút tiếp tục với bất kỳ phương pháp nào")
    return False
def handle_captcha_flow(driver, selector):
    """
    Xử lý toàn bộ quá trình captcha với selector duy nhất
    """
    # Chờ trang load hoàn tất
    time.sleep(3)
    
    # Tìm và click captcha
    success = find_and_click_captcha(driver, selector)
    
    if success:
        print("Xử lý captcha hoàn tất!")
        
        # Chờ kết quả sau khi click
        time.sleep(5)
        
        # BƯỚC MỚI: Kiểm tra và click nút "Click vào đây để tiếp tục"
        print("🎯 Kiểm tra nút tiếp tục sau captcha...")
        continue_success = check_and_click_continue_button(driver)
        
        if continue_success:
            print("🎉 Đã hoàn thành toàn bộ quy trình captcha và click tiếp tục!")
        else:
            print("⚠️ Captcha thành công nhưng không tìm thấy nút tiếp tục")
            
        return success and continue_success
    else:
        print("Không thể xử lý captcha")
        return False

def monitor_extension_progress(driver):
    """
    Giám sát tiến trình của extension
    """
    print("📊 Đang giám sát tiến trình extension...")
    
    try:
        # Kiểm tra URL hiện tại
        current_url = driver.current_url
        print(f"🌐 URL hiện tại: {current_url}")
        
        # Kiểm tra input fields
        inputs = driver.find_elements(By.TAG_NAME, 'input')
        print(f"📝 Số input fields trên trang: {len(inputs)}")
        
        for input_field in inputs:
            input_type = input_field.get_attribute('type')
            input_name = input_field.get_attribute('name')
            input_id = input_field.get_attribute('id')
            input_value = input_field.get_attribute('value')
            
            if input_value:
                print(f"  📦 Input {input_id or input_name}: '{input_value}'")
        
        # Kiểm tra xem có nút tiếp tục không
        continue_buttons = driver.find_elements(By.CSS_SELECTOR, 'a.btn.btn-success.get-link')
        print(f"🔗 Số nút tiếp tục tìm thấy: {len(continue_buttons)}")
        
    except Exception as e:
        print(f"⚠️ Không thể giám sát extension: {e}")

# =============================================
# MAIN CHƯƠNG TRÌNH
# =============================================

if __name__ == "__main__":
    link = "https://link4m.com/MbFIQPOL"
    
    # THAY THẾ SELECTOR Ở ĐÂY
    captcha_selector = "#recaptcha"  # Ví dụ: "#recaptcha" hoặc ".captcha-btn"
    
    try:
        # TẠO PROFILE VỚI PROXY TỰ ĐỘNG
        print("🔄 Đang tạo profile với proxy tự động...")
        profile_id = createProfileWithProxy()
        
        # Khởi động profile và kết nối Selenium
        print("Đang khởi động profile...")
        hwnd, debugPort = startProfile(profile_id)
        print(f"HWND: {hwnd}, Debug Port: {debugPort}")
        
        driver = connect_selenium_to_orbita(debugPort)
        print("Đã kết nối Selenium thành công!")
        
        # Truy cập link
        print(f"Đang truy cập: {link}")
        driver.get(link)
        
        # BƯỚC 1: KIỂM TRA EXTENSION ĐÃ LOAD CHƯA
        print("🔧 Kiểm tra extension...")
        extension_loaded = check_extension_loaded(driver)
        
        if not extension_loaded:
            print("🔄 Extension chưa load, thử kích hoạt thủ công...")
            trigger_extension_manually(driver)
        
        # BƯỚC 2: CHỜ EXTENSION HOÀN THÀNH
        print("🔄 Đang chờ extension hoàn thành công việc...")
        extension_completed = wait_for_extension_completion(driver, timeout=240)
        
        if extension_completed:
            print("🎉 Extension đã hoàn thành! Tiến hành xử lý captcha...")
            
            # Giám sát tiến trình cuối cùng
            monitor_extension_progress(driver)
            
            # BƯỚC 3: CHỈ XỬ LÝ CAPTCHA SAU KHI EXTENSION HOÀN THÀNH
            print("🎯 Bắt đầu xử lý captcha...")
            captcha_success = handle_captcha_flow(driver, captcha_selector)
            
            if captcha_success:
                print("✅ Toàn bộ quy trình hoàn thành thành công!")
            else:
                print("❌ Có lỗi trong quá trình xử lý captcha")
            
        else:
            print("⚠️ Extension không hoàn thành, kiểm tra trạng thái hiện tại...")
            monitor_extension_progress(driver)
            
            # Vẫn thử xử lý captcha nếu input đã có giá trị
            password_inputs = driver.find_elements(By.CSS_SELECTOR, 'input#password, input[name="password"]')
            for input_field in password_inputs:
                if input_field.get_attribute('value'):
                    print("✅ Phát hiện input đã có giá trị, vẫn xử lý captcha...")
                    captcha_success = handle_captcha_flow(driver, captcha_selector)
                    break
            else:
                print("❌ Không thể xử lý captcha vì extension không hoàn thành")
        
        # Giữ trình duyệt mở để kiểm tra
        print("Hoàn tất! Trình duyệt sẽ đóng sau 3 giây...")
        time.sleep(3)      
    except Exception as e:
        print(f"Lỗi trong quá trình thực thi: {e}")
        closeProfile(profile_id)
        time.sleep(2)
        deleteProfile(profile_id)
        print("Đã đóng trình duyệt và profile") 
    finally:
        # Dọn dẹp
        try:
            closeProfile(profile_id)
            time.sleep(2)
            deleteProfile(profile_id)
            print("Đã đóng trình duyệt và profile")
        except:
            pass 