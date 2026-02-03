import * as CertificateModel from '../models/certificateModel.js';

export const getCertificates = async (req, res) => {
    try {
        const rows = await CertificateModel.getAllCertificates();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCertificateByTarget = async (req, res) => {
    const { target_type, target_id } = req.params;
    try {
        const certificate = await CertificateModel.getCertificateByTarget(target_type, target_id);
        res.json(certificate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const upsertCertificate = async (req, res) => {
    try {
        await CertificateModel.upsertCertificate({
            ...req.body,
            uploader_id: req.user.userId
        });
        res.json({ message: 'Certificate saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCertificate = async (req, res) => {
    const { id } = req.params;
    try {
        await CertificateModel.deleteCertificateById(id);
        res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
