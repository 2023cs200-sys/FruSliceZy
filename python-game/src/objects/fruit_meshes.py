import math

from ursina import Entity, Vec3, color
from ursina.models.procedural.cone import Cone
from ursina.models.procedural.cylinder import Cylinder

from src.objects.fruit_geometry import (
    build_cap,
    build_fan,
    build_lathe,
    build_ribbon,
    build_tube,
    lerp3,
    lerp_color,
    ramp_color,
    tube_arc,
)


def _group(*children):
    root = Entity()
    for child in children:
        child.parent = root
    return root


# ------------------------------------------------------------------ apple

def _apple_profile():
    return [
        (-0.42, 0.00),
        (-0.39, 0.17),
        (-0.29, 0.31),
        (-0.13, 0.40),
        (0.00, 0.42),
        (0.14, 0.39),
        (0.28, 0.31),
        (0.36, 0.17),
        (0.37, 0.09),
        (0.28, 0.00),
    ]


def _apple_skin(y, phi):
    t = (y + 0.42) / 0.79
    base = ramp_color(
        [(190, 35, 35), (222, 42, 40), (238, 68, 55), (250, 150, 90), (120, 165, 70)],
        t,
    )
    stripe = 1.0 + 0.06 * math.sin(6 * phi) + 0.03 * math.sin(11 * phi + 1.3)
    if y > 0.30:
        k = (y - 0.30) / 0.07
        base = lerp_color(base, (110, 175, 65), min(1, k))
    return color.rgb32(
        min(255, int(base[0] * stripe)),
        min(255, int(base[1] * stripe * 0.9)),
        min(255, int(base[2] * stripe * 0.85)),
    )


APPLE_FLESH = (250, 246, 230)


def build_apple():
    return _group(
        Entity(model=build_lathe(_apple_profile(), _apple_skin), double_sided=True),
        Entity(
            model=Cylinder(),
            scale=(0.04, 0.16, 0.04),
            position=(0, 0.44, 0),
            rotation_z=6,
            color=color.rgb32(95, 60, 35),
        ),
        Entity(
            model="circle",
            scale=(0.18, 0.10, 1),
            position=(0.10, 0.50, 0),
            rotation_z=-28,
            color=color.rgb32(70, 145, 60),
            double_sided=True,
        ),
    )


def build_apple_half(side=+1):
    half_sweep = (0.0, math.pi) if side > 0 else (math.pi, 2 * math.pi)
    return _group(
        Entity(
            model=build_lathe(
                _apple_profile(), _apple_skin, phi_start=half_sweep[0],
                phi_end=half_sweep[1],
            ),
            double_sided=True,
        ),
        Entity(
            model=build_cap(
                _apple_profile(), color.rgb32(*APPLE_FLESH), rim_rgb=None
            ),
            double_sided=True,
        ),
        Entity(
            model=Cylinder(),
            scale=(0.03, 0.07, 0.03),
            position=(0, 0.44, 0),
            color=color.rgb32(95, 60, 35),
        ),
    )


# ------------------------------------------------------------------ orange

def _orange_profile():
    return [
        (-0.45, 0.00),
        (-0.43, 0.12),
        (-0.36, 0.28),
        (-0.24, 0.40),
        (-0.08, 0.46),
        (0.08, 0.46),
        (0.24, 0.40),
        (0.36, 0.28),
        (0.43, 0.12),
        (0.45, 0.00),
    ]


def _orange_skin(y, phi):
    t = (y + 0.45) / 0.90
    base = ramp_color([(235, 120, 20), (245, 155, 35), (250, 175, 55)], t)
    speck = 0.92 + 0.08 * math.sin(23 * phi + y * 30)
    return color.rgb32(
        min(255, int(base[0] * speck)),
        min(255, int(base[1] * speck)),
        min(255, int(base[2] * speck)),
    )


ORANGE_FLESH = (255, 200, 90)
ORANGE_RIND = (255, 240, 210)


def build_orange():
    return _group(
        Entity(model=build_lathe(_orange_profile(), _orange_skin), double_sided=True),
        Entity(
            model=Cylinder(),
            scale=(0.03, 0.06, 0.03),
            position=(0, 0.45, 0),
            color=color.rgb32(70, 130, 50),
        ),
    )


def build_orange_half(side=+1):
    half_sweep = (0.0, math.pi) if side > 0 else (math.pi, 2 * math.pi)
    return _group(
        Entity(
            model=build_lathe(
                _orange_profile(), _orange_skin, phi_start=half_sweep[0],
                phi_end=half_sweep[1],
            ),
            double_sided=True,
        ),
        Entity(
            model=build_cap(
                _orange_profile(),
                color.rgb32(*ORANGE_FLESH),
                rim_rgb=color.rgb32(*ORANGE_RIND),
                rim=0.86,
            ),
            double_sided=True,
        ),
    )


# ------------------------------------------------------------------ watermelon

def _watermelon_profile():
    return [
        (-0.62, 0.00),
        (-0.60, 0.15),
        (-0.52, 0.34),
        (-0.38, 0.50),
        (-0.20, 0.58),
        (0.00, 0.60),
        (0.20, 0.58),
        (0.38, 0.50),
        (0.52, 0.34),
        (0.60, 0.15),
        (0.62, 0.00),
    ]


def _watermelon_skin(y, phi):
    t = (y + 0.62) / 1.24
    base = ramp_color(
        [(45, 110, 40), (60, 140, 55), (75, 160, 60), (95, 175, 70), (60, 140, 50)],
        t,
    )
    # dark + light rind stripes along phi, like a real melon
    stripe = math.sin(7 * phi)
    s = 1.0 + 0.25 * stripe
    return color.rgb32(
        min(255, int(base[0] * s)),
        min(255, int(base[1] * s * (1.05 if stripe > 0 else 0.95))),
        min(255, int(base[2] * s)),
    )


WATERMELON_FLESH = (235, 80, 95)
WATERMELON_RIND = (240, 250, 235)


def build_watermelon():
    return _group(
        Entity(
            model=build_lathe(_watermelon_profile(), _watermelon_skin),
            double_sided=True,
        )
    )


def build_watermelon_half(side=+1):
    half_sweep = (0.0, math.pi) if side > 0 else (math.pi, 2 * math.pi)
    return _group(
        Entity(
            model=build_lathe(
                _watermelon_profile(), _watermelon_skin, phi_start=half_sweep[0],
                phi_end=half_sweep[1],
            ),
            double_sided=True,
        ),
        Entity(
            model=build_cap(
                _watermelon_profile(),
                color.rgb32(*WATERMELON_FLESH),
                rim_rgb=color.rgb32(*WATERMELON_RIND),
                rim=0.90,
            ),
            double_sided=True,
        ),
    )


# ------------------------------------------------------------------ pineapple

_PINE_EYE_ROWS = 12
_PINE_EYE_COLS = 14


def _pineapple_profile():
   
    return [
        (-0.65, 0.00),
        (-0.63, 0.14),
        (-0.60, 0.28),
        (-0.56, 0.40),
        (-0.51, 0.48),
        (-0.45, 0.51),
        (-0.37, 0.52),
        (-0.28, 0.53),
        (-0.18, 0.53),
        (-0.08, 0.53),
        (0.02, 0.52),
        (0.12, 0.50),
        (0.21, 0.47),
        (0.30, 0.43),
        (0.38, 0.38),
        (0.45, 0.32),
        (0.51, 0.26),
        (0.56, 0.19),
        (0.60, 0.12),
        (0.62, 0.07),
        (0.60, 0.04),
        (0.58, 0.02),
    ]


def _pineapple_radius_with_bumps(y, phi):
    """Silhouette + rhombic 'eye' bumps of a real pineapple rind.

    Two crossed wave trains (one along y, one around phi) whose product
    forms the diamond eye lattice; phase offset interleaves the rows.
    """
    from src.objects.fruit_geometry import radius_at

    base = radius_at(_pineapple_profile(), y)
    if base <= 0.0:
        return 0.0
    row_wave = math.sin(y * _PINE_EYE_ROWS * math.pi / 2.0)
    col_wave = math.sin(phi * _PINE_EYE_COLS)
    bump = row_wave * col_wave
    barrel_zone = max(0.0, 1.0 - abs(y) * 1.6)  # fade bumps at top/bottom
    return base * (1.0 + 0.055 * bump * barrel_zone)


def _pineapple_skin(y, phi):
    t = (y + 0.65) / 1.20
    base = ramp_color(
        [(150, 105, 35), (190, 140, 45), (215, 165, 55), (205, 145, 45), (170, 115, 40)],
        t,
    )
    # paint the same eye lattice the geometry uses: dark diamond centers,
    # bright ridges between them (unlit shading must be painted in)
    row_wave = math.sin(y * _PINE_EYE_ROWS * math.pi / 2.0)
    col_wave = math.sin(phi * _PINE_EYE_COLS)
    brightness = 1.0 + 0.22 * (row_wave * col_wave)
    return color.rgb32(
        min(255, max(0, int(base[0] * brightness))),
        min(255, max(0, int(base[1] * brightness))),
        min(255, max(0, int(base[2] * brightness))),
    )


PINEAPPLE_FLESH = (250, 235, 160)
PINEAPPLE_RIND = (215, 190, 90)


def _crown_leaf(parent, base, angle_deg, tilt_deg, length, width, offset_y=0.0):
    """One crown leaf: two stacked segments leaning outward, slightly bent."""
    a = math.radians(angle_deg)
    t = math.radians(tilt_deg)
    outward = Vec3(math.sin(a) * math.cos(t), math.sin(t), math.cos(a) * math.cos(t))
    base_pos = Vec3(
        base.x + math.sin(a) * 0.05,
        base.y + offset_y,
        base.z + math.cos(a) * 0.05,
    )
    lower_len = length * 0.55
    upper_len = length * 0.45
    mid = base_pos + outward * lower_len
    tip = mid + outward * upper_len + Vec3(0, 0.06, 0)
    for (p0, p1, w, shade) in (
        (base_pos, mid, width, 1.0),
        (mid, tip, width * 0.55, 0.85),
    ):
        seg_len = (p1 - p0).length()
        seg = Entity(
            parent=parent,
            model="cube",
            scale=(w, seg_len, w * 0.32),
            color=color.rgb32(
                int(70 * shade + 10),
                int(150 * shade),
                int(60 * shade),
            ),
        )
        seg.position = (p0 + p1) / 2
        # orientation via direct angle math (look_at is degenerate when the
        # segment runs nearly parallel to its own axis)
        direction = p1 - p0
        seg.rotation_x = math.degrees(math.atan2(direction.z, direction.y)) * -1
        seg.rotation_z = math.degrees(math.atan2(direction.x, direction.y))
        seg.double_sided = True
    return tip


def _pineapple_crown(center):
    """Spike rosette: 5 upright inner leaves + 7 tilted outer leaves."""
    crown = Entity()
    for i in range(5):
        angle = i * (360 / 5) + 20
        _crown_leaf(crown, center, angle, tilt_deg=8, length=0.42, width=0.09, offset_y=0.02)
    for i in range(7):
        angle = i * (360 / 7) + 10
        _crown_leaf(crown, center, angle, tilt_deg=38, length=0.34, width=0.11)
    return crown


def build_pineapple():
    profile = _pineapple_profile()
    return _group(
        Entity(
            model=build_lathe(
                profile, _pineapple_skin, longitudes=36,
                radius_fn=_pineapple_radius_with_bumps,
            ),
            double_sided=True,
        ),
        _pineapple_crown(Vec3(0, 0.60, 0)),
    )


def build_pineapple_half(side=+1):
    half_sweep = (0.0, math.pi) if side > 0 else (math.pi, 2 * math.pi)
    profile = _pineapple_profile()
    root = Entity()
    Entity(
        parent=root,
        model=build_lathe(
            profile, _pineapple_skin, longitudes=36,
            phi_start=half_sweep[0], phi_end=half_sweep[1],
            radius_fn=_pineapple_radius_with_bumps,
        ),
        double_sided=True,
    )
    Entity(
        parent=root,
        model=build_cap(
            profile,
            color.rgb32(*PINEAPPLE_FLESH),
            rim_rgb=color.rgb32(*PINEAPPLE_RIND),
            rim=0.88,
        ),
        double_sided=True,
    )
    # crown halves: only leaves rooted on the kept side survive the cut
    center = Vec3(0, 0.60, 0)
    for i in range(5):
        angle = i * (360 / 5) + 20
        if (side > 0) != (math.sin(math.radians(angle)) >= 0):
            continue
        _crown_leaf(root, center, angle, tilt_deg=8, length=0.42, width=0.09, offset_y=0.02)
    for i in range(7):
        angle = i * (360 / 7) + 10
        if (side > 0) != (math.sin(math.radians(angle)) >= 0):
            continue
        _crown_leaf(root, center, angle, tilt_deg=38, length=0.34, width=0.11)
    return root


# ------------------------------------------------------------------ banana

_BANANA_ARC = 0.9  # radians the center path bends


def _banana_path(t):
    """Center path of the banana: an arc in the XY plane from tip to tip."""
    a = _BANANA_ARC
    x = math.sin(a * t)
    y = -math.cos(a * t) + math.cos(a / 2)
    return Vec3(x, y, 0)


def _banana_radius(t):
    """Banana thickness: slim at the tips, full in the middle (thin fruit)."""
    return 0.105 * (0.30 + 0.70 * math.sin(math.pi * min(1, max(0, t)) ** 0.8))


def _banana_skin(t, th):
    base = ramp_color(
        [(240, 215, 60), (248, 230, 90), (240, 210, 60)],
        t,
    )
    ridge = 1.0 + 0.05 * math.cos(5 * th)
    return color.rgb32(
        min(255, int(base[0] * ridge)),
        min(255, int(base[1] * ridge * 0.97)),
        min(255, int(base[2] * ridge * 0.8)),
    )


BANANA_FLESH = (250, 245, 215)


def _banana_tip(cap_color):
    """Fan mesh capping the open tip rings of the banana tube."""
    return build_fan(
        tube_arc(_banana_path, _banana_radius, 0.0, 10),
        color.rgb32(*cap_color),
    )


def build_banana():
    return _group(
        Entity(
            model=build_tube(
                _banana_path,
                _banana_radius,
                _banana_skin,
                path_segments=16,
                ring_points=14,
            ),
            double_sided=True,
        ),
        Entity(model=_banana_tip((255, 235, 120)), double_sided=True),
        Entity(
            model=build_fan(
                tube_arc(_banana_path, _banana_radius, 1.0, 10),
                color.rgb32(120, 100, 40),
            ),
            double_sided=True,
        ),
    )


def build_banana_half(side=+1):
    """Split lengthwise: front half (z<=0, toward camera) or back half."""
    if side > 0:
        th_start, th_end = math.pi, 2 * math.pi
    else:
        th_start, th_end = 0.0, math.pi
    return _group(
        Entity(
            model=build_tube(
                _banana_path,
                _banana_radius,
                _banana_skin,
                path_segments=16,
                ring_points=8,
                th_start=th_start,
                th_end=th_end,
            ),
            double_sided=True,
        ),
        Entity(
            model=build_ribbon(
                _banana_path, _banana_radius, 0.0, 1.0, color.rgb32(*BANANA_FLESH),
                segments=16,
            ),
            double_sided=True,
        ),
        Entity(
            model=build_fan(
                tube_arc(
                    _banana_path, _banana_radius, 0.0, 8,
                    th_start=th_start, th_end=th_end,
                ),
                color.rgb32(250, 245, 215),
                wrap=False,
            ),
            double_sided=True,
        ),
        Entity(
            model=build_fan(
                tube_arc(
                    _banana_path, _banana_radius, 1.0, 8,
                    th_start=th_start, th_end=th_end,
                ),
                color.rgb32(120, 100, 40),
                wrap=False,
            ),
            double_sided=True,
        ),
    )


FRUIT_GEO = {
    "apple": (build_apple, build_apple_half),
    "orange": (build_orange, build_orange_half),
    "banana": (build_banana, build_banana_half),
    "pineapple": (build_pineapple, build_pineapple_half),
    "watermelon": (build_watermelon, build_watermelon_half),
}
