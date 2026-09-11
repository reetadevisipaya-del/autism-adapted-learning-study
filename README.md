# Adaptive Learning Study — Expert Validation Build

A comparative educational interface experiment for evaluating a professionally usable conventional educational interface against an autism-adapted interface using identical learning content and task logic.

## Experimental controls

- Both conditions use identical lessons, question wording, order, answer options, images and scoring.
- The independent variable is interface presentation.
- The conventional condition is a credible, accessible educational baseline. It is **not** intentionally made poor, visually chaotic or difficult to use.
- The autism-adapted condition uses the same content and functionality with predefined interface adaptations such as calmer presentation, clearer grouping, more generous spacing, reduced decorative load and more explicit/predictable structure.
- Researcher configuration is separated from participant mode so participants do not see condition labels, order assignment, study stage or data-export controls.
- Participant-facing answer feedback is neutral and does not reveal correctness during the task.

## Participant flow

Researcher setup → participant welcome → optional WebGazer camera setup → 9-point calibration → independent calibration-quality check → neutral ready screen → three lessons → ten questions → neutral completion screen → researcher results view.

## Eye tracking

WebGazer is researcher-controlled. When enabled, the build records gaze coordinates only during lesson/question phases, along with page context, viewport size and normalized coordinates.

The calibration procedure is followed by a separate five-target validation stage. The validation result, number of calibration attempts, mean/median validation error, total tracker samples and valid-sample percentage are stored as quality metadata. The validation threshold in this prototype is an engineering QC rule for pilot testing and must not be described as a clinically or externally validated WebGazer accuracy threshold.

## Data

Completed sessions are stored locally in the browser and can be exported as four CSV files:

- session summary
- responses
- events
- gaze samples

The build records anonymous participant/session identifiers, assigned order and condition, timing, breaks, answer performance, WebGazer quality metadata, viewport information and gaze samples. Participant names should never be entered.

## Versioning

Current branch build: **EV-1.0 (Expert Validation Build)**.

Freeze the exact build supplied to reviewers. Apply reviewer-requested changes to a new version (for example EV-1.1), then create a separate pilot build before main data collection.

## Research note

The generated face images are prototype stimuli, not a validated facial-affect instrument. Replace them with an appropriately licensed/validated stimulus set if validated facial-affect stimuli are required by the final protocol. Human-participant testing should proceed only after the applicable institutional ethics approval and consent/assent process.
