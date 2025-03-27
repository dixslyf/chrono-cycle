import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { EventTemplate, toEventTemplate } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { retrieveExpandedEventTemplatesByProjectTemplateId } from "@/db/queries/event-templates/list";
import { retrieveProjectTemplate } from "@/db/queries/project-templates/retrieve";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, EventTemplate[]> {
    const projectTemplateId = decodeProjectTemplateId(
        payloadP.projectTemplateId,
    );
    return pipe(
        TE.fromTask(getDb),
        TE.tap((db) =>
            // Check that the project template exists and is owned by the user.
            retrieveProjectTemplate(db, userId, projectTemplateId),
        ),
        TE.chain((db) =>
            TE.fromTask(() =>
                retrieveExpandedEventTemplatesByProjectTemplateId(
                    db,
                    projectTemplateId,
                ),
            ),
        ),
        TE.map((dbEts) => dbEts.map((dbEt) => toEventTemplate(dbEt))),
    );
}
