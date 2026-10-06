import { Context, Effect, Layer } from "effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";

export class WorkspaceNotesError extends Schema.TaggedError<WorkspaceNotesError>()(
  "WorkspaceNotesError",
  {
    path: Schema.String,
    cause: Schema.Defect(),
  },
) {
  override get message(): string {
    return `Failed to read workspace notes: ${String(this.cause)}`;
  }
}

export interface WorkspaceNotesShape {
  readonly read: (path: string) => Effect.Effect<string, WorkspaceNotesError>;
}

export class WorkspaceNotes extends Context.Service<WorkspaceNotes, WorkspaceNotesShape>()(
  "t3/workspace/WorkspaceNotes",
) {}

export const make = (fileSystem: FileSystem.FileSystem) =>
  WorkspaceNotes.of({
    read: (path) =>
      fileSystem
        .readFileString(path)
        .pipe(
          Effect.catchTag("PlatformError", (cause) =>
            Effect.fail(new WorkspaceNotesError({ path, cause })),
          ),
        ),
  });

export const warmNotesCache = (path: string) =>
  Effect.runPromise(Effect.logInfo(`warming workspace notes at ${path}`));

export const layer = Layer.effect(
  WorkspaceNotes,
  Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem;
    return make(fileSystem);
  }),
);
