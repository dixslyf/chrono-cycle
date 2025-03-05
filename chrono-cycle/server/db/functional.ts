import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgliteDatabase } from "drizzle-orm/pglite";
import { sql } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import getDb from ".";
import { InternalError } from "@/server/common/errors";

type Database = NodePgDatabase | PgliteDatabase;
type LowerBound<T, Lower> = Lower extends T ? T : never;
type ContainsInternalError<E> = InternalError | LowerBound<E, InternalError>;

class FunctionalDatabase {
    readonly db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public do<R>(
        f: (db: Database) => Promise<R>,
    ): TE.TaskEither<InternalError, R>;

    public do<R>(
        f: (db: Database) => Promise<R>,
        errorMessageF: (err: any) => string,
    ): TE.TaskEither<InternalError, R>;

    public do<R>(
        f: (db: Database) => Promise<R>,
        errorMessageF?: (err: any) => string,
    ): TE.TaskEither<InternalError, R> {
        return TE.tryCatch(
            () => f(this.db),
            (err) =>
                errorMessageF
                    ? InternalError(errorMessageF(err))
                    : InternalError("An error occurred with the database"),
        );
    }

    public transaction<E, R>(
        actions: TE.TaskEither<ContainsInternalError<E>, R>,
    ): TE.TaskEither<ContainsInternalError<E>, R> {
        return pipe(
            // Start database transaction.
            this.do<void>((db) => db.execute(sql`BEGIN`).then(() => undefined)),
            TE.chain(() => actions),
            TE.chain((ret) =>
                pipe(
                    this.do(
                        (db) => db.execute(sql`COMMIT`).then(() => ret), // Ignore the return of the execution and just return the previous value.
                    ),
                    TE.mapError((err) => err as ContainsInternalError<E>),
                ),
            ),
            // Roll back on error.
            TE.orElse((err) =>
                pipe(
                    this.do<void>((db) =>
                        db.execute(sql`ROLLBACK`).then(() => undefined),
                    ),
                    TE.chain(() => TE.left(err)), // Ignore the execute return value.
                ),
            ),
        );
    }
}

export default async function getFuncDb(): Promise<FunctionalDatabase> {
    return new FunctionalDatabase(await getDb());
}
