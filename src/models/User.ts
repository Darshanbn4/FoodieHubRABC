import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/types';

const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member'],
      required: true,
      default: 'member',
    },
    country: {
      type: String,
      enum: ['india', 'america'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const UserModel: Model<User> = 
  mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;
