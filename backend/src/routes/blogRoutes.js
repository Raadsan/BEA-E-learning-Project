import express from 'express';
import { verifyToken, isAdmin } from '../controllers/authController.js';
import { createBlogPost, deleteBlogPost, getBlogPage, updateBlogPost, updateBlogSettings } from '../controllers/blogController.js';

const router = express.Router();
router.get('/admin', verifyToken, isAdmin, getBlogPage);
router.get('/', getBlogPage);
router.put('/settings', verifyToken, isAdmin, updateBlogSettings);
router.post('/', verifyToken, isAdmin, createBlogPost);
router.put('/:id', verifyToken, isAdmin, updateBlogPost);
router.delete('/:id', verifyToken, isAdmin, deleteBlogPost);
export default router;
