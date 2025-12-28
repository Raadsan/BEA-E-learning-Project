-- Fix subprogram foreign key constraint
ALTER TABLE learning_materials DROP FOREIGN KEY fk_material_subprogram;

ALTER TABLE learning_materials
ADD CONSTRAINT fk_material_subprogram 
FOREIGN KEY (subprogram_id) REFERENCES subprograms(id) 
ON DELETE SET NULL;
