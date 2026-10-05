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

export default defineConfig({
  reviews: {
    high_level_summary: false,
    review_status: false,
    // Request changes until CodeRabbit's comments are resolved and checks pass, then approve.
    request_changes_workflow: true,
    allow_author_approval: false,
    auto_review: {
      enabled: true,
    },
    pre_merge_checks: {
      override_requested_reviewers_only: true,
      custom_checks: [{ name: "Approvability", mode: "error", instructions: approvability }],
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
});
