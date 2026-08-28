from ursina import Vec3

from config import config
from src.collision.collision_detector import check_sword_hits
from tests.fakes import FakeFruit, FakeSword


def test_horizontal_sweep_hits_fruit_on_path():
    sword = FakeSword(previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0))
    fruit = FakeFruit(position=Vec3(0, 0, 0))
    assert check_sword_hits(sword, [fruit]) == [fruit]


def test_sweep_misses_fruit_far_from_path():
    sword = FakeSword(previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0))
    fruit = FakeFruit(position=Vec3(0, 3, 0))
    assert check_sword_hits(sword, [fruit]) == []


def test_slow_movement_never_cuts():
    sword = FakeSword(
        previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0), is_slashing=False
    )
    fruit = FakeFruit(position=Vec3(0, 0, 0))
    assert check_sword_hits(sword, [fruit]) == []


def test_already_cut_fruit_not_hit_again():
    sword = FakeSword(previous_tip=Vec3(-2, 0, 0), tip=Vec3(2, 0, 0))
    fruit = FakeFruit(position=Vec3(0, 0, 0))
    fruit.cut = True
    assert check_sword_hits(sword, [fruit]) == []


def test_touch_hit_near_sword_body():
    reach = config.sword.blade_radius
    sword = FakeSword(previous_tip=Vec3(0, 1.75, 0), tip=Vec3(0, 1.75, 0))
    fruit = FakeFruit(position=Vec3(reach * 0.5, 0, 0))
    assert check_sword_hits(sword, [fruit]) == [fruit]
