import JobCard from "@/components/cards/JobCard";
import DataRenderer from "@/components/DataRenderer";
import JobsFilter from "@/components/filter/JobFilter";
import Pagination from "@/components/Pagination";
import { EMPTY_JOBS } from "@/constants/states";
import {
  fetchCountries,
  fetchJobs,
  fetchLocation,
} from "@/lib/actions/job.action";

const FindJobs = async ({ searchParams }: RouteParams) => {
  const [{ query, location, page }, locationResult, countriesResult] =
    await Promise.all([searchParams, fetchLocation(), fetchCountries()]);

  const pageNumber = Number(page) || 1;
  const userCountry = locationResult.success
    ? locationResult.data
    : "Worldwide";

  const searchQuery =
    query && location
      ? `${query} in ${location}`
      : query
        ? query
        : `Software Engineer in ${userCountry}`;

  const jobsResult = await fetchJobs({ query: searchQuery, page: pageNumber });

  const countries = countriesResult.success ? countriesResult.data : [];

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Jobs</h1>

      <div className="flex">
        <JobsFilter countriesList={countries} />
      </div>

      <DataRenderer
        response={jobsResult}
        selector={(data) => data}
        empty={EMPTY_JOBS}
        render={(jobs) =>
          jobs.map((job) => <JobCard key={job.job_id} job={job} />)
        }
      />

      {jobsResult.success && jobsResult.data.length > 0 && (
        <Pagination page={pageNumber} isNext={jobsResult.data.length === 10} />
      )}
    </>
  );
};

export default FindJobs;
