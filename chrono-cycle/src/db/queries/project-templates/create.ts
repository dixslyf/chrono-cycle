import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DuplicateNameError } from "@common/errors";

import { DbLike } from "@db";
import {
    DbProjectTemplate,
    DbProjectTemplateInsert,
    projectTemplates as projectTemplatesTable,
} from "@db/schema";

import { checkDuplicateProjectTemplateName } from "./checkDuplicateName";

export function createProjectTemplate(
    db: DbLike,
    toInsert: DbProjectTemplateInsert,
): TE.TaskEither<DuplicateNameError, DbProjectTemplate> {
    return pipe(
        checkDuplicateProjectTemplateName(db, toInsert.userId, toInsert.name),
        TE.chain(() =>
            TE.fromTask(() =>
                db
                    .insert(projectTemplatesTable)
                    .values(toInsert)
                    .returning()
                    .then((inserted) => inserted[0]),
            ),
        ),
    );
}
