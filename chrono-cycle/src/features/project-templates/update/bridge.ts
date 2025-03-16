import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import {
    ProjectTemplateOverview,
    toProjectTemplateOverview,
} from "@/common/data/domain";
import { DoesNotExistError, DuplicateNameError } from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { updateProjectTemplate } from "@/db/queries/project-templates/update";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<
    DoesNotExistError | DuplicateNameError,
    ProjectTemplateOverview
> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => {
            const { id, ...rest } = payloadP;
            return updateProjectTemplate(db, userId, {
                id: decodeProjectTemplateId(id),
                ...rest,
            });
        }),
        TE.map(toProjectTemplateOverview),
    );
}
