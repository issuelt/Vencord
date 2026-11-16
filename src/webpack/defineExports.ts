/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { WebpackRequire } from "@vencord/discord-types/webpack";

/** Defines harmony exports while keeping their descriptors configurable for webpack filtering. */
export const defineExports: OmitThisParameter<WebpackRequire["d"]> = (exports, definition, values) => {
    for (const key in definition) {
        if (Object.hasOwn(definition, key) && !Object.hasOwn(exports, key)) {
            Object.defineProperty(exports, key, {
                enumerable: true,
                configurable: true,
                get: definition[key]
            });
        }
    }
    for (const key in values) {
        if (Object.hasOwn(values, key) && !Object.hasOwn(exports, key)) {
            Object.defineProperty(exports, key, {
                enumerable: true,
                configurable: true,
                value: values[key]
            });
        }
    }
};
