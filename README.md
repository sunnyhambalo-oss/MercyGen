# MercyGen Church Website

A clean, modern, Christ-centered church website inspired by Apple-style minimalist design. The site is built to highlight Jesus, community, worship, and action rather than promoting the church brand alone.

## Overview

This project presents MercyGen Church as a welcoming digital home for:
- worship and prayer
- youth and campus communities
- daily spiritual encouragement
- testimonies and updates
- donations and mission support

The design emphasizes clarity, usability, elegance, and responsiveness across desktop and mobile screens.

## Core message

The site intentionally centers its message around:
- “Love God Love People Change The World”
- “Anointed and appointed for action”

These statements are woven into the design, content, and overall user experience.

## Pages included

### Home page
The home page includes:
- testimony videos
- updates section for events and announcements
- an “All” content section that aggregates content in one easy-to-scan layout
- prominent mission message and motto
- meetup location information

### College page
This page is dedicated to college and university students and highlights:
- worship and prayer gatherings
- discipleship and mentorship
- mission and service opportunities

### High School page
This page is dedicated to high school students and highlights:
- youth worship and prayer
- leadership development
- belonging and encouragement

### Devotional page
This page includes:
- a verse of the day
- a Bible version selector (NIV, KJV, ESV)
- a form where users can submit their own devotion reflections
- a community devotional list

### Donations page
The donation page includes:
- simple donation amount selection
- secure-looking payment form layout
- giving options for supporting church mission work

## How the site works

### Front-end structure
The site is built with plain HTML, CSS, and JavaScript for simplicity and fast loading.

- HTML files define each page and its sections
- CSS handles the Apple-inspired layout, typography, spacing, cards, colors, and responsiveness
- JavaScript manages dynamic behavior and interactive content

### Content model
The website uses in-browser JavaScript data arrays to simulate real community content such as:
- devotion submissions
- event updates
- general site content

This gives the site a polished, modern feel while keeping the project lightweight and easy to modify.

### Interactivity implemented
The JavaScript includes features such as:
- devotional version switching
- new devotional submissions added to the list instantly
- donation amount selection and checkout mock flow

### Technical architecture
This project is intentionally lightweight and static for easy hosting and quick iteration.

- Each page is a standalone HTML document
- Shared styling is centralized in [styles.css](styles.css)
- Shared behavior and sample data live in [script.js](script.js)
- Content is currently mocked in JavaScript arrays and rendered dynamically on the page

This makes the project straightforward to expand into a full CMS or backend-powered application later.

### Planning for future backend integration
The current version is front-end only and is suitable for a prototype or landing site. It can later be upgraded with:
- a real database for testimonies and updates
- user authentication and role-based permissions
- admin dashboards
- a real donation payment processor
- CMS support for managing media and events

## Requirements and stack

### Current project stack
- HTML5
- CSS3
- Vanilla JavaScript
- Static file hosting

### Recommended local tools
- any modern browser
- a simple web server
- optional VS Code for editing and previewing

## Files in the project

- [index.html](index.html) — home page
- [college.html](college.html) — college/student page
- [high-school.html](high-school.html) — high school page
- [devotional.html](devotional.html) — verse and devotion page
- [donate.html](donate.html) — donation page
- [styles.css](styles.css) — all layout and visual styling
- [script.js](script.js) — interactivity and dynamic page logic
- [README.md](README.md) — project documentation

## How to run locally

Open the project in a browser by launching the HTML files directly, or serve the folder with a local static server.

Example:

```bash
cd C:/Users/HP/Desktop/MercyGen
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

If Python is not available in your environment, use a Node-based static server instead:

```bash
cd C:/Users/HP/Desktop/MercyGen
npx serve .
```

## Security and production notes

The current donation page is a front-end mockup and should not be treated as production payment processing.

For a live production version, the following should be added:
- secure payment integration (e.g. Stripe or a trusted gateway)
- GDPR-safe data handling
- server-side validation
- authenticated admin roles
- protected access for media management features

## Purpose of the website

The website is created to:
- present Christ clearly and centrally
- encourage people to love God and love people
- promote discipleship, prayer, and mission
- build a welcoming church community online
- provide practical tools for outreach, support, and engagement

## Summary

MercyGen Church’s website combines a simple, premium visual style with meaningful ministry functionality. It is built not just to advertise the church, but to reflect the heart of Christ, community, and action.

## Account and role information

The project is designed around the following account structure:

### 1. Master Admin Account
Role:
- full control of the website
- can post updates and announcements
- can manage all content and site settings
- has access to all community moderation capabilities

Purpose:
- manages the church’s central communication and content strategy

### 2. Media Team Account
Role:
- controls updates, visual posts, and media content
- manages church imagery, testimonies, and event promotion
- publishes official media to the home page

Purpose:
- keeps the church’s digital presence active, beautiful, and aligned with the mission

### 3. Other User Accounts
Role:
- can submit testimonies
- can submit devotions
- can participate in community engagement

Purpose:
- enables church members and followers to contribute to a vibrant, shared experience

## Design inspiration

The visual style is inspired by Apple.com in the following ways:
- spacious layout
- soft neutral colors
- minimalistic typography
- high-contrast focus on content
- generous white space
- rounded cards and clean surfaces
- elegant emphasis on key messages

## Responsive design

The website is built to adapt to different viewports, including:
- mobile phones
- tablets
- laptops
- desktop monitors

Navigation, grids, and cards collapse into clean mobile-friendly layouts when the screen becomes smaller.

## Files in the project

- index.html — home page
- college.html — college/student page
- high-school.html — high school page
- devotional.html — verse and devotion page
- donate.html — donation page
- styles.css — all layout and visual styling
- script.js — interactivity and dynamic page logic

## How to run locally

Open the project in a browser by launching the HTML files directly, or serve the folder with a local static server.

Example:

```bash
cd C:/Users/HP/Desktop/MercyGen
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Purpose of the website

The website is created to:
- present Christ clearly and centrally
- encourage people to love God and love people
- promote discipleship, prayer, and mission
- build a welcoming church community online
- provide practical tools for outreach, support, and engagement

## Summary

MercyGen Church’s website combines a simple, premium visual style with meaningful ministry functionality. It is built not just to advertise the church, but to reflect the heart of Christ, community, and action.
