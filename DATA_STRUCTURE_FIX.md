# Data Structure Fix

## 🔧 Vấn đề đã sửa:

### **Runeword.json Structure:**
```json
{
  "Nadir": {
    "name": "Nadir - Nef Tir",
    "types": ["Helms"],
    "option": [
      "+50% Enhanced Defense",
      "+10 Defense",
      "..."
    ],
    "level": "13"
  }
}
```

### **Wiki.json Structure:**
```json
{
  "crafting": {
    "text": "```Craft item sẽ nhận được các affix cố định...```"
  }
}
```

## ✅ Sửa đổi đã thực hiện:

### **1. commands/runeword.js:**

**Trước:**
```javascript
{ name: 'Runes', value: runeword.runes || 'N/A' }
{ name: 'Item Types', value: runeword.itemtypes || 'N/A' }
{ name: 'Required Level', value: runeword.rlvl?.toString() || 'N/A' }
runeword.properties.join('\n')
```

**Sau:**
```javascript
{ name: 'Runeword', value: runeword.name || 'N/A' }
{ name: 'Item Types', value: Array.isArray(runeword.types) ? runeword.types.join(', ') : (runeword.types || 'N/A') }
{ name: 'Required Level', value: runeword.level?.toString() || 'N/A' }
runeword.option.join('\n')
```

### **2. commands/wiki.js:**

**Trước:**
```javascript
.setDescription(wikiItem.description || 'Không có mô tả')
wikiItem.properties.join('\n')
```

**Sau:**
```javascript
// Xử lý text có thể là string hoặc array
if (wikiItem.text && Array.isArray(wikiItem.text)) {
  value: wikiItem.text.join('\n')
} else if (typeof wikiItem.text === 'string') {
  value: wikiItem.text
} else {
  embed.setDescription('Không có thông tin chi tiết')
}
```

## 🎯 Kết quả:

### **Runeword Command (`/rw`):**
- ✅ Hiển thị đúng tên runeword (ví dụ: "Nadir - Nef Tir")
- ✅ Hiển thị đúng item types (ví dụ: "Helms")
- ✅ Hiển thị đúng required level (ví dụ: "13")
- ✅ Hiển thị đúng properties từ array `option`

### **Wiki Command (`/wiki`):**
- ✅ Hiển thị đúng title
- ✅ Xử lý được cả text dạng string và array
- ✅ Fallback message khi không có data

## 📋 Test Commands:

```
/rw Nadir          # Sẽ hiển thị "Nadir - Nef Tir" với properties
/wiki crafting     # Sẽ hiển thị thông tin crafting
/wiki ias          # Sẽ hiển thị thông tin IAS
```

## 🔍 Data Mapping:

| JSON Field | Display Field | Type | Handler |
|------------|---------------|------|---------|
| `runeword.name` | Runeword | string | Direct display |
| `runeword.types` | Item Types | array | Join with ', ' |
| `runeword.level` | Required Level | string | Convert to string |
| `runeword.option` | Properties | array | Join with '\n' |
| `wikiItem.text` | Information | string/array | Smart handling |

## ✅ Status:

- ✅ Runeword command fixed
- ✅ Wiki command fixed  
- ✅ Data structure mapping corrected
- ✅ Error handling improved
- ✅ Ready for testing
