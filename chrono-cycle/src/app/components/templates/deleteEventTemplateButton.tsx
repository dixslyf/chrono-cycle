"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Trash } from "lucide-react";

import { CriticalButton } from "@/app/components/customComponent/criticalButton";
import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { deleteEventTemplatesAction } from "@/features/event-templates/delete/action";
import { Failure } from "@/features/event-templates/delete/data";

export function DeleteEventTemplateButton({
    eventTemplateId,
    onSuccess,
    disabled,
}: {
    eventTemplateId: string;
    onSuccess: () => void;
    disabled?: boolean;
}): React.ReactNode {
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: async (eventTemplateId: string) => {
            const result = await deleteEventTemplatesAction({
                eventTemplateIds: [eventTemplateId],
            });
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onError: (_err: Failure) => {
            notifyError({
                message: "Failed to delete event template.",
            });
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully deleted event template.",
            });
            queryClient.invalidateQueries({
                queryKey: ["retrieve-project-template"],
            });
            onSuccess();
        },
    });

    return (
        <CriticalButton
            disabled={deleteMutation.isPending || disabled}
            loading={deleteMutation.isPending}
            leftSection={<Trash />}
            onClick={() => deleteMutation.mutate(eventTemplateId)}
        >
            Delete
        </CriticalButton>
    );
}
