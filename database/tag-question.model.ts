import {
  Model,
  HydratedDocument,
  model,
  models,
  Schema,
  Types,
} from "mongoose";

export interface ITagQuestion {
  tag: Types.ObjectId;
  question: Types.ObjectId;
}

export type ITagQuestionDoc = HydratedDocument<ITagQuestion>;

const TagQuestionSchema = new Schema<ITagQuestion>(
  {
    tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  },
  { timestamps: true },
);

const TagQuestion =
  (models?.TagQuestion as Model<ITagQuestion>) ||
  model<ITagQuestion>("TagQuestion", TagQuestionSchema);

export default TagQuestion;
