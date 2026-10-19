# Library Shelf

A Claude skill that checks your Goodreads shelf against your public library's digital collection (Libby/OverDrive) and Hoopla, then builds a page of the books you can borrow right now. Filter by audiobook or ebook, by library, and sort by availability, rating, length, or the date you added the book.

Each person builds their own page from their own accounts. Nothing is shared or uploaded by this repo.

## What you need
- [Claude Code](https://claude.com/claude-code) (or the Claude desktop app's Code tab) with the **Claude in Chrome** extension connected.
- Chrome signed in to the sites you use: Goodreads (only if your profile is private) and Hoopla (if you use it). You log in yourself; the skill never sees or stores passwords.
- Python 3.

## Install
As a plugin:
```
/plugin marketplace add dnaidionov/library-shelf
/plugin install library-shelf@library-shelf
```
Or clone the repo and copy `skills/library-shelf` into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project).

## Use
Open a Claude session in the folder where you want your data kept and say:

> Set up my Library Shelf.

Claude asks for your Goodreads profile link and your libraries, scans, and builds `library-shelf-data/dist/library-shelf.html`. A 500-book shelf takes about 15 minutes, mostly Hoopla. To refresh later: "Rescan my Library Shelf."

If the Artifact tool is available, Claude can also publish the page privately so you can open it on your phone.

## Privacy
- Your shelf, results and config are written only to your own `library-shelf-data/` folder. Keep that folder out of public repos (it is in `.gitignore` here).
- Library catalog lookups use OverDrive's public search interface and send book titles only. Goodreads and Hoopla are read through your own logged-in browser.
- The generated page contains your reading list. Share it only if you mean to.

## Limits
- It is a snapshot; availability changes through the day.
- Matching is by title and author surname, so a few editions may be missed or wrong.
- This relies on the current layouts of Goodreads and Hoopla pages and OverDrive's unofficial search interface, which can change without notice. Check each service's terms before heavy use.
- Hoopla titles count as available now; monthly borrow limits still apply.

## Develop
`examples/sample` holds fake data. To test the build without any account:

```
python3 skills/library-shelf/scripts/build-page.py examples/sample --snapshot "1 Jan 2026"
```

Not affiliated with Goodreads, OverDrive/Libby or Hoopla.
