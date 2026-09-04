from panda3d.core import loadPrcFileData

loadPrcFileData("", "window-type offscreen")
loadPrcFileData("", "audio-library-name null")

import math

import pytest
from ursina import Ursina

from src.objects.fruit import Fruit
from src.objects.fruit_geometry import build_cap, build_lathe, build_ribbon, build_tube
from src.objects.fruit_meshes import FRUIT_GEO
from src.utils.constants import FRUIT_TYPES


@pytest.fixture(scope="module")
def app():
    created = Ursina(title="fruit geo test", size=(320, 240))
    yield created


ALL_FRUITS = sorted(FRUIT_TYPES.keys())


@pytest.mark.parametrize("name", ALL_FRUITS)
def test_whole_builder_produces_geometry(app, name):
    whole, _half = FRUIT_GEO[name]
    root = whole()
    assert root is not None
    assert len(root.children) >= 1
    assert root.children[0].model is not None


@pytest.mark.parametrize("name", ALL_FRUITS)
@pytest.mark.parametrize("side", [+1, -1])
def test_half_builder_produces_geometry(app, name, side):
    _whole, half = FRUIT_GEO[name]
    root = half(side)
    assert root is not None
    assert root.children[0].model is not None


@pytest.mark.parametrize("name", ALL_FRUITS)
def test_half_has_flat_cut_face_in_screen_plane(app, name):
    """The defining feature of a half: a flat cap facing the camera (z=0)."""
    _whole, half = FRUIT_GEO[name]
    root = half(+1)
    cap = None
    for child in root.children:
        if hasattr(child.model, "vertices") and child.model.vertices:
            if all(abs(v.z) < 1e-9 for v in child.model.vertices):
                cap = child
                break
    assert cap is not None
    assert len(cap.model.vertices) >= 4  # a face, not a line
    assert len(cap.model.triangles) >= 3


@pytest.mark.parametrize("name", ALL_FRUITS)
def test_fruit_entity_uses_builder_and_sets_radius(app, name):
    fruit = Fruit(name)
    assert fruit.points == FRUIT_TYPES[name]["points"]
    assert 0.05 < fruit.radius < 3.0
    assert not fruit.cut
    assert not fruit.fell_out


def test_lathe_half_sweep_spans_half_circle(app):
    mesh = build_lathe(
        [(0.0, 0.0), (1.0, 1.0)],
        lambda y, phi: __import__("ursina").color.rgb32(255, 0, 0),
        longitudes=5,
        phi_start=0.0,
        phi_end=math.pi,
    )
    xs = [v.x for v in mesh.vertices]
    assert len(mesh.vertices) == 10
    # half sweep over [0, pi]: sin(phi) >= 0, so every z >= 0
    assert sum(1 for z in (v.z for v in mesh.vertices) if z < -1e-9) == 0
    assert sum(1 for z in (v.z for v in mesh.vertices) if z > 1e-9) > 0


def test_cap_lies_in_screen_plane(app):
    profile = [(0.0, 0.5), (0.5, 0.4), (1.0, 0.0)]
    from ursina import color

    mesh = build_cap(profile, color.rgb32(255, 255, 255))
    for vertex in mesh.vertices:
        assert vertex.z == 0.0


def test_cap_with_rim_has_flesh_center(app):
    profile = [(0.0, 0.5), (0.5, 0.4), (1.0, 0.0)]
    from ursina import color

    mesh = build_cap(profile, color.rgb32(10, 10, 10), rim_rgb=color.rgb32(200, 200, 200), rim=0.8)
    assert len(mesh.vertices) > 3
    center = mesh.vertices[0]
    assert center.x == 0.0


def test_tube_half_sweep_covers_half_ring(app):
    from ursina import Vec3

    mesh = build_tube(
        lambda t: Vec3(t, 0, 0),
        lambda t: 0.5,
        lambda t, th: __import__("ursina").color.rgb32(0, 255, 0),
        path_segments=4,
        ring_points=5,
        th_start=math.pi,
        th_end=2 * math.pi,
    )
    zs = [v.z for v in mesh.vertices]
    # all vertices at or beyond the boundary plane (z <= 0), toward camera
    assert sum(1 for z in zs if z > 1e-9) == 0
    assert sum(1 for z in zs if z < -1e-9) > 0  # and some strictly inside


def test_ribbon_lies_in_screen_plane(app):
    from ursina import Vec3, color

    mesh = build_ribbon(
        lambda t: Vec3(t, math.sin(t), 0),
        lambda t: 0.3,
        0.0,
        1.0,
        color.rgb32(255, 255, 255),
        segments=6,
    )
    for vertex in mesh.vertices:
        assert vertex.z == 0.0
    assert len(mesh.vertices) == 12
