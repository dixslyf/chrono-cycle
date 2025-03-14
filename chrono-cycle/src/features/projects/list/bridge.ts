import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/Task";

import { ProjectOverview, toProjectOverview } from "@/common/data/domain";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import getDb from "@/db";
import { listProjects } from "@/db/queries/projects/list";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): T.Task<ProjectOverview[]> {
    return pipe(
        getDb,
        T.chain(
            (db) => () =>
                listProjects(
                    db,
                    userId,
                    decodeProjectTemplateId(payloadP.projectTemplateId),
                ),
        ),
        T.map((dbProjs) => dbProjs.map(toProjectOverview)),
    );
}
