import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { EventTemplate, toEventTemplate } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { createEventTemplate } from "@/db/queries/event-templates/create";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, EventTemplate> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => {
            const { projectTemplateId, tags, ...rest } = payloadP;
            return createEventTemplate(db, userId, {
                projectTemplateId: decodeProjectTemplateId(projectTemplateId),
                tags: tags.map((name) => ({
                    userId,
                    name,
                })),
                ...rest,
            });
        }),
        TE.map(toEventTemplate),
    );
}
