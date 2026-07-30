import axios from "axios";

export async function coachSubmission({ code, language, result, problem }) {
  if (!process.env.AI_PROVIDER_URL || !process.env.AI_PROVIDER_KEY) {
    const accepted = result?.status === "Accepted";
    return {
      summary: accepted ? "Accepted. Your solution passed this run." : "The run did not pass yet.",
      complexity: "Review loops and nested scans; prefer hash maps or two-pointer patterns where the category fits.",
      feedback: accepted
        ? "Try explaining your invariants and edge cases as interview practice."
        : "Start from the failing case, trace expected versus actual output, then simplify the branch that diverges.",
      hint: `For ${problem?.title || "this problem"}, keep the implementation small and validate boundary inputs.`
    };
  }

  const { data } = await axios.post(
    process.env.AI_PROVIDER_URL,
    { code, language, result, problemTitle: problem?.title },
    { headers: { Authorization: `Bearer ${process.env.AI_PROVIDER_KEY}` } }
  );
  return data;
}
