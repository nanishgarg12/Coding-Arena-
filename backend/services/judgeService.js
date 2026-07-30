import axios from "axios";

const languageIds = {
  Java: 62,
  "C++": 54
};

export async function runCode({ language, sourceCode, stdin = "" }) {
  if (!process.env.JUDGE0_KEY) {
    return {
      status: "Accepted",
      stdout: "Mock execution passed. Configure JUDGE0_KEY for real sandboxed execution.",
      stderr: "",
      time: "0.02",
      memory: 1024
    };
  }

  const baseURL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.JUDGE0_KEY
  };

  const { data } = await axios.post(
    `${baseURL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: sourceCode,
      language_id: languageIds[language],
      stdin
    },
    { headers }
  );

  return {
    status: data.status?.description,
    stdout: data.stdout,
    stderr: data.stderr || data.compile_output,
    time: data.time,
    memory: data.memory
  };
}
