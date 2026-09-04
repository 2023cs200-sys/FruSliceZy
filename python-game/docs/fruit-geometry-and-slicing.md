# Fruit Geometry & Slicing Mechanics — Technical Documentation

This document explains **how fruits are built as 3D meshes** and **how slicing works**, including every piece of mathematics used. It covers the code in:

- `src/objects/fruit_geometry.py` — generic mesh engine
- `src/objects/fruit_meshes.py` — the five fruit builders (whole + halves)
- `src/objects/sliced_fruit.py` — the slicing engine
- `src/objects/fruit.py` — loader chain and collider sizing
- `tests/test_fruit_geometry.py`, `tests/test_sliced_fruit.py` — invariants

---

## Part 1 — The Mesh Math

### 1.1 Coordinate conventions

The play plane is **z = 0**; the camera looks from −Z toward +Z. Everything important happens in XY; Z gives depth.

- **X** — horizontal (screen left/right)
- **Y** — vertical (screen up/down)
- **Z** — depth, toward the camera

**Design rule:** every *cut face* lies in the z = 0 plane. This guarantees the camera always sees pale flesh when a fruit splits — regardless of how the half is later rotated around Z. A rotation about Z leaves the z-coordinate of every mesh point unchanged, so the cap stays camera-facing.

### 1.2 The lathe — solids of revolution

Most fruits (apple, orange, pineapple, watermelon) are **solids of revolution**: they can be described by a 2D silhouette (a *profile*) that is rotated 360° around the Y axis.

A **profile** is an ordered list of `(y, r)` pairs, bottom → top, where `r` is the fruit's horizontal radius at height `y`. For example, the orange:

```python
[(-0.45, 0.00), (-0.43, 0.12), (-0.36, 0.28), ..., (0.45, 0.00)]
```

**Generating the surface of revolution.** For each profile ring `i` at height `y_i` with radius `r_i`, the ring of surface points is the circle:

```
x(φ) = r · cos(φ)
z(φ) = r · sin(φ)      for φ ∈ [φ_start, φ_end]
```

`build_lathe()` walks every ring, and for each of the `longitudes` samples around the circle, emitting one vertex per (ring, angle) pair.

**Triangle construction.** Adjacent rings `i` and `i+1` and adjacent angles `j`, `j+1` form a curved rectangle (a "strip" of the surface). Each such quad is split into two triangles:

```
ring i:      a ——— b        quad (a,b,c,d) → triangles (a, c, b) and (b, c, d)
             |  \  |
             |   \ |
ring i+1:    c ——— d
```

Why two triangles per quad: GPUs only rasterize triangles. The diagonal split introduces a small faceting error compared to a true smooth surface, but at 22+ samples per ring this is visually negligible — and it is why the mesh looks slightly low-poly, which is a deliberate performance choice.

**Winding order.** Triangles are emitted consistently (e.g. `(a, c, b)`), keeping a uniform winding so face-culling works predictably. Because procedural fruits are rendered `double_sided=True`, an inconsistent winding would not cause invisible faces — but consistent winding keeps lighting/culling math sane if we ever switch shaders.

**Why a lathe?** One engine + five small profiles = five distinct fruits. And — the key trick for Section 2 — **a half is the same function with half the angle range** (next section).

### 1.3 The cut face (`build_cap`)

A half-lathe is hollow — slicing an apple must reveal flesh. `build_cap()` fills the cross-section.

The cap geometry walks the profile twice — once on the +x side, once on the −x side — then closes the outline into a fan from the center point:

```
outline = [(+r_0, y_0), (+r_1, y_1), ..., (+r_n, y_n)]      (up the +x side)
       ++ [(−r_n, y_n), ..., (−r_0, y_0)]                   (down the −x side)

center = (0, ȳ, 0),  where ȳ = (y_min + y_max) / 2

triangles: (center, outline[k], outline[k+1 mod m])   for k = 0..m−1
```

**The watermelon's rind ring.** With `rim_rgb` set, the cap emits two loops instead of one:

- **outer loop** at radius `r(y)` — colored `rim_rgb` (white)
- **inner loop** at radius `rim · r(y)` — colored flesh (red), where `rim = 0.90`

The fan from the center covers the inner disk (flesh), and a "belt" of quads connects outer and inner loops (the white rind ring). With `rim = 0.90`, the rind band occupies the outer 10% of the radius. Changing `rim` widens/narrows the painted rind.

### 1.4 The tube — bananas

A banana is not a solid of revolution — it's a **swept circle**: a disc whose center travels along a curved path while its size changes.

- **Path** — `_banana_path(t)`, an arc in the XY plane:

```
a = 0.9 (radians)                      total bend of the fruit
x(t) = sin(a·t)                         t ∈ [0, 1] tip → tip
y(t) = −cos(a·t) + cos(a/2)             (cos(a/2) centers the arc on y = 0)
```

- **Radius function** — `_banana_radius(t)`:

```
r(t) = 0.105 · (0.30 + 0.70 · sin(π · t^0.8))
```

The `t^0.8` skews the bulge slightly toward the middle; the factor 0.105 makes it a thin fruit.

- **Sweeping the frame.** At each of 16 sample points along the path, we need a local coordinate frame: the circle must be perpendicular to the path's tangent. Because the path lies entirely in the XY plane, the frame is simple:

```
tangent T = dP/dt (numerically: (P(t+ε) − P(t−ε)) / 2ε), normalized
binormal B = (0, 0, 1)                        world Z, constant
normal N = (T_y · B_z, −T_x · B_z, 0) = (T_y, −T_x, 0)
```

This is a **planar Frenet frame** (simplified). The general 3D case requires parallel transport or rotation-minimizing frames; here the plane constraint lets us hard-code B = world-Z. The `ε = 1e-4` central difference computes the tangent without needing a closed-form derivative.

**Ring vertices** at parameter `t`, angle `θ`:

```
V(t, θ) = P(t) + (N·cos θ + B·sin θ) · r(t)
```

Triangles connect consecutive rings exactly like the lathe.

**The banana cut face — a ribbon.** Cutting a banana splits it *lengthwise* — the cut face is a long strip, not a disk. `build_ribbon()` runs along the path in the z = 0 plane between the two boundary points of each ring (`center ± N·r`), producing a flat strip with both edges lying in the z = 0 plane.

### 1.5 Bump mapping via `radius_fn` (pineapple eyes)

`build_lathe` accepts an optional `radius_fn(y, φ)` that perturbs the base radius per-vertex. The pineapple's eye lattice:

```
base(y)     = radius_at(profile, y)                    piecewise-linear interpolation
row(y)      = sin(y · 12 · π / 2)                       12 eye rows along the height
col(φ)      = sin(φ · 14)                               14 columns around the circumference
bump(y, φ)  = row(y) · col(φ)
r(y, φ)     = base(y) · (1 + 0.055 · bump(y, φ) · fade(y))

fade(y)     = max(0, 1 − |y| · 1.6)                    fades bumps out at top/bottom
```

**Why a product of two sinusoids?** `sin(A)·sin(B)` is positive only where both factors are positive — its zero crossings form a **diamond/rhombus grid** in the (y, φ) plane. That matches the diagonal eye pattern of a real pineapple. Using the sum instead (`sin(A)+sin(B)`) would give stripes, not diamonds.

**Painting the same lattice into colors.** Because the scene is unlit, bump depth must also be faked with brightness:

```
brightness(y, φ) = 1 + 0.22 · row(y) · col(φ)
RGB(y, φ) = clamp(base_color(y) · brightness)
```

Geometry gives parallax at the silhouette; paint gives perceived depth on the surface facing the camera. Both use the *same* wave functions, so paint and geometry never contradict each other.

### 1.6 Color: ramps, stripes, speckle

All skins are pure functions `(y, φ) → RGB`.

**Color ramp** — multi-stop linear interpolation:

```
stops = [c₀, c₁, ..., cₙ]     (0–255 tuples)
t ∈ [0,1]
scaled = t · n
i = floor(scaled)
color = cᵢ + (cᵢ₊₁ − cᵢ) · (scaled − i)       per channel
```

e.g. apple: bottom red → mid red → top yellow-green blush → green crown area.

**Stripes** (apple, watermelon rind):

```
stripe(φ) = 1 + 0.06·sin(6φ) + 0.03·sin(11φ + 1.3)
```

Two sinusoids of different frequency/phase break up regularity so the pattern doesn't look machine-perfect.

**Speckle** (orange peel):

```
speck(φ, y) = 0.92 + 0.08·sin(23φ + 30y)
```

High frequency in both variables reads as peel texture at a glance.

**The black-fruit bug (unit mismatch — worth remembering).** `Color` objects hold **0–1 floats**; builder tuples are **0–255**. `ramp_color` originally returned a Color, and the skin functions did `int(color[0] · stripe)` — `int(0.87 · 1.0) = 0` → every channel collapsed to zero → black fruit. Fix: `ramp_color`/`lerp_color` return plain 0–255 tuples, one scale per file, documented.

### 1.7 Leaf placement math (pineapple crown)

Each leaf is two stacked stretched cubes. Placement is spherical-ish coordinates:

```
angle a = leaf_index · (360/n) + phase
tilt τ  = 8° (inner ring) / 38° (outer ring)

outward = (sin a · cos τ, sin τ, cos a · cos τ)       direction of growth
base    = (0, seat_y, 0) + (sin a, 0, cos a) · 0.05   small radial offset
mid     = base + outward · 0.55·L
tip     = mid + outward · 0.45·L + (0, 0.06, 0)      slight upward flick
```

**Orientation without look_at.** Ursina's `look_at` degenerates when the segment direction is (near-)parallel to its own forward axis (the upright center leaves). So orientation is direct angle math:

```
direction d = p1 − p0
rotation_x = −atan2(d.z, d.y)
rotation_z = atan2(d.x, d.y)
```

`atan2(·, ·)` (2-argument arctangent) resolves the full circle quadrant, unlike plain `atan`.

### 1.8 Loader chain and collider sizing

The loader priority (in `Fruit.__init__`):

1. **File model** (`info["model"]` path exists) → downloaded asset wins (Route A)
2. **Procedural builder** (`FRUIT_GEO[fruit_type][0]`) → default (Route B)
3. **Sphere fallback** — never crash

The collider radius is derived from the actual mesh:

```
max_dim = max(size.x, size.y, size.z)     from the builder's bounds
radius  = max_dim · 0.55
```

**Why 0.55?** For a sphere of visual radius R, the true collider would be R itself. But our fruits are lathes with stems and crowns — the bounding box is bigger than the "meaty" part. 0.55·max_dim compensates: it covers the bulk of the fruit without letting you slice the empty air above the stem. It is a forgiveness factor — hitboxes slightly smaller than visuals frustrate players less than the reverse. Tune via the 0.55 factor if hits feel off.

---

## Part 2 — The Slicing Mechanics

### 2.1 Where the slash direction comes from

The collision system (Phase 1, unchanged) already computes a swept segment per frame:

```
S = previous_tip_position → tip_position
```

If that segment passes within `fruit.radius + sword.blade_radius` of a fruit center, the fruit is cut. The direction the blade moved **is** the segment:

```
d = tip_position − previous_tip_position
slash_dir = normalize((d.x, d.y, 0))                 # locked to play plane
```

**Degenerate case:** if |d| < 0.001 (mouse stationary), there is no meaningful slash; we return (1, 0, 0) as a safe default (also gives tests a deterministic value).

**Zeroing z:** the sword moves in the play plane; keeping the direction planar guarantees the separation math stays in the screen plane where the player sees it.

### 2.2 Perpendicular separation — the core idea

A knife moving horizontally through an apple pushes the two halves apart **vertically**. The separation axis is the slash direction rotated by 90°.

In 2D, rotating a vector (x, y) by +90° (counterchalfwise) is:

```
R90(x, y) = (−y, x)
perp = (−slash_dir.y, slash_dir.x, 0)
```

**Why rotate by exactly 90°?** The halves part along the cut's normal, and the cut's normal is perpendicular to the blade's motion. Any other angle would look like the fruit got "smeared" diagonally rather than cleanly split.

The two half velocities:

```
v_left  = v_fruit · inherit + perp · push
v_right = v_fruit · inherit − perp · push
```

with `inherit = 0.4`, `push = 2.5` (both from `config.effects`).

**Invariants the tests verify:**

- **Perpendicularity:** (v_left − v_right) · slash_dir = 0  — separation is exactly perpendicular to the slash. Dot product zero.
- **Symmetry:** |v_left − v_right| = 2·push — equal and opposite pushes.
- **Momentum:** both halves keep `inherit`·v_fruit — the fruit doesn't stop dead when cut.

**Why 40% inheritance?** At 100% the halves would follow the original arc exactly, making the split hard to read. At 0% they'd stop dead, looking fake. 0.4 keeps the launch feel while making separation visible — a game-feel constant, tunable in config.

### 2.3 Aligning the half to the slash

Each half is built with its **cut plane at local x = 0** and its separation axis along local ±X. To align the half's geometry with the actual slash, rotate it about Z until local +X points along `perp`:

```
rotation_z = atan2(perp.y, perp.x)  (converted to degrees)
```

This is a single rotation, because:

- Rotation about Z preserves every z-coordinate → the cap built in the z = 0 plane **stays** in the z = 0 plane → flesh keeps facing the camera.
- The geometry's local separation direction (±X) rotates with it.

`side = +1` keeps the x ≥ 0 half; `side = −1` keeps x ≤ 0. Left/right assignment matches the velocity signs, so each half flies toward its own side of the cut.

**The full alignment chain:** collision segment → slash direction → 90° rotation → perp → `atan2` → rotation_z. One coherent frame handed from collision to geometry with no extra state.

### 2.4 The physics update (per frame, per half)

Explicit Euler integration with dt from the engine:

```
v.y ← v.y − g · dt        (gravity, g = 25 from config)
p ← p + v · dt             (position integration)
rotation_z ← rotation_z + spin · 0.3 · dt
rotation_x ← rotation_x + spin · 0.3 · dt   [slower tumble on the second axis]
```

Spin is randomized per half: spin ∈ uniform(−260, 260)°/s. Two axes tumble at different rates (0.3/0.6 factors) so the halves' rotation looks organic rather than like a rigid double-spin.

**Despawn rule:**

```
if y < despawn_y AND v.y < 0 → destroy
```

Both conditions matter: y < despawn_y alone would kill halves spawning low... but v.y < 0 alone would kill rising halves at spawn. The conjunction only removes halves that are actually falling out of the arena.

### 2.5 The fade curve

```
lifetime L = 1.6 s (config.effects.half_lifetime)
fade window = last 35%: starts at f₀ = 0.65·L

α(t) = 1                                   for t ≤ f₀
α(t) = 1 − (t − f₀)/(L − f₀)               for f₀ < t < L
```

Linear fade. The 65%/35% split is a game-feel choice: full visibility while the halves are near the cut point, gentle warning fade as they fall out of relevance.

**The alpha fan-out problem.** `SlicedHalf` is a *wrapper* Entity with **no model**; the visible meshes are child entities (inner root → mesh children). Ursina calls `setColorScaleOff()` on models, which severs parent→child color inheritance. Setting `wrapper.alpha` therefore changes nothing visible. The fix — an overridden property:

```python
@property
def alpha(self):  return self._alpha
@alpha.setter
def alpha(self, v):
    self._alpha = v
    for target in self._fade_targets:      # inner root + its mesh children
        target.alpha = v
```

Tests assert the *mesh* alphas dropped — not just the wrapper's bookkeeping value.

### 2.6 The ordering constraint in `_cut_fruit`

```python
spawn_halves(fruit, sword)      # reads fruit.position, fruit.velocity
object_manager.remove(fruit)    # destroys the fruit entity
```

Halves must be spawned **before** removal. After `remove` → `destroy`, the fruit's NodePath is a destroyed Panda3D object; touching `fruit.position` afterwards can trigger a native `!is_empty()` assertion. Ordering is the entire defense — there is no "safe" way to read a destroyed entity.

---

## Part 3 — Invariant-based testing

Tests check **mathematical properties**, not exact pixel output:

| Test | Invariant |
|---|---|
| half has a flat cut face, all z = 0, ≥ 3 triangles | The core half feature |
| lathe half-sweep → all z ≥ 0 | `phi_start/phi_end` actually halves the sweep |
| cap/ribbon vertices all z = 0 | Cut faces stay in the visible plane |
| (v_left − v_right) · slash = 0 | Separation perpendicular to slash |
| \|v_left − v_right\| = 2·push | Equal & opposite push |
| both halves keep inherit·v_fruit | Momentum conservation |
| radius ∈ (0.05, 3.0) after builder | Collider sanity for all five fruits |

Testing invariants rather than exact values makes the suite robust to tuning (profile edits, constant tweaks) while still catching structural bugs — wrong angle ranges, missing caps, black-color regressions.

---

## Appendix A — Symbol table

| Symbol | Meaning | Lives in |
|---|---|---|
| φ (phi) | Angle around the revolution axis | lathe/tube math |
| θ (theta) | Angle around a tube ring | banana |
| t | Parameter along a path [0,1] | banana path/radius |
| `profile` | [(y, r)] silhouette | all lathes |
| `perp` | slash_dir rotated +90° | slicing |
| `inherit` | fraction of fruit velocity kept | `half_velocities` |
| `push` | separation impulse magnitude | `config.effects.half_push` |
| L | half lifetime | `config.effects.half_lifetime` |
| α (alpha) | opacity 0..1 | fade |
| rim | fraction of radius painted as rind | caps |
| ε (epsilon) | 1e-4, tangent numerical step | banana frame |
| g | gravity 25 | `config.physics.gravity` |

## Appendix B — File map

```
src/objects/
├── fruit_geometry.py   ← generic engine: lathe, cap, tube, fan, ribbon, ramps
├── fruit_meshes.py     ← five fruits × (whole, half) + FRUIT_GEO registry
├── sliced_fruit.py     ← slash_direction, half_velocities, SlicedHalf, spawn_halves
├── fruit.py            ← loader chain (file → builtin → sphere), collider sizing
└── procedural_apple.py ← (legacy Phase 1 apple, superseded by fruit_meshes)
```
