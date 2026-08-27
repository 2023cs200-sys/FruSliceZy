from ursina import Vec3

from config import config


def _closest_point_on_segment(start, end, point):
    segment = end - start
    length_squared = segment.length_squared()
    if length_squared == 0:
        return start
    t = max(0.0, min(1.0, (point - start).dot(segment) / length_squared))
    return start + segment * t


def _hit(sword, fruit):
    reach = fruit.radius + config.sword.blade_radius
    swept = _closest_point_on_segment(
        sword.previous_tip_position, sword.tip_position, fruit.position
    )
    if (fruit.position - swept).length() <= reach:
        return True
    blade = _closest_point_on_segment(
        sword.position, sword.tip_position, fruit.position
    )
    return (fruit.position - blade).length() <= reach


def check_sword_hits(sword, fruits):
    if not sword.is_slashing:
        return []
    return [fruit for fruit in fruits if not fruit.cut and _hit(sword, fruit)]
