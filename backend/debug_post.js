
// debug_post.js
// Native fetch in Node 18+

const url = "http://localhost:5000/api/announcements/update/1";

async function run() {
    try {
        console.log(`Sending POST to ${url}`);
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Debug Update" })
        });
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
