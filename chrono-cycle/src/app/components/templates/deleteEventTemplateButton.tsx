"use client";

import { useModalsStack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { DeleteConfirmButton } from "@/app/components/customComponent/deleteConfirmButton";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { deleteEventTemplatesAction } from "@/features/event-templates/delete/action";
import { Failure } from "@/features/event-templates/delete/data";

export function DeleteEventTemplateButton<T extends string>({
    eventTemplateId,
    modalStack,
    onSuccess,
    disabled,
}: {
    eventTemplateId: string;
    modalStack: ReturnType<
        typeof useModalsStack<"confirm-delete-event-template" | T>
    >;
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
                queryKey: queryKeys.projectTemplates.retrieveBase(),
            });
            onSuccess();
        },
    });

    return (
        <DeleteConfirmButton
            onDelete={() => deleteMutation.mutate(eventTemplateId)}
            modalStack={modalStack}
            modalStackId="confirm-delete-event-template"
            itemType="event template"
            disabled={disabled}
            loading={deleteMutation.isPending}
        />
    );
}
