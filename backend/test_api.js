import fetch from 'node-fetch';

const test = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                program_id: 1,
                subprogram_id: 1,
                day: 'Monday',
                start_time: '09:00',
                end_time: '10:00',
                subject: 'Test Subject',
                type: 'Class'
            })
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
};

test();
