import prisma from '../lib/prisma.js';

export const getCertificates = async (req, res) => {
    try {
        const certs = await prisma.certificates.findMany({ orderBy: { created_at: 'desc' } });
        
        const admins = await prisma.admins.findMany({
            select: { id: true, first_name: true, last_name: true, username: true }
        });

        const mappedCerts = certs.map(cert => {
            const admin = admins.find(a => a.id === cert.uploader_id);
            const adminName = admin ? (admin.first_name ? `${admin.first_name} ${admin.last_name || ''}`.trim() : admin.username) : 'Administrator';
            
            return {
                ...cert,
                uploaded_by: adminName
            };
        });

        res.json(mappedCerts);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getCertificateByTarget = async (req, res) => {
    try {
        const { target_type, target_id } = req.params;
        const cert = await prisma.certificates.findFirst({
            where: { target_id: parseInt(target_id), target_type }
        });
        res.json(cert);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const upsertCertificate = async (req, res) => {
    try {
        const { target_id, target_type, template_url, name_x, name_y, font_size, font_color } = req.body;
        await prisma.certificates.upsert({
            where: { target_id_target_type: { target_id: parseInt(target_id), target_type } },
            update: { template_url, name_x, name_y, font_size, font_color, uploader_id: req.user.userId },
            create: { target_id: parseInt(target_id), target_type, template_url, name_x, name_y, font_size, font_color, uploader_id: req.user.userId }
        });
        res.json({ message: 'Certificate saved successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteCertificate = async (req, res) => {
    try {
        await prisma.certificates.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
