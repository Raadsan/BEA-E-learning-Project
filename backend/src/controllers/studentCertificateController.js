import prisma from '../lib/prisma.js';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export const downloadCertificate = async (req, res) => {
    const { target_type, target_id } = req.params;
    const studentId = req.user.userId;

    try {
        // 1. Get certificate template
        const cert = await prisma.certificates.findFirst({
            where: { target_id: parseInt(target_id), target_type }
        });
        if (!cert) return res.status(404).json({ error: 'Certificate template not found' });

        // 2. Get student name from multiple tables
        let studentName = '';
        let className = '-';

        const student = await prisma.students.findUnique({ where: { student_id: studentId }, include: { classes: true } });
        if (student) {
            studentName = student.full_name;
            className = student.classes?.class_name || '-';
        } else {
            const ielts = await prisma.IELTSTOEFL.findUnique({ where: { student_id: studentId } });
            if (ielts) {
                studentName = `${ielts.first_name} ${ielts.last_name}`;
            } else {
                const prof = await prisma.ProficiencyTestStudents.findFirst({ where: { student_id: studentId } });
                if (prof) {
                    studentName = `${prof.first_name} ${prof.last_name}`;
                    className = 'Proficiency Test';
                }
            }
        }
        if (!studentName) return res.status(404).json({ error: 'Student details not found' });

        // 3. Load template file
        const templatePath = path.join(process.cwd(), cert.template_url.replace(/^\//, ''));
        if (!fs.existsSync(templatePath)) return res.status(404).json({ error: 'Template file not found' });

        const templateBytes = fs.readFileSync(templatePath);
        const isPdf = cert.template_url.toLowerCase().endsWith('.pdf');

        let pdfDoc, firstPage;
        if (isPdf) {
            pdfDoc = await PDFDocument.load(templateBytes);
            firstPage = pdfDoc.getPages()[0];
        } else {
            pdfDoc = await PDFDocument.create();
            const image = cert.template_url.toLowerCase().endsWith('.png')
                ? await pdfDoc.embedPng(templateBytes)
                : await pdfDoc.embedJpg(templateBytes);
            const { width, height } = image.scale(1);
            firstPage = pdfDoc.addPage([width, height]);
            firstPage.drawImage(image, { x: 0, y: 0, width, height });
        }

        // 4. Draw name
        const hex = (cert.font_color || '#000000').replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const { width, height } = firstPage.getSize();
        pdfDoc.registerFontkit(fontkit);

        const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Montserrat-Bold.ttf');
        const fontBytes = fs.readFileSync(fontPath);
        const font = await pdfDoc.embedFont(fontBytes);

        const scaleX = width / 1000;
        const scaleY = height / 1000;
        const textWidth = font.widthOfTextAtSize(studentName, cert.font_size);
        const drawX = (cert.name_x * scaleX) - (textWidth / 2);
        const drawY = height - (cert.name_y * scaleY);

        firstPage.drawText(studentName, { x: drawX, y: drawY, size: cert.font_size, font, color: rgb(r, g, b) });

        // 5. Log issuance
        const alreadyClaimed = await prisma.issued_certificates.findFirst({
            where: { student_id: studentId, target_id: String(target_id), target_type }
        });
        if (!alreadyClaimed) {
            await prisma.issued_certificates.create({
                data: { student_id: studentId, student_name: studentName, target_id: String(target_id), target_type, class_name: className, certificate_id: cert.id }
            });
        }

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
        res.send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('Certificate error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getIssuedCertificates = async (req, res) => {
    try {
        const certs = await prisma.issued_certificates.findMany({ orderBy: { issued_at: 'desc' } });
        res.json(certs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyIssuedCertificates = async (req, res) => {
    try {
        const certs = await prisma.issued_certificates.findMany({
            where: { student_id: req.user.userId },
            orderBy: { issued_at: 'desc' }
        });
        res.json(certs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
