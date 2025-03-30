"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Trash } from "lucide-react";

import { CriticalButton } from "@/app/components/customComponent/criticalButton";
import { DeleteConfirmButton } from "@/app/components/customComponent/deleteConfirmButton";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

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
                queryKey: queryKeys.projects.retrieveProjectTemplateBase(),
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.projectTemplates.list(),
            });

            onSuccess();
        },
        onError: () =>
            notifyError({
                message: "Failed to delete project template.",
            }),
    });

    return (
        // Original implementation:
        // <CriticalButton
        //     disabled={disabled}
        //     loading={deleteMutation.isPending}
        //     leftSection={<Trash />}
        //     onClick={() => deleteMutation.mutate(projectTemplateId)}
        // >
        //     Delete
        // </CriticalButton>

        <DeleteConfirmButton
            disabled={disabled}
            loading={deleteMutation.isPending}
            onDelete={() => deleteMutation.mutate(projectTemplateId)}
            itemType="project template"
        />
    );
}
