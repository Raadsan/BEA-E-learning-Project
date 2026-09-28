import prisma from '../lib/prisma.js';
import {
  buildCreateAudit,
  buildUpdateAudit,
  enrichWithAudit,
  backfillMissingCreatedBy,
} from '../utils/auditTrail.js';

// CREATE CLASS
export const createClass = async (req, res) => {
  try {
    const { class_name, description, subprogram_id, teacher_id, shift_id } = req.body;
    if (!class_name) return res.status(400).json({ error: "Class name is required" });

    const existing = await prisma.classes.findUnique({ where: { class_name } });
    if (existing) return res.status(400).json({ error: "Class name already exists" });

    const createAudit = await buildCreateAudit(req, 'System');

    const classItem = await prisma.classes.create({
      data: {
        class_name,
        description,
        subprogram_id: subprogram_id ? parseInt(subprogram_id) : null,
        teacher_id: teacher_id ? parseInt(teacher_id) : null,
        shift_id: shift_id ? parseInt(shift_id) : null,
        ...createAudit,
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

    await backfillMissingCreatedBy(prisma.classes, 'Not recorded');
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

    const populated = await enrichWithAudit(classes.map(cls => {
      const teacher_name = cls.teachers?.full_name || 'Unassigned';
      const program_id = cls.subprograms?.program_id || null;
      const program_name = cls.subprograms?.programs?.title || 'N/A';
      const subprogram_name = cls.subprograms?.subprogram_name || 'N/A';
      const shift_name = cls.shifts?.shift_name || '';
      const shift_session = cls.shifts?.session_type || '';
      const shift_start = cls.shifts ? formatTime(cls.shifts.start_time) : '';
      const shift_end = cls.shifts ? formatTime(cls.shifts.end_time) : '';

      return {
        ...cls,
        teacher_name,
        program_id,
        program_name,
        subprogram_name,
        shift_name,
        shift_session,
        shift_start,
        shift_end
      };
    }));

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

// GET AVAILABLE SESSION SHIFTS FOR STUDENT (same subprogram, different shift)
export const getAvailableSessionClasses = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const student = await prisma.students.findUnique({ where: { student_id: studentId } });
    if (!student || !student.class_id) {
      return res.json([]);
    }

    const currentClass = await prisma.classes.findUnique({
      where: { id: student.class_id },
      include: { shifts: true }
    });
    if (!currentClass || !currentClass.subprogram_id) {
      return res.json([]);
    }

    const currentShiftId = currentClass.shift_id;

    const formatTime = (timeVal) => {
      if (!timeVal) return '';
      if (timeVal instanceof Date) {
        const hours = timeVal.getUTCHours().toString().padStart(2, '0');
        const minutes = timeVal.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      const str = timeVal.toString();
      if (str.includes('T')) {
        const parts = str.split('T');
        if (parts[1]) return parts[1].substring(0, 5);
      }
      return str;
    };

    // Get all classes in same subprogram (excluding current class)
    const classes = await prisma.classes.findMany({
      where: {
        subprogram_id: currentClass.subprogram_id,
        id: { not: currentClass.id }
      },
      include: { shifts: true }
    });

    // Build unique shifts from those classes (skip classes with no shift, skip same shift as current)
    const seenShiftIds = new Set();
    const result = [];

    for (const cls of classes) {
      if (!cls.shifts) continue;           // skip classes without a shift
      if (cls.shift_id === currentShiftId) continue; // skip same shift as student's current
      if (seenShiftIds.has(cls.shift_id)) continue;  // deduplicate by shift

      seenShiftIds.add(cls.shift_id);
      result.push({
        id: cls.id,              // class_id used for submission
        shift_id: cls.shift_id,
        shift_name: cls.shifts.shift_name || '',
        shift_session: cls.shifts.session_type || '',
        shift_start: formatTime(cls.shifts.start_time),
        shift_end: formatTime(cls.shifts.end_time),
      });
    }

    res.json(result);
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
    const program_id = classItem.subprograms?.program_id || null;
    const program_name = classItem.subprograms?.programs?.title || 'N/A';
    const subprogram_name = classItem.subprograms?.subprogram_name || 'N/A';
    const shift_name = classItem.shifts?.shift_name || '';
    const shift_session = classItem.shifts?.session_type || '';
    const shift_start = classItem.shifts ? formatTime(classItem.shifts.start_time) : '';
    const shift_end = classItem.shifts ? formatTime(classItem.shifts.end_time) : '';
    const scheduleParts = [shift_session || shift_name, shift_start && shift_end ? `${String(shift_start).slice(0, 5)} - ${String(shift_end).slice(0, 5)}` : '']
      .filter(Boolean);
    const schedule = scheduleParts.join(' · ') || classItem.schedule || null;

    // Resolve active/latest term for this class from course timelines
    let term_serial = null;
    let term_start = null;
    let term_end = null;
    let is_finished = false;
    try {
      const timelines = await prisma.course_timeline.findMany({
        where: { is_active: true },
        orderBy: { end_date: 'desc' },
      });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const matching = timelines.filter((t) => {
        const raw = t.class_ids;
        if (!raw) return false;
        try {
          const ids = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
          return ids.map(Number).includes(Number(classItem.id));
        } catch {
          return false;
        }
      });
      const current = matching.find((t) => {
        const start = new Date(t.start_date);
        const end = new Date(t.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      }) || matching[0] || null;
      if (current) {
        term_serial = current.term_serial;
        term_start = current.start_date;
        term_end = current.end_date;
        is_finished = new Date(current.end_date) < today;
      }
    } catch {
      // term enrichment is optional
    }

    res.json(await enrichWithAudit({
      ...classItem,
      teacher_name,
      program_id,
      program_name,
      subprogram_name,
      shift_name,
      shift_session,
      shift_start,
      shift_end,
      schedule,
      term_serial,
      term_start,
      term_end,
      is_finished,
      class_status: is_finished ? 'Finished' : 'Active',
    }));
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
    delete data.created_by;
    delete data.created_by_name;
    delete data.updated_by;
    delete data.updated_by_name;
    Object.assign(data, await buildUpdateAudit(req));

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
