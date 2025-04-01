"use client";

import { useModalsStack } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { DeleteConfirmButton } from "@/app/components/customComponent/deleteConfirmButton";
import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { deleteProjectAction } from "@/features/projects/delete/action";

export function DeleteProjectButton<T extends string>({
    projectId,
    modalStack,
    onSuccess,
    disabled,
}: {
    projectId?: string;
    modalStack: ReturnType<typeof useModalsStack<"confirm-delete-project" | T>>;
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
            modalStack={modalStack}
            modalStackId={"confirm-delete-project"}
            onDelete={() => {
                // Safety: Button is only enabled when projectId is not undefined.
                return deleteMutation.mutate(projectId as string);
            }}
            itemType="project"
            disabled={!projectId || disabled}
            loading={deleteMutation.isPending}
        />
    );
}
