-- Qiimeynta Ardayga (Teacher reviews Student)
CREATE TABLE IF NOT EXISTS student_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(50) NOT NULL,    -- Aqoonsiga Baraha (Reviewer)
    student_id VARCHAR(50) NOT NULL,    -- Aqoonsiga Ardayga la qiimeynayo (Reviewee)
    class_id INT NOT NULL,              -- Fasalka ay isaga xiran yihiin
    term_serial VARCHAR(50) NOT NULL,   -- Term-ka uu qiimeyntu khuseeyo (e.g., T1-2026)
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Qiimeynta (1 ilaa 5 xiddigood)
    comment TEXT,                       -- Faallada ama qoraalka dhiiri-gelinta ah
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Qiimeynta Baraha (Student reviews Teacher)
CREATE TABLE IF NOT EXISTS teacher_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,    -- Aqoonsiga Ardayga (Reviewer)
    teacher_id VARCHAR(50) NOT NULL,    -- Aqoonsiga Baraha la qiimeynayo (Reviewee)
    class_id INT NOT NULL,              -- Fasalka ay isaga xiran yihiin
    term_serial VARCHAR(50) NOT NULL,   -- Term-ka uu qiimeyntu khuseeyo
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Qiimeynta (1 ilaa 5 xiddigood)
    comment TEXT,                       -- Faallada uu ardaygu ka bixinayo baraha
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);
