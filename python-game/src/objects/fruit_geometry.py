import math

from ursina import Mesh, Vec3, color


def _rgb(r, g, b):
    return color.rgb32(
        int(min(255, max(0, r))),
        int(min(255, max(0, g))),
        int(min(255, max(0, b))),
    )


def lerp3(a, b, t):
    return a * (1 - t) + b * t


def lerp_color(a, b, t):
    
    return (
        int(lerp3(a[0], b[0], t)),
        int(lerp3(a[1], b[1], t)),
        int(lerp3(a[2], b[2], t)),
    )


def ramp_color(stops, t):
   
    t = min(1.0, max(0.0, t))
    last = len(stops) - 1
    scaled = t * last
    i = min(int(scaled), last - 1)
    return lerp_color(stops[i], stops[i + 1], scaled - i)


def radius_at(profile, y):
    
    for i in range(len(profile) - 1):
        y0, r0 = profile[i]
        y1, r1 = profile[i + 1]
        if y0 <= y <= y1:
            t = (y - y0) / (y1 - y0)
            return r0 + (r1 - r0) * t
    return 0.0


def build_lathe(profile, skin_fn, longitudes=22, phi_start=0.0,
                phi_end=2 * math.pi, radius_fn=None):
    
    vertices = []
    colors = []
    rings = len(profile)
    for y, radius in profile:
        for j in range(longitudes):
            phi = phi_start + (j / (longitudes - 1)) * (phi_end - phi_start)
            if radius_fn is not None:
                radius = radius_fn(y, phi)
            vertices.append(Vec3(radius * math.cos(phi), y, radius * math.sin(phi)))
            colors.append(skin_fn(y, phi))
    triangles = []
    for i in range(rings - 1):
        for j in range(longitudes - 1):
            a = i * longitudes + j
            b = i * longitudes + j + 1
            c = (i + 1) * longitudes + j
            d = (i + 1) * longitudes + j + 1
            triangles.extend((a, c, b, b, c, d))
    return Mesh(vertices=vertices, colors=colors, triangles=triangles, mode="triangle")


def build_cap(profile, flesh_rgb, rim_rgb=None, rim=0.82):
   
    up = [Vec3(r, y, 0) for y, r in profile]
    down = [Vec3(-r, y, 0) for y, r in reversed(profile)]
    outer = up + down
    mid_y = (profile[0][0] + profile[-1][0]) / 2
    if rim_rgb is None:
        center = Vec3(0, mid_y, 0)
        vertices = [center] + outer
        colors = [flesh_rgb] * len(vertices)
        triangles = []
        m = len(outer)
        for i in range(m):
            triangles.extend((0, 1 + i, 1 + (i + 1) % m))
        return Mesh(vertices=vertices, colors=colors, triangles=triangles, mode="triangle")

    inner = [Vec3(r * rim, y, 0) for y, r in profile] + [
        Vec3(-r * rim, y, 0) for y, r in reversed(profile)
    ]
    center = Vec3(0, mid_y, 0)
    vertices = [center] + outer + inner
    colors = [flesh_rgb] + [rim_rgb] * len(outer) + [flesh_rgb] * len(inner)
    m = len(outer)
    triangles = []
    for i in range(m):
        triangles.extend((0, 1 + m + i, 1 + m + (i + 1) % m))
    for i in range(m):
        j = (i + 1) % m
        o_i, o_j = 1 + i, 1 + j
        n_i, n_j = 1 + m + i, 1 + m + j
        triangles.extend((o_i, n_i, o_j))
        triangles.extend((o_j, n_i, n_j))
    return Mesh(vertices=vertices, colors=colors, triangles=triangles, mode="triangle")


def _frame_at(path_fn, radius_fn, t, t_min, t_max):
    eps = 1e-4
    t0 = max(t - eps, t_min)
    t1 = min(t + eps, t_max)
    tangent = path_fn(t1) - path_fn(t0)
    if tangent.length() < 1e-9:
        tangent = Vec3(1, 0, 0)
    tangent = tangent.normalized()
    # Paths lie in the XY plane, so the frame is: tangent in XY, B = world Z,
    # N perpendicular to both in XY.
    binormal = Vec3(0, 0, 1)
    normal = Vec3(tangent.y * binormal.z, -tangent.x * binormal.z, 0)
    return path_fn(t), normal, binormal, radius_fn(t)


def build_tube(
    path_fn,
    radius_fn,
    skin_fn,
    path_segments=14,
    ring_points=12,
    t_start=0.0,
    t_end=1.0,
    th_start=0.0,
    th_end=2 * math.pi,
):
    
    vertices = []
    colors = []
    rings = []
    for i in range(path_segments):
        t = t_start + (t_end - t_start) * i / (path_segments - 1)
        center, normal, binormal, radius = _frame_at(path_fn, radius_fn, t, t_start, t_end)
        base = len(vertices)
        ring = []
        for j in range(ring_points):
            th = th_start + (th_end - th_start) * j / (ring_points - 1)
            offset = (normal * math.cos(th) + binormal * math.sin(th)) * radius
            vertices.append(center + offset)
            colors.append(skin_fn(t, th))
            ring.append(base + j)
        rings.append(ring)
    triangles = []
    for i in range(path_segments - 1):
        for j in range(ring_points - 1):
            a = rings[i][j]
            b = rings[i][j + 1]
            c = rings[i + 1][j]
            d = rings[i + 1][j + 1]
            triangles.extend((a, c, b, b, c, d))
    return Mesh(vertices=vertices, colors=colors, triangles=triangles, mode="triangle")


def tube_arc(path_fn, radius_fn, t, points, th_start=0.0, th_end=2 * math.pi,
             t_min=0.0, t_max=1.0):
    center, normal, binormal, radius = _frame_at(path_fn, radius_fn, t, t_min, t_max)
    return [
        center + (normal * math.cos(th) + binormal * math.sin(th)) * radius
        for th in (
            th_start + (th_end - th_start) * j / (points - 1)
            for j in range(points)
        )
    ]


def build_fan(points, rgb, center=None, wrap=True):
    
    if center is None:
        center = Vec3(
            sum(p.x for p in points) / len(points),
            sum(p.y for p in points) / len(points),
            sum(p.z for p in points) / len(points),
        )
    vertices = [center] + list(points)
    colors = [rgb] * len(vertices)
    triangles = []
    n = len(points)
    last = n if wrap else n - 1
    for i in range(last):
        triangles.extend((0, 1 + i, 1 + (i + 1) % n))
    return Mesh(vertices=vertices, colors=colors, triangles=triangles, mode="triangle")


def build_ribbon(path_fn, radius_fn, t_start, t_end, rgb, segments=14,
                 t_min=0.0, t_max=1.0):
    
    side_a = []
    side_b = []
    for i in range(segments):
        t = t_start + (t_end - t_start) * i / (segments - 1)
        center, normal, _binormal, radius = _frame_at(path_fn, radius_fn, t, t_min, t_max)
        side_a.append(center + normal * radius)
        side_b.append(center - normal * radius)
    vertices = side_a + side_b
    colors = [rgb] * len(vertices)
    triangles = []
    n = segments
    for i in range(n - 1):
        a_i = i
        a_j = i + 1
        b_i = n + i
        b_j = n + i + 1
        triangles.extend((a_i, b_i, a_j))
        triangles.extend((a_j, b_i, b_j))
    return Mesh(vertices=vertices, colors=colors, triangles=triangles, mode="triangle")
