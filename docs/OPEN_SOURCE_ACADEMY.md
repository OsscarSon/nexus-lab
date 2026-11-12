# Open Source Academy — Full Curriculum v1

Audience: true beginner to early maintainer. Every module comprises short conceptual lessons, a guided demo, independent lab, evaluation, and artifact. No real external repo is executed automatically. A learner can switch to an offline simulated repository for any early module.

## M01 — Open Source Literacy (6 lessons)
1. What is source code? 2. Free vs open-source vs source-available 3. Community and maintainers 4. Examples of libraries vs applications 5. Trust and software supply chain 6. Respect and attribution.
Lab: classify projects by published permission terms; detect ambiguous/no-license cases. Deliverable: open-source decision worksheet.

## M02 — GitHub Orientation (7 lessons)
Repositories, README, files, stars/watches/forks, commits, branches, issues, releases, discussions.
Lab: interactive simulated GitHub repository treasure hunt. Deliverable: project discovery report.

## M03 — Git Foundations (9 lessons)
Working tree, staging, commit, diff, history, branch, merge, conflicts, revert, remotes.
Lab: safe virtual Git terminal and visual branching graph with undo. Deliverable: feature branch with commit history.

## M04 — Search and Evaluate Projects (7 lessons)
Search operators, languages/frameworks, release cadence, maintenance signals, documentation, dependency health, safety checklists.
Lab: compare 3 candidate repos using transparent rubric. Deliverable: annotated selection.

## M05 — Licenses and Obligations (8 lessons)
MIT, Apache-2.0, BSD-3-Clause, GPL, LGPL, AGPL, MPL, dual licensing, trademarks, third-party assets, license compatibility basics. Educational information, not legal advice.
Lab: scenario-based license decision exercise; never assume that publicly visible code grants reuse rights. Deliverable: attribution checklist.

## M06 — Run a Project Locally (10 lessons)
Prerequisites, README install instructions, Node/Python environments, package manifests, lockfiles, environment variables, dev servers, build vs run, debugging, sandboxing, secrets.
Lab: run vetted sample project inside controlled environment, with troubleshooting hints. Deliverable: reproducible runbook.

## M07 — Read and Change Code (8 lessons)
Entrypoints, folder roles, dependency paths, component tracing, find references, breakpoints, UI text change, small feature flag.
Lab: fork a preapproved sample and modify one tested feature. Deliverable: before/after diff and screenshot.

## M08 — Testing and Quality (7 lessons)
Why tests, unit/integration/UI, lint/format, type-check, CI basics, regression, issue reproduction, accessibility smoke test.
Lab: repair intentionally broken test, add regression check. Deliverable: passing test report.

## M09 — Collaboration and Pull Requests (8 lessons)
Issue templates, reproducible reports, branch naming, commits, PR descriptions, review etiquette, responding to feedback, contributor guidelines, code of conduct.
Lab: end-to-end simulated PR with an automated reviewer. Deliverable: review-ready PR packet.

## M10 — Automation and Release (8 lessons)
GitHub Actions basics, workflows/triggers, package publishing concepts, version tags, semantic versioning, changelog, dependency checks, release artifacts, rollback.
Lab: CI workflow for demo repo on safe triggers. Deliverable: versioned release checklist.

## M11 — Security and Responsible Maintenance (7 lessons)
Secrets handling, dependency risks, malicious packages, provenance basics, least privilege, vulnerability reporting, moderation, archival and handoff.
Lab: spot secrets in a fake commit, remove and rotate per simulated workflow. Deliverable: repository safety review.

## M12 — Capstone: Publish Your Open Source Tool (10 milestones)
Choose beginner tool; requirements; repo bootstrap; README; license choice with rights review; tests; docs; screenshots; versioned release; public release optional with explicit confirmation.
Graduation evidence: functioning demo, clear source, tests, installation instructions, contribution instructions, attribution and user-facing explanation.

## Cross-module labs
- Repo Explorer: URL input; metadata, README outline, dependency manifests, file tree with size limits; no automatic execution, and explicit indication of missing/unknown information.
- Git Playground: visual commit graph, staging, branches, merge conflict exercises; sandboxed simulated filesystem.
- License Lab: interactive scenarios with caveats and links to authoritative texts.
- Issue Detective: reproduce a seeded bug and write a good issue.
- PR Simulator: branch, diff, review feedback, merge with checkpoints.
- Dependency Inspector: dependency graph from vetted manifests; risk is a signal, not a definitive security verdict.

## Learning progression
Beginner M01–03 → Explorer M04–05 → Builder M06–08 → Contributor M09 → Maintainer M10–11 → Capstone M12. Provide optional branching; do not lock all content behind linear completion.

## Content template
Every lesson stores id, moduleId, title, locale, summary, objectives, prerequisites, estimatedMinutes, segments, interactiveLabId, questionBank, hints, evidenceRequirements, references, reviewedAt, version. Use canonical stable IDs and translation keys.

## Accessibility and honesty
Avoid learner-facing jargon without inline explanation. Include keyboard-only and screen-reader alternatives for visual Git graph. Distinguish real Git commands from simulated exercises. No fabricated GitHub stats, licenses or maintenance scores.
