/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { expect, test } from "vite-plus/test";

import { isWorkerSource, parseChunkIds } from "../src/webpack/chunks.ts";

test("loads numeric and quoted static chunks in the same group", () => {
    expect(parseChunkIds('n.e(123),n.e("456"),n.e("named-chunk")')).toEqual([123, 456, "named-chunk"]);
});

test("does not mistake dynamic expressions for static chunks", () => {
    expect(parseChunkIds("n.e(chunkId),n.e(123+offset)")).toEqual([]);
});

test("loads main chunks even when one of their modules contains worker code", () => {
    const chunk =
        '"use strict";(this.webpackChunkdiscord_app=this.webpackChunkdiscord_app||[]).push([[1],{2(){self.postMessage("result")}}]);';
    expect(isWorkerSource(chunk)).toBe(false);
});

test("keeps standalone workers out of the page", () => {
    expect(isWorkerSource('(()=>{"use strict";self.postMessage("result")})()')).toBe(true);
    expect(isWorkerSource('self.addEventListener("message",()=>self.postMessage("result"))')).toBe(true);
});
