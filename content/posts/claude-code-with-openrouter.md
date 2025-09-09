---
title: "Claude Code and OpenRouter"
date: 2025-09-04
tags:
  - inference
  - notes
---

TLDR - You can use any OpenRouter model with Claude Code via y-router, either locally or with their hosted version. Set environment variables to override the API endpoint and you're good to go.

# How to use any OpenRouter model with Claude Code

Claude Code is an Anthropic product that uses the Anthropic API format. OpenRouter uses the OpenAI API format, so we need a router to convert the requests. Here's a straightforward guide on how to connect Claude Code with OpenRouter.

### Step 1: Use a router

Because Claude Code is an Anthropic product - it uses the Anthropic API format. OpenRouter uses the OpenAI API format so we need a router to convert the requests. There's a couple different routers on Github but I prefer [y-router](https://github.com/luohy15/y-router/tree/main?tab=readme-ov-file) for a couple reasons:

1. Its extremely simple to run locally (just a `docker compose up -d`)
2. It has a free hosted version that you can use for Github Actions
3. It's extremely easy to setup your own hosted version via Cloudflare

I run this locally using

```bash
git clone https://github.com/luohy15/y-router.git
cd y-router
docker compose up -d
```

### Step 2: Set the required environment variables

You will need to set the following environment variables before you run the `claude` command. I'm using z-ai/glm-4.5-air for the small model since it's fast enough for most day-to-day tasks, and z-ai/glm-4.5 for when I need more reasoning power.

```bash
# this is the local port that y-router is running on
export ANTHROPIC_BASE_URL="http://localhost:8787"
# using auth token allows you to use CC without needing to login
# you can get this from OpenRouter
export ANTHROPIC_AUTH_TOKEN="sk-or-..."
# choose the "small" model
export ANTHROPIC_SMALL_FAST_MODEL=z-ai/glm-4.5-air
# chose the "large" model
export ANTHROPIC_MODEL=z-ai/glm-4.5
```

### Step 3: Run Claude Code

When you run `claude`, you should see something like

```bash
╭───────────────────────────────────────────────────╮
│ ✻ Welcome to Claude Code!                         │
│                                                   │
│   /help for help, /status for your current setup  │
│                                                   │
│   cwd: /Users/ishandhanani/Desktop/vcs/inboxy     │
│                                                   │
│   ─────────────────────────────────────────────── │
│                                                   │
│   Overrides (via env):                            │
│                                                   │
│   • API Base URL: http://localhost:8787           │
╰───────────────────────────────────────────────────╯
```

And when you run `/model` you should see your OpenRouter model selected.

## Github Actions with OpenRouter

Claude Code has a really solid set of default github actions that you can setup in your repo using `/install-github-actions`. You can easily adapt it to use the OpenRouter models by adding in the `env` section. Here's what I'm using in my projects:

```yaml
---
- name: Run Claude Code Review
  id: claude-review
  uses: anthropics/claude-code-action@v1
  env:
    ANTHROPIC_BASE_URL: ${{ secrets.ANTHROPIC_BASE_URL }}
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    ANTHROPIC_MODEL: z-ai/glm-4.5
    ANTHROPIC_SMALL_FAST_MODEL: z-ai/glm-4.5-air
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: |
      Insert good prompt here
```

In your github action secrets, you will need to set the following:

```yaml
ANTHROPIC_API_KEY: "sk-or-..."
ANTHROPIC_BASE_URL: "https://cc.yovy.app" # this is the shared y-router instance
ANTHROPIC_CUSTOM_HEADERS: "x-api-key: sk-or-..."
```
