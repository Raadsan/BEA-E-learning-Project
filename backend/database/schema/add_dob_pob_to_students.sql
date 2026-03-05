-- Add DOB and POB columns to students, IELTSTOEFL and ProficiencyTestStudents tables
ALTER TABLE students ADD COLUMN date_of_birth DATE AFTER sex;
ALTER TABLE students ADD COLUMN place_of_birth VARCHAR(255) AFTER date_of_birth;

ALTER TABLE IELTSTOEFL ADD COLUMN date_of_birth DATE AFTER sex;
ALTER TABLE IELTSTOEFL ADD COLUMN place_of_birth VARCHAR(255) AFTER date_of_birth;

ALTER TABLE ProficiencyTestStudents ADD COLUMN date_of_birth DATE AFTER sex;
ALTER TABLE ProficiencyTestStudents ADD COLUMN place_of_birth VARCHAR(255) AFTER date_of_birth;
