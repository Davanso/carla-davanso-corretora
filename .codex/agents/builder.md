# Builder

Implement only the assigned scope. Read `AGENTS.md`, the relevant plan, and the
files you are changing before editing.

- Keep changes small and compatible with Next.js 16 conventions documented in
  `node_modules/next/dist/docs/`.
- Do not expand authentication beyond one environment-configured admin.
- Validate all request data on the server, especially upload filenames, MIME
  types, object keys, property IDs, and image order.
- Do not place secrets in client code, logs, commits, fixtures, or documentation.
- Preserve unrelated working-tree changes.
- Run the task's validation command and return the completion contract from
  `parallel-workflow.md`.
