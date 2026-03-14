import { EMPTY_ANSWERS } from "@/constants/states";

import AnswerCard from "../cards/AnswerCard";
import DataRenderer from "../DataRenderer";
import CommonFilter from "../filter/CommonFilter";
import { AnswerFilters } from "@/constants/filters";

type AllAnswersProps = ActionResponse<{
  answers: Answer[];
  isNext: boolean;
  totalAnswers: number;
}>;

const AllAnswers = (props: AllAnswersProps) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        {props.success && (
          <h3 className="primary-text-gradient">
            {props.data.totalAnswers}
            {props.data.totalAnswers === 1 ? "Answer" : "Answers"}
          </h3>
        )}
        <CommonFilter
          filters={AnswerFilters}
          selectClassName="sm:min-w-32"
          containerClassName="max-xs:w-full"
        />
      </div>
      <DataRenderer
        response={props}
        selector={(data) => data.answers}
        empty={EMPTY_ANSWERS}
        render={(answers) =>
          answers.map((answer) => <AnswerCard key={answer._id} {...answer} />)
        }
      />
    </div>
  );
};

export default AllAnswers;
