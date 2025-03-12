import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import {
    ProjectTemplateOverview,
    toProjectTemplateOverview,
} from "@/common/data/domain";

import getDb from "@/db";
import { listProjectTemplatesForUser } from "@/db/queries/project-templates/list";

export function bridge(
    userId: number,
): TE.TaskEither<never, ProjectTemplateOverview[]> {
    return pipe(
        TE.fromTask(getDb),
        TE.flatMapTask((db) => () => listProjectTemplatesForUser(db, userId)),
        TE.map((dbPts) => dbPts.map((dbPt) => toProjectTemplateOverview(dbPt))),
    );
}
