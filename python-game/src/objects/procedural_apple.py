import math

from ursina import Entity, Mesh, Vec3, color


_PROFILE = [
    (-0.50, 0.00),
    (-0.46, 0.17),
    (-0.36, 0.30),
    (-0.20, 0.40),
    (-0.02, 0.46),
    (0.12, 0.47),
    (0.26, 0.44),
    (0.38, 0.36),
    (0.46, 0.24),
    (0.50, 0.14),
    (0.43, 0.00),
]

LONGITUDES = 26

_BOTTOM = Vec3(0.45, 0.04, 0.07)
_MID = Vec3(0.85, 0.13, 0.12)
_TOP = Vec3(0.96, 0.30, 0.20)


def _radius_at(y):
    for i in range(len(_PROFILE) - 1):
        y0, r0 = _PROFILE[i]
        y1, r1 = _PROFILE[i + 1]
        if y0 <= y <= y1:
            t = (y - y0) / (y1 - y0)
            return r0 + (r1 - r0) * t
    return 0.0


def _lerp3(a, b, t):
    return a * (1 - t) + b * t


def _vertex_color(y, phi):
    t = (y + 0.5)
    if t < 0.55:
        base = _lerp3(_BOTTOM, _MID, t / 0.55)
    else:
        base = _lerp3(_MID, _TOP, (t - 0.55) / 0.45)
    stripe = 1.0 + 0.05 * math.sin(5 * phi) + 0.03 * math.sin(11 * phi + 1.7)
    if y > 0.38:
        base *= 0.55 + 0.45 * ((0.50 - y) / 0.12)
    return base * stripe


def _build_body_mesh():
    vertices = []
    colors = []
    for y, radius in _PROFILE:
        for j in range(LONGITUDES):
            phi = j / LONGITUDES * math.pi * 2
            vertices.append(
                Vec3(radius * math.cos(phi), y, radius * math.sin(phi))
            )
            rgb = _vertex_color(y, phi)
            colors.append(
                color.rgb32(
                    int(min(1, rgb.x) * 255),
                    int(min(1, rgb.y) * 255),
                    int(min(1, rgb.z) * 255),
                )
            )
    triangles = []
    rings = len(_PROFILE)
    for i in range(rings - 1):
        for j in range(LONGITUDES):
            j_next = (j + 1) % LONGITUDES
            a = i * LONGITUDES + j
            b = i * LONGITUDES + j_next
            c = (i + 1) * LONGITUDES + j
            d = (i + 1) * LONGITUDES + j_next
            triangles.extend((a, c, b, b, c, d))
    return Mesh(vertices=vertices, colors=colors, triangles=triangles, mode="triangle")


def build_apple():
    root = Entity()
    Entity(
        parent=root,
        model=_build_body_mesh(),
        double_sided=True,
    )
    Entity(
        parent=root,
        model="cylinder",
        scale=(0.035, 0.14, 0.035),
        position=(0, 0.48, 0),
        rotation_z=6,
        color=color.rgb32(95, 60, 35),
    )
    Entity(
        parent=root,
        model="circle",
        scale=(0.20, 0.10, 1),
        position=(0.11, 0.54, 0),
        rotation_z=-28,
        color=color.rgb32(70, 145, 60),
        double_sided=True,
    )
    return root


BUILTIN_BUILDERS = {"apple": build_apple}
