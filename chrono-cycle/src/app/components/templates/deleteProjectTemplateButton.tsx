"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";

import { CriticalButton } from "@/app/components/customComponent/criticalButton";
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
            await deleteProjectTemplateAction(null, { projectTemplateId });
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
        <CriticalButton
            disabled={disabled}
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(projectTemplateId)}
        >
            <Trash className="mr-2" />
            Delete Template
        </CriticalButton>
    );
}
