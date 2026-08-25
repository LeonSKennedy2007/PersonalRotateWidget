# Rotating Discord Widget — Mixed Mode (Shuffle / Sequential)

Discord profile widget แบบ 5 ช่อง แต่ละช่องมี **รูป + ชื่อ + คำอธิบาย** เป็นของตัวเอง ไม่เกี่ยวข้องกับช่องอื่นเลย และ**เลือกโหมดหมุนเวียนได้เองต่อช่อง**:

- **`shuffle`** — สุ่มลำดับ ไม่ซ้ำตัวเดิมจนกว่าจะครบทุกตัวในลิสต์ก่อน แล้วค่อยสุ่มรอบใหม่
- **`sequential`** — เรียงตามลำดับที่พิมพ์ไว้ตรงๆ วนกลับไปตัวแรกเมื่อครบ

หมุนเวียนเปลี่ยนทุก 6 ชั่วโมงอัตโนมัติผ่าน GitHub Actions ไม่ต้องเปิดเครื่องตัวเองทิ้งไว้ ไม่ได้ดึงข้อมูลจากเกมหรือ API ภายนอกใดๆ — ทุกอย่างเป็นข้อมูลที่ตั้งเองทั้งหมด

## หลักการทำงาน

### 1. ไม่มี state เก็บไว้ที่ไหนเลย — คำนวณจากเวลาปัจจุบันล้วนๆ

```javascript
const block = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
```

`block` คือ "ช่วงเวลาที่เท่าไหร่" นับตั้งแต่ปี 1970 แบ่งเป็นก้อนละ 6 ชม. เปลี่ยนค่าทุก 6 ชม.พอดี คำนวณจากเวลาจริงล้วนๆ ไม่ต้องมี database หรือไฟล์ state — รันซ้ำกี่ครั้งในช่วง 6 ชม.เดียวกันก็ได้ผลลัพธ์เดิมเสมอ

### 2. แต่ละช่อง (slot) มีลิสต์และโหมดของตัวเอง หมุนอิสระจากช่องอื่น

```javascript
const cycle = Math.floor(block / list.length);   // รอบที่เท่าไหร่ (ครบ 1 รอบ = ผ่านครบทุกตัวในลิสต์นี้)
const position = block % list.length;             // ตำแหน่งภายในรอบนี้
```

เพราะแต่ละช่องมี array แยกกันเองตั้งแต่ต้น การหมุนของช่องหนึ่งจึงไม่มีทางไปกระทบหรือซ้ำกับช่องอื่นได้เลย

### 3. โหมด `sequential` — เรียงตรงๆ

```javascript
if (mode === "sequential") {
    return list[position];
}
```

หยิบตาม index ตรงๆ จากลิสต์ที่พิมพ์ไว้ ไม่มีการสุ่มใดๆ เลย

### 4. โหมด `shuffle` — สับไพ่แบบมีสูตร (seeded shuffle)

```javascript
const seed = cycle * 1000003 + slotIdx * 97;
const shuffled = seededShuffle(list, seed);
return shuffled[position];
```

ใช้ตัวสุ่มแบบมีสูตรตายตัว (`mulberry32`) สร้าง seed จาก **เลขรอบ (cycle)** + **หมายเลขช่อง (slotIdx)** แล้วสับลำดับทั้งลิสต์ (Fisher-Yates shuffle) — คงลำดับเดิมไว้ตลอดทั้งรอบ พอครบทุกตำแหน่งในรอบ (เท่ากับครบทุกตัวไม่ซ้ำกันเลย) `cycle` จะเปลี่ยน → สับลำดับใหม่อัตโนมัติ

**สิ่งที่การันตีได้เสมอ ไม่ว่าช่องนั้นจะใช้โหมดไหน:**
- ชื่อ, คำอธิบาย, รูป ของตัวละครหนึ่งตัวติดกันเป็นก้อนเดียวเสมอ (เลือก "ทั้งการ์ด" ไม่ได้แยกเลือกแต่ละ field)
- ช่อง `shuffle` ไม่มีทางซ้ำตัวเดิมภายใน 1 รอบ
- ช่อง `sequential` เรียงตามลำดับที่ตั้งไว้เป๊ะทุกครั้ง ไม่มีสุ่มปน

### 5. ถ้าปิด workflow ชั่วคราวแล้วเปิดใหม่

ระบบไม่ได้ "หยุดค้าง" รอ แล้วมาต่อจากจุดเดิม เพราะคำนวณจากเวลาปัจจุบันจริงทุกครั้ง ตัวที่ควรได้คิวในช่วงที่ปิดอยู่จะถูก**ข้ามไปเงียบๆ** (ไม่ error) พอเปิดกลับมาระบบจะกระโดดไปคำนวณตำแหน่งปัจจุบันตามเวลาจริงทันที

## Setup

### ส่วนที่ 1 — Discord Application + Widget

1. ไปที่ [discord.com/developers/applications](https://discord.com/developers/applications) กด `Ctrl+Shift+I` → Console (พิมพ์ `allow pasting` ถ้าถูกถาม)
2. วางสคริปต์จาก [aamiaa's WidgetCreator gist](https://gist.github.com/aamiaa/7cdd590e3949cd654758bc90bcb4710b) แล้ว Enter — จะสร้างแอปพลิเคชัน, widget, และเพิ่มเข้าโปรไฟล์ให้อัตโนมัติ พร้อมก็อปคำสั่งไว้ที่คลิปบอร์ด เอาไปรันในเทอร์มินัลอีกที
3. จด **Application ID** (General Information) และ **Bot Token** (Bot tab → Reset Token) ไว้
4. เอา **Discord User ID**: Settings → Advanced → เปิด Developer Mode → คลิกขวาชื่อตัวเอง → Copy User ID

### ส่วนที่ 2 — Deploy ขึ้น GitHub

1. สร้าง repo ใหม่ อัปโหลดไฟล์ทั้งหมดในโปรเจกต์นี้ (ตรวจสอบว่ามี `.github/workflows/update.yml` อยู่ในตำแหน่งที่ถูกต้อง)
2. **Settings → Secrets and variables → Actions** เพิ่ม 3 secret:

   | Secret | ค่า |
   |---|---|
   | `DISCORD_CLIENT_ID` | Application ID |
   | `DISCORD_USER_ID` | Discord User ID ของคุณ |
   | `DISCORD_BOT_TOKEN` | Bot Token |

3. แท็บ **Actions** → เลือก workflow "Update Rotating Discord Widget" → **Run workflow** รันครั้งแรก (การรันครั้งแรกเป็นตัวจดทะเบียนชื่อ field ให้ Discord รู้จักด้วย)

### ส่วนที่ 3 — ผูก field ใน Widget Editor

กลับไปหน้า Widget Editor (Application → Games → Widget) ตั้ง Value Type เป็น **User Data** แล้วพิมพ์ชื่อ field ตามตาราง (ตัวพิมพ์เล็ก-ใหญ่ต้องตรงเป๊ะ) — รวมทั้งหมด 15 field (5 ช่อง × 3 field):

| ช่อง | field รูป | field ชื่อ | field คำอธิบาย |
|---|---|---|---|
| ช่องที่ 1 | `slot1_image` | `slot1_name` | `slot1_desc` |
| ช่องที่ 2 | `slot2_image` | `slot2_name` | `slot2_desc` |
| ช่องที่ 3 | `slot3_image` | `slot3_name` | `slot3_desc` |
| ช่องที่ 4 | `slot4_image` | `slot4_name` | `slot4_desc` |
| ช่องที่ 5 | `slot5_image` | `slot5_name` | `slot5_desc` |

## การแก้ไข/เพิ่มรายการ

เปิดไฟล์ `widget.js` แก้ในตัวแปร `SLOTS` — เป็น array ของ object ที่มี `mode` และ `entries`:

```javascript
const SLOTS = [
    {
        mode: "shuffle",       // หรือ "sequential"
        entries: [
            { name: "...", description: "...", image: "https://..." },
            { name: "...", description: "...", image: "https://..." },
            // ใส่กี่รายการก็ได้ ไม่จำกัด
        ],
    },
    // ช่องถัดไปเพิ่มในรูปแบบเดียวกัน
];
```

**กฎที่ต้องรู้:**
- แต่ละช่องต้องมี**อย่างน้อย 1 รายการ** ใน `entries` ไม่งั้น script จะ error ตั้งแต่ต้น
- ใส่จำนวนรายการต่อช่องได้**ไม่จำกัด** เพราะแต่ละรอบส่งแค่ 1 ตัวต่อช่องขึ้น Discord — แต่ยิ่งใส่เยอะ ยิ่งวนกลับมาโชว์ตัวเดิมช้าลง (จำนวนตัว × 6 ชม. = เวลาที่วนครบ 1 รอบ)
- `image` ต้องเป็น**ลิงก์ตรงถึงไฟล์รูป** (raw link) ไม่ใช่ลิงก์หน้าเว็บ — GIF บางเว็บ (เช่น Tenor) อาจใช้ไม่ได้เพราะ hotlink/redirect protection แนะนำใช้ Giphy หรือโฮสต์ผ่าน GitHub/Imgur แทน
- แก้เสร็จ commit ขึ้น GitHub ระบบหมุนเวียนอัตโนมัติทุก 6 ชม.

## ปรับความถี่การหมุนเวียน

ถ้าอยากเปลี่ยนจาก 6 ชม. เป็นค่าอื่น ต้องแก้ **2 จุดให้ตรงกัน**:

1. `widget.js`: `const SIX_HOURS_MS = 6 * 60 * 60 * 1000;`
2. `.github/workflows/update.yml`: `cron: "0 */6 * * *"`

## ปรับจำนวนช่อง

เพิ่ม/ลบ object ใน `SLOTS` ได้ตามต้องการ ระบบจะสร้าง field `slot1_...` ถึง `slotN_...` ตามจำนวนช่องที่มีอัตโนมัติ (แต่ต้องไปเพิ่ม/ลบ field ในหน้า Widget Editor ให้ตรงกันเองด้วย และรวมทั้งหมดห้ามเกิน 30 field ตามลิมิตของ Discord — ที่ 5 ช่องตอนนี้ใช้ไป 15 field ยังเหลือพื้นที่อีกเยอะ)

## Troubleshooting

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| Run fails: `ช่องที่ N ไม่มีรายการเลย` | `entries` ของช่องนั้นว่างเปล่า ใส่อย่างน้อย 1 รายการ |
| Run fails: `Invalid Form Body (50035)` | field ทั้งหมดใน 1 รอบเกิน 30 รายการ — ลดจำนวนช่อง หรือลด field ต่อช่อง |
| Widget โชว์ placeholder/fallback บางช่อง | ชื่อ field ใน editor สะกดไม่ตรงกับใน `widget.js` (ตัวพิมพ์เล็ก-ใหญ่มีผล) |
| รูปไม่ขึ้น (โดยเฉพาะ GIF) | ลิงก์ `image` ไม่ใช่ลิงก์ตรงถึงไฟล์รูป, เว็บที่ฝากรูปบล็อก hotlink, หรือไฟล์ใหญ่เกินไป — ลองใช้ Giphy หรือรูปนิ่ง PNG/JPG แทน |
| Widget ค้าง ไม่อัปเดต | Discord client cache ไว้ กด Ctrl+R รีเฟรช |
| ช่องที่ตั้ง `sequential` ดันดูเหมือนสุ่ม | เช็ค `mode` ของช่องนั้นใน `SLOTS` ว่าพิมพ์ว่า `"sequential"` ถูกต้อง (พิมพ์ผิดหรือใส่ค่าอื่นจะถูกปฏิบัติเป็น `shuffle` โดยอัตโนมัติ) |

## หมายเหตุก่อนเผยแพร่ repo แบบสาธารณะ

- **อย่า commit ไฟล์ `.env`** ที่มีค่า token จริงขึ้น repo เด็ดขาด (มี `.gitignore` กันไว้ให้แล้ว แต่ควรเช็คซ้ำก่อน push)
- Secret ทั้ง 3 ตัว (`DISCORD_CLIENT_ID`, `DISCORD_USER_ID`, `DISCORD_BOT_TOKEN`) ต้องอยู่ใน GitHub Secrets เท่านั้น ไม่ควรฝังไว้ในโค้ดตรงๆ
- ถ้า Bot Token หลุด สามารถกด Reset Token ในหน้า Discord Developer Portal เพื่อยกเลิกของเก่าทันที
