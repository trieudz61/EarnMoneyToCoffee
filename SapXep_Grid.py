import pygetwindow as gw
import time
import math

class WindowArranger:
    def __init__(self):
        self.screen_width, self.screen_height = self.detect_screen_resolution()
        
    def detect_screen_resolution(self):
        """Phát hiện kích thước màn hình"""
        try:
            all_windows = gw.getAllWindows()
            max_width, max_height = 0, 0
            
            for window in all_windows:
                try:
                    if (window.width > max_width and window.height > max_height and
                        window.visible and not window.isMinimized):
                        max_width = window.width
                        max_height = window.height
                except:
                    continue
            
            if max_width >= 1024 and max_height >= 768:
                print(f"✅ Phát hiện màn hình: {max_width}×{max_height}")
                return max_width, max_height
            else:
                print("⚠️  Sử dụng kích thước mặc định 1920×1080")
                return 1920, 1080
                
        except Exception as e:
            print(f"❌ Lỗi phát hiện màn hình: {e}")
            return 1920, 1080
    
    def get_trieu_windows(self):
        """Chỉ lấy cửa sổ có chứa 'Trieu' trong tên"""
        windows = gw.getWindowsWithTitle('')
        trieu_windows = []
        
        for w in windows:
            try:
                if (w.visible and w.title and 
                    "Trieu" in w.title and  # CHỈ lấy cửa sổ có "Trieu"
                    not w.isMinimized and 
                    w.width > 200 and w.height > 200):
                    trieu_windows.append(w)
                    print(f"✅ Tìm thấy cửa sổ Trieu: {w.title}")
            except:
                continue
        
        return trieu_windows
    
    def calculate_optimal_layout(self, num_windows):
        """Tính layout tối ưu"""
        screen_ratio = self.screen_width / self.screen_height
        
        if num_windows == 1:
            return 1, 1
        elif num_windows == 2:
            return 2, 1
        elif num_windows == 3:
            if screen_ratio > 1.5:
                return 3, 1
            else:
                return 2, 2
        elif num_windows == 4:
            return 2, 2
        elif num_windows <= 6:
            return 3, 2
        elif num_windows <= 9:
            return 3, 3
        else:
            cols = math.ceil(math.sqrt(num_windows))
            rows = math.ceil(num_windows / cols)
            return cols, rows
    
    def arrange_trieu_windows(self):
        """Sắp xếp cửa sổ Trieu"""
        trieu_windows = self.get_trieu_windows()
        
        if not trieu_windows:
            print("❌ Không tìm thấy cửa sổ nào chứa 'Trieu'")
            return False
        
        num = len(trieu_windows)
        cols, rows = self.calculate_optimal_layout(num)
        
        print(f"🎯 Sắp xếp {num} cửa sổ Trieu trên màn hình {self.screen_width}×{self.screen_height}")
        print(f"📐 Layout: {cols}×{rows}")
        
        cell_w = self.screen_width // cols
        cell_h = self.screen_height // rows
        
        for i, win in enumerate(trieu_windows):
            col = i % cols
            row = i // cols
            
            x = col * cell_w
            y = row * cell_h
            
            width = cell_w if col < cols - 1 else self.screen_width - x
            height = cell_h if row < rows - 1 else self.screen_height - y
            
            try:
                if win.isMinimized:
                    win.restore()
                
                win.resizeTo(width, height)
                win.moveTo(x, y)
                print(f"✅ Đã sắp xếp: {win.title}")
                
            except Exception as e:
                print(f"❌ Lỗi với {win.title}: {e}")
        
        return True

# Phiên bản đơn giản
def simple_trieu_arrange():
    """Sắp xếp đơn giản chỉ cho cửa sổ Trieu"""
    windows = gw.getWindowsWithTitle('')
    trieu_windows = []
    
    for w in windows:
        try:
            if (w.visible and w.title and 
                "Trieu" in w.title and  # CHỈ lấy cửa sổ có "Trieu"
                not w.isMinimized and 
                w.width > 200 and w.height > 200):
                trieu_windows.append(w)
        except:
            continue
    
    if not trieu_windows:
        print("Không tìm thấy cửa sổ Trieu")
        return
    
    # Tự động phát hiện màn hình
    try:
        screen = gw.getAllWindows()[0]
        screen_width = screen.width
        screen_height = screen.height
    except:
        screen_width, screen_height = 1920, 1080
    
    num = len(trieu_windows)
    cols = math.ceil(math.sqrt(num))
    rows = math.ceil(num / cols)
    
    print(f"Sắp xếp {num} cửa sổ Trieu: {cols}×{rows}")
    
    cell_w = screen_width // cols
    cell_h = screen_height // rows
    
    for i, win in enumerate(trieu_windows):
        col = i % cols
        row = i // cols
        
        x = col * cell_w
        y = row * cell_h
        
        width = cell_w if col < cols - 1 else screen_width - x
        height = cell_h if row < rows - 1 else screen_height - y
        
        try:
            if win.isMinimized:
                win.restore()
            
            win.resizeTo(width, height)
            win.moveTo(x, y)
            print(f"Sắp xếp: {win.title}")
        except Exception as e:
            print(f"Lỗi: {e}")

# Chạy chương trình
def main():
    print("🔄 Tool sắp xếp cửa sổ TRIEU đang chạy...")
    print("📌 Chỉ sắp xếp cửa sổ có chứa 'Trieu' trong tên")
    print("📌 Nhấn Ctrl+C để dừng")
    print("=" * 50)
    
    # Sử dụng phiên bản class
    arranger = WindowArranger()
    
    try:
        while True:
            success = arranger.arrange_trieu_windows()
            if not success:
                print("⏳ Đang chờ cửa sổ Trieu...")
            print(f"⏳ Chờ 3 giây...")
            print("=" * 50)
            time.sleep(3)
            
    except KeyboardInterrupt:
        print("\n🛑 Đã dừng tool sắp xếp cửa sổ Trieu")

# Hoặc chạy phiên bản đơn giản
def main_simple():
    print("🚀 Bắt đầu sắp xếp cửa sổ Trieu...")
    while True:
        simple_trieu_arrange()
        time.sleep(3)

if __name__ == "__main__":
    main()  # Chạy phiên bản đầy đủ
    # main_simple()  # Hoặc chạy phiên bản đơn giản