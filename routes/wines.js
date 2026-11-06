import express from 'express';
import mongoose from 'mongoose';
import { Wine } from '../models/Wine.js';

const router = express.Router();

const COLORS = ['rouge', 'blanc', 'rosé', 'doux'];
const SORTS = { name: 'name', newest: '-createdAt', oldest: 'createdAt' };

// the only fields the client can set. _id, createdAt and updatedAt come from the server
const ALLOWED_FIELDS = ['name', 'slug', 'color', 'varietals', 'format', 'serveTemp', 'description', 'imageUrl'];

// what PUT puts back in the optional fields that are not sent
const EMPTY_WINE = { varietals: [], format: '', serveTemp: '', description: '', imageUrl: '' };

function pickFields(body) {
  const data = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

// ---------- middleware ----------

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid wine id' });
  }
  next();
}

// in express 5 req.body is undefined when nothing is sent, so this has to run first
function checkBody(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }
  next();
}

// POST and PUT need the full wine
function requireFields(req, res, next) {
  const details = [];
  for (const field of ['name', 'slug', 'color']) {
    const value = req.body[field];
    if (typeof value !== 'string' || value.trim() === '') {
      details.push(`${field} is required`);
    }
  }
  if (details.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details });
  }
  next();
}

// turns mongoose errors into a clear response, anything else goes to the 500 handler
function handleDbError(err, res, next) {
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) =>
      e.name === 'CastError' ? `${e.path} has the wrong type` : e.message
    );
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Validation failed', details: [`${err.path} has the wrong type`] });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'A wine with this slug already exists' });
  }
  next(err);
}

// ---------- routes ----------

// GET /api/wines   optional: ?color=rouge &search=fruit &sort=name|newest|oldest &limit=10
router.get('/', async (req, res, next) => {
  const { color, search = '', sort = 'name', limit = '20' } = req.query;

  if (color !== undefined && !COLORS.includes(color)) {
    return res.status(400).json({ error: 'color must be rouge, blanc, rosé or doux' });
  }
  if (!Object.hasOwn(SORTS, sort)) {
    return res.status(400).json({ error: 'sort must be name, newest or oldest' });
  }
  const max = Number(limit);
  if (!Number.isInteger(max) || max < 1 || max > 100) {
    return res.status(400).json({ error: 'limit must be a number between 1 and 100' });
  }

  const filter = {};
  if (color) filter.color = color;
  if (search) {
    // escape the special characters so the search is treated as normal text
    const text = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(text, 'i');
    filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
  }

  try {
    const wines = await Wine.find(filter).sort(SORTS[sort]).limit(max);
    res.json(wines);
  } catch (err) {
    next(err);
  }
});

// GET /api/wines/:id
router.get('/:id', checkId, async (req, res, next) => {
  try {
    const wine = await Wine.findById(req.params.id);
    if (!wine) return res.status(404).json({ error: 'Wine not found' });
    res.json(wine);
  } catch (err) {
    next(err);
  }
});

// POST /api/wines
router.post('/', checkBody, requireFields, async (req, res, next) => {
  try {
    const wine = await Wine.create(pickFields(req.body));
    res.status(201).json(wine);
  } catch (err) {
    handleDbError(err, res, next);
  }
});

// PUT /api/wines/:id   replaces the whole wine, fields that are not sent go back to their default
router.put('/:id', checkId, checkBody, requireFields, async (req, res, next) => {
  try {
    const wine = await Wine.findById(req.params.id);
    if (!wine) return res.status(404).json({ error: 'Wine not found' });

    wine.overwrite({ ...EMPTY_WINE, ...pickFields(req.body) });
    await wine.save();
    res.json(wine);
  } catch (err) {
    handleDbError(err, res, next);
  }
});

// PATCH /api/wines/:id   only changes the fields that are sent
router.patch('/:id', checkId, checkBody, async (req, res, next) => {
  const data = pickFields(req.body);
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Send at least one field to update' });
  }

  try {
    const wine = await Wine.findByIdAndUpdate(req.params.id, data, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!wine) return res.status(404).json({ error: 'Wine not found' });
    res.json(wine);
  } catch (err) {
    handleDbError(err, res, next);
  }
});

// DELETE /api/wines/:id
router.delete('/:id', checkId, async (req, res, next) => {
  try {
    const wine = await Wine.findByIdAndDelete(req.params.id);
    if (!wine) return res.status(404).json({ error: 'Wine not found' });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
