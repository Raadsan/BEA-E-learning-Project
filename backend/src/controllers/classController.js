import prisma from '../lib/prisma.js';

// CREATE CLASS
export const createClass = async (req, res) => {
  try {
    const { class_name, description, subprogram_id, teacher_id, shift_id } = req.body;
    if (!class_name) return res.status(400).json({ error: "Class name is required" });

    const existing = await prisma.classes.findUnique({ where: { class_name } });
    if (existing) return res.status(400).json({ error: "Class name already exists" });

    const classItem = await prisma.classes.create({
      data: {
        class_name,
        description,
        subprogram_id: subprogram_id ? parseInt(subprogram_id) : null,
        teacher_id: teacher_id ? parseInt(teacher_id) : null,
        shift_id: shift_id ? parseInt(shift_id) : null
      }
    });
    res.status(201).json({ message: "Class created", class: classItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL CLASSES
export const getClasses = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const includeQuery = {
      subprograms: {
        include: {
          programs: true
        }
      },
      teachers: true,
      shifts: true
    };

    let classes;
    if (role === 'teacher') {
      classes = await prisma.classes.findMany({
        where: { teacher_id: parseInt(userId) },
        include: includeQuery
      });
    } else {
      classes = await prisma.classes.findMany({
        include: includeQuery
      });
    }

    const formatTime = (timeVal) => {
      if (!timeVal) return '';
      if (timeVal instanceof Date) {
        const hours = timeVal.getUTCHours().toString().padStart(2, '0');
        const minutes = timeVal.getUTCMinutes().toString().padStart(2, '0');
        const seconds = timeVal.getUTCSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      }
      const str = timeVal.toString();
      if (str.includes('T')) {
        const parts = str.split('T');
        if (parts[1]) {
          return parts[1].substring(0, 8);
        }
      }
      return str;
    };

    const populated = classes.map(cls => {
      const teacher_name = cls.teachers?.full_name || 'Unassigned';
      const program_name = cls.subprograms?.programs?.title || 'N/A';
      const subprogram_name = cls.subprograms?.subprogram_name || 'N/A';
      const shift_name = cls.shifts?.shift_name || '';
      const shift_start = cls.shifts ? formatTime(cls.shifts.start_time) : '';
      const shift_end = cls.shifts ? formatTime(cls.shifts.end_time) : '';

      return {
        ...cls,
        teacher_name,
        program_name,
        subprogram_name,
        shift_name,
        shift_start,
        shift_end
      };
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET CLASSES BY SUBPROGRAM ID
export const getClassesBySubprogramId = async (req, res) => {
  try {
    const classes = await prisma.classes.findMany({
      where: { subprogram_id: parseInt(req.params.subprogram_id) }
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE CLASS
export const getClass = async (req, res) => {
  try {
    const includeQuery = {
      subprograms: {
        include: {
          programs: true
        }
      },
      teachers: true,
      shifts: true
    };

    const classItem = await prisma.classes.findUnique({
      where: { id: parseInt(req.params.id) },
      include: includeQuery
    });
    if (!classItem) return res.status(404).json({ error: "Not found" });

    const formatTime = (timeVal) => {
      if (!timeVal) return '';
      if (timeVal instanceof Date) {
        const hours = timeVal.getUTCHours().toString().padStart(2, '0');
        const minutes = timeVal.getUTCMinutes().toString().padStart(2, '0');
        const seconds = timeVal.getUTCSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      }
      const str = timeVal.toString();
      if (str.includes('T')) {
        const parts = str.split('T');
        if (parts[1]) {
          return parts[1].substring(0, 8);
        }
      }
      return str;
    };

    const teacher_name = classItem.teachers?.full_name || 'Unassigned';
    const program_name = classItem.subprograms?.programs?.title || 'N/A';
    const subprogram_name = classItem.subprograms?.subprogram_name || 'N/A';
    const shift_name = classItem.shifts?.shift_name || '';
    const shift_start = classItem.shifts ? formatTime(classItem.shifts.start_time) : '';
    const shift_end = classItem.shifts ? formatTime(classItem.shifts.end_time) : '';

    res.json({
      ...classItem,
      teacher_name,
      program_name,
      subprogram_name,
      shift_name,
      shift_start,
      shift_end
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE CLASS
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.subprogram_id) data.subprogram_id = parseInt(data.subprogram_id);
    if (data.teacher_id) data.teacher_id = parseInt(data.teacher_id);
    if (data.shift_id) data.shift_id = parseInt(data.shift_id);

    const updated = await prisma.classes.update({
      where: { id: parseInt(id) },
      data
    });
    res.json({ message: "Updated", class: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE CLASS
export const deleteClass = async (req, res) => {
  try {
    await prisma.classes.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
