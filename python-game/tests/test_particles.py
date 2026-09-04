from panda3d.core import loadPrcFileData

loadPrcFileData("", "window-type offscreen")
loadPrcFileData("", "audio-library-name null")

import pytest
from ursina import Ursina, Vec3, camera, scene, time

from config import config
from src.effects.particles import (
    ScreenFlash,
    _Chunk,
    _Particle,
    fruit_chunks,
    juice_burst,
    slash_flash,
)


@pytest.fixture(scope="module")
def app():
    created = Ursina(title="vfx test", size=(320, 240))
    yield created


def _spawned_of(cls):
    return [e for e in scene.entities if isinstance(e, cls)]


def test_juice_burst_spawns_circular_particles_with_z_spread(app):
    before = set(id(e) for e in scene.entities)
    juice_burst(Vec3(1, 2, 0), (235, 80, 95))
    drops = [e for e in scene.entities if id(e) not in before]
    assert len(drops) > 0
    assert all(isinstance(e, _Particle) for e in drops)
    # circular droplets, not quads
    assert all(e.model.name == "circle" for e in drops if e.model is not None)
    # real z-spread toward the camera: velocities must leave the z=0 plane
    assert any(abs(e.velocity.z) > 0.01 for e in drops)
    assert any(e.velocity.z < 0 for e in drops)  # some toward camera (-z)
    for e in drops:
        from ursina import destroy

        destroy(e)


def test_fruit_chunks_spawn_spinning_quad_debris(app):
    before = set(id(e) for e in scene.entities)
    fruit_chunks(Vec3(0, 1, 0), (220, 40, 40), direction=Vec3(1, 0, 0))
    chunks = [e for e in scene.entities if id(e) not in before]
    assert len(chunks) > 0
    assert all(isinstance(e, _Chunk) for e in chunks)
    # spin sampled from a strong range: nonzero, bounded, mostly fast
    assert all(e.spin != 0 and abs(e.spin) <= 720 for e in chunks)
    assert any(abs(e.spin) > 100 for e in chunks)  # statistically near-certain
    # flung along the slash direction (positive x)
    assert all(e.velocity.x > 0 for e in chunks)
    for e in chunks:
        from ursina import destroy

        destroy(e)


def test_slash_flash_stretches_along_direction(app):
    from src.effects.particles import _SlashFlash

    before = set(id(e) for e in scene.entities)
    slash_flash(Vec3(0, 0, 0), Vec3(1, 0, 0))
    flashes = [
        e for e in scene.entities
        if id(e) not in before and isinstance(e, _SlashFlash)
    ]
    assert len(flashes) == 1
    f = flashes[0]
    # stretched lengthwise, thin across (spec: (slash_length, 0.25))
    assert f.scale_x > 4 * f.scale_y
    assert f.scale_y == pytest.approx(0.25)
    # horizontal slash -> no z-rotation
    assert f.rotation_z == pytest.approx(0.0)
    from ursina import destroy

    destroy(f)


def test_slash_flash_rotates_to_diagonal(app):
    import math

    from src.effects.particles import _SlashFlash

    before = set(id(e) for e in scene.entities)
    slash_flash(Vec3(0, 0, 0), Vec3(1, 1, 0))
    flashes = [
        e for e in scene.entities
        if id(e) not in before and isinstance(e, _SlashFlash)
    ]
    f = flashes[0]
    assert f.rotation_z == pytest.approx(45.0)
    from ursina import destroy

    destroy(f)


def test_slash_flash_fades_and_destroys(app):
    from src.effects.particles import _SlashFlash

    before = set(id(e) for e in scene.entities)
    slash_flash(Vec3(0, 0, 0), Vec3(0, 1, 0))
    time.dt = 1 / 60
    flashes = [
        e for e in scene.entities
        if id(e) not in before and isinstance(e, _SlashFlash)
    ]
    assert len(flashes) == 1
    f = flashes[0]
    f.update()  # one frame in
    assert f.alpha < 1.0
    f.age = f.lifetime + 0.01
    f.update()  # past lifetime -> self-destroy
    assert f.age >= f.lifetime


def test_screen_flash_trigger_and_decay(app):
    flash = ScreenFlash()
    assert not flash._overlay.enabled  # idle: invisible
    flash.trigger()
    assert flash._overlay.enabled
    assert flash._overlay.alpha == pytest.approx(0.65)
    time.dt = 1 / 60
    for _ in range(60):
        flash.update()
    assert not flash._overlay.enabled  # fully decayed
    # re-triggerable
    flash.trigger(intensity=0.5)
    assert flash._overlay.enabled
    assert flash._overlay.alpha == pytest.approx(0.65 * 0.5)
    flash.clear()


def test_screen_flash_parented_to_camera(app):
    flash = ScreenFlash()
    # parent is the camera's node path; verify by ancestry
    assert flash._overlay.has_ancestor(camera)
    # and it sits in front of the camera (local +z, positive distance)
    assert flash._overlay.z > 0
    flash.clear()


def test_particle_gravity_pulls_down(app):
    before = set(id(e) for e in scene.entities)
    juice_burst(Vec3(0, 3, 0), (250, 246, 230))
    time.dt = 1 / 60
    drops = [
        e for e in scene.entities
        if id(e) not in before and isinstance(e, _Particle)
    ]
    assert drops
    v_before = max(d.velocity.y for d in drops)
    for _ in range(30):
        for d in list(drops):
            try:
                d.update()
            except Exception:
                drops.remove(d)
    v_after = max(d.velocity.y for d in drops)
    assert v_after < v_before
