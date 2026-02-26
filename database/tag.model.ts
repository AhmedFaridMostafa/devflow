import { Model, HydratedDocument, model, models, Schema } from "mongoose";

export interface ITag {
  name: string;
  questions: number;
}

export type ITagDoc = HydratedDocument<ITag>;

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    questions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Tag = (models?.Tag as Model<ITag>) || model<ITag>("Tag", TagSchema);

export default Tag;
