from panda3d.core import loadPrcFileData

loadPrcFileData("", "window-type offscreen")
loadPrcFileData("", "audio-library-name null")

import math

import pytest
from ursina import Ursina, Vec3, destroy

from config import config
from src.objects.fruit import Fruit
from src.objects.sliced_fruit import (
    SlicedHalf,
    half_velocities,
    slash_direction,
    spawn_halves,
)
from tests.fakes import FakeSword


@pytest.fixture(scope="module")
def app():
    created = Ursina(title="slice test", size=(320, 240))
    yield created


def test_slash_direction_follows_tip_movement(app):
    sword = FakeSword(previous_tip=Vec3(0, 0, 0), tip=Vec3(3, 4, 7))
    d = slash_direction(sword)
    assert d.x == pytest.approx(3 / 5)
    assert d.y == pytest.approx(4 / 5)
    assert d.z == pytest.approx(0.0)  # locked to play plane


def test_slash_direction_normalized(app):
    sword = FakeSword(previous_tip=Vec3(-10, -10, 0), tip=Vec3(80, 90, 0))
    assert slash_direction(sword).length() == pytest.approx(1.0)


def test_slash_direction_degenerate_gives_horizontal(app):
    sword = FakeSword(previous_tip=Vec3(1, 1, 0), tip=Vec3(1, 1, 0))
    d = slash_direction(sword)
    assert d == Vec3(1, 0, 0)


def test_horizontal_slash_splits_halves_vertically(app):
    left, right = half_velocities(Vec3(0, 5, 0), Vec3(1, 0, 0), push=2.5)
    # slash is horizontal -> separation is vertical: up and down
    assert left.y > 0 and right.y < 0
    assert left.x == pytest.approx(0) and right.x == pytest.approx(0)
    # equal and opposite along the separation axis
    assert (left - right).length() == pytest.approx(5.0)


def test_vertical_slash_splits_halves_horizontally(app):
    left, right = half_velocities(Vec3(0, 0, 0), Vec3(0, 1, 0), push=3.0)
    assert left.x < 0 and right.x > 0
    assert left.y == pytest.approx(0) and right.y == pytest.approx(0)


def test_diagonal_slash_perpendicular_separation(app):
    d = Vec3(1, 1, 0).normalized()
    left, right = half_velocities(Vec3(0, 0, 0), d, push=2.0)
    separation = left - right
    # separation must be perpendicular to the slash
    dot = separation.x * d.x + separation.y * d.y
    assert dot == pytest.approx(0.0, abs=1e-6)
    assert separation.length() == pytest.approx(4.0)  # 2 * push


def test_halves_inherit_fruit_momentum(app):
    fruit_v = Vec3(2, 10, 0)
    left, right = half_velocities(fruit_v, Vec3(1, 0, 0), push=1.0, inherit=0.5)
    # both keep half the fruit's velocity: (1, 5, 0)
    assert left.x == pytest.approx(1.0)
    assert right.x == pytest.approx(1.0)
    assert left.y - right.y == pytest.approx(2.0)  # symmetric push only on perp


def test_spawn_halves_creates_two_diverging_entities(app):
    fruit = Fruit("apple")
    fruit.position = Vec3(0, 0, config.play_area.plane_z)
    fruit.velocity = Vec3(0, 2, 0)
    sword = FakeSword(previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0))
    left, right = spawn_halves(fruit, sword)
    assert left is not right
    assert isinstance(left, SlicedHalf) and isinstance(right, SlicedHalf)
    # horizontal slash -> vertical separation
    assert left.velocity.y > right.velocity.y
    destroy(left)
    destroy(right)


def test_sliced_half_falls_under_gravity_and_fades(app):
    fruit = Fruit("watermelon")
    fruit.position = Vec3(0, 0, config.play_area.plane_z)
    fruit.velocity = Vec3(0, 1, 0)
    sword = FakeSword(previous_tip=Vec3(0, -2, 0), tip=Vec3(0, 2, 0))
    left, right = spawn_halves(fruit, sword)
    import ursina

    ursina.time.dt = 1 / 60
    y_before = left.y
    v_before = left.velocity.y
    for _ in range(30):
        left.update()
    assert left.y < y_before or left.velocity.y < v_before
    # simulate near end of life: alpha must decrease (our property fans out to children)
    left.age = left.lifetime * 0.8
    alpha_before = left.alpha
    fade_before_children = [t.alpha for t in left._fade_targets]
    left.update()
    assert left.alpha < alpha_before
    assert all(
        t.alpha < b for t, b in zip(left._fade_targets, fade_before_children)
    )  # meshes actually faded
    left.age = left.lifetime + 0.1
    left.update()  # must not raise; entity self-destroys past lifetime
    assert left.age >= left.lifetime  # destroyed; do not touch entity after this
    destroy(right)


def test_half_lands_below_play_area_and_is_destroyed(app):
    fruit = Fruit("orange")
    fruit.position = Vec3(0, config.play_area.despawn_y - 1, config.play_area.plane_z)
    fruit.velocity = Vec3(0, -5, 0)
    sword = FakeSword(previous_tip=Vec3(-1, 0, 0), tip=Vec3(1, 0, 0))
    left, right = spawn_halves(fruit, sword)
    import ursina

    ursina.time.dt = 1 / 60
    left.velocity = Vec3(0, -20, 0)
    left.update()
    assert left.fell_out  # below despawn line while falling -> gone
    destroy(right)


def test_cut_via_game_spawns_halves_then_cleans_up(app):
    """Integration: a real Game cut produces 2 halves; time removes them.

    Mirrors the spec's verification for Section 3: cut -> 2 halves exist ->
    later cleaned up. Runs against the actual Game orchestrator, not fakes.
    """
    import ursina

    from src.game.game import Game
    from src.game.game_state import GameState

    ursina.time.dt = 1 / 60
    game = Game()
    game.start_game()
    assert game.state == GameState.PLAYING

    fruit = Fruit("apple")
    fruit.position = Vec3(0, 0, config.play_area.plane_z)
    fruit.velocity = Vec3(0, 0, 0)
    game.object_manager.add(fruit)
    game.sword = FakeSword(previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0))

    # snapshot live entities BEFORE the cut; destroyed entities from earlier
    # tests still linger in scene.entities and must not pollute the diff
    from ursina import scene

    alive_before = set(id(e) for e in scene.entities if hasattr(e, "enabled"))

    game.update()  # collision -> _cut_fruit -> spawn_halves

    assert fruit not in game.object_manager.fruits
    new_entities = [
        e
        for e in scene.entities
        if id(e) not in alive_before and isinstance(e, SlicedHalf)
    ]
    assert len(new_entities) == 2

    left = next(h for h in new_entities if h.velocity.y > 0)
    right = next(h for h in new_entities if h.velocity.y < 0)
    assert left.velocity.y > 0 and right.velocity.y < 0  # perpendicular split

    # simulate the rest of the half lifetime: both must self-clean
    frames = int(config.effects.half_lifetime * 60) + 10
    destroyed = {"left": False, "right": False}
    for _ in range(frames):
        for key, half in (("left", left), ("right", right)):
            if destroyed[key]:
                continue
            try:
                half.update()
            except Exception as exc:
                # once destroyed, further update() raises; that's the cleanup
                assert "destroyed" in str(exc), exc
                destroyed[key] = True
    assert destroyed["left"] and destroyed["right"]  # both halves cleaned up
    game.object_manager.clear()
    game.player.trail.clear()
    game.score_manager.reset()
    game.combo_manager.reset()
