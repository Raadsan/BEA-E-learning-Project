import db from "./dbconfig.js";

const seedData = async () => {
    try {
        const questions = [
            {
                id: 1,
                part: 1,
                type: 'mcq',
                questionText: 'Choose the correct synonym for "Benevolent".',
                options: ['Kind', 'Cruel', 'Rich', 'Poor'],
                correctOption: 0,
                points: 2
            },
            {
                id: 2,
                part: 1,
                type: 'mcq',
                questionText: 'Identify the grammatically correct sentence.',
                options: [
                    'She don\'t like apples.',
                    'She doesn\'t likes apples.',
                    'She doesn\'t like apples.',
                    'She do not like apples.'
                ],
                correctOption: 2,
                points: 2
            },
            {
                id: 3,
                part: 2,
                type: 'passage',
                passageText: 'The internet has revolutionized the way we consume information. In the past, people relied on newspapers, television, and radio for news. Today, instant updates are available at our fingertips. However, this has also led to the spread of misinformation.',
                subQuestions: [
                    {
                        id: 31,
                        questionText: 'What was a primary source of news in the past?',
                        options: ['The Internet', 'Smartphones', 'Newspapers', 'Social Media'],
                        correctOption: 2,
                        points: 1
                    },
                    {
                        id: 32,
                        questionText: 'What is a negative consequence mentioned in the text?',
                        options: ['Faster information', 'Spread of misinformation', 'Less reading', 'More television'],
                        correctOption: 1,
                        points: 1
                    }
                ]
            },
            {
                id: 4,
                part: 3,
                type: 'essay',
                title: 'Essay Writing',
                description: 'Write an essay on the impact of technology on modern education. (Min 200 words)',
                points: 10
            }
        ];

        const [result] = await db.promise().query(
            `INSERT INTO professional_tests (title, description, duration_minutes, questions, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                'IELTS Professional Proficiency Test',
                'This test assesses your advanced English skills necessary for professional environments. It covers grammar, vocabulary, reading comprehension, and writing.',
                60,
                JSON.stringify(questions),
                'active'
            ]
        );

        console.log("✅ Sample Professional Test seeded successfully. ID:", result.insertId);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
