# Codex Learn Study

A self-contained comparative educational interface experiment. Open `index.html` in a modern browser.

## Experimental controls

- Both conditions use identical lessons, question wording, order, answer order, images and scoring.
- The manipulated variable is interface presentation only.
- The standard condition intentionally introduces busy colour, decoration, inconsistent visual emphasis and denser styling. It remains keyboard-operable so the study does not create avoidable access barriers.
- The autism-adapted condition uses a predictable one-task-at-a-time flow, low-arousal palette, plain language, generous spacing, visible progress, no timer, reduced motion and optional sound.

## Data

Completed sessions are stored in IndexedDB in the browser that conducted the session. The results screen exports participant-level and question-level data as CSV.

Browser security prevents a remote participant's browser from writing directly to an arbitrary folder on the researcher's laptop. For multisite/remote collection, deploy with a secure database endpoint, then export the collected records to the laptop. Do not collect participant names.

## Measures

Condition, anonymous participant ID, start/completion timestamp, completion status, total duration, score, incorrect count, per-question response, correctness, response time, answer changes, subject, viewport and user-agent.

## Research note

The generated face images are prototype stimuli, not a validated facial-affect instrument. Replace them with a licensed, validated stimulus set before a formal study and obtain ethics approval/consent appropriate to the participant group.
