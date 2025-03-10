import {
    Event,
    EventTemplate,
    Project,
    ProjectOverview,
    ProjectTemplate,
    ProjectTemplateOverview,
    Reminder,
    ReminderTemplate,
    Tag,
} from "@common/data/domain";

import {
    DbExpandedEvent,
    DbExpandedEventTemplate,
    DbExpandedProject,
    DbExpandedProjectTemplate,
    DbProject,
    DbProjectTemplate,
    DbReminder,
    DbReminderTemplate,
    DbTag,
} from "@db/schema";

import {
    encodeEventId,
    encodeEventTemplateId,
    encodeProjectId,
    encodeProjectTemplateId,
    encodeReminderId,
    encodeReminderTemplateId,
    encodeTagId,
} from "./identifiers";

export function toProjectTemplateOverview(
    dbPt: DbProjectTemplate,
): ProjectTemplateOverview {
    const { id, ...rest } = dbPt;
    return {
        id: encodeProjectTemplateId(id),
        ...rest,
    };
}

export function toProjectTemplate(
    dbPt: DbExpandedProjectTemplate,
): ProjectTemplate {
    const { id, events, ...rest } = dbPt;
    return {
        id: encodeProjectTemplateId(id),
        events: events.map((et) => toEventTemplate(et)),
        ...rest,
    };
}

export function toTag(dbTag: DbTag): Tag {
    return {
        id: encodeTagId(dbTag.id),
        name: dbTag.name,
    };
}

export function toReminderTemplate(dbRt: DbReminderTemplate): ReminderTemplate {
    const { id, eventTemplateId, ...rest } = dbRt;
    return {
        id: encodeReminderTemplateId(id),
        eventTemplateId: encodeEventTemplateId(eventTemplateId),
        ...rest,
    };
}

export function toEventTemplate(dbEt: DbExpandedEventTemplate): EventTemplate {
    const { id, projectTemplateId, reminders, tags, ...rest } = dbEt;
    return {
        id: encodeEventTemplateId(id),
        projectTemplateId: encodeProjectTemplateId(projectTemplateId),
        reminders: reminders.map((r) => toReminderTemplate(r)),
        tags: tags.map((t) => toTag(t)),
        ...rest,
    };
}

export function toProjectOverview(dbProj: DbProject): ProjectOverview {
    const { id, projectTemplateId, ...rest } = dbProj;
    return {
        id: encodeProjectId(id),
        projectTemplateId: projectTemplateId
            ? encodeProjectTemplateId(projectTemplateId)
            : null,
        ...rest,
    };
}

export function toProject(dbProj: DbExpandedProject): Project {
    const { id, events, projectTemplateId, ...rest } = dbProj;
    return {
        id: encodeProjectId(id),
        events: events.map((e) => toEvent(e)),
        projectTemplateId: projectTemplateId
            ? encodeProjectTemplateId(projectTemplateId)
            : null,
        ...rest,
    };
}

export function toEvent(dbE: DbExpandedEvent): Event {
    const { id, projectId, reminders, tags, eventTemplateId, ...rest } = dbE;
    return {
        id: encodeEventId(id),
        projectId: encodeProjectId(projectId),
        reminders: reminders.map((r) => toReminder(r)),
        tags: tags.map((t) => toTag(t)),
        eventTemplateId: eventTemplateId
            ? encodeEventTemplateId(eventTemplateId)
            : null,
        ...rest,
    };
}

export function toReminder(dbR: DbReminder): Reminder {
    const { id, eventId, reminderTemplateId, ...rest } = dbR;
    return {
        id: encodeReminderId(id),
        eventId: encodeEventId(eventId),
        reminderTemplateId: reminderTemplateId
            ? encodeReminderTemplateId(reminderTemplateId)
            : null,
        ...rest,
    };
}
