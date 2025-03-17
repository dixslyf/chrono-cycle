import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { DoesNotExistError } from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { deleteProjectTemplate } from "@/db/queries/project-templates/delete";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payload: ParsedPayload,
): TE.TaskEither<DoesNotExistError, void> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            deleteProjectTemplate(
                db,
                userId,
                decodeProjectTemplateId(payload.projectTemplateId),
            ),
        ),
        TE.map(() => undefined),
    );
}
