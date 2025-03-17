import { pipe } from "fp-ts/function";
import * as ROA from "fp-ts/ReadonlyArray";
import * as TE from "fp-ts/TaskEither";
import { match } from "ts-pattern";

import { Project, toProject } from "@/common/data/domain";
import { AssertionError } from "@/common/errors";

import { getDb } from "@/db";
import { listProjectTemplatesForUser } from "@/db/queries/project-templates/list";
import { listProjects } from "@/db/queries/projects/list";
import { retrieveExpandedProject } from "@/db/queries/projects/retrieveExpanded";

export function bridge(
    userId: number,
): TE.TaskEither<AssertionError, Project[]> {
    // TODO: This implementation makes many DB calls. We should optimise it into a single query.
    return pipe(
        TE.Do,
        TE.bind("db", () => TE.fromTask(getDb)),
        // List the user's project templates.
        TE.bind("dbPts", ({ db }) =>
            TE.fromTask(() => listProjectTemplatesForUser(db, userId)),
        ),
        TE.bind("dbExpandedProjs", ({ db, dbPts }) =>
            pipe(
                dbPts,
                // List the project instances for each template.
                TE.traverseArray((dbPt) =>
                    TE.fromTask(() => listProjects(db, userId, dbPt.id)),
                ),
                TE.map(ROA.flatten),
                // Get the expanded versions of the projects.
                TE.chain(
                    TE.traverseArray((dbProj) =>
                        retrieveExpandedProject(db, userId, dbProj.id),
                    ),
                ),
                TE.mapError((err) =>
                    match(err)
                        // Since we retrieve the expanded projects based on the retrieved list of projects,
                        // the retrieval of the expanded versions should never fail.
                        .with({ _errorKind: "DoesNotExistError" }, () =>
                            AssertionError("Unexpected missing project"),
                        )
                        .otherwise((err) => err),
                ),
            ),
        ),
        TE.map(({ dbExpandedProjs }) => dbExpandedProjs.map(toProject)),
    );
}
