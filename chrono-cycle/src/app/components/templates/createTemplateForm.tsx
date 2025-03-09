"use client";

import * as E from "fp-ts/Either";
import { useActionState, useEffect } from "react";
import { match, P } from "ts-pattern";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { Button, Group } from "@mantine/core";

import { ValidationIssues } from "@/server/common/errors";
import { createProjectTemplateAction } from "@/server/features/project-templates/create/action";
import {
    createFormSchema,
    CreateResult,
} from "@/server/features/project-templates/create/data";
import { Textarea, TextInput } from "@mantine/core";
import { pipe } from "fp-ts/lib/function";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

function getCreateErrorMessage(createState: CreateResult) {
    return match(createState)
        .with(
            { left: { _errorKind: "ValidationError" } },
            () => "Invalid or missing fields",
        )
        .with(
            { left: { _errorKind: "DuplicateNameError" } },
            () => "Project tempalte name is already used",
        )
        .with({ right: P.any }, () => "")
        .exhaustive();
}

function extractValidationIssues(
    createState: CreateResult | null,
): ValidationIssues<"name" | "description"> {
    const noIssue = { name: [], description: [] };
    if (!createState) {
        return noIssue;
    }

    return match(createState)
        .with(
            {
                _tag: "Left",
                left: { _errorKind: "ValidationError", issues: P.select() },
            },
            (issues) => issues,
        )
        .otherwise(() => noIssue);
}

export function CreateProjectTemplateForm({
    onSuccess,
}: {
    onSuccess: () => void;
}): React.ReactNode {
    // Action state for creating a project template.
    const [createResult, createAction, createPending] = useActionState(
        createProjectTemplateAction,
        null,
    );

    // Call `onSuccess` whenever creation is successful.
    useEffect(() => {
        if (!createResult) {
            return;
        }

        pipe(
            createResult,
            E.match(
                (_err) =>
                    notifyError({
                        message: "Failed to create project template.",
                    }),
                () => {
                    notifySuccess({
                        message: "Successfully created project template.",
                    });
                    onSuccess();
                },
            ),
        );
    }, [createResult, onSuccess]);

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            description: "",
        },
        validate: zodResolver(createFormSchema),
    });

    return (
        <form action={createAction}>
            <TextInput
                name="name"
                label="Name"
                required
                description="Name of the project template"
                error="Invalid project template name"
                placeholder="Project template name"
                disabled={createPending}
                {...form.getInputProps("name")}
            />
            <Textarea
                name="description"
                label="Description"
                required
                description="Enter description"
                error="Invalid description"
                placeholder="Add description"
                disabled={createPending}
                {...form.getInputProps("description")}
            />
            <div className="relative mb-4">
                <ul className="text-red-500">
                    {createResult && getCreateErrorMessage(createResult)}
                    {Object.entries(
                        extractValidationIssues(createResult),
                    ).flatMap(([fieldName, errors]) =>
                        errors.map((err, idx) => (
                            <li
                                key={`${fieldName}-${idx}`}
                                className="px-4 py-3"
                            >
                                {err || ""}
                            </li>
                        )),
                    )}
                </ul>
            </div>
            <Group justify="flex-end">
                <Button type="submit" loading={createPending}>
                    Create
                </Button>
            </Group>
        </form>
    );
}
