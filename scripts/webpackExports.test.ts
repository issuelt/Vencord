/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { expect, test } from "vite-plus/test";

import { defineExports } from "../src/webpack/defineExports.ts";

test("legacy getter exports stay live", () => {
    let value = 1;
    const exports: { value?: number } = {};
    defineExports(exports, { value: () => value });
    expect(exports.value).toBe(1);
    value = 2;
    expect(exports.value).toBe(2);
});

test("direct class exports keep constructor identity and can be hidden from finders", () => {
    class Example {}
    const exports: { Example?: typeof Example } = {};
    defineExports(exports, {}, { Example });
    const Constructor = exports.Example;
    expect(Constructor).toBe(Example);
    expect(Constructor && new Constructor()).toBeInstanceOf(Example);
    expect(Object.getOwnPropertyDescriptor(exports, "Example")).toEqual({
        value: Example,
        enumerable: true,
        configurable: true,
        writable: false
    });
    Object.defineProperty(exports, "Example", { enumerable: false });
    expect(Object.keys(exports)).toEqual([]);
    expect(exports.Example).toBe(Example);
});

test("existing exports and getters win collisions with direct values", () => {
    const exports = { existing: "preserved" };
    defineExports(
        exports,
        { existing: () => "overwritten", collision: () => "getter" },
        { existing: "overwritten", collision: "direct" }
    );
    expect(exports).toEqual({ existing: "preserved", collision: "getter" });
    expect(Object.getOwnPropertyDescriptor(exports, "collision")?.configurable).toBe(true);
});

test("inherited getters and values are not exported", () => {
    const getters = { ownGetter: () => "getter" };
    const values = { ownValue: "value" };
    Reflect.setPrototypeOf(getters, { inheritedGetter: () => "ignored" });
    Reflect.setPrototypeOf(values, { inheritedValue: "ignored" });
    const exports = {};
    defineExports(exports, getters, values);
    expect(exports).toEqual({ ownGetter: "getter", ownValue: "value" });
});
