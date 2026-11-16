/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ErrorCard } from "@components/ErrorCard";
import { UpdateLogger } from "@utils/updater";
import { ConfirmModal, openModal, Parser } from "@webpack/common";

/** Updater IPC errors arrive as plain objects; git failures carry stderr (see src/main/updater/common.ts). */
function getErrorMessage(e: unknown) {
    if (typeof e !== "object" || e === null || !("message" in e) || typeof e.message !== "string")
        return "An unknown error occurred.\nPlease try again or see the console for more info.";

    const stderr = "stderr" in e && typeof e.stderr === "string" ? e.stderr.trim() : "";
    return stderr ? `${e.message}:\n${stderr}` : e.message;
}

export function runWithDispatch(dispatch: React.Dispatch<React.SetStateAction<boolean>>, action: () => any) {
    return async () => {
        dispatch(true);

        try {
            await action();
        } catch (e) {
            UpdateLogger.error(e);

            const err = getErrorMessage(e);

            openModal(props => (
                <ConfirmModal {...props} title="Oops!" confirmText="OK" variant="primary">
                    <ErrorCard>
                        {err.split("\n").map((line, idx) => (
                            <div key={idx}>{Parser.parse(line)}</div>
                        ))}
                    </ErrorCard>
                </ConfirmModal>
            ));
        } finally {
            dispatch(false);
        }
    };
}
