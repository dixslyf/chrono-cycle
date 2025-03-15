import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { Event, toEvent } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { decodeProjectId } from "@/lib/identifiers";

import getDb from "@/db";
import { listEvents } from "@/db/queries/events/list";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, Event[]> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            listEvents(db, userId, decodeProjectId(payloadP.projectId)),
        ),
        TE.map((dbEvents) => dbEvents.map((dbEvent) => toEvent(dbEvent))),
    );
}
