import { defineConfig } from "@coderabbitai/config";

const approvability = `Fail when a maintainer should read this pull request before CodeRabbit approves it, and name the rule and file. Fail if it:

- Changes a product default: a setting's default value, or what users get without opting in. Making a feature do what it already promises is a bug fix, not a default change.
- Adds or broadens a directive that disables or suppresses a lint, type-checker, LSP, or other static-analysis diagnostic, including file-level, line-level, and configuration-level overrides.
- Adds a subsystem or user workflow, or is a large refactor across apps or packages.
- Changes packages/contracts or persisted data in a way that existing clients or stored data might not accept.
- Changes authentication, pairing, credentials, secrets, or remote connection trust.
- Adds or changes an external side effect, such as acting on GitHub, publishing a release, or calling a webhook.
- Adds, upgrades, or patches a dependency.
- Changes CI or release configuration, agent or contributor instructions, or any review tool's configuration, including .github/, AGENTS.md, CONTRIBUTING.md, .agents/, and .coderabbit.config.ts.

Otherwise pass. A focused bug fix, copy or layout fix, revert, or docs-only or test-only change passes unless a rule above applies. If you cannot decide, fail rather than report inconclusive. When failing, say that the pull request needs a maintainer's review.
`;

// Org members and collaborators merge their own pull requests. CodeRabbit gates
// everyone else's, where its approval tells maintainers what is safe to merge.
const UNGATED_AUTHORS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

// Paths that alone meet an Approvability rule. Naming them to the check keeps
// these rules from depending on its judgment.
const MAINTAINER_PATHS = [
  [
    "CI, agent, or review configuration",
    /^\.(github|vite-hooks|agents|claude|cursor)\/|^\.coderabbit\.config\.ts$|(^|\/)(AGENTS|CLAUDE|CONTRIBUTING)\.md$/,
  ],
  ["dependencies", /^(pnpm-lock\.yaml|pnpm-workspace\.yaml|patches\/)/],
] as const;

export default defineConfig((ctx) => {
  const gated = !UNGATED_AUTHORS.has(ctx.pr?.authorAssociation ?? "");
  const changed = ctx.pr?.changedFiles?.status === "resolved" ? ctx.pr.changedFiles.paths : [];
  const pathRules = MAINTAINER_PATHS.flatMap(([rule, pattern]) => {
    const paths = changed.filter((path) => pattern.test(path));
    if (paths.length === 0) return [];
    const shown = paths.length > 5 ? [...paths.slice(0, 5), `and ${paths.length - 5} more`] : paths;
    return [`- ${rule}: ${shown.join(", ")}`];
  });
  return {
    reviews: {
      high_level_summary: false,
      review_status: false,
      // Request changes until CodeRabbit's comments are resolved and checks pass, then approve.
      request_changes_workflow: gated,
      allow_author_approval: false,
      auto_review: {
        enabled: true,
      },
      pre_merge_checks: {
        override_requested_reviewers_only: true,
        custom_checks: [
          {
            name: "Approvability",
            mode: gated ? "error" : "off",
            instructions:
              pathRules.length === 0
                ? approvability
                : `${approvability}\nThese changed files meet a rule on their own, so fail and name them:\n${pathRules.join("\n")}\n`,
          },
        ],
      },
      path_filters: [
        // Vendored read-only reference checkouts of upstream Effect and Alchemy
        // (see scripts/lib/reference-repos.ts). Nothing imports from them.
        "!.repos/**",
      ],
      path_instructions: [
        {
          path: "{apps,packages,infra}/**/*.ts",
          instructions: "Hold changed code to the rules in docs/internals/effect-services.md.",
        },
        {
          path: "apps/web/src/**/*.{tsx,css}",
          instructions: "Hold changed code to the rules in docs/internals/web-ui.md.",
        },
      ],
    },
    knowledge_base: {
      code_guidelines: {
        filePatterns: [
          { files: "docs/internals/effect-services.md", applyTo: "{apps,packages,infra}/**/*.ts" },
          { files: "docs/internals/web-ui.md", applyTo: "apps/web/src/**/*.{tsx,css}" },
        ],
      },
    },
  };
});
