import mongoose from 'mongoose';

const wineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      maxlength: [120, 'name can be 120 characters at most'],
    },
    // used in the url of the wine page on the capstone front end
    slug: {
      type: String,
      required: [true, 'slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug can only have letters, numbers and dashes (example: la-fleur)'],
    },
    color: {
      type: String,
      required: [true, 'color is required'],
      enum: {
        values: ['rouge', 'blanc', 'rosé', 'doux'],
        message: 'color must be rouge, blanc, rosé or doux',
      },
    },
    varietals: { type: [String], default: [] },
    format: { type: String, trim: true, default: '' },
    serveTemp: { type: String, trim: true, default: '' },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'description can be 1000 characters at most'],
    },
    imageUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Wine = mongoose.model('Wine', wineSchema);
