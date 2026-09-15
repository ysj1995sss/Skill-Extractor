const SAMPLE = `python-programming-847291
React Hooks #392 !!!
• leadership_skill_44
C++ / Docker 12345
machine learning??? 90821
"communication" *** 7
node.js___992
   SQL   &&&  55
product-design-001
python-programming-847291`;

const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const chipsEl = document.getElementById("chips");
const statusEl = document.getElementById("status");
const inputCountEl = document.getElementById("input-count");
const outputCountEl = document.getElementById("output-count");
const copyBtn = document.getElementById("copy");
const copyCommaBtn = document.getElementById("copy-comma");

function splitInput(text) {
  return text
    .replace(/https?:\/\/\S+/gi, " ")
    .split(/[\n,;|/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanSkill(raw, { stripNumbers, stripSigns }) {
  let value = raw.trim();
  if (!value) return "";

  value = value.replace(/https?:\/\/\S+/gi, " ");
  value = value.replace(/^[\s>*•·\-–—]+/, "");

  if (stripNumbers) {
    value = value.replace(/\d+/g, " ");
  }

  if (stripSigns) {
    // Keep letters (any language), spaces, hyphens, plus, hash, and dots
    // so names like C++, C#, Node.js, and machine-learning survive.
    value = value.replace(/[^\p{L}\p{M}\s+\-.#]/gu, " ");
  }

  value = value.replace(/\s+/g, " ").trim();
  value = value.replace(/^[-.#\s]+|[-.#\s]+$/g, "");
  value = value.replace(/-{2,}/g, "-").replace(/\.{2,}/g, ".");

  return value.trim();
}

function extractSkills(text, options) {
  const seen = new Set();
  const skills = [];

  for (const chunk of splitInput(text)) {
    const cleaned = cleanSkill(chunk, options);
    if (!cleaned) continue;

    const key = cleaned.toLowerCase();
    if (options.dedupe && seen.has(key)) continue;
    seen.add(key);
    skills.push(cleaned);
  }

  if (options.sort) {
    skills.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  return skills;
}

function optionsFromUi() {
  return {
    stripNumbers: document.getElementById("opt-numbers").checked,
    stripSigns: document.getElementById("opt-signs").checked,
    dedupe: document.getElementById("opt-dedupe").checked,
    sort: document.getElementById("opt-sort").checked,
  };
}

function render(skills) {
  const text = skills.join("\n");
  outputEl.value = text;
  outputCountEl.textContent = `${skills.length} skill${skills.length === 1 ? "" : "s"}`;
  copyBtn.disabled = skills.length === 0;
  copyCommaBtn.disabled = skills.length === 0;

  chipsEl.replaceChildren(
    ...skills.map((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      return li;
    })
  );
}

function runExtract() {
  const skills = extractSkills(inputEl.value, optionsFromUi());
  render(skills);
  statusEl.textContent = skills.length
    ? "Ready to copy."
    : "No skills found. Paste lines that still contain letters.";
}

function updateInputCount() {
  const lines = splitInput(inputEl.value).length;
  inputCountEl.textContent = `${lines} line${lines === 1 ? "" : "s"}`;
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = label;
  } catch {
    outputEl.select();
    document.execCommand("copy");
    statusEl.textContent = label;
  }
}

inputEl.addEventListener("input", () => {
  updateInputCount();
  runExtract();
});

for (const id of ["opt-numbers", "opt-signs", "opt-dedupe", "opt-sort"]) {
  document.getElementById(id).addEventListener("change", runExtract);
}

document.getElementById("extract").addEventListener("click", runExtract);

document.getElementById("clear").addEventListener("click", () => {
  inputEl.value = "";
  render([]);
  updateInputCount();
  statusEl.textContent = "";
  inputEl.focus();
});

document.getElementById("sample").addEventListener("click", () => {
  inputEl.value = SAMPLE;
  updateInputCount();
  runExtract();
});

copyBtn.addEventListener("click", () => {
  if (!outputEl.value) return;
  copyText(outputEl.value, "Copied all skills.");
});

copyCommaBtn.addEventListener("click", () => {
  const joined = outputEl.value
    .split("\n")
    .filter(Boolean)
    .join(", ");
  if (!joined) return;
  copyText(joined, "Copied comma-separated skills.");
});

updateInputCount();
