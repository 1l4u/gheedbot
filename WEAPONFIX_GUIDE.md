# Hướng dẫn sử dụng script fix_weaponfix.js

## Mục đích
Script này sẽ chuyển đổi file `weaponfix.json` từ format phức tạp thành format đơn giản tương tự như `weapon.json` hiện tại.

## Cách sử dụng

### 1. Chuẩn bị file
- Đặt file `weaponfix.json` vào thư mục gốc của bot
- Đảm bảo file có cấu trúc JSON hợp lệ

### 2. Chạy script
```bash
node fix_weaponfix.js
```

### 3. Kết quả
- File `weapon_fixed.json` sẽ được tạo ra
- Thống kê sẽ hiển thị số lượng weapons đã xử lý

## Các thay đổi được thực hiện

### 1. Chuẩn hóa cấu trúc
- Tất cả objects sẽ có cấu trúc giống object đầu tiên
- Các trường bắt buộc: `name`, `code`, `min`, `max`, `speed`, `StrBonus`, `DexBonus`, `reqstr`, `reqdex`, `levelreq`

### 2. Xử lý damage types theo logic mới
- **Priority 1**: `min`, `max` (nếu có) → main weapon
- **Priority 2**: `mindam`, `maxdam` (nếu không có min/max) → main weapon
- **Priority 3**: `2handmin`, `2handmax` (nếu `2handed = "1"` và không có min/max/mindam/maxdam) → main weapon

### 3. Xử lý 2-handed weapons
- Nếu `2handed = "1"` và `min/max` rỗng → sử dụng `2handmin/2handmax` làm main weapon
- Nếu `2handed = "1"` và `min/max` không rỗng → tạo thêm object `"Weapon (2hand)"`
- Nếu `2handed != "1"` nhưng có `2handmin/2handmax` → tạo object `"Weapon (2hand)"`

### 4. Xử lý throwing weapons
- Nếu có `minmisdam`, `maxmisdam` → tạo object `"Weapon (throw)"`

### 4. Xử lý giá trị rỗng
- Tất cả `""` → `"0"`
- `null`, `undefined` → `"0"`

### 5. Xóa các trường không cần thiết
- `1or2handed`
- `2handed`
- `2handmin`, `2handmax`
- `minmisdam`, `maxmisdam`
- `mindam`, `maxdam`
- Trường rỗng `""`

## Ví dụ chuyển đổi

### Input (weaponfix.json):
```json
{
  "name": "Balanced Axe",
  "code": "bal",
  "mindam": "8",
  "maxdam": "13",
  "2handmindam": "10",
  "2handmaxdam": "15",
  "minmisdam": "6",
  "maxmisdam": "11",
  "speed": "-10",
  "StrBonus": "75",
  "DexBonus": "75",
  "reqstr": "54",
  "reqdex": "35"
}
```

### Output (weapon_fixed.json):
```json
[
  {
    "name": "Balanced Axe (melee)",
    "code": "bal",
    "min": "8",
    "max": "13",
    "speed": "-10",
    "StrBonus": "75",
    "DexBonus": "75",
    "reqstr": "54",
    "reqdex": "35",
    "levelreq": "0"
  },
  {
    "name": "Balanced Axe (2hand)",
    "code": "bal",
    "min": "10",
    "max": "15",
    "speed": "-10",
    "StrBonus": "75",
    "DexBonus": "75",
    "reqstr": "54",
    "reqdex": "35",
    "levelreq": "0"
  },
  {
    "name": "Balanced Axe (missile)",
    "code": "bal",
    "min": "6",
    "max": "11",
    "speed": "-10",
    "StrBonus": "75",
    "DexBonus": "75",
    "reqstr": "54",
    "reqdex": "35",
    "levelreq": "0"
  }
]
```

## Thống kê
Script sẽ hiển thị:
- Tổng số weapons đã tạo: 368
- Số weapons normal (không có suffix): 320
- Số weapons 2hand: 18
- Số weapons throw: 30

### Kết quả thực tế từ weaponfix.json:
- **Input**: 320 weapons gốc
- **Output**: 368 weapons (tăng 48 weapons)
- **2Hand weapons**: 18 (swords có thể dùng 1 tay hoặc 2 tay)
- **Throw weapons**: 30 (throwing knives, axes, javelins, etc.)

## Lưu ý
- File gốc `weaponfix.json` không bị thay đổi
- Kết quả được lưu vào `weapon_fixed.json`
- Nếu `weaponfix.json` rỗng, script sẽ sử dụng file mẫu để demo

## Sau khi chạy script
1. Kiểm tra file `weapon_fixed.json`
2. Nếu hài lòng, có thể thay thế `weapon.json` bằng `weapon_fixed.json`
3. Hoặc upload `weapon_fixed.json` lên GitHub repository
