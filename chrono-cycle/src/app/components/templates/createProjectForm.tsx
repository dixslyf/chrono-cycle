"use client";

import { Button, Group, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { zodResolver } from "mantine-form-zod-resolver";
import { startTransition, useActionState, useEffect } from "react";
import { match, P } from "ts-pattern";
import { z } from "zod";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { ValidationIssues } from "@/common/errors";

import { createProjectAction } from "@/features/projects/create/action";
import { payloadSchema, Result } from "@/features/projects/create/data";

function getCreateErrorMessage(createState: Result) {
    return match(createState)
        .with(
            { left: { _errorKind: "ValidationError" } },
            () => "Invalid or missing fields",
        )
        .with(
            { left: { _errorKind: "DuplicateNameError" } },
            () => "Project name is already taken",
        )
        .with(
            { left: { _errorKind: "DoesNotExistError" } },
            () => "Project template does not exist",
        )
        .with(
            { left: { _errorKind: "InternalError" } },
            () => "An internal error occurred",
        )
        .with({ right: P.any }, () => "")
        .exhaustive();
}

function extractValidationIssues(
    createState: Result | null,
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

export function CreateProjectForm({
    projectTemplateId,
    onSuccess,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
}): React.ReactNode {
    // Action state for creating a project.
    const [createResult, createAction, createPending] = useActionState(
        createProjectAction,
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
                        message: "Failed to create project.",
                    }),
                () => {
                    notifySuccess({
                        message: "Successfully created project.",
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
            startsAt: new Date(),
        },
        validate: zodResolver(
            payloadSchema
                .omit({ projectTemplateId: true })
                .setKey("startsAt", z.date()),
        ),
    });

    return (
        <form
            onSubmit={form.onSubmit((values) => {
                console.log(values);
                startTransition(() => {
                    const { startsAt, ...rest } = values;
                    createAction({
                        ...rest,
                        startsAt: startsAt.toISOString().split("T")[0], // Extract YYYY-MM-DD.
                        projectTemplateId,
                    });
                });
            })}
        >
            <TextInput
                label="Name"
                required
                description="Name of the project template"
                error="Invalid project template name"
                placeholder="Project template name"
                disabled={createPending}
                {...form.getInputProps("name")}
            />
            <Textarea
                label="Description"
                required
                description="Enter description"
                error="Invalid description"
                placeholder="Add description"
                disabled={createPending}
                {...form.getInputProps("description")}
            />
            <DatePickerInput
                label="Start Date"
                required
                description="The project's start date"
                error="Invalid project start date"
                placeholder="Project start date"
                disabled={createPending}
                {...form.getInputProps("startsAt")}
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
