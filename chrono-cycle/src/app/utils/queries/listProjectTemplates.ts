import { queryOptions } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { listProjectTemplatesAction } from "@/features/project-templates/list/action";

import { queryKeys } from "./keys";

export function listProjectTemplatesOptions(params?: { onError?: () => void }) {
    return queryOptions({
        queryKey: queryKeys.projectTemplates.list(),
        queryFn: async function () {
            const listProjectTemplatesResult =
                await listProjectTemplatesAction();

            return pipe(
                listProjectTemplatesResult,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        meta: {
            errorMessage: "Failed to retrieve project templates.",
            onError: params?.onError,
        },
    });
}
