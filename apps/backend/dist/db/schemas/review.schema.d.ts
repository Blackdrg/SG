import { Document } from 'mongoose';
export declare class ReviewDocument extends Document {
    userId: string;
    restaurantId: string;
    orderId: string;
    rating: number;
    comment: string;
    images: string[];
}
export declare const ReviewSchema: import("mongoose").Schema<ReviewDocument, import("mongoose").Model<ReviewDocument, any, any, any, Document<unknown, any, ReviewDocument, any, {}> & ReviewDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReviewDocument, Document<unknown, {}, import("mongoose").FlatRecord<ReviewDocument>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReviewDocument> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
