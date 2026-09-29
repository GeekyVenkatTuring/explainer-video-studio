# HyperFrames Delivery Collateral

## Title options

1. HyperFrames: Write Video in HTML, Then Render It Like Code
2. How HyperFrames Turns HTML into Deterministic Video
3. Video, Written in HTML: The HyperFrames Full Course

## YouTube description

HyperFrames renders video from HTML: timing lives in `data-*` attributes, a paused timeline is sought to any instant, and the renderer turns those sampled states into frames. This course walks from the composition contract and seek-safe animation through visual direction, audio, captions, validation, Studio, and cloud rendering.

It is for web developers, creative technologists, video-tool builders, and teams that want video assets they can write, diff, review, personalize, and render in a repeatable workflow.

00:00 Intro — Video, Written in HTML  
02:21 Part 1 · The Workflows  
04:17 Part 2 · The Contract  
11:44 Part 3 · Motion  
15:57 Part 4 · Creative Direction  
18:40 Part 5 · Media & Audio  
22:34 Part 6 · Ship It  
27:47 Recap

Every visual in this video was generated—there is no stock footage—and the narration is a synthetic voice.

## Chapter summaries

### Intro — Video, Written in HTML

Introduces the central model: an HTML composition declares timing in its data attributes, a runtime seeks to a moment, and snapshots at 30 frames per second become video. It explains why this is useful: no footage is required, the web stack is reusable, the result is plain text for review, and identical input produces identical frames.

### Part 1 · The Workflows

Maps the workflows that share the engine: product launches and website tours, faceless explainers, pull-request videos, captions and talking-head recuts, motion graphics, music videos, and slideshows. It also covers routing by input, then the practical loop of init, write, lint/validate/inspect, preview, and render.

### Part 2 · The Contract

Covers `data-composition-id` and root `data-duration`, clip timing with `data-start`, tracks and z-order, and the single paused timeline that is sought rather than played. It also explains standalone versus sub-compositions and `<template>`, framework-owned media, render-time variables, deterministic seeded randomness, the transform allowlist, and silent failures such as unsized roots, root backgrounds, and duplicate IDs.

### Part 3 · Motion

Shows how seek-safe motion pre-computes layout constants rather than measuring the DOM during a tween, then builds scenes from small atomic rules or multi-phase blueprints. It uses a paused GSAP timeline registered on `window.__timelines`, explains adapters for seven runtimes, and covers CSS scene transitions, named text effects, and motion auditing.

### Part 4 · Creative Direction

Establishes `frame.md` as the source of truth for palette, fonts, and tone, so scenes share one visual system. It argues for dense, hierarchical, continuously moving video frames rather than sparse web-page layouts, then plans palette, type, narration, and beats before authoring.

### Part 5 · Media & Audio

Starts with credential preflight and a deliberate hosted-versus-offline choice, then follows one audio engine from request file to assets and metadata. It covers the TTS fallback ladder, word timestamps and transcription, music and sound-effect retrieval or local generation, language-pinned transcription, and captions built from flat word timing arrays.

### Part 6 · Ship It

Explains the layered checks—lint for structure, validate for runtime and contrast, inspect for visual overflow—and why nested work also needs snapshots. It covers Studio as an editable, user-gated preview step; draft/high/strict/Docker render choices; Lambda frame-range fan-out; the blocks-versus-components registry; and environment upkeep with doctor, current tools, and feedback.

### Recap

Reassembles the course: one HTML file, timing and tracks in data attributes, a paused seekable timeline, deterministic transform-based motion, multiple runtimes, video-first design, one audio engine, and a check-preview-render workflow. The final promise is video that can be written, diffed, reviewed, and rendered like code.

## Key concepts covered

- HTML compositions and frame-by-frame rendering
- `data-composition-id` and `data-duration`
- Clips, `data-start`, and clip durations
- `data-track-index` and deterministic z-order
- Paused timelines and seeking instead of playback
- Standalone compositions and `<template>` sub-compositions
- Framework-owned video and audio playback
- Render-time composition variables
- Seeded randomness and parallel-worker determinism
- Transform-only, seek-safe animation
- GSAP registration on `window.__timelines`
- Runtime adapters for GSAP, Lottie, Three.js, Anime.js, CSS, WAAPI, and TypeGPU
- Video-first design specs, hierarchy, density, and continuous motion
- Audio credential preflight and hosted/local fallbacks
- Word timestamps, transcription, and karaoke-style captions
- Lint, validate, inspect, snapshot, Studio, and user-gated render approval
- Lambda fan-out rendering and reusable registry blocks/components

## Tags

HyperFrames, HTML video, video as code, programmatic video, deterministic rendering, GSAP, web animation, creative coding, video automation, React video, captions, cloud rendering
