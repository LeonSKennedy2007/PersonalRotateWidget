# Rotating Discord Widget — 4 Independent Slots

Discord profile widget แบบ 4 ช่อง แต่ละช่องมี **ลิสต์ของตัวเอง** (รูป + ชื่อ + description) ไม่เกี่ยวข้องกับช่องอื่นเลย แต่ละช่องหมุนเวียนตามลิสต์ของตัวเองอิสระ ทุก 6 ชั่วโมง

## หลักการทำงาน

```javascript
const block = Math.floor(Date.now() / (6 * 60 * 60 * 1000));

// แต่ละช่อง (slot) คำนวณ index ของตัวเอง จากลิสต์ของตัวเอง
const index = block % SLOTS[slotIdx].length;
```

- `block` เปลี่ยนค่าทุก 6 ชม. (คำนวณจากเวลาปัจจุบัน ไม่ต้องมี state เก็บที่ไหน)
- **แต่ละช่อง mod ด้วยความยาวลิสต์ของตัวเอง** ไม่ใช่ลิสต์รวม → ช่อง 1 หมุนตามจังหวะของช่อง 1, ช่อง 2 หมุนตามจังหวะของช่อง 2 อย่างเป็นอิสระต่อกัน
- เพราะแต่ละช่องมีลิสต์แยกกันเองตั้งแต่ต้น (คุณเป็นคนกำหนดว่าใครอยู่ช่องไหน) **จึงไม่มีทางที่ตัวละครจากช่องหนึ่งไปโผล่ในอีกช่องได้เลย** ไม่ต้องมีโค้ดพิเศษมาป้องกันซ้ำข้ามช่อง เพราะโครงสร้างข้อมูลกันไว้ให้เองอยู่แล้ว

ตัวอย่างถ้าช่อง 1 มี 5 ตัว (A,B,C,D,E) และช่อง 2 มี 5 ตัวเหมือนกัน (F,G,H,I,J):

| ช่วงเวลา | ช่องที่ 1 | ช่องที่ 2 |
|---|---|---|
| block 0 | A | F |
| block 1 | B | G |
| block 2 | C | H |
| block 3 | D | I |
| block 4 | E | J |
| block 5 | A (วนกลับ) | F (วนกลับ) |

ถ้าแต่ละช่องมีจำนวนรายการไม่เท่ากัน (เช่นช่อง 1 มี 5 ตัว ช่อง 2 มี 3 ตัว) ก็ไม่มีปัญหา — แต่ละช่องจะวนครบรอบของตัวเองในจังหวะที่ต่างกัน (ช่อง 2 จะวนกลับมาไวกว่าช่อง 1) ซึ่งเป็นเรื่องปกติของการหมุนแบบอิสระ

## Setup

### ส่วนที่ 1 — Discord Application + Widget

ใช้ขั้นตอนเดิม (สคริปต์ของ aamiaa ผ่าน DevTools console ในหน้า `discord.com/developers/applications`) เพื่อได้ **Application ID**, **Bot Token**, **Discord User ID**

### ส่วนที่ 2 — Deploy ขึ้น GitHub

1. สร้าง repo ใหม่ (private) อัปโหลดไฟล์ทั้งหมดในโปรเจกต์นี้
2. **Settings → Secrets and variables → Actions** เพิ่ม 3 secret:

   | Secret | ค่า |
   |---|---|
   | `DISCORD_CLIENT_ID` | Application ID |
   | `DISCORD_USER_ID` | Discord User ID ของคุณ |
   | `DISCORD_BOT_TOKEN` | Bot Token |

3. แท็บ **Actions** → เลือก workflow "Update Rotating Discord Widget" → **Run workflow** รันครั้งแรก

### ส่วนที่ 3 — ผูก field ใน Widget Editor

ตั้ง Value Type เป็น **User Data** พิมพ์ชื่อ field ตามตาราง (ตัวพิมพ์เล็ก-ใหญ่ต้องตรง) — รวม 12 field:

| ช่อง | field รูป | field ชื่อ | field description |
|---|---|---|---|
| ช่องที่ 1 | `slot1_image` | `slot1_name` | `slot1_desc` |
| ช่องที่ 2 | `slot2_image` | `slot2_name` | `slot2_desc` |
| ช่องที่ 3 | `slot3_image` | `slot3_name` | `slot3_desc` |
| ช่องที่ 4 | `slot4_image` | `slot4_name` | `slot4_desc` |

## การแก้ไข/เพิ่มรายการ

เปิดไฟล์ `widget.js` แก้ในตัวแปร `SLOTS` — เป็น array ของ 4 array ย่อย (หนึ่งอันต่อหนึ่งช่อง):

```javascript
const SLOTS = [
    // ---- ช่องที่ 1 ----
    [
        { name: "...", description: "...", image: "https://..." },
        { name: "...", description: "...", image: "https://..." },
        // ใส่กี่ตัวก็ได้ ไม่จำกัดแค่ 5
    ],
    // ---- ช่องที่ 2 ----
    [ ... ],
    // ---- ช่องที่ 3 ----
    [ ... ],
    // ---- ช่องที่ 4 ----
    [ ... ],
];
```

- แต่ละช่องต้องมี**อย่างน้อย 1 รายการ** ไม่งั้น script จะ error ตั้งแต่ต้น
- `image` ต้องเป็นลิงก์ตรงถึงไฟล์รูป (raw link) ไม่ใช่ลิงก์หน้าเว็บ
- แก้เสร็จ commit ขึ้น GitHub ระบบหมุนเวียนอัตโนมัติทุก 6 ชม.

## ปรับความถี่การหมุนเวียน

แก้ **2 จุดให้ตรงกัน**:
1. `widget.js`: `const SIX_HOURS_MS = 6 * 60 * 60 * 1000;`
2. `.github/workflows/update.yml`: `cron: "0 */6 * * *"`

## Troubleshooting

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| Run fails: `ช่องที่ N ไม่มีรายการเลย` | ลิสต์ของช่องนั้นใน `SLOTS` ว่างเปล่า ใส่อย่างน้อย 1 รายการ |
| Widget โชว์ placeholder/fallback บางช่อง | ชื่อ field ใน editor สะกดไม่ตรงกับใน `widget.js` |
| รูปไม่ขึ้น | ลิงก์ `image` ไม่ใช่ลิงก์ตรงถึงไฟล์รูป หรือเว็บที่ฝากรูปบล็อก hotlink |
| Widget ค้าง ไม่อัปเดต | Discord client cache ไว้ กด Ctrl+R รีเฟรช |
