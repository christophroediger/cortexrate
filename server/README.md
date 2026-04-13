Backend-only modules live here as the project grows.

- Keep HTTP parsing and response shaping in `app/api/...`.
- Keep database access, protected operations, and domain logic here.
- Do not import server-only code into client components.
