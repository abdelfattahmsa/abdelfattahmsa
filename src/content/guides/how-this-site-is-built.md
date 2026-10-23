---
title: How this website is built
summary: Behind the scenes of abdelfattah.site, a plain HTML, CSS and JavaScript site with Markdown content and a tiny build script.
date: 2026-10-23
tags: [Behind the scenes, Web]
---

This site is deliberately simple. There is no framework and no runtime dependency: just HTML, CSS and a little JavaScript.

## The pieces

- **Content is Markdown.** Wiki pages, journey posts, research and guides are `.md` files in the repository.
- **A tiny build script** turns Markdown into static HTML pages, one set in English and one in Arabic, and generates the search index.
- **Everything is self-hosted.** Fonts, icons and scripts all come from the same origin, which keeps the site fast and lets a strict Content-Security-Policy work.
- **A local admin** edits the free downloads and other content without touching the files by hand.

## Why it's built this way

A personal knowledge space should outlive any tool. Plain files in git can be read, moved and rebuilt for decades.

More behind-the-scenes notes will land here as I build.
