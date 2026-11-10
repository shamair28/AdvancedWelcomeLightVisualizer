# Experiment: keep the inner DRL lit while the turn signal flashes (base LED, CAFD 000043AF)

**Status:** idea only, not coded or tested on a car yet.
**Applies to:** US G20 LCI base LED, FLM2 CAFD_000043AF_016_020_000, both FLM2 Left 0x43 and Right 0x44.

## Finding

Lmm1 has two turn-signal records that set a DRL tube to 0% while the indicator works:

| Record | Bytes (0-based) | Value | Effect |
|---|---|---|---|
| 30 | 180–185 | `44 90 18 00 00 0A` | output 4 (inner tube) to 0% while function 490 is active |
| 41 | 246–251 | `54 81 18 00 00 0A` | output 5 (outer tube) to 0% while function 481 is active |

- Function 481 is the turn signal itself: the amber outputs use it at 100% (`74 81 …`). The outer tube is switched off because the amber lives in that tube.
- Function 490 switches off the inner tube.
- US (wert_67) and EU (wert_66) both have record 30. China (wert_80) leaves it out and keeps record 41, so BMW codes Chinese cars to keep the inner DRL lit while indicating.

## Proposed change

Set the brightness byte of record 30 (byte 183) from `00` to `64` (100%), so `44 90 18 00 00 0A` becomes `44 90 18 64 00 0A`. If that misbehaves, use `1E` (30%) instead.

This is the welcome-animation Lmm1 with that one extra byte. Compared with stock wert_67, it differs only at byte 183 (`00` → `64` or `1E`) and byte 208 (`01` → `07`, the outer tube's welcome curve). Code the same value in both modules. Lmm2 stays wert_47, and Staging1/Staging2 stay unchanged.

**Lmm1_Data, inner DRL at 100% while indicating:**

`04, 52, 44, 64, 00, 00, 04, 81, 34, 64, 00, 00, 10, D2, 24, 64, 0A, 06, 11, 05, 24, 64, 02, 02, 11, 62, 24, 64, 06, 06, 12, A5, 20, 64, 02, 02, 13, 10, 20, 64, 02, 02, 14, 50, 30, 64, 00, 00, 23, 81, 43, 64, 04, 05, 23, A2, 43, 64, 06, 05, 23, D0, 50, 64, 06, 06, 23, E0, 40, 64, 06, 06, 23, F4, 43, 64, 00, 05, 24, D0, 30, 64, 06, 06, 30, D2, 24, 64, 0A, 06, 31, 05, 24, 64, 02, 02, 31, 62, 24, 64, 06, 06, 32, A5, 20, 64, 02, 02, 33, 10, 20, 64, 02, 02, 34, 50, 30, 64, 00, 00, 43, 20, 34, 64, 06, 06, 43, 42, 44, 1E, 06, 06, 43, 70, 40, 1E, 06, 06, 43, 81, 67, 1E, 01, 03, 43, A2, 67, 1E, 02, 03, 43, D0, 50, 1E, 06, 06, 43, E0, 40, 1E, 06, 06, 43, F0, 63, 1E, 00, 03, 44, 03, 67, 1E, 00, 03, 44, 50, 20, 64, 00, 00, 44, 90, 18, 64, 00, 0A, 53, 20, 34, 64, 06, 06, 53, 42, 44, 1E, 06, 06, 53, 70, 40, 1E, 06, 06, 53, 81, 67, 1E, 07, 03, 53, A2, 67, 1E, 02, 03, 53, D0, 50, 1E, 06, 06, 53, E0, 40, 1E, 06, 06, 53, F0, 63, 1E, 00, 03, 54, 03, 67, 1E, 00, 03, 54, 50, 20, 64, 00, 00, 54, 81, 18, 00, 00, 0A`

**Lmm1_Data, inner DRL at 30% while indicating:**

`04, 52, 44, 64, 00, 00, 04, 81, 34, 64, 00, 00, 10, D2, 24, 64, 0A, 06, 11, 05, 24, 64, 02, 02, 11, 62, 24, 64, 06, 06, 12, A5, 20, 64, 02, 02, 13, 10, 20, 64, 02, 02, 14, 50, 30, 64, 00, 00, 23, 81, 43, 64, 04, 05, 23, A2, 43, 64, 06, 05, 23, D0, 50, 64, 06, 06, 23, E0, 40, 64, 06, 06, 23, F4, 43, 64, 00, 05, 24, D0, 30, 64, 06, 06, 30, D2, 24, 64, 0A, 06, 31, 05, 24, 64, 02, 02, 31, 62, 24, 64, 06, 06, 32, A5, 20, 64, 02, 02, 33, 10, 20, 64, 02, 02, 34, 50, 30, 64, 00, 00, 43, 20, 34, 64, 06, 06, 43, 42, 44, 1E, 06, 06, 43, 70, 40, 1E, 06, 06, 43, 81, 67, 1E, 01, 03, 43, A2, 67, 1E, 02, 03, 43, D0, 50, 1E, 06, 06, 43, E0, 40, 1E, 06, 06, 43, F0, 63, 1E, 00, 03, 44, 03, 67, 1E, 00, 03, 44, 50, 20, 64, 00, 00, 44, 90, 18, 1E, 00, 0A, 53, 20, 34, 64, 06, 06, 53, 42, 44, 1E, 06, 06, 53, 70, 40, 1E, 06, 06, 53, 81, 67, 1E, 07, 03, 53, A2, 67, 1E, 02, 03, 53, D0, 50, 1E, 06, 06, 53, E0, 40, 1E, 06, 06, 53, F0, 63, 1E, 00, 03, 54, 03, 67, 1E, 00, 03, 54, 50, 20, 64, 00, 00, 54, 81, 18, 00, 00, 0A`

## Effect on the welcome animation

- The animation is driven by the welcome records (flag byte ending in 3 or 7, last two bytes = on/off curve). Record 30 is a plain brightness record (flags `18`) with no curve fields.
- The change does not move any record. Lmm1 stays 252 bytes, with 42 records in the same order. The curve change at byte 208 and both Staging1 values are unaffected.
- **Possible side effect:** the unlock and lock confirmations flash the turn signals. If the car treats those flashes as function 490, the inner tube would now light at 100% during the amber blinks, in the 1.8 s before the animation starts. With `1E` it would sit at 30% instead, the same level it fades to at the start of the animation.

## Open questions

- When exactly does function 490 fire? Reportedly the inner tube already stays lit while indicating with the low beams on, so it may only fire in DRL-only mode. If it also fires with the low beams on, `64` would raise the inner tube from its 30% position level to full while indicating.
- Which wins when the welcome function and function 490 are both active?

## Test plan

1. Code the `64` value in both modules.
2. Signal left and right, first with DRLs only and then with the low beams on. Check the inner tube and look for lamp-fault warnings in the cluster.
3. Lock and unlock while filming at 60 fps, and check whether the inner tube lights during the amber blinks.
4. If the low-beam or unlock behaviour is unwanted, try `1E`.

## Legal note

US FMVSS 108 requires a DRL within about 10 cm of a turn signal to switch off or dim while the turn signal flashes. The outer tube clearly falls under that rule, which is why record 41 stays unchanged. Check the inner tube distance and the rules for your region before using this on the road.
