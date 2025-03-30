"use client";

import { useMutation } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { deleteProjectAction } from "@/features/projects/delete/action";

import { DeleteConfirmButton } from "../customComponent/deleteConfirmButton";

export function DeleteProjectButton({
    projectId,
    onSuccess,
    disabled,
}: {
    projectId: string;
    onSuccess: () => void;
    disabled?: boolean;
}): React.ReactNode {
    const deleteMutation = useMutation({
        mutationFn: async (projectId: string) => {
            const result = await deleteProjectAction(null, { projectId });
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully deleted project.",
            });
            onSuccess();
        },
        onError: () => {
            notifyError({
                message: "Failed to delete project.",
            });
        },
    });

    return (
        <DeleteConfirmButton
            onDelete={() => deleteMutation.mutate(projectId)}
            itemType="project"
            disabled={disabled}
            loading={deleteMutation.isPending}
        />
    );
}
