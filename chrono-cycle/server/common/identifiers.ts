import Sqids from "sqids";

const alphabet: string =
    "2na6ICdpxG73S8myYUJ40ckNL5htTosvgWuR1AqfzwZX9OKFDMBHPVbQjrieEl";

let sqids: Sqids | null = null;

export function getSqids(): Sqids {
    if (!sqids) {
        sqids = new Sqids({
            alphabet,
            minLength: 16,
        });
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
