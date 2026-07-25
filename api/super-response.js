import { AppError, runSuperResponse } from "../lib/super-response.js";

export const config = {
  maxDuration: 60,
};

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, {
      ok: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Use POST for this endpoint." },
    });
  }

  try {
    const requiredCode = process.env.APP_ACCESS_CODE?.trim();
    const suppliedCode = String(request.headers["x-app-access-code"] || "").trim();
    if (requiredCode && suppliedCode !== requiredCode) {
      return sendJson(response, 401, {
        ok: false,
        error: { code: "UNAUTHORISED", message: "The private access code is missing or incorrect." },
      });
    }

    const result = await runSuperResponse(request.body || {}, process.env, fetch);
    return sendJson(response, 200, result);
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return sendJson(response, status, {
      ok: false,
      error: {
        code: error?.code || "INTERNAL_ERROR",
        message: error?.message || "Unexpected server error.",
      },
    });
  }
}
