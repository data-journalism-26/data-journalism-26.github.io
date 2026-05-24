# Showcase Website - Claude Code Context

This is a portfolio/showcase website for the Data Journalism course (GRAD-E1493) at the Hertie School, Berlin, taught by Prof. Simon Munzert in Spring 2026.

## What this site does

Displays student data journalism projects in a modern news-magazine-style layout. Projects are stored as metadata in `projects.json` and rendered client-side. No build step - plain HTML/CSS/JS deployed as a GitHub Page.

## Key files

- `projects.json` - all project metadata (title, authors, URL, category, editor's pick, thumbnail, blurb)
- `thumbnails/` - student portrait photos (named to match `thumbnail` field in JSON)
- `index.html` - the page
- `style.css` - styling
- `app.js` - client-side rendering from JSON

## Design principles

- Modern, clean, news-magazine aesthetic (The Pudding / NYT Interactive style)
- Dark header, white content, good typography (Inter from Google Fonts)
- Editor's picks prominently featured at top
- Projects grouped by topic category
- Responsive, fast, no frameworks
- Cards link to live project URLs (or GitHub repo if URL is null)

## GitHub org

https://github.com/orgs/data-journalism-26

All student project repos are under this organization. The showcase repo is also here.

## Deployment

GitHub Pages from main branch, root folder. Site URL: https://data-journalism-26.github.io/showcase/
