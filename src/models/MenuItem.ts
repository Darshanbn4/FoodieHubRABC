import mongoose, { Schema, Model } from 'mongoose';
import { MenuItem } from '@/types';

const MenuItemSchema = new Schema<MenuItem>(
  {
    restaurantId: {
      type: String,
      required: true,
      ref: 'Restaurant',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient restaurant queries
MenuItemSchema.index({ restaurantId: 1 });

const MenuItemModel: Model<MenuItem> =
  mongoose.models.MenuItem || mongoose.model<MenuItem>('MenuItem', MenuItemSchema);

export default MenuItemModel;
