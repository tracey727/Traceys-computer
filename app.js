const form = document.querySelector("#questionForm");
const questionInput = document.querySelector("#question");
const characterCount = document.querySelector("#characterCount");
const submitButton = document.querySelector("#submitButton");
const progressSection = document.querySelector("#progressSection");
const progressTitle = document.querySelector("#progressTitle");
const progressText = document.querySelector("#progressText");
const errorSection = document.querySelector("#errorSection");
const errorText = document.querySelector("#errorText");
const resultsSection = document.querySelector("#resultsSection");
const answerGrid = document.querySelector("#answerGrid");
const finalAnswer = document.querySelector("#finalAnswer");
const finalMeta = document.querySelector("#finalMeta");
const finalWarning = document.querySelector("#finalWarning");
const timingLabel = document.querySelector("#timingLabel");
const connectionBadge = document.querySelector("#connectionBadge");
const copyButton = document.querySelector("#copyButton");
const accessCodeWrap = document.querySelector("#accessCodeWrap");
const accessCodeInput = document.querySelector("#accessCode");

const providerElements = {
  openai: {
    state: document.querySelector("#openaiState"),
    model: document.querySelector("#openaiModel"),
    checkbox: document.querySelector('input[value="openai"]'),
  },
  anthropic: {
    state: document.querySelector("#anthropicState"),
    model: document.querySelector("#anthropicModel"),
    checkbox: document.querySelector('input[value="anthropic"]'),
  },
  gemini: {
    state: document.querySelector("#geminiState"),
    model: document.querySelector("#geminiModel"),
    checkbox: document.querySelector('input[value="gemini"]'),
  },
};

function formatDuration(ms = 0) {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  questionInput.disabled = isLoading;
  document.querySelectorAll('input[name="provider"], #synthesisProvider').forEach((element) => {
    element.disabled = isLoading;
  });
  progressSection.classList.toggle("hidden", !isLoading);
  submitButton.querySelector("span").textContent = isLoading ? "Building response…" : "Build Super Response";
}

function showError(message) {
  errorText.textContent = message;
  errorSection.classList.remove("hidden");
}

function clearOutput() {
  errorSection.classList.add("hidden");
  resultsSection.classList.add("hidden");
  answerGrid.innerHTML = "";
  finalAnswer.textContent = "";
  finalWarning.classList.add("hidden");
  finalWarning.textContent = "";
}

function makeAnswerCard(answer) {
  const article = document.createElement("article");
  const statusClass = answer.status === "fulfilled" ? "" : answer.status === "skipped" ? "skipped" : "failed";
  article.className = `answer-card ${statusClass}`.trim();

  const header = document.createElement("div");
  header.className = "answer-card-header";
  const identity = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = answer.label;
  const model = document.createElement("div");
  model.className = "model-name";
  model.textContent = answer.model || "Not called";
  identity.append(title, model);

  const status = document.createElement("span");
  status.className = "status-pill";
  status.textContent = answer.status === "fulfilled" ? "COMPLETE" : answer.status === "skipped" ? "SKIPPED" : "ERROR";
  header.append(identity, status);
  article.append(header);

  if (answer.status === "fulfilled") {
    const preview = document.createElement("div");
    preview.className = "answer-preview";
    preview.textContent = answer.text;
    article.append(preview);
  } else {
    const error = document.createElement("p");
    error.className = "answer-error";
    error.textContent = answer.error?.message || "The provider did not return an answer.";
    article.append(error);
  }

  if (typeof answer.durationMs === "number") {
    const duration = document.createElement("div");
    duration.className = "answer-duration";
    duration.textContent = `Finished in ${formatDuration(answer.durationMs)}`;
    article.append(duration);
  }

  return article;
}

function renderResult(data) {
  data.answers.forEach((answer) => answerGrid.append(makeAnswerCard(answer)));
  finalAnswer.textContent = data.final.text;
  finalMeta.textContent = `${data.final.label} · ${data.final.model}${data.final.usedSingleAnswerFallback ? " · fallback used" : ""}`;
  timingLabel.textContent = `Total ${formatDuration(data.timings.totalMs)}`;

  if (data.final.warning) {
    finalWarning.textContent = data.final.warning;
    finalWarning.classList.remove("hidden");
  }

  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadHealth() {
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    if (!response.ok) throw new Error(`Health check failed (${response.status})`);
    const health = await response.json();
    const configuredCount = Object.values(health.configuredProviders).filter(Boolean).length;

    for (const [provider, elements] of Object.entries(providerElements)) {
      const configured = health.configuredProviders[provider];
      elements.model.textContent = health.models[provider];
      elements.state.textContent = configured ? "Ready" : "Key needed";
      elements.state.className = configured ? "configured" : "missing";
      if (!configured) elements.checkbox.checked = false;
    }

    accessCodeWrap.classList.toggle("hidden", !health.accessCodeRequired);

    if (configuredCount > 0) {
      connectionBadge.textContent = `${configuredCount} provider${configuredCount === 1 ? "" : "s"} ready`;
      connectionBadge.classList.add("ready");
    } else {
      connectionBadge.textContent = "Add API keys to begin";
      connectionBadge.classList.add("warning");
    }
  } catch (error) {
    connectionBadge.textContent = "Server connection problem";
    connectionBadge.classList.add("warning");
    console.error(error);
  }
}

questionInput.addEventListener("input", () => {
  characterCount.textContent = `${questionInput.value.length.toLocaleString("en-AU")} / 12,000`;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearOutput();

  const providers = [...document.querySelectorAll('input[name="provider"]:checked')].map((input) => input.value);
  if (!providers.length) {
    showError("Select at least one configured provider.");
    return;
  }

  setLoading(true);
  progressTitle.textContent = "Consulting selected models…";
  progressText.textContent = "Responses run in parallel. The final synthesis begins when they finish.";

  try {
    const response = await fetch("/api/super-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessCodeWrap.classList.contains("hidden") ? {} : { "x-app-access-code": accessCodeInput.value }),
      },
      body: JSON.stringify({
        question: questionInput.value,
        providers,
        synthesisProvider: document.querySelector("#synthesisProvider").value,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data?.error?.message || `Server returned ${response.status}.`);
    }
    renderResult(data);
  } catch (error) {
    showError(error?.message || "Unexpected error. Check the server and API keys, then try again.");
  } finally {
    setLoading(false);
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(finalAnswer.textContent || "");
    copyButton.textContent = "Copied";
    setTimeout(() => { copyButton.textContent = "Copy answer"; }, 1400);
  } catch {
    copyButton.textContent = "Copy failed";
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js").catch(console.error));
}

loadHealth();
