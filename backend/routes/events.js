import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import Event from '../models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/', async (req, res) => {
  try {
    const { category, date, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (date) {
      const today = new Date();
      switch (date) {
        case 'today':
          query.date = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          };
          break;
        case 'week':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
          query.date = { $gte: weekStart, $lt: weekEnd };
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          query.date = { $gte: monthStart, $lt: monthEnd };
          break;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event" });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, date, time, location, category, capacity, price, image } = req.body;

    const event = await Event.create({
      name,
      description,
      date,
      time,
      location,
      category,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      image: image,
      creator: req.userId,
      attendees: [req.userId]
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: "Error creating event" });
  }
});

// Attend event
router.post('/:id/attend', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.attendees.includes(req.userId)) {
      return res.status(400).json({ message: "Already attending this event" });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    event.attendees.push(req.userId);
    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error attending event" });
  }
});

router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // buffer to base64
    const base64String = req.file.buffer.toString('base64');

    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64String}`, {
      folder: 'events',
    });

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

export default router;