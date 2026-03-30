"use server";

import handleError from "../handlers/error";

const RAPIDAPI_KEY = process.env.RAPID_API_KEY;
const RAPIDAPI_HOST = "jsearch.p.rapidapi.com";

export const fetchLocation = async (): Promise<ActionResponse<string>> => {
  try {
    const response = await fetch("http://ip-api.com/json/?fields=country");
    if (!response.ok)
      throw new Error(
        `Location API request failed: ${response.status} ${response.statusText}`,
      );
    const result = (await response.json()) as { country?: string };

    if (!result.country)
      throw new Error("Country field missing from location API response");

    return {
      success: true,
      data: result.country,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const fetchCountries = async (): Promise<ActionResponse<Country[]>> => {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name",
      { next: { revalidate: 259200 } },
    );

    if (!response.ok)
      throw new Error(
        `Country API request failed: ${response.status} ${response.statusText}`,
      );

    const result = (await response.json()) as CountryAPIResponse[];

    // Map nested API shape to flat Country type
    const countries: Country[] = result
      .map((c) => ({ name: c.name.common }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { success: true, data: countries };
  } catch (error) {
    return handleError(error);
  }
};

export const fetchJobs = async (
  filters: JobFilterParams,
): Promise<ActionResponse<Job[]>> => {
  try {
    const { query, page = 1 } = filters;

    if (!RAPIDAPI_KEY)
      throw new Error("RAPID_API_KEY environment variable is not defined");
    if (!query.trim()) throw new Error("Job search query is required");

    const url = new URL(`https://${RAPIDAPI_HOST}/search`);
    url.searchParams.set("query", query);
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok)
      throw new Error(
        `Job API request failed: ${response.status} ${response.statusText}`,
      );

    const result = (await response.json()) as JobSearchResponse;

    if (result.status !== "OK" || !Array.isArray(result.data))
      throw new Error("Unexpected response shape from job API");

    return {
      success: true,
      data: result.data.filter((job) => job.job_title),
    };
  } catch (error) {
    return handleError(error);
  }
};
