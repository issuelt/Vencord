/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Extracts numeric and quoted static chunk IDs, excluding dynamic expressions. */
export function parseChunkIds(code: string) {
    return Array.from(code.matchAll(/\((?:"([^"]+)"|(\d+))\)/g), match => {
        const id = match[1] ?? match[2];
        const numericId = Number(id);
        return Number.isNaN(numericId) ? id : numericId;
    });
}

/** Distinguishes standalone worker scripts from chunks containing worker code. */
export function isWorkerSource(code: string) {
    return (
        /importScripts\(|self\.postMessage/.test(code) &&
        !/^\s*(?:"use strict";)?\((?:this|self|globalThis)\.webpackChunkdiscord_app=/.test(code)
    );
}
