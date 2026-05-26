import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ReviewDocument extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  restaurantId!: string;

  @Prop({ required: true })
  orderId!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop()
  comment!: string;

  @Prop([String])
  images!: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewDocument);
