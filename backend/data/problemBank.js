const javaStarter = "class Solution {\n    public String solve(String input) {\n        return \"\";\n    }\n}";
const cppStarter = "#include <bits/stdc++.h>\nusing namespace std;\n\nstring solve(string input) {\n    return \"\";\n}";

const specs = [
  ["Two Sum", "ARRAY", "Easy"], ["Best Time To Buy And Sell Stock", "ARRAY", "Easy"],
  ["Contains Duplicate", "ARRAY", "Beginner"], ["Maximum Subarray", "ARRAY", "Medium"],
  ["Product Of Array Except Self", "ARRAY", "Medium"], ["Rotate Array", "ARRAY", "Easy"],
  ["Move Zeroes", "ARRAY", "Beginner"], ["Merge Sorted Array", "ARRAY", "Easy"],
  ["Valid Anagram", "STRING", "Easy"], ["Valid Palindrome", "STRING", "Beginner"],
  ["Longest Common Prefix", "STRING", "Easy"], ["Group Anagrams", "STRING", "Medium"],
  ["Longest Substring Without Repeating Characters", "STRING", "Medium"],
  ["Reverse Linked List", "LINKED LIST", "Easy"], ["Merge Two Sorted Lists", "LINKED LIST", "Easy"],
  ["Linked List Cycle", "LINKED LIST", "Easy"], ["Add Two Numbers", "LINKED LIST", "Medium"],
  ["Remove Nth Node", "LINKED LIST", "Medium"], ["Valid Parentheses", "STACK", "Easy"],
  ["Min Stack", "STACK", "Medium"], ["Daily Temperatures", "STACK", "Medium"],
  ["Maximum Depth Binary Tree", "TREE", "Easy"], ["Invert Binary Tree", "TREE", "Easy"],
  ["Level Order Traversal", "TREE", "Medium"], ["Validate BST", "TREE", "Medium"],
  ["Number Of Islands", "GRAPH", "Medium"], ["Clone Graph", "GRAPH", "Medium"],
  ["Course Schedule", "GRAPH", "Medium"], ["Binary Search", "SEARCH", "Beginner"],
  ["Rotated Sorted Array", "SEARCH", "Medium"], ["Climbing Stairs", "DP", "Easy"],
  ["House Robber", "DP", "Medium"], ["Coin Change", "DP", "Medium"],
  ["Longest Increasing Subsequence", "DP", "Medium"], ["Permutations", "BACKTRACKING", "Medium"],
  ["Combination Sum", "BACKTRACKING", "Medium"], ["SQL Select Champions", "SQL", "Beginner"],
  ["Second Highest Salary", "SQL", "Medium"], ["Debug Broken Loop", "Debugging", "Easy"],
  ["Fix Null Pointer", "Debugging", "Easy"], ["Responsive Navbar", "Frontend", "Easy"],
  ["Debounced Search Box", "Frontend", "Medium"], ["Design URL Shortener", "System Design", "Medium"],
  ["Rate Limiter", "System Design", "Hard"], ["Top K Frequent Elements", "ARRAY", "Medium"],
  ["Kth Largest Element", "ARRAY", "Medium"], ["Serialize Binary Tree", "TREE", "Hard"],
  ["Word Ladder", "GRAPH", "Hard"], ["Edit Distance", "DP", "Hard"], ["N Queens", "BACKTRACKING", "Hard"]
];

export const problems = specs.map(([title, category, difficulty], index) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    title,
    slug,
    category,
    difficulty,
    description: buildDescription(title, category),
    constraints: [
      "Input size is selected to reward efficient solutions.",
      "Return exactly the requested output format.",
      "Handle empty, duplicate, and boundary values where applicable."
    ],
    examples: [
      {
        input: sampleInput(category, index),
        output: sampleOutput(category),
        explanation: "The expected answer follows the standard interpretation of the problem statement."
      }
    ],
    testCases: [
      { input: sampleInput(category, index), expectedOutput: sampleOutput(category), hidden: false },
      { input: `${index + 3}\n1 2 3 4`, expectedOutput: sampleOutput(category), hidden: true }
    ],
    starterCode: { Java: javaStarter, "C++": cppStarter },
    tags: [category, difficulty],
    acceptanceRate: Math.max(25, 82 - index)
  };
});

function buildDescription(title, category) {
  const categoryText = {
    ARRAY: "Use array traversal, indexing, sorting, prefix state, or hashing to compute the target result.",
    STRING: "Analyze characters and substrings while preserving correctness for casing, punctuation, and duplicates.",
    "LINKED LIST": "Manipulate node pointers carefully and keep memory usage controlled.",
    STACK: "Use stack state to model the most recent unresolved token or value.",
    TREE: "Traverse tree nodes recursively or iteratively and preserve structural invariants.",
    GRAPH: "Model relationships with adjacency data and use BFS, DFS, or topological reasoning.",
    SEARCH: "Exploit sorted structure with binary search style decisions.",
    DP: "Define subproblems, transitions, and base cases to avoid repeated work.",
    BACKTRACKING: "Explore candidates recursively and prune invalid branches early.",
    SQL: "Write a query that returns the requested rows with correct filtering and ordering.",
    Debugging: "Find and repair the defect while keeping the original intent intact.",
    Frontend: "Build the requested UI behavior with accessible, responsive interaction.",
    "System Design": "Describe core APIs, storage, scaling, and failure handling tradeoffs."
  };
  return `${title}: ${categoryText[category]} Optimize for correctness first, then speed and clarity.`;
}

function sampleInput(category, index) {
  if (category === "SQL") return "employees(id,name,salary)\n1,Ana,100\n2,Bo,200";
  if (category === "Frontend") return "viewport=375 search=arena";
  if (category === "System Design") return "users=1000000 qps=2500";
  if (category === "STRING") return "racecar";
  if (category === "TREE") return "3 9 20 null null 15 7";
  if (category === "GRAPH") return "4\n0-1\n1-2\n2-3";
  return `${index + 2}\n2 7 11 15`;
}

function sampleOutput(category) {
  if (category === "SQL") return "Bo";
  if (category === "Frontend") return "component-ready";
  if (category === "System Design") return "design-reviewed";
  if (category === "STRING") return "true";
  if (category === "TREE") return "3";
  if (category === "GRAPH") return "valid";
  return "9";
}
