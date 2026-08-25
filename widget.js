if (process.env.GITHUB_ACTIONS !== "true") {
    require("dotenv").config();
}
const axios = require("axios");

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// ============================================================
// 5 ช่อง แต่ละช่องมีลิสต์ของตัวเอง ไม่เกี่ยวข้องกับช่องอื่น
// แต่ละช่องเลือกโหมดหมุนเวียนได้เอง ผ่าน "mode":
//   "shuffle"    = สุ่มลำดับ ไม่ซ้ำตัวเดิมจนกว่าจะครบทุกตัวในลิสต์ แล้วค่อยสุ่มรอบใหม่
//   "sequential" = เรียงตามลำดับที่พิมพ์ไว้ใน entries เป๊ะๆ วนกลับไปตัวแรกเมื่อครบ
// (จำนวนรายการต่อช่องใส่เท่าไหร่ก็ได้ ไม่จำเป็นต้องเท่ากันทุกช่อง)
// ============================================================
const SLOTS = [
    // ---- ช่องที่ 1 (สุ่ม) ----
    {
        mode: "shuffle",
        entries: [
            { name: "Lumine", description: "Traveler from another world", image: "https://example.com/images/lumine.png" },
            { name: "Paimon", description: "...", image: "https://example.com/images/paimon.png" },
            { name: "Furina", description: "...", image: "https://example.com/images/furina.png" },
            { name: "Nahida", description: "...", image: "https://example.com/images/nahida.png" },
            { name: "Venti", description: "...", image: "https://example.com/images/venti.png" },
        ],
    },
    // ---- ช่องที่ 2 (เรียงตามลำดับ) ----
    {
        mode: "sequential",
        entries: [
            { name: "𝜗𝜚 ࣪˖ ִ𐙚 ​​​Eʟʏꜱɪᴀ​​ ۫ ꣑ৎ˚𑣲 ۫˖", description: '"Thank you for being in the dream with me GN𖹭."', image: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTdxeHd5a2xwNXAwNWJwNWpnNGZ2aGFwaHNmYjA1bXE4M2I4NHRjeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SYhq0nt6QTYzORNSRO/giphy.gif" },
            { name: "𝜗𝜚 ࣪˖ ִ𐙚 ​​​Cʏʀᴇɴᴇ​​ ۫ ꣑ৎ˚𑣲 ۫˖", description: '"This will be a romantic story like no other. right?', image: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTFjdjhrYWhoeTJhcmplZGU0MzYwNWN3cGRjNmw4cHlobXNjY2s3MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hFB9LJYeUoKzfmc2LZ/giphy.gif" },
            { name: "𝜗𝜚 ࣪˖ ִ𐙚 ​A​​🇪​​🇲​​🇪🇦​​🇹​​🇭​​ ۫ ꣑ৎ˚𑣲 ۫˖", description: '"All I want... is for you to live safe and happy."', image: "blob:https://tools.kommodo.ai/81ac67bf-fca3-40d2-a48f-552b438f78db" },
        ],
    },
    // ---- ช่องที่ 3 (สุ่ม) ----
    {
        mode: "shuffle",
        entries: [
            { name: "Cha Eun-Woo", description: "Favorite actor", image: "https://example.com/images/cha-eun-woo.png" },
            { name: "Character 2", description: "...", image: "https://example.com/images/character-2.png" },
            { name: "Character 3", description: "...", image: "https://example.com/images/character-3.png" },
            { name: "Character 4", description: "...", image: "https://example.com/images/character-4.png" },
            { name: "Character 5", description: "...", image: "https://example.com/images/character-5.png" },
        ],
    },
    // ---- ช่องที่ 4 (เรียงตามลำดับ) ----
    {
        mode: "sequential",
        entries: [
            { name: "Character A", description: "...", image: "https://example.com/images/character-a.png" },
            { name: "Character B", description: "...", image: "https://example.com/images/character-b.png" },
            { name: "Character C", description: "...", image: "https://example.com/images/character-c.png" },
            { name: "Character D", description: "...", image: "https://example.com/images/character-d.png" },
            { name: "Character E", description: "...", image: "https://example.com/images/character-e.png" },
        ],
    },
    // ---- ช่องที่ 5 (สุ่ม) ----
    {
        mode: "shuffle",
        entries: [
            { name: "Character F", description: "...", image: "https://example.com/images/character-f.png" },
            { name: "Character G", description: "...", image: "https://example.com/images/character-g.png" },
            { name: "Character H", description: "...", image: "https://example.com/images/character-h.png" },
            { name: "Character I", description: "...", image: "https://example.com/images/character-i.png" },
            { name: "Character J", description: "...", image: "https://example.com/images/character-j.png" },
        ],
    },
];

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// ---- seeded PRNG (mulberry32) — deterministic: seed เดียวกัน = ผลลัพธ์เดียวกันเป๊ะทุกครั้ง ----
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// สับลำดับ array แบบ Fisher-Yates โดยใช้ seed ที่กำหนด (ผลลัพธ์คงที่ ไม่ใช่สุ่มใหม่ทุกครั้งที่รัน)
function seededShuffle(array, seed) {
    const rng = mulberry32(seed);
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function pickCurrentEntries() {
    const block = Math.floor(Date.now() / SIX_HOURS_MS);

    return SLOTS.map((slot, slotIdx) => {
        const { mode, entries: list } = slot;
        if (!list || list.length === 0) {
            throw new Error(`ช่องที่ ${slotIdx + 1} ไม่มีรายการเลย ใส่อย่างน้อย 1 รายการ`);
        }

        const cycle = Math.floor(block / list.length); // รอบที่เท่าไหร่ (ครบ 1 รอบ = ผ่านครบทุกตัวในลิสต์)
        const position = block % list.length; // ตำแหน่งภายในรอบนี้ (0 ถึง length-1)

        if (mode === "sequential") {
            // เรียงตามลำดับที่พิมพ์ไว้ตรงๆ ไม่มีการสับลำดับ
            return { entry: list[position], index: position, cycle, mode };
        }

        // ค่าเริ่มต้น / mode === "shuffle": สุ่มลำดับแบบไม่ซ้ำภายในรอบเดียวกัน
        // seed ผูกกับทั้ง "รอบ" และ "ช่อง" เพื่อให้แต่ละช่องสับลำดับไม่เหมือนกัน
        // และพอขึ้นรอบใหม่ (cycle เปลี่ยน) จะได้ seed ใหม่ → สับลำดับใหม่อัตโนมัติ
        const seed = cycle * 1000003 + slotIdx * 97;
        const shuffled = seededShuffle(list, seed);
        return { entry: shuffled[position], index: position, cycle, mode: "shuffle" };
    });
}

async function syncWidget() {
    try {
        const picks = pickCurrentEntries();

        const dynamic = [];
        picks.forEach(({ entry }, i) => {
            const n = i + 1; // slot1, slot2, slot3, slot4
            dynamic.push({ type: 1, name: `slot${n}_name`, value: entry.name });
            dynamic.push({ type: 1, name: `slot${n}_desc`, value: entry.description });
            dynamic.push({ type: 3, name: `slot${n}_image`, value: { url: entry.image } });
        });

        const payload = { data: { dynamic } };
        const discordApiUrl =
            `https://discord.com/api/v9/applications/${DISCORD_CLIENT_ID}` +
            `/users/${DISCORD_USER_ID}/identities/0/profile`;

        const response = await axios.patch(discordApiUrl, payload, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        const summary = picks
            .map(({ entry, index, mode }, i) => `slot${i + 1}[${mode}]=${entry.name}(#${index})`)
            .join(", ");
        console.log(`✅ ${summary}. Status: ${response.status}`);
    } catch (error) {
        if (error.response) {
            console.error("Discord API Error:", error.response.status, JSON.stringify(error.response.data));
            process.exit(1);
        } else {
            console.error("Request Error:", error.message);
            process.exit(1);
        }
    }
}

syncWidget();
