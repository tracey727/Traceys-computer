import test from "node:test";
import assert from "node:assert/strict";
import { AppError, getPublicHealth, runSuperResponse } from "../lib/super-response.js";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("health exposes provider readiness without exposing keys", () => {
  const health = getPublicHealth({ OPENAI_API_KEY: "secret", OPENAI_MODEL: "test-model" });
  assert.equal(health.configuredProviders.openai, true);
  assert.equal(health.configuredProviders.anthropic, false);
  assert.equal(health.models.openai, "test-model");
  assert.equal(JSON.stringify(health).includes("secret"), false);
});

test("one configured provider returns its answer without a second synthesis call", async () => {
  let calls = 0;
  const mockFetch = async (url) => {
    calls += 1;
    assert.match(String(url), /openai\.com/);
    return jsonResponse({ model: "mock-openai", output_text: "A strong standalone answer." });
  };

  const result = await runSuperResponse(
    { question: "Test question", providers: ["openai"] },
    { OPENAI_API_KEY: "test", OPENAI_MODEL: "mock-openai" },
    mockFetch
  );

  assert.equal(result.ok, true);
  assert.equal(result.answers[0].status, "fulfilled");
  assert.equal(result.final.text, "A strong standalone answer.");
  assert.equal(result.final.usedSingleAnswerFallback, true);
  assert.equal(calls, 1);
});

test("three providers are collected and OpenAI synthesises the result", async () => {
  const seen = [];
  const mockFetch = async (url, options) => {
    const target = String(url);
    const body = JSON.parse(options.body);
    seen.push(target);

    if (target.includes("openai.com")) {
      const prompt = body.input;
      if (typeof prompt === "string" && prompt.includes("Candidate answers")) {
        return jsonResponse({ model: "openai-synth", output_text: "Combined final answer." });
      }
      return jsonResponse({ model: "openai-model", output_text: "OpenAI answer." });
    }
    if (target.includes("anthropic.com")) {
      return jsonResponse({ model: "claude-model", content: [{ type: "text", text: "Claude answer." }] });
    }
    if (target.includes("googleapis.com")) {
      return jsonResponse({ candidates: [{ content: { parts: [{ text: "Gemini answer." }] } }] });
    }
    throw new Error(`Unexpected URL: ${target}`);
  };

  const result = await runSuperResponse(
    {
      question: "Compare the answers",
      providers: ["openai", "anthropic", "gemini"],
      synthesisProvider: "openai",
    },
    {
      OPENAI_API_KEY: "openai-key",
      ANTHROPIC_API_KEY: "anthropic-key",
      GEMINI_API_KEY: "gemini-key",
    },
    mockFetch
  );

  assert.equal(result.answers.filter((answer) => answer.status === "fulfilled").length, 3);
  assert.equal(result.final.text, "Combined final answer.");
  assert.equal(result.final.provider, "openai");
  assert.equal(seen.length, 4);
});

test("missing provider keys are skipped while configured providers still work", async () => {
  const result = await runSuperResponse(
    { question: "Hello", providers: ["openai", "gemini"] },
    { OPENAI_API_KEY: "test" },
    async () => jsonResponse({ model: "mock", output_text: "Hello back." })
  );

  assert.equal(result.answers[0].status, "fulfilled");
  assert.equal(result.answers[1].status, "skipped");
  assert.equal(result.final.text, "Hello back.");
});

test("empty questions are rejected", async () => {
  await assert.rejects(
    () => runSuperResponse({ question: "   " }, { OPENAI_API_KEY: "test" }, async () => jsonResponse({})),
    (error) => error instanceof AppError && error.status === 400 && error.code === "QUESTION_REQUIRED"
  );
});
