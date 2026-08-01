import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

const studentId = 'TEST-EXPIRED-001';
const email = 'expired.student@bea.test';
const plainPassword = 'Test@12345';
const transactionId = 'TEST-EXPIRED-PAYMENT-001';

try {
  const now = new Date();
  const expiredAt = new Date('2026-07-31T20:59:59.000Z');
  await prisma.$executeRawUnsafe('ALTER TABLE students MODIFY COLUMN paid_until DATETIME NULL');
  await prisma.$executeRawUnsafe(`UPDATE students SET paid_until = DATE_ADD(paid_until, INTERVAL 86399 SECOND) WHERE paid_until IS NOT NULL AND TIME(paid_until) = '00:00:00'`);
  const password = await bcrypt.hash(plainPassword, 10);
  const program = await prisma.programs.findFirst({ select: { title: true } });
  const student = await prisma.students.upsert({
    where: { student_id: studentId },
    update: { full_name: 'Expired Test Student', email, password, approval_status: 'approved', funding_status: 'Paid', chosen_program: program?.title || 'Test Program', paid_until: expiredAt },
    create: { student_id: studentId, full_name: 'Expired Test Student', email, password, approval_status: 'approved', funding_status: 'Paid', chosen_program: program?.title || 'Test Program', paid_until: expiredAt },
  });
  const paymentExists = await prisma.payments.findFirst({ where: { provider_transaction_id: transactionId } });
  if (!paymentExists) {
    await prisma.payments.create({
      data: { student_id: student.student_id, amount: 10, method: 'test', status: 'paid', currency: 'USD', provider_transaction_id: transactionId, created_at: new Date(now.getTime() - (32 * 86400000)) },
    });
  }
  console.log(JSON.stringify({ student_id: student.student_id, email, password: plainPassword, paid_until: expiredAt }));
} finally {
  await prisma.$disconnect();
}
