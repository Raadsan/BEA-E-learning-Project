CREATE TABLE assessment_attempt_locks (
  id INTEGER NOT NULL AUTO_INCREMENT,
  test_type VARCHAR(20) NOT NULL,
  test_id INTEGER NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  started_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  UNIQUE INDEX unique_assessment_attempt_lock (test_type, test_id, student_id),
  INDEX idx_attempt_lock_student (student_id),
  PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
