/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { expect, test } from "vite-plus/test";

import { hasReportFailures, type PatchInfo, type Report } from "./lib/reports.ts";

const slowPatch: PatchInfo = { plugin: "Example", id: "123", match: "anchor", type: "took 11ms" };
const report = (overrides: Partial<Report> = {}): Report => ({
    branch: "stable",
    meta: { buildNumber: "1", buildHash: "same-build" },
    badPatches: [],
    slowPatches: [],
    badStarts: [],
    badWebpackFinds: [],
    otherErrors: [],
    ignoredErrors: [],
    ...overrides
});

test("a clean report passes without a confirmation run", () => {
    expect(hasReportFailures(report())).toBe(false);
});

test("an unconfirmed timing failure cannot pass", () => {
    expect(hasReportFailures(report({ slowPatches: [slowPatch] }))).toBe(true);
});

test("an isolated timing outlier passes when a fresh run does not reproduce it", () => {
    expect(hasReportFailures(report({ slowPatches: [slowPatch] }), report())).toBe(false);
});

test("a different patch being slow does not confirm the original outlier", () => {
    expect(
        hasReportFailures(
            report({ slowPatches: [slowPatch] }),
            report({ slowPatches: [{ ...slowPatch, plugin: "Other" }] })
        )
    ).toBe(false);
});

test("the same patch exceeding the limit in both runs fails even if its duration changes", () => {
    expect(
        hasReportFailures(
            report({ slowPatches: [slowPatch] }),
            report({ slowPatches: [{ ...slowPatch, type: "took 20ms" }] })
        )
    ).toBe(true);
});

test.each([
    report({ badPatches: [slowPatch] }),
    report({ badStarts: [{ plugin: "Example", error: "failed" }] }),
    report({ badWebpackFinds: ["findByProps"] })
])("functional failures in either run fail even when the other run is clean", failed => {
    expect(hasReportFailures(failed, report())).toBe(true);
    expect(hasReportFailures(report({ slowPatches: [slowPatch] }), failed)).toBe(true);
});

test("a different Discord build cannot confirm that a timing failure disappeared", () => {
    expect(
        hasReportFailures(
            report({ slowPatches: [slowPatch] }),
            report({ meta: { buildNumber: "2", buildHash: "different-build" } })
        )
    ).toBe(true);
});
