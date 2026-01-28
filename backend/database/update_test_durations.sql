-- Update duration for all placement and proficiency tests to 24 hours (1440 minutes)
UPDATE placement_tests SET duration_minutes = 1440;
UPDATE proficiency_tests SET duration_minutes = 1440;
