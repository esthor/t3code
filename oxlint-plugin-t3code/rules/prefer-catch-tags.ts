import { defineRule } from "@oxlint/plugins";

const MESSAGE = "Catch known tags with `Effect.catchTags({ Tag: handler })`, even for one tag.";

/** Reports `Effect.catchTag`, through any namespace import of `effect/Effect` or a named import. */
export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Require `Effect.catchTags` over `Effect.catchTag`.",
    },
  },
  create(context) {
    const effectNamespaces = new Set<string>();
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "effect/Effect") return;
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier") {
            effectNamespaces.add(specifier.local.name);
          } else if (
            specifier.type === "ImportSpecifier" &&
            (specifier.imported.type === "Identifier"
              ? specifier.imported.name
              : specifier.imported.value) === "catchTag"
          ) {
            context.report({ node: specifier, message: MESSAGE });
          }
        }
      },
      MemberExpression(node) {
        if (
          !node.computed &&
          node.object.type === "Identifier" &&
          effectNamespaces.has(node.object.name) &&
          node.property.type === "Identifier" &&
          node.property.name === "catchTag"
        ) {
          context.report({ node, message: MESSAGE });
        }
      },
    };
  },
});
