import { extendExpiredPayment } from '../src/controllers/paymentController.js';
import prisma from '../src/lib/prisma.js';

const studentId = 'TEST-EXPIRED-001';
let statusCode = 200;
let responseBody;
const req = { params: { studentId }, body: { quantity: 1, unit: 'hours' } };
const res = {
  status(code) { statusCode = code; return this; },
  json(body) { responseBody = body; return this; },
};

try {
  const startedAt = Date.now();
  await extendExpiredPayment(req, res);
  if (statusCode !== 200 || !responseBody?.success) throw new Error(responseBody?.error || `Unexpected status ${statusCode}`);
  const saved = await prisma.students.findUnique({ where: { student_id: studentId }, select: { paid_until: true } });
  const delta = new Date(saved.paid_until).getTime() - startedAt;
  if (delta < 3500000 || delta > 3700000) throw new Error(`Expected about one hour, received ${delta}ms`);
  console.log('PASS: one-hour access extension was stored with time precision.');
} finally {
  await prisma.students.update({ where: { student_id: studentId }, data: { paid_until: new Date('2026-07-31T20:59:59.000Z') } });
  await prisma.$disconnect();
}
