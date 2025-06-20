import Sqids from "sqids";
import { z } from "zod";

const COMMON_SQIDS_CONFIG = {
    minLength: 16,
};

const sqidses = {
    projectTemplate: new Sqids({
        alphabet:
            "RQdSlkis95wmHvOeMayNnCGZ4DrKEzjuUIxbFJtAqo73PVT1X8WBLYh2fgp6c0",
        ...COMMON_SQIDS_CONFIG,
    }),
    eventTemplate: new Sqids({
        alphabet:
            "2na6ICdpxG73S8myYUJ40ckNL5htTosvgWuR1AqfzwZX9OKFDMBHPVbQjrieEl",
        ...COMMON_SQIDS_CONFIG,
    }),
    reminderTemplate: new Sqids({
        alphabet:
            "wbA9KrOU1EgIoT6sicLlCpP7RxXMHF2e0uGaDN3hVWSd8tzZkjQqBvmf54ynYJ",
        ...COMMON_SQIDS_CONFIG,
    }),
    project: new Sqids({
        alphabet:
            "t68m5x4qEDyFQVIMvR2pceXn13u0HjoShlaBrLYbdzgsOKZw7CGNPk9WiUJTAf",
        ...COMMON_SQIDS_CONFIG,
    }),
    event: new Sqids({
        alphabet:
            "73SdLl8XHKnirPW1U4k6pyZADFxVsTuf2wOvzBaQYRCe9tN5EqhmobMgGI0cjJ",
        ...COMMON_SQIDS_CONFIG,
    }),
    reminder: new Sqids({
        alphabet:
            "3F7eqvxs05fj9oMwazBtShRCI6KZNQ2OLWnmJ4i8lGAYVTUHcErb1XpyDPdguk",
        ...COMMON_SQIDS_CONFIG,
    }),
    tag: new Sqids({
        alphabet:
            "Co5GjZLnANYE6ImUuF7k2x48r3OQiHy0VcSTbfRDlWavsPhgKXdzpt9JqMeBw1",
        ...COMMON_SQIDS_CONFIG,
    }),
};

function genEncodeId(entityType: keyof typeof sqidses) {
    return function (id: number): string {
        const sqids = sqidses[entityType];
        return sqids.encode([id]);
    };
}

function genDecodeId(entityType: keyof typeof sqidses) {
    return function (encodedId: string): number {
        const sqids = sqidses[entityType];
        return sqids.decode(encodedId)[0];
    };
}

export const encodedIdSchema = z
    .string()
    .nonempty("Identifier should not be empty")
    .min(
        COMMON_SQIDS_CONFIG.minLength,
        "Identifier should be at least 16 characters long",
    )
    .regex(/^\S*$/, "Identifer should not contain whitespace");

export const encodeProjectTemplateId = genEncodeId("projectTemplate");
export const decodeProjectTemplateId = genDecodeId("projectTemplate");

export const encodeEventTemplateId = genEncodeId("eventTemplate");
export const decodeEventTemplateId = genDecodeId("eventTemplate");

export const encodeReminderTemplateId = genEncodeId("reminderTemplate");
export const decodeReminderTemplateId = genDecodeId("reminderTemplate");

export const encodeProjectId = genEncodeId("project");
export const decodeProjectId = genDecodeId("project");

export const encodeEventId = genEncodeId("event");
export const decodeEventId = genDecodeId("event");

export const encodeReminderId = genEncodeId("reminder");
export const decodeReminderId = genDecodeId("reminder");

export const encodeTagId = genEncodeId("tag");
export const decodeTagId = genDecodeId("tag");
