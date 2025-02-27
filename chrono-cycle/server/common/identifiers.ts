import Sqids from "sqids";
import { z } from "zod";

const SQIDS_CONFIG = {
    alphabet: "2na6ICdpxG73S8myYUJ40ckNL5htTosvgWuR1AqfzwZX9OKFDMBHPVbQjrieEl",
    minLength: 16,
};

let sqids: Sqids | null = null;

export const encodedIdSchema = z
    .string()
    .nonempty("Identifier should not be empty")
    .min(
        SQIDS_CONFIG.minLength,
        "Identifier should be at least 16 characters long",
    )
    .regex(/^\S*$/, "Identifer should not contain whitespace");

export function getSqids(): Sqids {
    if (!sqids) {
        sqids = new Sqids(SQIDS_CONFIG);
    }

    return sqids;
}

export function encodeId(id: number): string {
    const sqid = getSqids();
    return sqid.encode([id]);
}

export function decodeId(encodedId: string): number {
    const sqid = getSqids();
    return sqid.decode(encodedId)[0];
}
