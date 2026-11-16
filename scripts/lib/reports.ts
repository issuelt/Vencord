/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type Branch = "stable" | "ptb" | "canary";

export interface PatchInfo {
    readonly plugin: string;
    readonly type: string;
    readonly id: string;
    readonly match: string;
    readonly error?: string;
}

/** What one run against one Discord branch found. */
export interface Report {
    readonly branch: Branch;
    meta: { buildNumber: string; buildHash: string };
    readonly badPatches: PatchInfo[];
    readonly slowPatches: PatchInfo[];
    readonly badStarts: { plugin: string; error: string }[];
    readonly badWebpackFinds: string[];
    readonly otherErrors: string[];
    readonly ignoredErrors: string[];
}

export function hasFunctionalFailures(report: Report) {
    return report.badPatches.length + report.badStarts.length + report.badWebpackFinds.length > 0;
}

/** A confirmation can clear timing-only failures; functional failures from either run still fail. */
export function hasReportFailures(report: Report, confirmation?: Report) {
    if (hasFunctionalFailures(report) || (confirmation && hasFunctionalFailures(confirmation))) return true;
    if (report.slowPatches.length === 0) return false;
    if (!confirmation || report.meta.buildHash !== confirmation.meta.buildHash) return true;

    return report.slowPatches.some(patch =>
        confirmation.slowPatches.some(
            repeated => patch.plugin === repeated.plugin && patch.id === repeated.id && patch.match === repeated.match
        )
    );
}
