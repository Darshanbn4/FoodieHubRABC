import mongoose, { Schema, Model } from 'mongoose';
import { Order, OrderItem } from '@/types';

const OrderItemSchema = new Schema<OrderItem>(
  {
    menuItemId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<Order>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    restaurantId: {
      type: String,
      required: true,
      ref: 'Restaurant',
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: OrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'placed', 'cancelled'],
      required: true,
      default: 'pending',
    },
    total: {
      type: Number,
      required: true,
      min: 0,
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
    paymentMethodId: {
      type: String,
      ref: 'PaymentMethod',
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ country: 1 });
OrderSchema.index({ status: 1 });

const OrderModel: Model<Order> =
  mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema);

export default OrderModel;
