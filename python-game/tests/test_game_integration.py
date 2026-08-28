from panda3d.core import loadPrcFileData

loadPrcFileData("", "window-type offscreen")
loadPrcFileData("", "audio-library-name null")

import time as ursina_time

import pytest
from ursina import Ursina, Vec3, application

from config import config
from src.game.game_state import GameState
from src.objects.fruit import Fruit
from tests.fakes import FakeSword

FRAME = 1 / 60


@pytest.fixture(scope="module")
def app():
    created = Ursina(title="test", size=(320, 240))
    yield created


@pytest.fixture()
def game(app):
    from src.game.game import Game

    ursina_time.dt = FRAME
    created = Game()
    yield created
    created.object_manager.clear()
    created.trail.clear()


def test_start_game_enters_playing_state(game):
    game.start_game()
    assert game.state == GameState.PLAYING
    assert game.time_left == config.round.duration


def test_spawner_creates_fruits_over_time(game):
    game.start_game()
    for _ in range(120):
        game.spawner.update(FRAME)
    assert len(game.object_manager.fruits) > 0


def test_fruit_rises_then_falls_out_and_is_cleaned_up(game):
    game.start_game()
    fruit = Fruit("apple")
    fruit.velocity = Vec3(0, 22, 0)
    game.object_manager.add(fruit)
    start_y = fruit.y
    for _ in range(20):
        fruit.update()
    assert fruit.y > start_y
    for _ in range(600):
        fruit.update()
    assert fruit.fell_out
    game.object_manager.update()
    assert fruit not in game.object_manager.fruits


def test_cutting_fruit_awards_score_and_removes_it(game):
    game.start_game()
    fruit = Fruit("apple")
    fruit.position = Vec3(0, 0, config.play_area.plane_z)
    fruit.velocity = Vec3(0, 0, 0)
    game.object_manager.add(fruit)
    game.sword = FakeSword(previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0))
    game.update()
    assert game.score_manager.score == 10
    assert game.score_manager.fruits_cut == 1
    assert fruit not in game.object_manager.fruits


def test_three_fast_cuts_build_combo_score(game):
    game.start_game()
    for _ in range(3):
        fruit = Fruit("apple")
        fruit.position = Vec3(0, 0, config.play_area.plane_z)
        fruit.velocity = Vec3(0, 0, 0)
        game.object_manager.add(fruit)
        game.sword = FakeSword(previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0))
        game.update()
    assert game.combo_manager.best_combo == 3
    assert game.score_manager.score == 10 + 11 + 12


def test_round_ends_after_duration(game):
    game.start_game()
    frames = int(config.round.duration / FRAME) + 30
    for _ in range(frames):
        game.update()
    assert game.state == GameState.GAME_OVER
