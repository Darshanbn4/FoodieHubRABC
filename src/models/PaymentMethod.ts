import mongoose, { Schema, Model } from 'mongoose';
import { PaymentMethod } from '@/types';

const PaymentMethodSchema = new Schema<PaymentMethod>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi'],
      required: true,
    },
    lastFourDigits: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^\d{4}$/.test(v),
        message: 'Last four digits must be exactly 4 digits',
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentMethodModel: Model<PaymentMethod> =
  mongoose.models.PaymentMethod || mongoose.model<PaymentMethod>('PaymentMethod', PaymentMethodSchema);

export default PaymentMethodModel;
