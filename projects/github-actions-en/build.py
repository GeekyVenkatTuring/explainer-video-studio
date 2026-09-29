#!/usr/bin/env python3
"""GitHub Actions, Explained — build (English, prefix `gha`).

A ~40-minute chaptered course: what GitHub Actions is, every major feature, how to
automate with it — plus a closing tour of the rest of the GitHub platform.

Identity: "the workflow run graph" (GitHub-dark). Semantic colors mirror gha/core.tsx:
  EVT amber = events/triggers · RUN blue = runners/jobs · ACT violet = actions/code/data
  OK green = success/deploy · BAD red = failure/danger/security
Voice: Kokoro ONNX af_bella (offline, direct). Captions ON. 16:9 1080p30.
Renders PER CHAPTER (artifacts/ch/chNN.json), then concatenates to a master.

Run with the kokoro-onnx venv:
  projects/midcap5-picks-en/.venv/bin/python3 projects/github-actions-en/build.py
Idempotent: delete assets/<id>.wav (and assets/raw/<id>_c*.wav) to regenerate a beat.

Caption text = the narration as written. TTS text = narration run through PRON (spoken
forms for acronyms), so captions read "CI/CD" while the voice says "C I C D".
"""
import json, os, re, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro

KOKORO_MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
KOKORO_VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE, LANG = "af_bella", "en-us"
_K = None
def kokoro():
    global _K
    if _K is None: _K = Kokoro(KOKORO_MODEL, KOKORO_VOICES)
    return _K

GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PREFIX = "gha"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets")
CHDIR = os.path.join(ROOT, "artifacts", "ch")
for d in (PUBLIC, RAW, CHDIR, os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

EVT, RUN, ACT, OK, BAD = "#F2A93B", "#58A6FF", "#BC8CFF", "#3FB950", "#F85149"

# spoken forms (TTS only; captions keep the written form)
PRON = [
    (r"\bCI/CD\b", "C I, C D"), (r"\bCI\b", "C I"), (r"\bCD\b", "C D"),
    (r"\bOIDC\b", "O I D C"), (r"\bGITHUB_TOKEN\b", "GitHub token"),
    (r"\bgh workflow run\b", "G H workflow run"), (r"\bgh\b", "G H"),
    (r"\bGHCR\b", "G H C R"), (r"\bPyPI\b", "pie P I"), (r"\bUTC\b", "U T C"),
    (r"\bIST\b", "I S T"), (r"\bAPI\b", "A P I"), (r"\bAWS\b", "A W S"),
    (r"\bIDE\b", "I D E"), (r"\bCLI\b", "C L I"), (r"\bCodeQL\b", "code Q L"),
    (r"\bPRs\b", "P Rs"), (r"\bURL\b", "U R L"),
]
def spoken(t):
    for a, b in PRON:
        t = re.sub(a, b, t)
    return t

CHAPTERS = {
    0: "Intro", 1: "The Big Picture", 2: "Anatomy of a Workflow", 3: "Triggers & Events",
    4: "Runners & Jobs", 5: "Actions: Building Blocks", 6: "Data, Secrets & Caching",
    7: "Deploying with Actions", 8: "Security", 9: "Cost, Speed & Debugging",
    10: "Beyond Actions: The Rest of GitHub",
}

def divider(n, title, sub, color, text, ch):
    return (f"d{n:02d}", "gha_divider", {"n": n, "title": title, "sub": sub, "color": color, "total": 10}, text, ch)

SEGMENTS = [
 # ================================================================ CH00 · INTRO
 ("t00", "gha_title",
  {"kicker": "GITHUB ACTIONS · THE COMPLETE GUIDE", "line1": "GitHub Actions,", "line2": "Explained",
   "sub": "events · workflows · runners · deploys · security — plus a tour of GitHub"},
  "Every time you push code, something could happen automatically. [pause] Tests could run. A build "
  "could ship. A bug could be caught before anyone sees it. [pause] That something is GitHub Actions. "
  "Let's learn it from zero to production — and then tour the rest of GitHub.", 0),

 ("h00", "gha_manual",
  {"steps": ["Run the tests", "Build the app", "Package it", "Copy to server", "Restart & pray"]},
  "Picture a team with no automation. [pause] A developer finishes a feature. Now they run the tests "
  "by hand — if they remember. They build the app on their own laptop. They copy files to a server. "
  "[pause] Then comes the classic line: it works on my machine. [pause] Every step is slow, manual, and "
  "easy to get wrong. And it happens dozens of times a day, across the whole team. [pause] Now picture "
  "a robot that watches your repository. The moment code arrives, it runs every step, the same way, "
  "every time, on a clean machine. [pause] That robot is what we're building toward.", 0),

 ("h01", "gha_timeline",
  {"events": [
     {"y": "2018", "t": "Announced", "d": "Actions unveiled, in beta"},
     {"y": "2019", "t": "GA with CI/CD", "d": "Hosted runners for Linux, Windows, macOS"},
     {"y": "2021", "t": "OIDC + reuse", "d": "Keyless cloud logins, reusable workflows"},
     {"y": "2024", "t": "Attestations", "d": "Signed build provenance, Arm64 runners"},
     {"y": "2025", "t": "Scale-ups", "d": "Free Arm runners for public repos, deeper nesting"},
     {"y": "2026", "t": "Price cut", "d": "Hosted runners up to 39% cheaper"}]},
  "GitHub Actions isn't new, but it has grown fast. [pause] It was announced in twenty eighteen, and "
  "became generally available with full CI/CD in late twenty nineteen. [pause] Since then it has added "
  "keyless cloud logins, reusable workflows, Arm runners, and signed build attestations. [pause] In "
  "January twenty twenty six, GitHub cut hosted runner prices by up to thirty nine percent. [pause] "
  "Today it's the default automation engine for a huge share of projects on GitHub — and for public "
  "open source repositories, standard runners are completely free.", 0),

 ("r00", "gha_roadmap",
  {"parts": [
     {"t": "The Big Picture", "s": "CI/CD and where Actions fits", "c": RUN},
     {"t": "Anatomy of a Workflow", "s": "one YAML file, line by line", "c": ACT},
     {"t": "Triggers & Events", "s": "push, PRs, schedules, buttons", "c": EVT},
     {"t": "Runners & Jobs", "s": "machines, graphs, matrices", "c": RUN},
     {"t": "Actions", "s": "reusable building blocks", "c": ACT},
     {"t": "Data, Secrets & Caching", "s": "expressions, outputs, caches", "c": ACT},
     {"t": "Deploying", "s": "environments, approvals, OIDC", "c": OK},
     {"t": "Security", "s": "tokens, pinning, injection", "c": BAD},
     {"t": "Cost, Speed & Debugging", "s": "run it well, fix it fast", "c": EVT},
     {"t": "The Rest of GitHub", "s": "PRs, Issues, Copilot, Codespaces…", "c": OK}]},
  "Here's the map. [pause] We start with the big picture, then the anatomy of a workflow file, line "
  "by line. [pause] Then triggers, runners and jobs, and the reusable actions that make it all fast. "
  "[pause] Next, how data flows — expressions, secrets, outputs and caching. [pause] Then deployments, "
  "security, cost, speed and debugging. [pause] And finally, a tour of the rest of GitHub — pull "
  "requests, issues, projects, Codespaces, Copilot and security features. [pause] By the end, you'll "
  "read any workflow file, and write your own.", 0),

 # ================================================================ CH01 · BIG PICTURE
 divider(1, "The Big Picture", "CI/CD — and where Actions fits", RUN,
  "Part one. The big picture. [pause] Before any YAML, let's understand the problem Actions solves.", 1),

 ("c01", "gha_cicd", {},
  "Two ideas sit underneath everything. [pause] First, continuous integration, or CI. Everyone merges "
  "small changes often, and every merge is automatically built and tested. Problems surface in "
  "minutes, not weeks. [pause] Second, continuous delivery, or CD. Once a change passes, it's "
  "automatically packaged and shipped — to staging, then to production. [pause] Together they form a "
  "loop. Code, build, test, release, deploy, monitor — and back to code. [pause] The faster that loop "
  "spins, the faster a team learns. GitHub Actions is the engine that spins it.", 1),

 ("c01b", "gha_compare",
  {"kicker": "WHY ACTIONS?", "title": "A separate CI server vs. Actions",
   "left": {"h": "Traditional CI server", "icon": "🖥️", "c": BAD,
            "items": ["A server you host, patch and back up", "Webhooks wired to each repo",
                      "Mostly reacts to code pushes", "Plugins installed server-side"]},
   "right": {"h": "GitHub Actions", "icon": "⚡", "c": OK,
             "items": ["Lives inside GitHub, next to your code", "Built in — nothing to wire up",
                       "Reacts to dozens of GitHub events", "Thousands of reusable actions"]}},
  "There are other tools for this — Jenkins, CircleCI, GitLab CI. So why Actions? [pause] The big "
  "difference is where it lives. Actions runs inside GitHub, right next to your code, your pull "
  "requests and your issues. [pause] No separate server to patch. No webhooks to wire up. [pause] And "
  "it's not just for CI. Actions reacts to almost any event on GitHub — a new issue, a comment, a "
  "release, a schedule. [pause] So it's really a general automation platform that happens to be great "
  "at CI/CD.", 1),

 ("c01c", "gha_hierarchy", {},
  "Now the mental model. Five words, and everything else hangs off them. [pause] An event is something "
  "that happens — like a push. [pause] The event triggers a workflow: a YAML file in your repository. "
  "[pause] A workflow contains one or more jobs. [pause] Each job runs on a runner — a fresh virtual "
  "machine. [pause] And each job is a list of steps, run in order. A step either runs a shell command, "
  "or uses a prebuilt action. [pause] Event, workflow, job, runner, step. Hold on to that chain. Every "
  "chapter from here zooms into one link of it.", 1),

 # ================================================================ CH02 · ANATOMY
 divider(2, "Anatomy of a Workflow", "one YAML file, line by line", ACT,
  "Part two. Anatomy of a workflow. [pause] Let's open a real workflow file and read it, line by line.", 2),

 ("a02", "gha_yaml",
  {"kicker": "YOUR FIRST WORKFLOW", "title": "Fifteen lines that test every change", "file": ".github/workflows/ci.yml",
   "lines": ["name: CI", "on:", "  push:", "    branches: [main]", "  pull_request:", "jobs:", "  test:",
             "    runs-on: ubuntu-latest", "    steps:", "      - uses: actions/checkout@v4",
             "      - uses: actions/setup-node@v4", "        with:", "          node-version: 22",
             "      - run: npm ci", "      - run: npm test"],
   "notes": [
     {"a": 0, "b": 0, "at": 0.19, "c": ACT, "t": "name — the label shown in the Actions tab"},
     {"a": 1, "b": 4, "at": 0.32, "c": EVT, "t": "on — the trigger: pushes to main + every pull request"},
     {"a": 5, "b": 6, "at": 0.5, "c": RUN, "t": "jobs — one job, called “test”"},
     {"a": 7, "b": 7, "at": 0.6, "c": RUN, "t": "runs-on — which machine: latest Ubuntu"},
     {"a": 8, "b": 14, "at": 0.7, "c": OK, "t": "steps — checkout, install Node, install deps, test"}]},
  "Workflows live in one place: a folder called dot github, slash workflows. Any YAML file there is a "
  "workflow. [pause] Line one, name, is just the label you'll see in the UI. [pause] Next, on. This is "
  "the trigger. Here: run on every push to main, and on every pull request. [pause] Then jobs. We have "
  "one job, called test. [pause] runs-on picks the machine: the latest Ubuntu runner. [pause] And steps "
  "is the to-do list. Check out the code. Install Node. Install dependencies. Run the tests. [pause] "
  "Fifteen lines, and every pull request now gets tested automatically.", 2),

 ("a02b", "gha_steps", {},
  "Every step is one of two kinds. [pause] A uses step pulls in an action — reusable code someone "
  "already wrote. actions slash checkout, at v4, means: the checkout action, from the actions "
  "organization, version four. The with block passes it inputs. [pause] A run step is plain shell. "
  "Whatever you'd type in a terminal, you can put here. Use a pipe character to write several lines. "
  "[pause] Steps in a job share the same machine and the same files. So step one checks out the code, "
  "and step four can test it. [pause] That shared workspace is what makes a job feel like one "
  "continuous script.", 2),

 ("a02c", "gha_lifecycle", {},
  "So what actually happens when you push? [pause] GitHub receives the push, and records an event. "
  "[pause] It looks in dot github slash workflows — in that exact commit — for workflows listening to "
  "push. [pause] Each match becomes a workflow run, and its jobs go into a queue. [pause] A runner picks "
  "up a job. On hosted runners, that's a brand new virtual machine, created just for this job. [pause] "
  "The runner downloads the actions, runs each step, and streams the logs back live. [pause] When the "
  "job finishes, the machine is destroyed. And a green check, or a red cross, appears next to your "
  "commit.", 2),

 ("a02d", "gha_runlog", {},
  "You watch all of this in the Actions tab. [pause] On the left, every run of every workflow. Click "
  "one, and you see a graph of its jobs. [pause] Click a job, and you get the live log — every step, "
  "with its own timing, expandable line by line. [pause] The same result shows up on pull requests as a "
  "status check. [pause] With branch protection, you can make those checks required. The merge button "
  "stays locked until the tests pass. [pause] That's the whole loop: a push, a run, a verdict — right "
  "where the team works.", 2),

 # ================================================================ CH03 · TRIGGERS
 divider(3, "Triggers & Events", "when does a workflow run?", EVT,
  "Part three. Triggers. [pause] A workflow does nothing until an event wakes it up. Let's meet the "
  "events.", 3),

 ("e03", "gha_events", {},
  "The on key accepts dozens of events. Here are the ones you'll use most. [pause] push and pull "
  "request — the heart of CI. [pause] workflow dispatch — a manual Run button. [pause] schedule — run "
  "on a timer. [pause] release — when you publish a version. [pause] issues and issue comment — to "
  "automate project management. [pause] workflow run — start one workflow after another finishes. "
  "[pause] And repository dispatch — let an outside system trigger you through the API. [pause] One "
  "workflow can listen to several events at once.", 3),

 ("e03b", "gha_filter", {},
  "Usually you don't want every push to trigger everything. So events take filters. [pause] branches "
  "limits runs to certain branches. tags does the same for tags. [pause] paths is the powerful one. It "
  "says: only run if these files changed. [pause] Watch. This push changed a readme and a doc. Neither "
  "matches src slash star star, or package dot json — so the workflow is skipped. [pause] The next push "
  "touched a source file. Match — the workflow runs. [pause] For pull requests, types narrows it "
  "further: opened, synchronize, labeled, and so on. [pause] Good filters save minutes, money and "
  "noise.", 3),

 ("e03c", "gha_cron", {"expr": "30 2 * * 1-5"},
  "The schedule trigger uses cron syntax. Five fields: minute, hour, day of month, month, and day of "
  "week. [pause] Thirty, two, star, star, one to five means: at two thirty, Monday to Friday. [pause] "
  "One catch — the time is always UTC. In India, two thirty UTC is eight AM IST. [pause] Scheduled "
  "runs use the default branch, can start a few minutes late when GitHub is busy, and can't run more "
  "often than every five minutes. [pause] In public repos, schedules pause after sixty days without "
  "activity. [pause] Use them for nightly builds, dependency checks, reports and cleanup.", 3),

 ("e03d", "gha_dispatch", {},
  "workflow dispatch adds a Run workflow button to the Actions tab. [pause] Better still, it takes "
  "inputs. Here we ask for an environment — staging or production — and a dry run checkbox. [pause] "
  "GitHub renders them as a small form. You pick values, click Run, and the workflow reads them from the "
  "inputs context. [pause] It's perfect for one-click deploys, database migrations, and anything a "
  "human should start on purpose. [pause] You can trigger the same thing from a terminal, too, with gh "
  "workflow run.", 3),

 # ================================================================ CH04 · RUNNERS & JOBS
 divider(4, "Runners & Jobs", "where your code actually runs", RUN,
  "Part four. Runners and jobs. [pause] Where does your code actually run, and how do jobs work "
  "together?", 4),

 ("j04", "gha_hosted", {},
  "The easy option is a GitHub-hosted runner. [pause] You write runs-on ubuntu-latest, windows-latest, "
  "or macos-latest, and GitHub hands you a fresh virtual machine, preloaded with common tools. [pause] "
  "There are Arm runners, larger machines with more cores, and even GPU runners. [pause] The key word "
  "is ephemeral. Every job gets a clean machine, and it's wiped when the job ends. [pause] Nothing leaks "
  "between runs. That's why builds are reproducible — and why you'll want caching, which we'll see "
  "later. [pause] A single job on a hosted runner can run for up to six hours.", 4),

 ("j04b", "gha_selfhosted", {},
  "The other option is a self-hosted runner: your own machine, registered with GitHub. [pause] A small "
  "agent on it asks GitHub for work, runs the job, and reports back. [pause] Why do this? Special "
  "hardware. Access to a private network. Or heavy workloads where your own machines are cheaper. "
  "[pause] At scale, teams run the Actions Runner Controller on Kubernetes. It watches the queue and "
  "scales runner pods up and down automatically. [pause] The trade-off: you now own patching, security "
  "and cleanup. [pause] And never attach self-hosted runners to public repositories — a stranger's pull "
  "request could run code on your machine.", 4),

 ("j04c", "gha_dag", {},
  "A workflow can hold many jobs, and by default they all start at once, in parallel. [pause] To order "
  "them, use needs. Here, unit tests and end-to-end tests both need build. Deploy needs every check. "
  "[pause] GitHub turns that into a graph, and starts each job the moment its needs are done. [pause] "
  "Watch the timeline. Run one after another, these jobs take eleven minutes. Run as a graph, just six. "
  "[pause] And if a job fails, everything that needs it is skipped. A broken build never reaches "
  "deploy.", 4),

 ("j04d", "gha_matrix", {},
  "Need to test on several platforms? Don't copy the job — use a matrix. [pause] Give it lists: three "
  "operating systems, and three Node versions. [pause] GitHub multiplies them out: three times three, "
  "nine jobs, all in parallel. [pause] exclude removes combinations you don't need. include adds "
  "special ones. Here we drop one and add one — still nine. [pause] By default, fail-fast is on: if one "
  "job fails, GitHub cancels the rest to save time. Turn it off when you want the full picture. [pause] "
  "One matrix can generate up to two hundred and fifty six jobs.", 4),

 ("j04e", "gha_services", {},
  "Jobs often need a real database to test against. That's what service containers are for. [pause] "
  "Under services, you name a container — say Postgres — with its image, a password and a health check. "
  "[pause] GitHub starts it next to your job, waits until it's healthy, and your tests connect to it. "
  "[pause] When the job ends, it's thrown away. Every run gets a clean database. [pause] You can even "
  "run the whole job inside a container, with the container key. Same idea: you choose the exact "
  "environment.", 4),

 ("j04f", "gha_yaml",
  {"kicker": "CONTROLLING FAILURE", "title": "Timeouts, soft failures and cleanup", "file": ".github/workflows/ci.yml",
   "lines": ["jobs:", "  test:", "    runs-on: ubuntu-latest", "    timeout-minutes: 15", "    steps:",
             "      - uses: actions/checkout@v4", "      - run: npm test", "      - run: npm run lint",
             "        continue-on-error: true", "      - if: failure()", "        run: ./notify-team.sh",
             "      - if: always()", "        run: docker compose down"],
   "notes": [
     {"a": 3, "b": 3, "at": 0.1, "c": EVT, "t": "timeout-minutes — kill a stuck job after 15 min, not 6 h"},
     {"a": 7, "b": 8, "at": 0.32, "c": ACT, "t": "continue-on-error — lint may fail without failing the job"},
     {"a": 9, "b": 10, "at": 0.54, "c": BAD, "t": "if: failure() — runs only when something broke"},
     {"a": 11, "b": 12, "at": 0.82, "c": OK, "t": "if: always() — cleanup, pass or fail"}]},
  "Real pipelines also need to control failure. [pause] First, timeout minutes. A hung test could "
  "otherwise burn up to six hours. Set a sensible limit, like fifteen minutes. [pause] Next, continue on "
  "error. Here, lint may fail without failing the whole job — useful for a check you're still rolling "
  "out. [pause] Normally, a failed step stops the job. But a step with if failure runs only when "
  "something broke — perfect for alerting the team. [pause] And if always runs no matter what, so the "
  "cleanup happens every single time.", 4),

 # ================================================================ CH05 · ACTIONS
 divider(5, "Actions", "reusable building blocks", ACT,
  "Part five. The actions themselves. [pause] Workflows stay short because of reuse. Let's see how.", 5),

 ("m05", "gha_marketplace", {},
  "An action is a packaged, reusable step. [pause] The GitHub Marketplace lists thousands of them. "
  "Checking out code. Setting up Node, Python, Java or Go. Caching. Uploading artifacts. Building "
  "Docker images. Logging in to AWS, Azure or Google Cloud. [pause] You reference one with uses: the "
  "owner, the repository, and after the at sign, a version. [pause] That version can be a tag like v4, "
  "a branch, or a full commit hash. [pause] Remember that detail. It matters a lot in the security "
  "chapter.", 5),

 ("m05b", "gha_actiontypes", {},
  "You can write your own actions, in three flavors. [pause] A JavaScript action runs directly on the "
  "runner with Node. It starts fastest, and works on every operating system. [pause] A Docker container "
  "action ships its own environment. Fully reproducible, but Linux only, and slower to start. [pause] A "
  "composite action is simply a bundle of steps, packaged as one. It's the easiest to write. [pause] "
  "All three are described by a file called action dot yml, which declares the inputs, the outputs, "
  "and how to run.", 5),

 ("m05c", "gha_yaml",
  {"kicker": "WRITE YOUR OWN", "title": "A composite action, inside your repo", "file": ".github/actions/setup-app/action.yml",
   "lines": ["name: Setup app", "description: Install Node and deps", "inputs:", "  node-version:",
             "    default: \"22\"", "runs:", "  using: composite", "  steps:",
             "    - uses: actions/setup-node@v4", "      with:",
             "        node-version: ${{ inputs.node-version }}", "        cache: npm",
             "    - run: npm ci", "      shell: bash"],
   "notes": [
     {"a": 0, "b": 1, "at": 0.08, "c": ACT, "t": "metadata — what the action is"},
     {"a": 2, "b": 4, "at": 0.13, "c": EVT, "t": "inputs — node-version, default 22"},
     {"a": 5, "b": 11, "at": 0.27, "c": RUN, "t": "using: composite — ordinary steps inside"},
     {"a": 12, "b": 13, "at": 0.5, "c": BAD, "t": "run steps in a composite must set shell"},
     {"a": -1, "b": -1, "at": 0.66, "c": OK, "t": "caller: uses: ./.github/actions/setup-app"}]},
  "Here's a composite action, living inside the repository. [pause] It declares one input, the node "
  "version, with a default. [pause] Under runs, using composite, it lists ordinary steps: set up Node "
  "with caching, then install dependencies. [pause] Note that run steps inside a composite must declare "
  "a shell. [pause] Now every workflow in this repo can replace those steps with a single line: uses, "
  "dot slash, dot github, slash actions, slash setup app.", 5),

 ("m05d", "gha_reuse", {},
  "For bigger reuse, there are reusable workflows. [pause] A workflow whose trigger is workflow call "
  "can be called by other workflows — even from other repositories. It takes inputs and secrets, and "
  "runs whole jobs. [pause] Platform teams love this. Write one hardened deploy pipeline, and fifty "
  "services call it. Fix a bug once, and everyone gets the fix. [pause] Rule of thumb: composite "
  "actions reuse steps. Reusable workflows reuse jobs. [pause] Since late twenty twenty five, you can "
  "nest reusable workflows ten levels deep, and call up to fifty in one run.", 5),

 # ================================================================ CH06 · DATA
 divider(6, "Data, Secrets & Caching", "how information flows through a run", ACT,
  "Part six. Data. [pause] Workflows need to make decisions, keep secrets, pass results along, and "
  "remember things between runs.", 6),

 ("x06", "gha_expr", {},
  "Anything inside dollar, double braces is an expression, evaluated by GitHub. [pause] Expressions "
  "read from contexts. github holds the event, the branch and the actor. env holds variables. secrets "
  "holds secrets. And matrix, needs, steps and inputs hold what you'd expect. [pause] The most common "
  "use is if, on a job or a step. [pause] This deploy step runs only on a push to main, and only if "
  "everything before it succeeded. [pause] Watch it evaluate for four different runs. Only one passes. "
  "[pause] There are status functions too: success, failure, always and cancelled. always is handy for "
  "cleanup that must run no matter what.", 6),

 ("x06b", "gha_secrets", {},
  "Configuration comes in three kinds. [pause] env sets plain environment variables, right in the "
  "workflow file. [pause] Variables, the vars context, live in settings — non-secret config like a "
  "region or a URL. [pause] Secrets are encrypted. They're stored at the organization, repository or "
  "environment level, and the narrowest scope wins. [pause] Secrets never appear in plain text. If one "
  "is printed, the log shows three stars instead. [pause] But masking isn't magic. If you transform a "
  "secret — encode it, or split it — the log won't recognise it. So don't print secrets at all.", 6),

 ("x06c", "gha_outputs", {},
  "Steps and jobs often need to pass results along. [pause] Inside a job, a step writes a key and a "
  "value to a special file, named GitHub output. Later steps read it through the steps context. "
  "[pause] Between jobs it's different — they run on different machines. A job declares outputs, and "
  "the next job reads them through needs. [pause] For files, like a compiled app or a test report, use "
  "artifacts. Upload in one job, download in another. [pause] Artifacts also appear on the run page "
  "for people to download, kept for ninety days by default.", 6),

 ("x06d", "gha_cache", {},
  "Remember, every job starts on a clean machine. So without help, every run downloads all its "
  "dependencies again. [pause] Caching fixes that. You save a folder under a key, and restore it next "
  "time. [pause] The trick is the key. It includes a hash of your lock file. Same lock file, same key — "
  "a cache hit, and installing takes seconds. [pause] Change one dependency, and the hash changes. New "
  "key, a miss, a fresh install — and a new cache saved for next time. [pause] Most setup actions do "
  "this for you with one cache option. Each repo gets ten gigabytes of cache free, and unused entries "
  "are evicted after seven days.", 6),

 ("x06e", "gha_yaml",
  {"kicker": "TALKING TO THE RUNNER", "title": "Special files and workflow commands", "file": "steps (any workflow)",
   "lines": ["- run: echo \"API_URL=https://api.acme.dev\" >> $GITHUB_ENV", "- run: echo \"$HOME/.local/bin\" >> $GITHUB_PATH",
             "- run: echo \"::add-mask::$TEMP_TOKEN\"", "- run: echo \"::warning file=app.js::Deprecated API\"",
             "- run: echo \"::error::Coverage below 80%\"", "- run: |", "    echo \"### Tests: 128 passed\" >> $GITHUB_STEP_SUMMARY",
             "    echo \"[Coverage report](…)\" >> $GITHUB_STEP_SUMMARY"],
   "notes": [
     {"a": 0, "b": 0, "at": 0.12, "c": ACT, "t": "GITHUB_ENV — a variable for every later step"},
     {"a": 1, "b": 1, "at": 0.24, "c": RUN, "t": "GITHUB_PATH — add a folder to PATH"},
     {"a": 2, "b": 2, "at": 0.42, "c": BAD, "t": "::add-mask:: — hide a value created at runtime"},
     {"a": 3, "b": 4, "at": 0.6, "c": EVT, "t": "::warning:: / ::error:: — annotations on the run and the PR"},
     {"a": 5, "b": 7, "at": 0.78, "c": OK, "t": "GITHUB_STEP_SUMMARY — a markdown report on the run page"}]},
  "Steps can also talk back to the runner. [pause] Besides GitHub output, there are more special files. "
  "Write to GitHub env, and a variable exists for every later step. Write to GitHub path, and a folder "
  "joins the path. [pause] Then there are workflow commands — special lines you echo. add-mask hides a "
  "value you generated at runtime, like a temporary token. [pause] warning and error create "
  "annotations, shown on the run page and even on the pull request diff. [pause] And the step summary "
  "file turns markdown into a report on the run page — tables, results and links.", 6),

 # ================================================================ CH07 · DEPLOY
 divider(7, "Deploying with Actions", "from green check to production", OK,
  "Part seven. Deployment. [pause] CI proves the code works. CD puts it in front of users. Let's ship "
  "safely.", 7),

 ("p07", "gha_pipeline", {},
  "Here's a classic pipeline. Build, test, deploy to staging, then production. [pause] Each deploy job "
  "targets an environment. Environments are named targets, with their own secrets and their own rules. "
  "[pause] Production has required reviewers. The run pauses here, and waits for a human to approve. "
  "[pause] You can also add a wait timer, and restrict which branches may deploy. [pause] Once approved, "
  "the job continues, and GitHub records the deployment, with a link to the live site. [pause] "
  "Automation does the work. A human keeps the final say.", 7),

 ("p07b", "gha_concurrency", {},
  "What if two pushes land a minute apart? Two deploys could race each other. [pause] The concurrency "
  "key fixes this. Runs that share a group name never run at the same time. [pause] Add cancel in "
  "progress, and a newer run cancels the older one. [pause] Watch: four pushes arrive. Without "
  "concurrency, four deploys overlap. With it, only the latest one finishes. [pause] For pull requests, "
  "use the branch name as the group. Every new push cancels the stale run, and saves minutes.", 7),

 ("p07c", "gha_oidc", {},
  "To deploy to a cloud, your workflow needs credentials. The old way was to paste a long-lived cloud "
  "key into secrets. [pause] If that key leaks, it works for anyone, for months. [pause] The modern way "
  "is OpenID Connect, or OIDC. [pause] The job asks GitHub for a signed token that says: I am this repo, "
  "on this branch, in this environment. [pause] AWS, Azure or Google Cloud checks that token against a "
  "trust policy you wrote, and hands back credentials that expire within the hour. [pause] No stored "
  "cloud keys at all. To allow it, give the job the id-token write permission.", 7),

 ("p07e", "gha_yaml",
  {"kicker": "PUTTING IT TOGETHER", "title": "One file: test, approve, deploy", "file": ".github/workflows/deliver.yml",
   "lines": ["on:", "  push: { branches: [main] }", "permissions: { contents: read, id-token: write }",
             "concurrency: { group: production }", "jobs:", "  test:", "    uses: ./.github/workflows/ci.yml",
             "  deploy:", "    needs: test", "    runs-on: ubuntu-latest", "    environment: production", "    steps:",
             "      - uses: actions/checkout@v4", "      - uses: aws-actions/configure-aws-credentials@v4",
             "        with: { role-to-assume: ${{ vars.DEPLOY_ROLE }} }", "      - run: ./deploy.sh"],
   "notes": [
     {"a": 0, "b": 1, "at": 0.1, "c": EVT, "t": "trigger: every push to main"},
     {"a": 2, "b": 3, "at": 0.2, "c": BAD, "t": "read-only + OIDC · one production deploy at a time"},
     {"a": 5, "b": 6, "at": 0.4, "c": ACT, "t": "test = our reusable CI workflow"},
     {"a": 7, "b": 10, "at": 0.5, "c": OK, "t": "deploy waits for test · protected environment → reviewers"},
     {"a": 11, "b": 15, "at": 0.66, "c": RUN, "t": "OIDC login to AWS — no stored keys — then ship"}]},
  "Let's put the last few chapters together in one file. [pause] It triggers on every push to main. "
  "[pause] Permissions are read-only, plus id-token write for OIDC. And the concurrency group means only "
  "one production deploy runs at a time. [pause] The test job simply calls our reusable CI workflow. "
  "[pause] Deploy needs test, and targets the production environment — so the required reviewers must "
  "approve. [pause] Then it checks out the code, logs in to AWS through OIDC with no stored keys, and "
  "runs the deploy script. [pause] Sixteen lines, and nearly every idea so far is in there.", 7),

 ("p07d", "gha_bullets",
  {"kicker": "SHIP MORE THAN SERVERS", "title": "What else a workflow can publish", "color": OK,
   "items": [
     {"i": "🏷️", "k": "GitHub Releases", "d": "Push a tag → release notes + binaries attached"},
     {"i": "📦", "k": "Container images", "d": "Build & push to GitHub Container Registry (GHCR)"},
     {"i": "🧩", "k": "Packages", "d": "Publish to npm, PyPI, Maven — or GitHub Packages"},
     {"i": "🌐", "k": "GitHub Pages", "d": "Build a docs site and deploy it on every merge"},
     {"i": "🔏", "k": "Attestations", "d": "Signed proof of which workflow + commit built this file"}]},
  "Deployment isn't just servers. [pause] Actions can publish a GitHub release, with notes and "
  "binaries, whenever you push a tag. [pause] It can build container images and push them to the "
  "GitHub Container Registry. [pause] It can publish packages to npm, PyPI or Maven. [pause] It can "
  "build a docs site and deploy it to GitHub Pages. [pause] And it can sign what it builds with artifact "
  "attestations — proof of exactly which workflow, from which commit, produced this file.", 7),

 # ================================================================ CH08 · SECURITY
 divider(8, "Security", "your pipeline is part of your attack surface", BAD,
  "Part eight. Security. [pause] Your pipeline holds secrets and can push to production. That makes "
  "it a target.", 8),

 ("s08", "gha_permissions", {},
  "Every job gets an automatic credential: the GITHUB_TOKEN. It lets the workflow call the GitHub API — "
  "comment on a pull request, push a tag, publish a package. [pause] It expires when the job ends. "
  "[pause] What it can do is set by the permissions key. [pause] Newer repositories default to "
  "read-only. Best practice: start with read, and grant write only for exactly what a job needs. "
  "[pause] Here: contents read, pull requests write, and id-token write for cloud login. Everything "
  "else, none. [pause] If an attacker hijacks a step, least privilege limits the damage.", 8),

 ("s08b", "gha_supply", {},
  "Now, that version after the at sign. A tag like v4 is just a pointer, and its owner can move it. "
  "[pause] In March twenty twenty five, that's exactly what happened. Attackers compromised the popular "
  "tj-actions changed-files action, and moved its version tags to malicious code. [pause] Tens of "
  "thousands of repositories used it. Their workflows pulled the bad code automatically, and some "
  "printed secrets into public logs. [pause] Repositories pinned to a full commit hash were safe, "
  "because a hash can't be moved. [pause] So pin third-party actions to a commit hash, and let "
  "Dependabot propose the updates.", 8),

 ("s08c", "gha_injection", {},
  "The next trap is script injection. [pause] Look at this step. It echoes the pull request title, "
  "straight into a shell command. [pause] But the title is written by whoever opened the pull request. "
  "An attacker names their PR: quote, semicolon, curl evil dot sh, pipe to shell. [pause] GitHub pastes "
  "that text into the script before running it. The shell sees a second command, and runs it. [pause] "
  "The fix: pass untrusted values through an environment variable, and quote it. Now the title is just "
  "data. [pause] And be very careful with pull request target. It runs with secrets, even for pull "
  "requests from forks.", 8),

 ("s08d", "gha_bullets",
  {"kicker": "THE HARDENING CHECKLIST", "title": "Seven habits of a secure pipeline", "color": BAD,
   "items": [
     {"i": "🔒", "k": "Read-only by default", "d": "permissions: contents: read — grant writes per job"},
     {"i": "📌", "k": "Pin to commit hashes", "d": "Third-party actions @<full SHA>, not @v4"},
     {"i": "🪪", "k": "OIDC, not stored keys", "d": "Short-lived cloud credentials, nothing to leak"},
     {"i": "🧪", "k": "No untrusted input in run", "d": "Route titles/branches through env vars"},
     {"i": "🛂", "k": "Protect production", "d": "Environments + required reviewers"},
     {"i": "🖥️", "k": "Private self-hosted only", "d": "Never on public repos"},
     {"i": "🤖", "k": "Dependabot + code scanning", "d": "Keep actions updated; scan workflows too"}]},
  "Here's the checklist. [pause] One: set permissions to read by default. [pause] Two: pin third-party "
  "actions to commit hashes. [pause] Three: use OIDC instead of long-lived cloud keys. [pause] Four: "
  "never paste untrusted input into run scripts. [pause] Five: protect production with environments and "
  "reviewers. [pause] Six: keep self-hosted runners away from public repos. [pause] And seven: turn on "
  "Dependabot and code scanning, which can check your workflow files too.", 8),

 # ================================================================ CH09 · COST SPEED DEBUG
 divider(9, "Cost, Speed & Debugging", "run it well, fix it fast, automate more", EVT,
  "Part nine. Running Actions well. [pause] Cost, speed, debugging — and what else you can automate.", 9),

 ("b09", "gha_billing", {},
  "First, cost. Public repositories on standard runners are free. [pause] Private repos get a monthly "
  "allowance of free minutes — two thousand on the Free plan, more on paid plans. [pause] Beyond that, "
  "you pay per minute. Linux is the cheapest, Windows costs more, and macOS costs the most. [pause] One "
  "detail: each job is rounded up to a whole minute. So twelve jobs of ten seconds bill as twelve "
  "minutes, not two. [pause] A giant matrix of tiny jobs can cost more than you'd think.", 9),

 ("b09b", "gha_speed", {},
  "Now speed. A slow pipeline is a tax on every single change. [pause] Start by caching dependencies. "
  "[pause] Then split the work into parallel jobs. [pause] For big builds, try a larger runner. [pause] "
  "Stack those three, and an eighteen minute pipeline can drop to about five. [pause] Path filters and "
  "cancel in progress go further — they skip runs altogether. [pause] Faster feedback means developers "
  "stay in flow.", 9),

 ("b09c", "gha_debug", {},
  "Sooner or later, a run goes red. Here's how to debug it. [pause] Open the failed step. The error is "
  "usually in the last few lines, and GitHub marks it with an annotation. [pause] Re-run just the "
  "failed jobs, instead of the whole workflow. [pause] Still stuck? Re-run with debug logging on, for "
  "much more detail. [pause] To iterate faster, the open source tool act runs your workflows locally, in "
  "Docker. [pause] And write to the job summary — a markdown report right on the run page, for test "
  "results and links.", 9),

 ("b09d", "gha_beyond", {},
  "Finally, remember: Actions is an automation platform, not just CI. [pause] Teams use it to label and "
  "triage new issues, close stale ones, and welcome first-time contributors. [pause] To generate "
  "release notes, and bump versions. [pause] To run nightly scrapers, reports and backups. [pause] And "
  "increasingly, to power AI. GitHub's own Copilot coding agent does its work inside an environment "
  "powered by Actions. [pause] If it happens on GitHub, you can probably automate it.", 9),

 ("b09e", "gha_yaml",
  {"kicker": "AUTOMATION RECIPE 1", "title": "Auto-triage every new issue", "file": ".github/workflows/triage.yml",
   "lines": ["on:", "  issues:", "    types: [opened]", "permissions:", "  issues: write", "jobs:", "  triage:",
             "    runs-on: ubuntu-latest", "    env:", "      NUM: ${{ github.event.issue.number }}",
             "      GH_TOKEN: ${{ github.token }}", "    steps:", "      - if: contains(github.event.issue.title, 'bug')",
             "        run: gh issue edit $NUM --add-label bug", "      - run: gh issue comment $NUM --body \"Thanks!\""],
   "notes": [
     {"a": 0, "b": 2, "at": 0.1, "c": EVT, "t": "runs when an issue is opened"},
     {"a": 3, "b": 4, "at": 0.2, "c": BAD, "t": "just enough permission: write issues"},
     {"a": 8, "b": 10, "at": 0.32, "c": ACT, "t": "issue number via env (safe) · token for the gh CLI"},
     {"a": 12, "b": 13, "at": 0.56, "c": RUN, "t": "title mentions “bug”? → add the bug label"},
     {"a": 14, "b": 14, "at": 0.7, "c": OK, "t": "always post a friendly first reply"}]},
  "Let's build two automations. First: auto-triage. [pause] The trigger is issues, of type opened. "
  "[pause] The job only needs permission to write issues. [pause] We pass the issue number through an "
  "environment variable — the safe pattern from the security chapter — along with the token that the gh "
  "command line tool needs. [pause] If the title mentions bug, add the bug label. [pause] Then post a "
  "friendly first reply, so nobody waits in silence. [pause] Fifteen lines, and every new issue is "
  "triaged within seconds.", 9),
 ("b09f", "gha_yaml",
  {"kicker": "AUTOMATION RECIPE 2", "title": "Ship a release on every version tag", "file": ".github/workflows/release.yml",
   "lines": ["on:", "  push:", "    tags: ['v*']", "permissions:", "  contents: write", "jobs:", "  release:",
             "    runs-on: ubuntu-latest", "    steps:", "      - uses: actions/checkout@v4",
             "      - run: npm ci && npm run build", "      - run: zip -r app.zip dist",
             "      - run: gh release create \"$TAG\" app.zip --generate-notes", "        env:",
             "          TAG: ${{ github.ref_name }}", "          GH_TOKEN: ${{ github.token }}"],
   "notes": [
     {"a": 0, "b": 2, "at": 0.08, "c": EVT, "t": "any tag starting with v — like v1.4.0"},
     {"a": 3, "b": 4, "at": 0.2, "c": BAD, "t": "contents: write — needed to create a release"},
     {"a": 9, "b": 11, "at": 0.32, "c": RUN, "t": "check out, build, and zip the app"},
     {"a": 12, "b": 15, "at": 0.41, "c": OK, "t": "create the release, attach the zip, auto-write notes"},
     {"a": -1, "b": -1, "at": 0.66, "c": ACT, "t": "ship = git tag v1.4.0 && git push --tags"}]},
  "Second: releases. [pause] This workflow triggers on any tag that starts with v. [pause] Creating a "
  "release needs contents write permission. [pause] It checks out the code, builds it, and zips the "
  "output. [pause] Then a single gh command creates the release, attaches the zip, and writes release "
  "notes from the merged pull requests. [pause] Now shipping a version is just: create a tag, push it, "
  "done. [pause] Issues, releases, schedules, chat ops — once you see the pattern, you'll want to "
  "automate everything.", 9),

 # ================================================================ CH10 · REST OF GITHUB
 divider(10, "The Rest of GitHub", "the platform Actions plugs into", OK,
  "Part ten. The rest of GitHub. [pause] Actions is one piece of a much bigger platform. Let's tour the "
  "other features — the ones your workflows plug into.", 10),

 ("g10", "gha_platform", {},
  "At the center is the repository: your code, its full history, and its branches. [pause] Around it, "
  "GitHub groups its features into a few families. [pause] Collaborate — pull requests and code review. "
  "[pause] Plan — Issues, Projects and Discussions. [pause] Build — Codespaces, and Copilot, the AI "
  "assistant. [pause] Automate — Actions, which you now know well. [pause] Secure — Dependabot, code "
  "scanning and secret scanning. [pause] And ship — Releases, Packages and Pages. [pause] Let's walk "
  "through them.", 10),

 ("g10b", "gha_pr", {},
  "The heart of collaboration is the pull request. [pause] You create a branch, commit your change, "
  "and open a pull request to merge it into main. [pause] Teammates review the diff line by line. They "
  "comment, suggest edits, and approve, or request changes. [pause] A code owners file can require "
  "review from the right team automatically. [pause] Meanwhile, Actions runs the checks. [pause] "
  "Rulesets and branch protection enforce the policy — reviews required, checks green. And a merge "
  "queue can test changes together before they land. [pause] Then you merge: squash, rebase, or a "
  "merge commit.", 10),

 ("g10c", "gha_issues", {},
  "For planning, there are Issues. Each one tracks a bug, a task or an idea, with labels, assignees, "
  "and sub-issues for breaking big work down. [pause] Projects turns issues into a planning board — "
  "a table, a kanban board, or a roadmap timeline, with custom fields like priority and sprint. [pause] "
  "Write closes, then the issue number, in a pull request, and merging it closes the issue "
  "automatically. [pause] For open-ended conversation there's Discussions — questions, ideas and "
  "announcements, away from the bug tracker. [pause] And a wiki, for longer documentation.", 10),

 ("g10d", "gha_codespaces", {},
  "Codespaces gives you a full development environment in the cloud. [pause] Click Code, then create "
  "codespace, and in seconds you're in VS Code — in your browser or on your desktop — on a cloud "
  "machine with your repo already cloned. [pause] A dev container file defines the tools, so every "
  "contributor gets an identical setup. No more setup documents. [pause] Personal accounts get a free "
  "monthly allowance of core hours. [pause] It's perfect for onboarding, reviewing a pull request "
  "properly, or coding from a tablet.", 10),

 ("g10e", "gha_copilot", {},
  "Then there's Copilot, GitHub's AI assistant. [pause] In your editor, it completes code as you "
  "type, and answers questions in chat. [pause] On github dot com, it can review pull requests and "
  "leave comments like a teammate would. [pause] And the Copilot coding agent goes further. Assign it "
  "an issue, and it works in the background — writing code, running tests in its Actions-powered "
  "environment — then opens a pull request for you to review. [pause] There's a free tier to start, "
  "and paid plans for heavier use. [pause] You stay the reviewer. The agent does the legwork.", 10),

 ("g10f", "gha_ghas", {},
  "Security is built in, too. [pause] Dependabot watches your dependencies. It raises alerts for known "
  "vulnerabilities, and opens pull requests that upgrade them. [pause] Code scanning, powered by "
  "CodeQL, analyses your code for bugs like injection, and flags them right in the pull request. "
  "[pause] Secret scanning finds leaked keys and tokens. With push protection, it blocks the push "
  "before the secret ever reaches GitHub. [pause] For public repositories, much of this is free. For "
  "private ones, it's sold as GitHub Secret Protection and Code Security.", 10),

 ("g10g", "gha_bullets",
  {"kicker": "SHIP & EXTEND", "title": "More GitHub features worth knowing", "color": OK,
   "items": [
     {"i": "🏷️", "k": "Releases", "d": "Versioned downloads + notes, built from tags"},
     {"i": "📦", "k": "Packages & GHCR", "d": "Host containers and libraries next to the code"},
     {"i": "🌐", "k": "Pages", "d": "Free static sites straight from a repo"},
     {"i": "⌨️", "k": "GitHub CLI (gh)", "d": "PRs, issues and workflow runs from the terminal"},
     {"i": "🧷", "k": "Gists", "d": "Share snippets and notes instantly"},
     {"i": "🔌", "k": "Apps & Marketplace", "d": "Integrations that extend GitHub itself"},
     {"i": "📈", "k": "Insights", "d": "Contributors, traffic, dependency graph"}]},
  "A few more worth knowing. [pause] Releases package versioned downloads with notes. [pause] Packages "
  "and the container registry host your images and libraries next to the code. [pause] Pages serves "
  "free static websites straight from a repository. [pause] The GitHub CLI, gh, drives pull requests, "
  "issues and workflow runs from your terminal. [pause] Gists share snippets instantly. [pause] Apps "
  "from the Marketplace extend GitHub itself. [pause] And Insights shows contributors, traffic, and "
  "your dependency graph.", 10),

 ("r10", "gha_recap",
  {"title": "GitHub Actions in one breath", "color": OK,
   "items": [
     "Event → workflow → job → runner → step: the whole model",
     "Workflows are YAML files in .github/workflows",
     "Filters, schedules and buttons decide WHEN a workflow runs",
     "needs builds a graph; a matrix fans jobs out in parallel",
     "Actions + reusable workflows: rarely start from scratch",
     "Caches, outputs, artifacts carry data; secrets stay masked",
     "Deploy via environments, approvals and OIDC — no stored keys",
     "Around it: PRs, Issues, Projects, Codespaces, Copilot, security"],
   "closer": "Push code. Let the robots do the rest."},
  "Let's recap. [pause] Everything is a chain: an event starts a workflow, a workflow runs jobs, and "
  "each job runs steps on a runner. [pause] Workflows are YAML files in dot github slash workflows. "
  "[pause] Filters decide when they run. needs and matrix decide how jobs fan out. [pause] Actions and "
  "reusable workflows mean you rarely start from scratch. [pause] Caches, outputs and artifacts carry "
  "data through. [pause] Environments, approvals and OIDC make deploys safe, and least privilege keeps "
  "them secure. [pause] And around it all, GitHub gives you pull requests, issues, projects, "
  "Codespaces, Copilot and built-in security. [pause] Now open a repository, create dot github slash "
  "workflows, and write your first fifteen lines. Push code. Let the robots do the rest. Thanks for "
  "watching.", 10),
]


def ffdur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=noprint_wrappers=1:nokey=1", path],
                         capture_output=True, text=True, check=True)
    return round(float(out.stdout.strip()), 3)

def tts_chunk(path, text):
    samples, sr = kokoro().create(spoken(text), voice=VOICE, speed=1.0, lang=LANG)
    sf.write(path, samples, sr, subtype="PCM_16")

def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id + ".wav")
    if os.path.exists(fin):
        return fin, ffdur(fin)
    chunks = [c.strip() for c in text.split("[pause]") if c.strip()]
    paths = []
    for ci, chunk in enumerate(chunks):
        cp = os.path.join(RAW, f"{seg_id}_c{ci}.wav")
        if not os.path.exists(cp):
            tts_chunk(cp, chunk)
        paths.append(cp)
    psil = os.path.join(RAW, "_pause.wav")
    if not os.path.exists(psil):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                        "-t", str(PAUSE), psil], check=True, capture_output=True)
    clist = os.path.join(RAW, f"{seg_id}_concat.txt")
    with open(clist, "w") as f:
        for i2, p2 in enumerate(paths):
            f.write(f"file '{p2}'\n")
            if i2 < len(paths) - 1:
                f.write(f"file '{psil}'\n")
    af = f"atempo={ATEMPO}" if ATEMPO != 1.0 else "anull"
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist,
                    "-filter:a", af, "-ar", "24000", "-ac", "1", fin], check=True, capture_output=True)
    return fin, ffdur(fin)

# ---- captions: proportional per-word timing, wrapped to <=2 lines --------
def _wrap(text, width=52):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur: lines.append(cur)
    return "\n".join(lines[:2])

def beat_cues(text, dur, t0):
    parts = [p for p in text.split("[pause]")]
    n_pause = len(parts) - 1
    ppause = PAUSE / ATEMPO
    all_words = sum(len(p.split()) for p in parts) or 1
    word_time = max(0.0, dur - n_pause * ppause) / all_words
    cues, ct = [], 0.0
    for pi, part in enumerate(parts):
        words = part.split(); i = 0
        while i < len(words):
            j = min(len(words), i + 9)
            chunk = words[i:j]; d = word_time * len(chunk)
            cues.append([round(t0 + ct, 3), round(t0 + ct + d, 3), _wrap(" ".join(chunk))])
            ct += d; i = j
        if pi < len(parts) - 1:
            ct += ppause
    return cues

def make_silence():
    silence = os.path.join(FIN, "_sil.wav")
    if not os.path.exists(silence):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), silence],
                       check=True, capture_output=True)
    return silence

def concat_wavs(wavs, out):
    silence = make_silence()
    clist = os.path.join(RAW, "_concat_%s.txt" % os.path.basename(out).replace(".wav", ""))
    with open(clist, "w") as f:
        for i, w in enumerate(wavs):
            f.write(f"file '{w}'\n")
            if i < len(wavs) - 1:
                f.write(f"file '{silence}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist, "-c", "copy", out],
                   check=True, capture_output=True)

def cut_list(segs):
    cuts, cues, t = [], [], 0.0
    for (sid, variant, props, _ch, wav, dur, text) in segs:
        cues.extend(beat_cues(text, dur, t))
        cuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3),
                     "out_seconds": round(t + dur + GAP, 3), "props": {**props, "dur": round(dur + GAP, 3)}})
        t += dur + GAP
    return cuts, cues, t - GAP

if __name__ == "__main__":
    import sys
    only_words = "--words" in sys.argv
    words = sum(len(s[3].replace("[pause]", " ").split()) for s in SEGMENTS)
    print(f"{len(SEGMENTS)} segments · {words} words")
    if only_words:
        for ch in CHAPTERS:
            w = sum(len(s[3].replace("[pause]", " ").split()) for s in SEGMENTS if s[4] == ch)
            print(f"  ch{ch:02d} {w:5d} words  {CHAPTERS[ch]}")
        sys.exit(0)

    built = []
    print("== TTS ==")
    for sid, variant, props, text, ch in SEGMENTS:
        path, dur = gen_one(sid, text)
        built.append((sid, variant, props, ch, path, dur, text))
        warn = "  ⚠ LONG >90s" if dur > 90 else ""
        print(f"  ch{ch:02d} {sid:6s} {variant:16s} {dur:6.2f}s{warn}", flush=True)

    render_list = []
    print("\n== per-chapter artifacts ==")
    for ch in sorted(CHAPTERS):
        segs = [b for b in built if b[3] == ch]
        if not segs:
            continue
        ch_wav = os.path.join(PUBLIC, f"narration_ch{ch:02d}.wav")
        concat_wavs([b[4] for b in segs], ch_wav)
        cuts, cues, secs = cut_list(segs)
        ch_json = os.path.join(CHDIR, f"ch{ch:02d}.json")
        json.dump({"cuts": cuts, "captions": cues,
                   "audio": {"narration": {"src": f"{PREFIX}/narration_ch{ch:02d}.wav", "volume": 1.0}}},
                  open(ch_json, "w"), indent=1)
        render_list.append({"ch": ch, "json": ch_json, "seconds": round(secs, 2), "title": CHAPTERS[ch]})
        print(f"  ch{ch:02d}  {secs:7.2f}s  {len(cuts):2d} scenes  {CHAPTERS[ch]}")

    json.dump(render_list, open(os.path.join(ROOT, "artifacts", "render_list.json"), "w"), indent=1)
    total = sum(r["seconds"] for r in render_list) + GAP * 0
    print(f"\nTOTAL {total:.1f}s ({total/60:.2f} min) · {len(built)} scenes · {words} words · "
          f"{words/(total/60):.0f} effective wpm · captions ON")
