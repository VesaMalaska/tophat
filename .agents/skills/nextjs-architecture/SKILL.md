---
name: nextjs-architecture
description: Next.js server, client, route, and caching boundaries for workspaces with the derived nextjs capability.
---

# Next.js architecture

Use only when the validated workspace derives `nextjs`. Follow the project's installed Next.js version and routing conventions; do not infer a specific release or router from TopHat.

- **Server Components:** Keep server-only data access and secrets on the server. Pass serializable, minimal props across client boundaries. Check the project's rendering and caching policy for each data source.
- **Client Components:** Add a client boundary only for interactions or browser APIs that require it. Never import server secrets or privileged modules into the client graph.
- **Route handlers:** Validate inputs and authorization at the server boundary. State response shape, error behavior, and relevant caching explicitly.
- **Server actions:** Treat each action as a server entry point; validate input, authorization, mutation effects, and cache invalidation. Never rely on the caller's client-side checks as authorization.
- **Tests:** Exercise server behavior, client interactions, and route/action contracts with the host project's declared runner and validation scripts. Choose browser flows only when a task actually requires them.
