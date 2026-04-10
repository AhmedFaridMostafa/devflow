"use server";

import { Answer, Question, Tag, User } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { GlobalSearchSchema } from "../validations";
import { serialize, Serialize } from "../utils";

export async function globalSearch(
  params: GlobalSearchParams,
): Promise<ActionResponse<Serialize<GlobalSearchResult>>> {
  try {
    const validationResult = await action({
      params,
      schema: GlobalSearchSchema,
    });

    if (validationResult instanceof Error) return handleError(validationResult);

    const { query, type } = validationResult.params;

    const regexQuery = { $regex: query, $options: "i" };

    let results: GlobalSearchResult = {};

    const modelsAndTypes: SearchConfig[] = [
      { model: Question, searchField: "title", type: "question" },
      { model: User, searchField: "name", type: "user" },
      { model: Answer, searchField: "content", type: "answer" },
      { model: Tag, searchField: "name", type: "tag" },
    ];

    const searchableTypes = modelsAndTypes.map((m) => m.type);

    const isSearchableType = (type: string): type is SearchableType => {
      return searchableTypes.includes(type as SearchableType);
    };

    if (!type || !isSearchableType(type)) {
      const allResults = await Promise.all(
        modelsAndTypes.map(async ({ model, searchField, type: modelType }) => {
          const docs: (typeof model.prototype)[] = await model
            .find({ [searchField]: regexQuery })
            .limit(2);
          if (docs.length === 0) return {};
          return {
            [modelType]: docs.map((item) => ({
              title:
                modelType === "answer"
                  ? `Answers containing ${query}`
                  : item[searchField],
              type: modelType,
              _id: modelType === "answer" ? item.question : item._id,
            })),
          };
        }),
      );
      results = Object.assign({}, ...allResults);
    } else {
      const modelInfo = modelsAndTypes.find((item) => item.type === type);

      if (!modelInfo) throw new Error("Invalid search type");

      const docs: (typeof modelInfo.model.prototype)[] = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      results[type] = docs.map((item) => ({
        title:
          type === "answer"
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type,
        _id: type === "answer" ? item.question : item._id,
      }));
    }

    return {
      success: true,
      data: serialize(results),
    };
  } catch (error) {
    return handleError(error);
  }
}
