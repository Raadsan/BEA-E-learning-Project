import prisma from '../lib/prisma.js';

const defaultSettings = {
  id: 1,
  hero_title: 'BEA Blog',
  hero_subtitle: 'Insights, tips, and stories to help you on your English learning journey',
};

const postData = (body) => ({
  title: String(body.title || '').trim(),
  excerpt: String(body.excerpt || '').trim(),
  content: String(body.content || '').trim(),
  category: String(body.category || '').trim(),
  author: String(body.author || 'BEA Team').trim(),
  image_url: body.image_url || null,
  read_time: body.read_time || null,
  featured: Boolean(body.featured),
  status: body.status === 'draft' ? 'draft' : 'published',
  published_at: body.published_at ? new Date(body.published_at) : new Date(),
});

export const getBlogPage = async (req, res) => {
  try {
    const isAdmin = req.path === '/admin';
    const [settings, posts] = await Promise.all([
      prisma.blog_page_settings.findUnique({ where: { id: 1 } }),
      prisma.blog_posts.findMany({
        where: isAdmin ? {} : { status: 'published' },
        orderBy: [{ featured: 'desc' }, { published_at: 'desc' }],
      }),
    ]);
    res.json({ settings: settings || defaultSettings, posts });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const updateBlogSettings = async (req, res) => {
  try {
    const hero_title = String(req.body.hero_title || '').trim();
    const hero_subtitle = String(req.body.hero_subtitle || '').trim();
    if (!hero_title || !hero_subtitle) return res.status(400).json({ error: 'Hero title and subtitle are required' });
    const result = await prisma.blog_page_settings.upsert({ where: { id: 1 }, create: { id: 1, hero_title, hero_subtitle }, update: { hero_title, hero_subtitle } });
    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const createBlogPost = async (req, res) => {
  try {
    const data = postData(req.body);
    if (!data.title || !data.excerpt || !data.content || !data.category) return res.status(400).json({ error: 'Title, excerpt, content and category are required' });
    res.status(201).json(await prisma.blog_posts.create({ data }));
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const updateBlogPost = async (req, res) => {
  try { res.json(await prisma.blog_posts.update({ where: { id: Number(req.params.id) }, data: postData(req.body) })); }
  catch (error) { res.status(500).json({ error: error.message }); }
};

export const deleteBlogPost = async (req, res) => {
  try { await prisma.blog_posts.delete({ where: { id: Number(req.params.id) } }); res.json({ message: 'Deleted' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
};
