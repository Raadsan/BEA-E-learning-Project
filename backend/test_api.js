// import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api/announcements";

async function testApi() {
    try {
        console.log("Testing GET /api/announcements...");
        const res = await fetch(BASE_URL);
        const data = await res.json();
        console.log("GET Response:", data);

        if (data.length > 0) {
            const id = data[0].id;
            console.log(`\nTesting PUT /api/announcements/${id}...`);
            const updateRes = await fetch(`${BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Updated Title Check" })
            });

            if (updateRes.ok) {
                console.log("PUT Success!");
            } else {
                console.log("PUT Failed:", updateRes.status, updateRes.statusText);
                const err = await updateRes.text();
                console.log("Error Body:", err);
            }
        } else {
            console.log("No announcements to update.");
        }

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testApi();
