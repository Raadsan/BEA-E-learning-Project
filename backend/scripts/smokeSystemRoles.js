import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';

const stamp = Date.now();
const ids = { admin: null, teacher: null, student: `SMOKE-STUDENT-${stamp}`, program: null, subprogram: null, class: null, assignment: null };
const results = [];
const password = await bcrypt.hash('Smoke@Test123', 10);
const tokenFor = (userId, role, email) => jwt.sign({ userId, role, email }, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', { expiresIn: '1h' });
let server;

function pass(name) { results.push({ name, status: 'PASS' }); }
function fail(name, error) { results.push({ name, status: 'FAIL', error: error.message }); throw error; }

try {
  const admin = await prisma.admins.create({ data: { full_name: 'Smoke Admin', email: `smoke.admin.${stamp}@bea.test`, username: `smoke_admin_${stamp}`, password, role: 'super', status: 'active' } });
  const teacher = await prisma.teachers.create({ data: { full_name: 'Smoke Teacher', email: `smoke.teacher.${stamp}@bea.test`, teacher_id: `SMOKE-T-${stamp}`, password, status: 'active' } });
  await prisma.students.create({ data: { student_id: ids.student, full_name: 'Smoke Student', email: `smoke.student.${stamp}@bea.test`, password, approval_status: 'approved', funding_status: 'Paid', paid_until: new Date(Date.now() + 86400000) } });
  ids.admin = admin.id;
  ids.teacher = teacher.id;

  const adminToken = tokenFor(admin.id, 'admin', admin.email);
  const teacherToken = tokenFor(teacher.id, 'teacher', teacher.email);
  const studentToken = tokenFor(ids.student, 'student', `smoke.student.${stamp}@bea.test`);

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (name, path, { method = 'GET', token, body, expected = [200] } = {}) => {
    try {
      const response = await fetch(`${base}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
      const text = await response.text();
      let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      if (!expected.includes(response.status)) throw new Error(`${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
      pass(name); return data;
    } catch (error) { fail(name, error); }
  };

  await request('Runtime health', '/health');
  await request('Admin authentication', '/api/auth/me', { token: adminToken });
  await request('Teacher authentication', '/api/auth/me', { token: teacherToken });
  await request('Student authentication', '/api/auth/me', { token: studentToken });

  const program = await request('Admin add program', '/api/programs', { method: 'POST', token: adminToken, body: { title: `Smoke Program ${stamp}`, description: 'Automated smoke test', status: 'active', price: 10 } , expected: [201] });
  ids.program = program.program.id;
  await request('Get all programs', '/api/programs');
  await request('Admin edit program', `/api/programs/${ids.program}`, { method: 'PUT', token: adminToken, body: { title: `Smoke Program Updated ${stamp}`, price: 12 } });

  const subprogram = await request('Admin add course', '/api/subprograms', { method: 'POST', token: adminToken, body: { subprogram_name: `Smoke Course ${stamp}`, program_id: ids.program, status: 'active' }, expected: [201] });
  ids.subprogram = subprogram.subprogram.id;
  await request('Get all courses', '/api/subprograms');
  await request('Admin edit course', `/api/subprograms/${ids.subprogram}`, { method: 'PUT', token: adminToken, body: { description: 'Updated smoke course' } });

  const classResult = await request('Admin add and assign class', '/api/classes', { method: 'POST', token: adminToken, body: { class_name: `Smoke Class ${stamp}`, subprogram_id: ids.subprogram, teacher_id: ids.teacher }, expected: [201] });
  ids.class = classResult.class.id;
  await request('Admin get all classes', '/api/classes', { token: adminToken });
  const teacherClasses = await request('Teacher assigned classes', '/api/teachers/my-classes', { token: teacherToken });
  if (!teacherClasses.some((row) => row.id === ids.class)) fail('Teacher class assignment assertion', new Error('Assigned class missing')); else pass('Teacher class assignment assertion');

  await request('Admin assign student to class', `/api/students/${ids.student}`, { method: 'PUT', token: adminToken, body: { class_id: ids.class } });
  await request('Student assigned classes', '/api/students/my-classes', { token: studentToken });
  await request('Admin payment access list', '/api/payments/expired', { token: adminToken });

  const assignment = await request('Teacher add assignment', '/api/assignments', { method: 'POST', token: teacherToken, body: { type: 'writing_task', title: `Smoke Assignment ${stamp}`, description: 'Smoke test', class_id: ids.class, program_id: ids.program, total_points: 20 }, expected: [201] });
  ids.assignment = assignment.assignment.id;
  await request('Teacher get assignments', '/api/assignments?type=writing_task', { token: teacherToken });
  await request('Teacher edit assignment', `/api/assignments/update/${ids.assignment}`, { method: 'PUT', token: teacherToken, body: { type: 'writing_task', title: `Smoke Assignment Updated ${stamp}`, description: 'Updated', class_id: ids.class, total_points: 25 } });
  const submission = await request('Student submit assignment', '/api/assignments/submit', { method: 'POST', token: studentToken, body: { type: 'writing_task', assignment_id: ids.assignment, content: 'Smoke submission' }, expected: [200, 201] });
  const submissionId = submission.submission?.id || submission.id;
  if (submissionId) await request('Teacher grade assignment', `/api/assignments/grade/${submissionId}`, { method: 'PATCH', token: teacherToken, body: { type: 'writing_task', score: 18, feedback: 'Smoke grade' } });
  await request('Teacher delete assignment', `/api/assignments/delete/${ids.assignment}?type=writing_task`, { method: 'DELETE', token: teacherToken });
  ids.assignment = null;

  await request('Admin unassign student', `/api/students/${ids.student}`, { method: 'PUT', token: adminToken, body: { class_id: null } });
  await prisma.student_class_history.deleteMany({ where: { student_id: ids.student } });
  await request('Admin delete class', `/api/classes/${ids.class}`, { method: 'DELETE', token: adminToken }); ids.class = null;
  await request('Admin delete course', `/api/subprograms/${ids.subprogram}`, { method: 'DELETE', token: adminToken }); ids.subprogram = null;
  await request('Admin delete program', `/api/programs/${ids.program}`, { method: 'DELETE', token: adminToken }); ids.program = null;
  await request('Admin delete teacher', `/api/teachers/${ids.teacher}`, { method: 'DELETE', token: adminToken }); ids.teacher = null;
  await request('Admin delete student', `/api/students/${ids.student}`, { method: 'DELETE', token: adminToken }); ids.student = null;
} catch (error) {
  if (!results.some((row) => row.status === 'FAIL')) results.push({ name: 'Suite setup/runtime', status: 'FAIL', error: error.message });
} finally {
  if (ids.assignment) await prisma.assignments.deleteMany({ where: { id: ids.assignment } }).catch(() => {});
  if (ids.student) { await prisma.student_class_history.deleteMany({ where: { student_id: ids.student } }).catch(() => {}); await prisma.students.deleteMany({ where: { student_id: ids.student } }).catch(() => {}); }
  if (ids.class) await prisma.classes.deleteMany({ where: { id: ids.class } }).catch(() => {});
  if (ids.subprogram) await prisma.subprograms.deleteMany({ where: { id: ids.subprogram } }).catch(() => {});
  if (ids.program) await prisma.programs.deleteMany({ where: { id: ids.program } }).catch(() => {});
  if (ids.teacher) await prisma.teachers.deleteMany({ where: { id: ids.teacher } }).catch(() => {});
  if (ids.admin) await prisma.admins.deleteMany({ where: { id: ids.admin } }).catch(() => {});
  if (server) await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
}

for (const result of results) console.log(`${result.status} | ${result.name}${result.error ? ` | ${result.error}` : ''}`);
const failures = results.filter((row) => row.status === 'FAIL');
console.log(`SUMMARY | ${results.length - failures.length} passed | ${failures.length} failed`);
if (failures.length) process.exitCode = 1;
