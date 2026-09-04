from panda3d.core import loadPrcFileData

loadPrcFileData("", "window-type offscreen")
loadPrcFileData("", "audio-library-name null")

import pytest
from ursina import Ursina, Vec3, destroy, time

from config import config
from src.player.slash import SlashTrail
from src.player.sword import Sword
from tests.fakes import FakeSword


@pytest.fixture(scope="module")
def app():
    created = Ursina(title="sword trail test", size=(320, 240))
    yield created


def test_sword_tip_position_unchanged(app):
    """The collision contract: tip = position + (0, 1.75, 0)."""
    sword = Sword()
    sword.position = Vec3(1, 2, config.play_area.plane_z)
    assert sword.tip_position == Vec3(1, 3.75, config.play_area.plane_z)
    destroy(sword)


def test_sword_is_3d_now(app):
    """Sword must have volumetric parts, not just flat quads."""
    from ursina import Mesh

    sword = Sword()
    cubes = 0
    procedural_meshes = 0
    for c in sword.children:
        if c.model is None:
            continue
        if isinstance(c.model, Mesh):
            procedural_meshes += 1  # Cone tip, Cylinder grip/pommel
        elif getattr(c.model, "name", None) == "cube":
            cubes += 1
    # boxes (blade, edges, guard, bands) + cone/cylinder meshes
    assert cubes >= 5
    assert procedural_meshes >= 3
    destroy(sword)


def test_sword_blade_reaches_tip_height(app):
    """Blade must visually reach tip_position, or cuts won't look right."""
    sword = Sword()
    highest_y = max(c.y + c.scale_y / 2 for c in sword.children)
    assert highest_y == pytest.approx(1.75, abs=0.05)
    destroy(sword)


def test_sword_slash_threshold_unchanged(app):
    sword = Sword()
    sword.velocity = Vec3(
        config.sword.slash_speed_threshold, 0, 0
    )
    assert sword.is_slashing
    sword.velocity = Vec3(config.sword.slash_speed_threshold - 1, 0, 0)
    assert not sword.is_slashing
    destroy(sword)


def test_trail_spawns_layered_glow_and_core(app):
    trail = SlashTrail()
    sword = FakeSword(
        previous_tip=Vec3(0, 0, 0), tip=Vec3(1.5, 0, 0), is_slashing=True
    )
    sword.speed = 30
    time.dt = 1 / 60
    trail.update(sword)  # first call only records last_point
    assert trail.segments == []
    sword2 = FakeSword(
        previous_tip=Vec3(1.5, 0, 0), tip=Vec3(3.0, 0, 0), is_slashing=True
    )
    sword2.speed = 30
    trail.update(sword2)  # second call spawns the segment
    assert len(trail.segments) == 1
    seg = trail.segments[0]
    assert seg["glow"].scale_y > seg["core"].scale_y  # glow wider than core
    assert seg["core"].scale_x == pytest.approx(1.5)  # segment length
    # core sits slightly in front of glow (toward camera)
    assert seg["core"].z < seg["glow"].z
    trail.clear()


def test_trail_width_scales_with_speed(app):
    trail = SlashTrail()
    slow = FakeSword(
        previous_tip=Vec3(0, 0, 0), tip=Vec3(1, 0, 0), is_slashing=True
    )
    slow.speed = 5
    fast = FakeSword(
        previous_tip=Vec3(0, 0, 0), tip=Vec3(1, 0, 0), is_slashing=True
    )
    fast.speed = 40

    trail._spawn_segment(Vec3(0, 0, 0), Vec3(1, 0, 0), speed=slow.speed)
    trail._spawn_segment(Vec3(1, 0, 0), Vec3(2, 0, 0), speed=fast.speed)
    slow_width = trail.segments[0]["width"]
    fast_width = trail.segments[1]["width"]
    assert fast_width > slow_width * 1.5  # clearly thicker
    trail.clear()


def test_trail_tapers_as_segments_age(app):
    trail = SlashTrail()
    trail._spawn_segment(Vec3(0, 0, 0), Vec3(1, 0, 0), speed=40)
    time.dt = config.sword.trail_lifetime * 0.8
    width_before = trail.segments[0]["glow"].scale_y
    trail._decay()
    width_after = trail.segments[0]["glow"].scale_y
    assert width_after < width_before  # aging shrinks the trail
    trail.clear()


def test_trail_no_segments_when_not_slashing(app):
    trail = SlashTrail()
    sword = FakeSword(
        previous_tip=Vec3(0, 0, 0), tip=Vec3(3, 3, 0), is_slashing=False
    )
    time.dt = 1 / 60
    trail.update(sword)
    assert trail.segments == []
    trail.clear()


def test_trail_clear_destroys_all(app):
    trail = SlashTrail()
    trail._spawn_segment(Vec3(0, 0, 0), Vec3(1, 0, 0), speed=30)
    trail._spawn_segment(Vec3(1, 0, 0), Vec3(2, 0, 0), speed=30)
    assert len(trail.segments) == 2
    trail.clear()
    assert trail.segments == []
    assert trail.last_point is None
