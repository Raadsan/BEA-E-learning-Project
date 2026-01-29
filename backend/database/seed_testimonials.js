import db from './dbconfig.js';

const dbp = db.promise();

const testimonials = [
    {
        student_name: "Mohamed",
        student_role: "IELTS Exam preparation student",
        quote: "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings. The business English course was exactly what I needed.",
        initials: "MO",
        image_url: null,
        rating: 5
    },
    {
        student_name: "MOhamed",
        student_role: "Student for general english course",
        quote: "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings. The business English course was exactly what I needed.",
        initials: "MO",
        image_url: null,
        rating: 5
    },
    {
        student_name: "Ruweyda",
        student_role: "ESP student",
        quote: "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings. The business English course was exactly what I needed.",
        initials: "RU",
        image_url: null,
        rating: 5
    }
];

const seedTestimonials = async () => {
    try {
        console.log('Seeding testimonials data...');

        for (const t of testimonials) {
            const query = `
        INSERT INTO testimonials (student_name, student_role, quote, initials, image_url, rating)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
            await dbp.query(query, [t.student_name, t.student_role, t.quote, t.initials, t.image_url, t.rating]);
        }

        console.log('Testimonials seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding testimonials:', error);
        process.exit(1);
    }
};

seedTestimonials();
