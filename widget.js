if (process.env.GITHUB_ACTIONS !== "true") {
    require("dotenv").config();
}
const axios = require("axios");

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// ============================================================
// 4 ช่อง แต่ละช่องมีลิสต์ของตัวเอง 5 รายการ ไม่เกี่ยวข้องกับช่องอื่น
// แต่ละช่องหมุนเวียนอิสระ ตามลิสต์ของตัวเองเท่านั้น
// (จะใส่มากกว่าหรือน้อยกว่า 5 ต่อช่องก็ได้ ไม่จำเป็นต้องเท่ากันทุกช่อง)
// ============================================================
const SLOTS = [
    // ---- ช่องที่ 1 ----
    [
        { name: "Lumine", description: "Traveler from another world", image: "https://example.com/images/lumine.png" },
        { name: "Paimon", description: "...", image: "https://example.com/images/paimon.png" },
        { name: "Furina", description: "...", image: "https://example.com/images/furina.png" },
        { name: "Nahida", description: "...", image: "https://example.com/images/nahida.png" },
        { name: "Venti", description: "...", image: "https://example.com/images/venti.png" },
    ],
    // ---- ช่องที่ 2 ----
    [
        { name: "Oguri Cap", description: "Uma Musume ace sprinter", image: "https://example.com/images/oguri-cap.png" },
        { name: "Special Week", description: "...", image: "https://example.com/images/special-week.png" },
        { name: "Silence Suzuka", description: "...", image: "https://example.com/images/silence-suzuka.png" },
        { name: "Tokai Teio", description: "...", image: "https://example.com/images/tokai-teio.png" },
        { name: "Mejiro McQueen", description: "...", image: "https://example.com/images/mejiro-mcqueen.png" },
    ],
    // ---- ช่องที่ 3 ----
    [
        { name: "Cha Eun-Woo", description: "Favorite actor", image: "https://example.com/images/cha-eun-woo.png" },
        { name: "Character 2", description: "...", image: "https://example.com/images/character-2.png" },
        { name: "Character 3", description: "...", image: "https://example.com/images/character-3.png" },
        { name: "Character 4", description: "...", image: "https://example.com/images/character-4.png" },
        { name: "Character 5", description: "...", image: "https://example.com/images/character-5.png" },
    ],
    // ---- ช่องที่ 4 ----
    [
        { name: "Character A", description: "...", image: "https://example.com/images/character-a.png" },
        { name: "Character B", description: "...", image: "https://example.com/images/character-b.png" },
        { name: "Character C", description: "...", image: "https://example.com/images/character-c.png" },
        { name: "Character D", description: "...", image: "https://example.com/images/character-d.png" },
        { name: "Character E", description: "...", image: "https://example.com/images/character-e.png" },
    ],
];

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function pickCurrentEntries() {
    const block = Math.floor(Date.now() / SIX_HOURS_MS);
    return SLOTS.map((list, slotIdx) => {
        if (list.length === 0) {
            throw new Error(`ช่องที่ ${slotIdx + 1} ไม่มีรายการเลย ใส่อย่างน้อย 1 รายการ`);
        }
        const index = block % list.length;
        return { entry: list[index], index };
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

        const summary = picks.map(({ entry, index }, i) => `slot${i + 1}=${entry.name}(#${index})`).join(", ");
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
