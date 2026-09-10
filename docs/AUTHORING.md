# Community Wiki Authoring

`community-wiki-data.json` stores community-authored additions to the standalone wiki. Imported CityLife pages remain the reference baseline; community pages are merged into the same reader without overwriting imported source material.

## Add an article

Add an object to `pages` with these required fields:

```json
{
  "id": "lowercase-kebab-case-id",
  "title": "Clear Article Title",
  "categoryId": "getting-started",
  "status": "published",
  "lastReviewed": "YYYY-MM-DD",
  "summary": "One sentence for search and future assistant use.",
  "content": "# Clear Article Title\n\nWrite the verified information in Markdown."
}
```

Use `needs-review` when information may be outdated. Do not place rules in this file; `CityLife Roleplay.txt` remains the verbatim rules source.

Link to another community article with its stable ID: `[Adding Information](wiki:contributing-information)`.

## Rule-to-guide references

Do not edit the verbatim rules source to add navigation. Add a `ruleGuideLinks` record to `community-wiki-data.json` instead:

```json
{ "ruleSection": "Robbery Rules", "occurrence": 1, "guidePath": "/criminal-guide/criminal-guide/robberies.md", "label": "Robberies Guide" }
```

The reader adds the guide link below the original rules section and a reciprocal rule link below the guide. `occurrence` distinguishes repeated section names.

## Add a map location

Add location records to `locations` before referencing them from an article:

```json
{
  "id": "example-location",
  "name": "Location Name",
  "map": { "x": 0, "y": 0 },
  "notes": "Verified location context."
}
```

Set `locationIds` on an article to an array of location IDs. Coordinates are placeholders until the map integration is implemented.

## Content rules

- Add original, concise descriptions from verified knowledge. Do not overwrite imported source files.
- Use stable IDs; other articles, locations, and a future LLM may reference them.
- Update `lastReviewed` when confirming or correcting an article.
- Keep external source links only when they are necessary to verify a claim.
- Start with the purpose or requirement. Follow with prerequisites, ordered steps, and exceptions.
- Use direct, neutral language. Avoid decorative introductions, jokes, roleplay framing, hype, emoji, and conversational closings.
- Name a section by its task, such as `Requirements`, `Procedure`, `Location`, `Rewards`, or `Related Rules`.
- Use a `> **Note:**` block only for information that changes how the reader should proceed.