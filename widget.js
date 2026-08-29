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
            { name: "𝜗𝜚 ࣪˖ ִ𐙚 ​​​Eʟʏꜱɪᴀ​​ ۫ ꣑ৎ˚𑣲 ۫˖", description: '“Thank you for being in the dream with me GN𖹭.”', image: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjNjcnpqNXY1cDF3ZmR3aWppZHByZDNqYm4waHc5eTV0c3BoMjBxYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6P80t9A9I4ww62NPui/giphy.gif" },
            { name: "𝜗𝜚 ࣪˖ ִ𐙚 ​​​Cʏʀᴇɴᴇ​​ ۫ ꣑ৎ˚𑣲 ۫˖", description: '“ This will be a romantic story like no other. right?', image: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDlzaGhwYW0xaHR2aW9wem05N2RqOG5wdjI3NXdieDBwbHYwZDRqaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d7EfztUuCNRCHrqp6p/giphy.gif" },
            { name: "𝜗𝜚 ࣪˖ ִ𐙚 ​A​​ᴇᴍᴇᴀᴛʜ​​ ۫ ꣑ৎ˚𑣲 ۫˖", description: '“ All I want... is for you to live safe and happy. ”', image: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXlneHhiN3lwZWdkMWxmcDQzMnAwdnpjbno0ZWhpMWVlcWFlbWV6MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mMtkD6L0jkcPekSAwv/giphy.gif" },
            { name: "𝜗𝜚 ࣪˖ ִ𐙚 ​​​​Rᴇᴍɪᴇʟʟᴇ​​ ۫ ꣑ৎ˚𑣲 ۫˖", description: '“ Sigh... You were much cute when u were asleep ”', image: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzA3aWRlOW1lcTU3ODV2d3ZybmdycXMycjJzdHlneXJsNzMzOTc1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/td2OOOn28nqUN1NTyQ/giphy.gif" },
        ],
    },
    // ---- ช่องที่ 3 (สุ่ม) ----
    {
        mode: "shuffle",
        entries: [
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Mɪᴢɪ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "私とあなたの愛は違う…でも、これも愛だった", image: "https://c.tenor.com/bpUgoSrZzuIAAAAC/tenor.gif" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Hᴀʀᴜ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "“ I won't let losing get me down! Urara, la la la! ♪ ”", image: "https://i.pinimg.com/736x/bd/44/42/bd4442a704a6c59aa13fc81671a6b1b1.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ Aɪ ʜᴏꜱʜɪɴᴏ𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ 嘘はとびきりの愛なんだよ" - 🎤๋࣭ ⭑⚝”', image: "https://c.tenor.com/dMq_3VYgIVAAAAAC/tenor.gif" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ ᴍᴀᴅᴏᴋᴀ𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ たとえ私が見えなくても、私はここにいます。', image: "https://i.pinimg.com/736x/36/3e/a6/363ea6a39b13a141191b43be136b6b4f.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Aʀᴜ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ 私を雇うのがどれだけ高くつくか、分かってい', image: "https://c.tenor.com/OuTnAyZtmhQAAAAd/tenor.gif" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Rᴏxʏ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ I fell in love at first sight. With you Rudy. ”', image: "https://i.pinimg.com/1200x/e3/7f/a2/e37fa2eb005ab5f8d6d61b44b57f95c0.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Eʟᴀɪɴᴀ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ 魔女の証であるブローチをつけた美しい少女 ”', image: "https://i.pinimg.com/736x/c0/66/4f/c0664f6d274029ae6c8e890154a72612.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Rᴇᴢᴇ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ Ill teach you! The things u dont know or cant do ”', image: "https://i.pinimg.com/736x/50/8e/6b/508e6bce7afd3b5fbea9715cdd140758.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ ᴍᴀᴋɪᴍᴀ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ From now on, you are in my care, Denji. ”', image: "https://i.pinimg.com/736x/a0/fd/fe/a0fdfe0fb7863ad96d35eb08ad5b39fd.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Aꜱʜʟᴇʏ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ You chose me! ME!! You chose me, you did!!  ”', image: "https://cdn.imageurlgenerator.com/uploads/373c88f8-7055-40ed-a87b-aa9289cf15a1.webp" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Nᴀᴢᴜɴᴀ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ Sometimes feeling & desire come as a package', image: "https://i.pinimg.com/736x/fe/cc/88/fecc88461f1ee19d1e60d8d264caed8b.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Jᴏʟʏɴᴇ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ あたしは…この“石の海”から自由になる… ”', image: "https://i.pinimg.com/736x/41/dc/db/41dcdbc9e6924953f28dd411a120fe7a.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Mᴇɢᴜᴍɪɴ𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ が名はめぐみん 紅魔族屈指の魔法使いにして ”', image: "https://c.tenor.com/xk20ECbmifQAAAAd/tenor.gif" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Nᴏʙᴀʀᴀ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ 自分が幸せに生きるために、美しく装う。”', image: "https://i.pinimg.com/736x/3f/7e/13/3f7e1383552dcd15bb72f21348a9f79b.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Kɪᴛᴀꜱᴀɴ 𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ 頑張ってね ” - “ Harikitte ikou! ”', image: "https://c.tenor.com/9yii3PXtLEwAAAAC/tenor.gif" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Iꜱʜᴍᴀᴇʟ𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ Ill follow your orders, as long as they are efficient”', image: "https://i.pinimg.com/736x/54/16/7b/54167b896925f5c7eae3ed424f6dd186.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Fᴀᴜꜱᴛ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "“ Dante, know all doesnt mean I tell u everything ”", image: "https://i.pinimg.com/736x/c9/43/4a/c9434a8336d45a6df8354347f074b25d.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Aʟʏᴀ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "“ Эй, обрати внимание. Поговори со мной... ”", image: "https://i.pinimg.com/736x/a9/02/89/a902899e9e527a7de25dcc34aa8060d5.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Mᴀʀɪɴ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "感情を隠していると、身を滅ぼすことになるよ。", image: "https://i.pinimg.com/736x/d7/9b/86/d79b8671f6efe783b16b435904a16392.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Nɪɴᴏ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: '“ 勝手に教えてくるんじゃないわよ！”', image: "https://i.pinimg.com/736x/66/8f/9e/668f9e7636be59e48911e4f5189acba5.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Mɪᴏ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "“ 別に睨んでるわけじゃないから… ”", image: "https://i.pinimg.com/736x/61/94/16/6194168ae2091bf59ffca4ea48446dc6.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Mɪᴋᴜ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "“ 俺にできるんだから、他の4人にも当然できるさ。 ”", image: "https://i.pinimg.com/736x/0e/83/55/0e8355cd1dee6ddbbc7f7d4106edc56c.jpg" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Hɪᴛᴏʀɪ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "“ I don't wanna work! I'm scared People scare me!”", image: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWVidWRkbjFuMHdyNDFpY2RpdDdidmM3cXZzczZ2ajlvc2VhZ2N1OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8cbLnzdeb6xTTnBbfm/giphy.gif" },
            { name: " ‎ ۫꣑ও ⸼ ࣪ ♡ Cʜɪᴋᴀ 𑣲𓈒‿ᚐ۶ৎ ݂۫ ", description: "“ No matter how u polish a turd, it's still a turd. ”", image: "https://i.pinimg.com/736x/26/d2/1a/26d21ad449d2aa35608edd9fe2eb0225.jpg" },
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
