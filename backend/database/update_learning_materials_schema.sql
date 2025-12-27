-- Update learning_materials table with program and subprogram IDs
ALTER TABLE learning_materials
ADD COLUMN program_id INT NULL AFTER type,
ADD COLUMN subprogram_id INT NULL AFTER program_id;

-- Add foreign keys
ALTER TABLE learning_materials
ADD CONSTRAINT fk_material_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_material_subprogram FOREIGN KEY (subprogram_id) REFERENCES programs(id) ON DELETE SET NULL;

-- Note: In this project, subprograms are stored in the same 'programs' table with program_type='sub'
