const fs = require('fs');

// Đọc file weaponfix.json (hoặc sample nếu file gốc rỗng)
let filename = '../data/weaponfix.json';
let content = fs.readFileSync(filename, 'utf8');

if (content.trim() === '') {
  console.log('File weaponfix.json rỗng, tạo file mẫu để test...');

  // Tạo file mẫu với các trường hợp khác nhau
  const sampleData = [
    {
      "name": "Hand Axe",
      "code": "hax",
      "min": "3",
      "max": "6",
      "speed": "0",
      "StrBonus": "100",
      "DexBonus": "0",
      "levelreq": "0"
    },
    {
      "name": "Axe",
      "code": "axe",
      "mindam": "4",
      "maxdam": "11",
      "1or2handed": "",
      "2handed": "",
      "2handmindam": "",
      "2handmaxdam": "",
      "minmisdam": "",
      "maxmisdam": "",
      "speed": "10",
      "StrBonus": "100",
      "DexBonus": "",
      "reqstr": "32",
      "reqdex": "0",
      "levelreq": "0"
    },
    {
      "name": "Large Axe",
      "code": "lax",
      "mindam": "",
      "maxdam": "",
      "1or2handed": "",
      "2handed": "1",
      "2handmindam": "6",
      "2handmaxdam": "13",
      "minmisdam": "",
      "maxmisdam": "",
      "speed": "-10",
      "StrBonus": "110",
      "DexBonus": "",
      "reqstr": "35",
      "reqdex": "",
      "levelreq": "0"
    },
    {
      "name": "Throwing Knife",
      "code": "tkf",
      "mindam": "2",
      "maxdam": "3",
      "1or2handed": "",
      "2handed": "",
      "2handmindam": "",
      "2handmaxdam": "",
      "minmisdam": "4",
      "maxmisdam": "5",
      "speed": "",
      "StrBonus": "75",
      "DexBonus": "75",
      "reqstr": "",
      "reqdex": "",
      "levelreq": "0"
    },
    {
      "name": "Harpoon",
      "code": "har",
      "mindam": "8",
      "maxdam": "13",
      "1or2handed": "",
      "2handed": "1",
      "2handmindam": "10",
      "2handmaxdam": "15",
      "minmisdam": "6",
      "maxmisdam": "11",
      "speed": "-10",
      "StrBonus": "75",
      "DexBonus": "75",
      "reqstr": "54",
      "reqdex": "35",
      "levelreq": "0"
    }
  ];

  fs.writeFileSync('../data/weaponfix_sample.json', JSON.stringify(sampleData, null, 2));
  filename = '../data/weaponfix_sample.json';
  content = fs.readFileSync(filename, 'utf8');
}

const data = JSON.parse(content);

console.log(`Đang xử lý ${data.length} weapons từ ${filename}...`);

const fixedWeapons = [];

data.forEach((weapon, index) => {
  // Tạo object cơ bản từ object đầu tiên
  const baseWeapon = {
    name: weapon.name || "",
    code: weapon.code || "",
    min: "0",
    max: "0",
    speed: weapon.speed || "0",
    StrBonus: weapon.StrBonus || "0",
    DexBonus: weapon.DexBonus || "0",
    reqstr: weapon.reqstr || "0",
    reqdex: weapon.reqdex || "0",
    levelreq: weapon.levelreq || "0"
  };

  // Xử lý các trường rỗng thành "0"
  Object.keys(baseWeapon).forEach(key => {
    if (baseWeapon[key] === "" || baseWeapon[key] === null || baseWeapon[key] === undefined) {
      baseWeapon[key] = "0";
    }
  });

  // Kiểm tra các loại damage và thuộc tính
  const hasBasicMinMax = weapon.min && weapon.max && weapon.min !== "" && weapon.max !== "";
  const hasMinMaxDam = weapon.mindam && weapon.maxdam && weapon.mindam !== "" && weapon.maxdam !== "";
  const has2HandDam = weapon["2handmin"] && weapon["2handmax"] && weapon["2handmin"] !== "" && weapon["2handmax"] !== "";
  const hasMissileDam = weapon.minmisdam && weapon.maxmisdam && weapon.minmisdam !== "" && weapon.maxmisdam !== "";
  const is2Handed = weapon["2handed"] === "1";

  // Xử lý weapon theo logic mới
  let mainWeaponAdded = false;

  // 1. Nếu có min/max cơ bản, sử dụng nó làm main weapon
  if (hasBasicMinMax) {
    baseWeapon.min = weapon.min;
    baseWeapon.max = weapon.max;
    fixedWeapons.push(baseWeapon);
    mainWeaponAdded = true;
  }
  // 2. Nếu có mindam/maxdam, sử dụng làm main weapon
  else if (hasMinMaxDam) {
    baseWeapon.min = weapon.mindam;
    baseWeapon.max = weapon.maxdam;
    fixedWeapons.push(baseWeapon);
    mainWeaponAdded = true;
  }
  // 3. Nếu là 2handed weapon và min/max rỗng nhưng có 2handmin/2handmax
  else if (is2Handed && has2HandDam) {
    baseWeapon.min = weapon["2handmin"];
    baseWeapon.max = weapon["2handmax"];
    fixedWeapons.push(baseWeapon);
    mainWeaponAdded = true;
  }

  // 4. Xử lý 2hand damage (nếu không phải main weapon)
  if (has2HandDam && (!is2Handed || (is2Handed && (hasBasicMinMax || hasMinMaxDam)))) {
    const twoHandWeapon = { ...baseWeapon };
    twoHandWeapon.name = weapon.name + " (2hand)";
    twoHandWeapon.min = weapon["2handmin"];
    twoHandWeapon.max = weapon["2handmax"];
    fixedWeapons.push(twoHandWeapon);
  }

  // 5. Xử lý missile/throw damage
  if (hasMissileDam) {
    const throwWeapon = { ...baseWeapon };
    throwWeapon.name = weapon.name + " (throw)";
    throwWeapon.min = weapon.minmisdam;
    throwWeapon.max = weapon.maxmisdam;
    fixedWeapons.push(throwWeapon);
  }

  // 6. Nếu không có damage nào, vẫn thêm object cơ bản
  if (!mainWeaponAdded) {
    fixedWeapons.push(baseWeapon);
  }

  // Log progress
  if ((index + 1) % 500 === 0) {
    console.log(`Đã xử lý ${index + 1}/${data.length} weapons...`);
  }
});

console.log(`Hoàn thành! Tạo ra ${fixedWeapons.length} weapons từ ${data.length} weapons gốc`);

// Ghi file mới
fs.writeFileSync('../data/weapon_fixed.json', JSON.stringify(fixedWeapons, null, 2));
console.log('Đã lưu vào ../data/weapon_fixed.json');

// Thống kê
const stats = {
  total: fixedWeapons.length,
  twohand: fixedWeapons.filter(w => w.name.includes('(2hand)')).length,
  throw: fixedWeapons.filter(w => w.name.includes('(throw)')).length,
  normal: fixedWeapons.filter(w => !w.name.includes('(') && !w.name.includes(')')).length
};

console.log('\nThống kê:');
console.log(`- Tổng cộng: ${stats.total}`);
console.log(`- Normal: ${stats.normal}`);
console.log(`- 2Hand: ${stats.twohand}`);
console.log(`- Throw: ${stats.throw}`);

// Hiển thị một vài ví dụ
console.log('\nVí dụ weapons:');
fixedWeapons.slice(0, 5).forEach(w => {
  console.log(`${w.name}: ${w.min}-${w.max} damage`);
});
