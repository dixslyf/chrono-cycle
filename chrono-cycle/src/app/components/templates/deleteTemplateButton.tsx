"use client";

import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { deleteProjectTemplateAction } from "@/server/features/project-templates/delete/action";
import { Button } from "@mantine/core";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Trash } from "lucide-react";
import { startTransition, useActionState, useEffect } from "react";

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
                (_err) =>
                    notifyError({
                        message: "Failed to delete project template.",
                    }),
                () => {
                    notifySuccess({
                        message: "Successfully deleted project template.",
                    });
                    onSuccess();
                },
            ),
        );
    }, [deleteResult, onSuccess]);

    return (
        <Button
            variant="filled"
            color="red"
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
