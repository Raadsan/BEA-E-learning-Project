import prisma from '../lib/prisma.js';

const defaults = {
  id: 1,
  hero_title: 'Master English with',
  hero_highlight: 'Global Standards',
  hero_description: 'Structured learning from A1 to C2, powered by CEFR framework and GSE scoring. Join thousands of learners across Somalia achieving their English language goals.',
  hero_images: ['/images/A Path to Global Opportunities.jpg', '/images/Innovative Learning Environment.jpg', '/images/Student—Centered Learning.jpg'],
  cta_text: 'Start Learning Today',
  cta_link: '/auth/registration',
};

export const getHomepageSettings = async (_req, res) => {
  try { res.json(await prisma.homepage_settings.findUnique({ where: { id: 1 } }) || defaults); }
  catch (error) { res.status(500).json({ error: error.message }); }
};

export const updateHomepageSettings = async (req, res) => {
  try {
    const payload = {
      hero_title: String(req.body.hero_title || '').trim(),
      hero_highlight: String(req.body.hero_highlight || '').trim(),
      hero_description: String(req.body.hero_description || '').trim(),
      hero_images: Array.isArray(req.body.hero_images) ? req.body.hero_images.filter(Boolean).slice(0, 6) : [],
      cta_text: String(req.body.cta_text || '').trim(),
      cta_link: String(req.body.cta_link || '').trim(),
    };
    const words = payload.hero_description.split(/\s+/).filter(Boolean).length;
    if (!payload.hero_title || !payload.hero_highlight || !payload.hero_description || !payload.hero_images.length || !payload.cta_text || !payload.cta_link) return res.status(400).json({ error: 'Complete all homepage fields' });
    if (words > 300) return res.status(400).json({ error: 'Hero description cannot exceed 300 words' });
    res.json(await prisma.homepage_settings.upsert({ where: { id: 1 }, create: { id: 1, ...payload }, update: payload }));
  } catch (error) { res.status(500).json({ error: error.message }); }
};
