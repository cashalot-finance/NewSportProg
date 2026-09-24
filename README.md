# YogaFlow AI 0.9 Production Beta

0.9 is built on the clean Android shell introduced in 0.8.

## What changed

- Sequence Engine moved to `engine.js` and is tested independently of the UI.
- 36 structured poses, five styles, five goals, duration/intensity controls.
- Health-tag filtering plus red-flag blocking.
- Transition smoothness scoring and final validation.
- Local profile and workout history.
- 2D timed workout player.
- Android PrintManager export path.
- 3D Avatar Lab is an isolated Android activity running in process `:avatar`.
- If the avatar renderer fails, the main YogaFlow process remains independent.

## Production status

The health/safety rule base remains prototype data and requires professional/clinical validation before public medical-safety claims. A production release also requires a private long-lived release signing key, Play App Signing, device-farm coverage and privacy/legal review.
