import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import * as CertificateModel from '../models/certificateModel.js';
import * as StudentModel from '../models/studentModel.js';
import * as ProgramModel from '../models/programModel.js';
import * as SubprogramModel from '../models/subprogramModel.js';
import * as IeltsModel from '../models/ieltsToeflModel.js';
import * as ProficiencyModel from '../models/proficiencyTestStudentsModel.js';

export const downloadCertificate = async (req, res) => {
    const { target_type, target_id } = req.params;
    const studentId = req.user.userId || req.user.id; // Support both just in case

    try {
        // 1. Get certificate template
        const cert = await CertificateModel.getCertificateByTarget(target_type, target_id);

        if (!cert) {
            return res.status(404).json({ error: 'Certificate template not found' });
        }

        // 2. Get student details (Check multiple tables)
        let student = await StudentModel.getStudentById(studentId);
        let studentName = '';
        let className = '-';

        if (student) {
            studentName = student.full_name;
            if (target_type === 'subprogram') {
                const historicalClass = await StudentModel.getHistoricalClass(studentId, target_id);
                className = historicalClass?.class_name || student.class_name || '-';
            } else {
                className = student.class_name || '-';
            }
        } else {
            // Check IELTS
            student = await IeltsModel.getStudentById(studentId);
            if (student) {
                studentName = `${student.first_name} ${student.last_name}`;
            } else {
                // Check Proficiency
                student = await ProficiencyModel.getCandidateById(studentId);
                if (student) {
                    studentName = `${student.first_name} ${student.last_name}`;
                    className = "Proficiency Test";
                }
            }
        }

        if (!studentName) {
            return res.status(404).json({ error: 'Student details not found' });
        }

        // 3. Get Target Name (Program or Subprogram)
        let targetName = '';
        if (target_type === 'program') {
            const program = await ProgramModel.getProgramByTitle(target_id) || await ProgramModel.getProgramById(target_id);
            targetName = program?.title || 'Program';
        } else {
            const sub = await SubprogramModel.getSubprogramById(target_id);
            targetName = sub?.subprogram_name || 'Subprogram';
        }

        // 4. Load Template (PDF or Image)
        const templatePath = path.join(process.cwd(), cert.template_url.replace(/^\//, ''));
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: 'Template file not found' });
        }

        const templateBytes = fs.readFileSync(templatePath);
        let pdfDoc;
        let firstPage;

        const isPdf = cert.template_url.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            pdfDoc = await PDFDocument.load(templateBytes);
            firstPage = pdfDoc.getPages()[0];
        } else {
            // Handle Images (PNG/JPG)
            pdfDoc = await PDFDocument.create();
            let image;
            if (cert.template_url.toLowerCase().endsWith('.png')) {
                image = await pdfDoc.embedPng(templateBytes);
            } else {
                image = await pdfDoc.embedJpg(templateBytes);
            }

            // Add page with image dimensions
            const { width, height } = image.scale(1);
            firstPage = pdfDoc.addPage([width, height]);
            firstPage.drawImage(image, {
                x: 0,
                y: 0,
                width: width,
                height: height,
            });
        }

        // 5. Set font color
        const hex = (cert.font_color || '#000000').replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        // 6. Draw Name & Custom Font
        const { width, height } = firstPage.getSize();

        // Register fontkit to support custom fonts
        pdfDoc.registerFontkit(fontkit);

        // Load custom font from assets (Montserrat-Bold for a clean modern look)
        // We check both absolute path and relative to ensure it works in all environments
        const fontPath = fs.existsSync(path.join(process.cwd(), 'assets', 'fonts', 'Montserrat-Bold.ttf'))
            ? path.join(process.cwd(), 'assets', 'fonts', 'Montserrat-Bold.ttf')
            : path.join(process.cwd(), 'backend', 'assets', 'fonts', 'Montserrat-Bold.ttf');

        const fontBytes = fs.readFileSync(fontPath);
        const font = await pdfDoc.embedFont(fontBytes);

        const scaleX = width / 1000;
        const scaleY = height / 1000;

        // Calculate text width for centering
        const textWidth = font.widthOfTextAtSize(studentName, cert.font_size);
        const drawX = (cert.name_x * scaleX) - (textWidth / 2); // Center relative to X
        const drawY = height - (cert.name_y * scaleY);

        // Optional Masking (to "remove" placeholder text if needed) 
        // Commented out as requested "empty center"
        /*
        const maskPadding = 10;
        firstPage.drawRectangle({
            x: drawX - maskPadding,
            y: drawY - 5,
            width: textWidth + (maskPadding * 2),
            height: cert.font_size + 10,
            color: rgb(1, 1, 1),
            opacity: 1,
        });
        */

        firstPage.drawText(studentName, {
            x: drawX,
            y: drawY,
            size: cert.font_size,
            font: font,
            color: rgb(r, g, b),
        });

        // 7. Log Issuance (if not already logged for this student and target)
        const alreadyClaimed = await CertificateModel.hasStudentClaimedCertificate(studentId, target_id, target_type);
        if (!alreadyClaimed) {
            await CertificateModel.logIssuedCertificate({
                student_id: studentId,
                student_name: studentName,
                target_id: target_id,
                target_type: target_type,
                target_name: targetName,
                class_name: className,
                certificate_id: cert.id
            });
        }

        // 8. Save and send PDF
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ error: 'Failed to generate certificate' });
    }
};

export const getIssuedCertificates = async (req, res) => {
    try {
        const rows = await CertificateModel.getIssuedCertificates();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyIssuedCertificates = async (req, res) => {
    const studentId = req.user.userId || req.user.id;
    try {
        const rows = await CertificateModel.getMyIssuedCertificates(studentId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
