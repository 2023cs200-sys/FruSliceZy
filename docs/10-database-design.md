# Database Design

## 1. Overview

The initial version can use local JSON files instead of a full database because the game is designed for local gameplay.

This keeps the project lightweight and easy to deploy.

## 2. High Score Storage

File:

```text
data/high_scores.json
```

Example:

```json
[
  {
    "score": 1250,
    "combo": 18,
    "fruits_cut": 72,
    "bombs_hit": 1,
    "difficulty": 5,
    "date": "2026-08-27"
  },
  {
    "score": 980,
    "combo": 11,
    "fruits_cut": 58,
    "bombs_hit": 0,
    "difficulty": 4,
    "date": "2026-08-26"
  }
]
```

## 3. Settings Storage

File:

```text
data/settings.json
```

Example:

```json
{
  "difficulty": "normal",
  "sound_enabled": true,
  "music_enabled": true,
  "controller_port": 8765
}
```

## 4. Future Database Option

If the project is expanded, SQLite can replace JSON storage.

Possible table:

```text
HighScores
-----------
id
score
combo
fruits_cut
bombs_hit
difficulty
date
```

## 5. Data Management

The application should:

- Load scores when starting.
- Add a new score after game over.
- Sort scores from highest to lowest.
- Keep a configurable number of top scores.
- Save settings when they change.

## Current Persistence Status

No backend persistence files are currently used. The browser prototype keeps
scores and settings in React state for the current page session only; it does
not use `localStorage` or a database. There is no high-score screen in the
current UI.

The JSON examples above are a future storage contract. Persistence should be
implemented only after the runtime ownership of scores and settings is
settled.
