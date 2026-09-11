# Shared Map Setup

The wiki remains hosted on GitHub Pages. Supabase supplies member login and the private shared map.

## 1. Create the project

1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor**, paste the complete contents of `supabase-map-schema.sql`, and run it once.
3. Open **Project Settings > API** and copy the Project URL and publishable/anon key.
4. Put those two public values in `supabase-config.js`.

Do not put the `service_role` key in this repository. The publishable/anon key is designed for browser use; Row Level Security protects the data.

## 2. Configure username/password login

In **Authentication > Providers > Email**:

- Keep email/password signups enabled.
- Turn **Confirm email** off. The app uses a private synthetic email internally so members only enter a username and password.

Members remain signed in on each device through Supabase's persistent browser session. Because accounts do not use real inboxes, forgotten passwords must be reset by the owner from the Supabase Authentication dashboard.

## 3. Create the private wiki workspace

1. Rerun the complete `supabase-map-schema.sql` after updating these files. It safely replaces the functions and prevents additional workspaces from being created.
2. Open the wiki, expand **First-time owner setup**, and create the owner username/password.
3. Create the first workspace when prompted.
4. Open **Map sync** and copy the generated site key to approved members.
5. Members create an account using a username, password, and that site key.

The first owner can import the browser's previous local map from the Map sync panel. The import is one-time and preserves the old data until the cloud save succeeds.

## Access model

- The normal wiki interface is hidden until a user is both signed in and a workspace member.
- GitHub Pages files are still statically downloadable by a determined visitor. Truly private articles would also need to be moved into Supabase.
- Shared drawings and points are visible only to authenticated workspace members.
- Owners and editors can modify the map.
- Every cloud save records a revision and the responsible account.
- The invite code can be rotated from the Supabase SQL editor if it is exposed.
