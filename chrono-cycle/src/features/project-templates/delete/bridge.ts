import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { DoesNotExistError } from "@root/src/common/errors";
import getDb from "@root/src/db";
import { deleteProjectTemplate } from "@root/src/db/queries/project-templates/delete";
import { decodeProjectTemplateId } from "@root/src/lib/identifiers";

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
