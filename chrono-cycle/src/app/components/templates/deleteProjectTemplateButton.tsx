"use client";

import { Button } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Trash } from "lucide-react";
import { startTransition, useActionState, useEffect } from "react";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { deleteProjectTemplateAction } from "@/features/project-templates/delete/action";

export function DeleteProjectTemplateButton({
    projectTemplateId,
    onSuccess,
    disabled,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
    disabled?: boolean;
}): React.ReactNode {
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: async (projectTemplateId: string) => {
            const result = await deleteProjectTemplateAction(null, {
                projectTemplateId,
            });
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully deleted project template.",
            });
            // Refresh the project template for project details.
            queryClient.invalidateQueries({
                queryKey: ["retrieve-project-template-of-project"],
            });
            onSuccess();
        },
        onError: () =>
            notifyError({
                message: "Failed to delete project template.",
            }),
    });

    return (
        <Button
            variant="filled"
            color="red"
            disabled={disabled}
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(projectTemplateId)}
        >
            <Trash className="mr-2" />
            Delete Template
        </Button>
    );
}
