"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Button } from "@mantine/core";
import { Trash } from "lucide-react";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { deleteProjectTemplateAction } from "@/server/project-templates/delete/action";

export function DeleteTemplateButton({
    projectTemplateId,
    onSuccess,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
}): React.ReactNode {
    const [deleteResult, deleteAction, deletePending] = useActionState(
        deleteProjectTemplateAction,
        null,
    );

    // Handle the deletion result.
    useEffect(() => {
        if (!deleteResult) {
            return;
        }

        pipe(
            deleteResult,
            E.match(
                (_err) => {
                    /* TODO: display error */
                },
                () => onSuccess(),
            ),
        );
    }, [deleteResult, onSuccess]);

    return (
        <Button
            variant="filled"
            disabled={deletePending}
            onClick={() =>
                startTransition(() => deleteAction(projectTemplateId))
            }
        >
            <Trash className="mr-2" />
            Delete
        </Button>
    );
}
