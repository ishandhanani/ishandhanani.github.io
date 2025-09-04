---
title: "A Minimal Nix Home-Manager Configuration"
date: 2025-09-04
tags:
  - notes
  - nix
  - personal
  - home-manager
---

TLDR - I moved from a homespun, complex and honestly quite fragile setup script system to a clean Nix Home Manager configuration for my personal mac and ephemeral linux VMs.

For years, I managed my environment with a mix of hand-rolled setup scripts and scattered package installs. It worked—barely. But as I spun up more machines (Linux VMs, SLURM clusters, random dev boxes) and layered on complexity, the approach got increasingly fragile.

Because I'm on vacation, I finally bit the bullet and tried Nix Home Manager. I’m not running NixOS; I use macOS on my laptop and a bunch of plain Linux machines. Home Manager has been a perfect middle ground: declarative configs, reproducible dotfiles, and just enough pragmatism to let me keep working the way I like. This blog post is primarily a collection of learnings and somewhat of a worklog. Much of the initial setup was written by claude code by taking my setup repo and asking it to write the most simple home manager configuration possible. From there I worked with cursor to slowly add more and more complexity until I could run `./install` and get a working setup.

You can find my configuration on [github](https://github.com/ishandhanani/dotfiles).

## Understanding Nix, NixOS and Home Manager at a high level

Before diving in, it’s worth clarifying the landscape because the terminology can get confusing.

- **Nix** is the package manager and language. At its core, it’s a way to describe packages and configurations _declaratively_. Instead of saying “run this install command,” you describe what you want (e.g. `git`, `vim`), and Nix figures out how to build it in a reproducible way.

- **NixOS** is a full Linux distribution built on Nix. It takes the declarative idea to the extreme: the kernel, services, users, even systemd units are all defined in Nix. You run `nixos-rebuild` and your whole system state updates atomically.

- **Home Manager** is the piece I actually use. It brings the declarative style of Nix to _user-level environments_ (dotfiles, shells, editors, CLI tools), without requiring NixOS. You can run it on macOS or any Linux distro, and it just manages your home directory setup.

Here’s the mental model:

```
                  ┌──────────────┐
                  │     Nix      │   ← the package manager + language
                  └──────┬───────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
 ┌───────────────┐                 ┌───────────────┐
 │    NixOS      │                 │ Home Manager  │
 │ full OS built │                 │ user-level    │
 │ on Nix        │                 │ configs/tools │
 └───────────────┘                 └───────────────┘
```

I didn’t want to replace macOS or declaratively manage kernels and services. I just wanted my **dotfiles, shells, and tools** to stay consistent across laptops and ephemeral VMs. That’s exactly what Home Manager gives me.

### What about flakes?

Flakes are a newer feature of Nix that make configurations **pinned, reproducible, and shareable**.

- Without flakes, Nix pulls packages from a moving channel (so today’s `nixos-unstable` might be different tomorrow).
- With flakes, you pin exact commits of nixpkgs and other inputs in a `flake.lock` file.
- You also get a standardized structure for declaring configs, which makes it easier to share and reproduce them.

Basically - flakes allow me to run

```bash
nix run home-manager/master -- switch --flake .#ishandhanani@macbook
```

…and know I’ll get the **same environment every time, on every machine**.

> [!important]
> For my workflow, I didn’t need the full power of NixOS. I just wanted my shells, dotfiles, and dev tools to be reproducible across macOS and Linux VMs. That’s why I anchored everything around Home Manager, with flakes providing reproducibility and modular configs keeping it understandable.

## Scratchpad and learnings

### Making sure you pull from cache as much as possible

The first time I tried building on my Mac, it tried to build LLVM and Apple SDKs from source which didn't seem right as I only wanted to install git and vim. The culprit? I was tracking nixos-unstable, which often doesn’t publish macOS binaries. Because I'm only using nix for packages (and not nixos in its entirety), I can directly point toward nixpkgs-unstable. In my `flake.nix`, I changed

```diff
- inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
+ inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
```

This was a dramatic improvement. Hours to seconds.

### Repo structure

People have their nix configs setup in a variety of ways. For me, it made sense to keep things relatively modular (using home-manager `modules`) and simple. My current repo structure looks like this:

```
dotfiles/
├─ flake.nix
├─ home.nix
├─ home-linux.nix
└─ modules/
   ├─ zsh.nix
   ├─ vim.nix
   ├─ git.nix
   └─ uvx.nix
```

At a high level

- `home.nix` → core configuration (username, home dir, basic packages)
- `home-linux.nix` → core configuration for linux. Used for ephemeral linux VMs.
- `modules/` → split by concern (zsh, vim, git)
- `flake.nix` → pins nixpkgs/home-manager and wires everything together

### Using uvx for non-nixpkgs packages

Not everything I use is packaged in nixpkgs. For Python-based tools, I rely on uvx (`llm`). Rather than give up on declarative installs, I wrote a tiny Home Manager module (modules/uvx.nix) that runs once per activation. I found this to be a good balance rather than figuring out how write my own nix package. It's declarative enough 😄.

```nix
{ config, lib, pkgs, ... }:

# Tools that I want to specifically install with uvx

let
  # List of uv tools you want installed
  uvxTools = [ "llm" ];
in
{
  home.activation.installUvTools = lib.hm.dag.entryAfter [ "writeBoundary" "linkGeneration" ] ''
    echo "🔧 Running uv tools activation script..."
    mkdir -p "$HOME/.local/bin"

    if [ -f "$HOME/.nix-profile/bin/uv" ]; then
      echo "✅ uv found, installing tools: ${builtins.concatStringsSep " " uvxTools}"
      for tool in ${builtins.concatStringsSep " " uvxTools}; do
        echo "📦 Installing $tool..."
        "$HOME/.nix-profile/bin/uv" tool install "$tool" --force
      done
      echo "✅ uv tools installation complete"
    else
      echo "❌ uv not found at $HOME/.nix-profile/bin/uv, skipping uv tool installs"
    fi
  '';
}
```

When I switch configs on a new VM, all my CLI helpers land in `~/.local/bin` without me touching a thing.

### Sourcing shell scripts to include helper functions

This is another place where I decided to take a pragamtic approach. I've written a couple ai-powered shell scripts that I include in my zshrc. Instead of using Nix's weird string inclusion syntax, I just source them in my zshrc. Much cleaner and extensible in my opinion.

```nix
    # Zsh-specific configuration
    initContent = lib.mkMerge [
      ''
        source ${../functions/ai-functions.zsh} > /dev/null 2>&1
      ''
    ];
```

## The Result

This setup handles everything from my shell aliases to development tools in a declarative way. The entire environment is defined in ~200 lines of Nix across a few modules.

I'm considering extending this approach to manage development environments for specific projects with their own dependencies and shell configurations. At some point I'll look into `nix-darwin` for system-level macOS configurations, which will probably mean the inclusion of a `darwin/` folder.
