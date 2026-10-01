import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

describe("proxy auth routing", () => {
  it("redirects logged-out users from protected pages to /login", () => {
    const res = proxy(new NextRequest("https://app.test/dashboard"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects logged-in users away from /login", () => {
    const req = new NextRequest("https://app.test/login", {
      headers: { cookie: "wacrm_session=session-token" },
    });

    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("preserves invite routing for logged-in users", () => {
    const req = new NextRequest("https://app.test/login?invite=abc123", {
      headers: { cookie: "wacrm_session=session-token" },
    });

    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/join/abc123");
  });

  it("passes through protected pages when a session cookie exists", () => {
    const req = new NextRequest("https://app.test/dashboard", {
      headers: { cookie: "wacrm_session=session-token" },
    });

    const res = proxy(req);

    expect(res.headers.get("location")).toBeNull();
  });
});
