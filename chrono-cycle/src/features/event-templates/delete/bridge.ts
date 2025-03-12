import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@common/errors";

import { decodeEventTemplateId } from "@lib/identifiers";

import getDb from "@db";
import { deleteEventTemplates } from "@db/queries/event-templates/delete";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            deleteEventTemplates(
                db,
                userId,
                new Set(
                    payloadP.eventTemplateIds.map((id) =>
                        decodeEventTemplateId(id),
                    ),
                ),
            ),
        ),
    );
}
