"use client";

import { Button } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Trash } from "lucide-react";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { deleteProjectAction } from "@/features/projects/delete/action";

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
        <Button
            variant="filled"
            color="red"
            disabled={disabled}
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(projectId)}
        >
            <Trash className="mr-2" />
            Delete
        </Button>
    );
}
