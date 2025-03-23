import { describe, expect, it } from "vitest";

import { retrieveSettingsAction } from "@/features/settings/retrieve/action";

describe("retrieveSettingsAction", () => {
    it("should retrieve user settings", async () => {
        const result = await retrieveSettingsAction();
        expect(result).toBeRight();
    });
});
