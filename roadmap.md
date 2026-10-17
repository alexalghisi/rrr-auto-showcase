# Rotation repair
- [x] Redact detected registration plates in all six stored orbits and 30 real photos; manually cover missed Suzuki dealer plates. Automated orbit detection may still miss some views.
- [x] Add fractional adjacent-frame blending and direct reversible pointer tracking; mouse and real touch gestures checked on all three currently public cars, motion tests pass.
- [ ] Replace identity-changing AI orbit images with a verified consistent orbit (requires real full-orbit capture or reliable reconstructed model; current source frames cannot establish identical-car fidelity).
- [ ] Reactivate Adsterra as explicitly requested, verify changes and publish.
- [x] Correct frame loading, pointer motion and offscreen rendering across all cars.
- [x] Smooth discontinuities in the existing image sequences without replacing the real photos.
- [x] Verify all five currently listed cars with mouse and touch on cards/detail pages, test repeated turns in stock, validate files for all six registered sequences, and pass motion tests. Suzuki is not currently listed, so only its files were validated.

# EU advertising consent
- [x] Replace custom advertising consent with Google's certified CMP integration and safe defaults.
- [x] Correct cookie disclosures and verify settings at 320px, 390px and desktop; Google consent tests pass. Adsterra subsequently reactivated by request, separately opt-in.
- [ ] Activate and verify the published European regulations message (requires access to the owner's AdSense account).