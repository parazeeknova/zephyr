import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Server Action Generator
  plop.setGenerator("action", {
    description: "Create a new server action",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of your action?"
      },
      {
        type: "input",
        name: "path",
        message: "Where should this action be created? (e.g., app/actions)"
      }
    ],
    actions: [
      {
        type: "add",
        path: "{{path}}/{{camelCase name}}.ts",
        templateFile: "templates/server-action.hbs"
      }
    ]
  });

  // API Route Generator
  plop.setGenerator("route", {
    description: "Create a new API route",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of your route?"
      },
      {
        type: "input",
        name: "path",
        message: "Where should this route be created? (e.g., app/api/users)"
      }
    ],
    actions: [
      {
        type: "add",
        path: "{{path}}/route.ts",
        templateFile: "templates/route.hbs"
      }
    ]
  });

  // Page Generator
  plop.setGenerator("page", {
    description: "Create a new page",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of your page?"
      },
      {
        type: "input",
        name: "path",
        message: "Where should this page be created? (e.g., app/users)"
      },
      {
        type: "confirm",
        name: "isClient",
        message: "Is this a client component?",
        default: false
      }
    ],
    actions: (data) => {
      const actions = [];
      const template = data?.isClient ? "client-page.hbs" : "page.hbs";

      actions.push({
        type: "add",
        path: "{{path}}/page.tsx",
        templateFile: `templates/${template}`
      });

      return actions;
    }
  });

  // Mutation Generator
  plop.setGenerator("mutation", {
    description: "Create a new mutation",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of your mutation?"
      },
      {
        type: "input",
        name: "path",
        message: "Where should this mutation be created? (e.g., mutations)"
      }
    ],
    actions: [
      {
        type: "add",
        path: "{{path}}/{{camelCase name}}.ts",
        templateFile: "templates/mutation.hbs"
      }
    ]
  });

  // Hook Generator
  plop.setGenerator("hook", {
    description: "Create a new React hook",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of your hook? (without 'use' prefix)"
      },
      {
        type: "input",
        name: "path",
        message: "Where should this hook be created? (e.g., hooks)"
      }
    ],
    actions: [
      {
        type: "add",
        path: "{{path}}/use{{pascalCase name}}.tsx",
        templateFile: "templates/hook.hbs"
      }
    ]
  });
}
