import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { EventTemplate, toEventTemplate } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { listEventTemplates } from "@/db/queries/event-templates/list";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, EventTemplate[]> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            listEventTemplates(
                db,
                userId,
                decodeProjectTemplateId(payloadP.projectTemplateId),
            ),
        ),
        TE.map((dbEts) => dbEts.map((dbEt) => toEventTemplate(dbEt))),
    );
}
