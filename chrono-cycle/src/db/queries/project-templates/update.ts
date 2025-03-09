import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DoesNotExistError, DuplicateNameError } from "@common/errors";

import { DbLike } from "@db";
import {
    DbProjectTemplate,
    DbProjectTemplateUpdate,
    projectTemplates as projectTemplatesTable,
} from "@db/schema";

import { checkDuplicateProjectTemplateName } from "./checkDuplicateName";

function rawUpdateProjectTemplate(
    db: DbLike,
    data: DbProjectTemplateUpdate,
): TE.TaskEither<DoesNotExistError, DbProjectTemplate> {
    const task = pipe(
        TE.fromTask(() =>
            db
                .update(projectTemplatesTable)
                .set({ updatedAt: new Date(), ...data })
                .where(eq(projectTemplatesTable.id, data.id))
                .returning(),
        ),
        TE.chain((updated) =>
            updated.length === 0
                ? TE.left(DoesNotExistError())
                : TE.right(updated[0]),
        ),
    );

    return task;
}

export function updateProjectTemplate(
    db: DbLike,
    userId: number,
    data: DbProjectTemplateUpdate,
): TE.TaskEither<DoesNotExistError | DuplicateNameError, DbProjectTemplate> {
    const task = pipe(
        data.name
            ? checkDuplicateProjectTemplateName(db, userId, data.name)
            : TE.right(undefined),
        TE.chain<
            DoesNotExistError | DuplicateNameError,
            void,
            DbProjectTemplate
        >(() => rawUpdateProjectTemplate(db, data)),
    );

    return task;
}
