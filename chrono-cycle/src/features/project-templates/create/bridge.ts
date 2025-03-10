import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import {
    ProjectTemplateOverview,
    toProjectTemplateOverview,
} from "@common/data/domain";

import getDb from "@db";
import { createProjectTemplate } from "@db/queries/project-templates/create";
import { DbProjectTemplateInsert } from "@db/schema";

import { Failure, ParsedPayload } from "./data";

function toDbInsert(
    userId: number,
    payloadP: ParsedPayload,
): DbProjectTemplateInsert {
    return {
        userId,
        ...payloadP,
    };
}

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<Failure, ProjectTemplateOverview> {
    return pipe(
        TE.fromTask(() => getDb()),
        TE.chain((db) =>
            createProjectTemplate(db, toDbInsert(userId, payloadP)),
        ),
        TE.map((dbPt) => toProjectTemplateOverview(dbPt)),
    );
}
