import mongoose, { Schema, Model } from 'mongoose';
import { Restaurant } from '@/types';

const RestaurantSchema = new Schema<Restaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      enum: ['india', 'america'],
      required: true,
    },
    currencySymbol: {
      type: String,
      required: true,
      default: '$',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const RestaurantModel: Model<Restaurant> =
  mongoose.models.Restaurant || mongoose.model<Restaurant>('Restaurant', RestaurantSchema);

export default RestaurantModel;
