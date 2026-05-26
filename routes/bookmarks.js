const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const { authMiddleware } = require('../utils/auth');

// Protect ALL routes in this file
router.use(authMiddleware);

// POST /api/bookmarks
router.post('/', async (req, res) => {
  try {
    const { title, url, description, tags } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required.' });
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      title,
      url,
      description,
      tags,
    });

    res.status(201).json({ message: 'Bookmark created.', bookmark });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error creating bookmark.' });
  }
});

// GET /api/bookmarks
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ count: bookmarks.length, bookmarks });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching bookmarks.' });
  }
});

// GET /api/bookmarks/:id
router.get('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    res.status(200).json({ bookmark });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bookmark ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching bookmark.' });
  }
});

// PUT /api/bookmarks/:id
router.put('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    const { title, url, description, tags } = req.body;
    if (title !== undefined) bookmark.title = title;
    if (url !== undefined) bookmark.url = url;
    if (description !== undefined) bookmark.description = description;
    if (tags !== undefined) bookmark.tags = tags;

    const updatedBookmark = await bookmark.save();
    res.status(200).json({ message: 'Bookmark updated.', bookmark: updatedBookmark });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bookmark ID format.' });
    }
    res.status(500).json({ message: 'Server error updating bookmark.' });
  }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    await bookmark.deleteOne();
    res.status(200).json({ message: 'Bookmark deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bookmark ID format.' });
    }
    res.status(500).json({ message: 'Server error deleting bookmark.' });
  }
});

module.exports = router;