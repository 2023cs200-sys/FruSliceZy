from math import atan2, degrees

from ursina import Entity, Vec3, color, destroy, time

from config import config


class SlashTrail:
    def __init__(self):
        self.segments = []
        self.last_point = None

    @staticmethod
    def _distance_2d(a, b):
        return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5

    def update(self, sword):
        if not sword.is_slashing:
            self.last_point = sword.tip_position
            self._decay()
            return
        point = sword.tip_position
        if (
            self.last_point is not None
            and self._distance_2d(point, self.last_point) >= 0.1
        ):
            self._spawn_segment(self.last_point, point)
        self.last_point = point
        self._decay()

    def _spawn_segment(self, start, end):
        length = self._distance_2d(start, end)
        angle = degrees(atan2(end.y - start.y, end.x - start.x))
        segment = Entity(
            model="quad",
            scale=(length, 0.09),
            color=color.rgba32(170, 215, 255, 255),
            position=Vec3(
                (start.x + end.x) / 2,
                (start.y + end.y) / 2,
                config.play_area.plane_z - 0.2,
            ),
            rotation_z=angle,
            double_sided=True,
        )
        self.segments.append({"entity": segment, "age": 0.0})
        while len(self.segments) > config.sword.trail_max_segments:
            oldest = self.segments.pop(0)
            destroy(oldest["entity"])

    def _decay(self):
        remaining = []
        for segment in self.segments:
            segment["age"] += time.dt
            if segment["age"] >= config.sword.trail_lifetime:
                destroy(segment["entity"])
                continue
            fade = 1 - segment["age"] / config.sword.trail_lifetime
            segment["entity"].alpha = fade
            remaining.append(segment)
        self.segments = remaining

    def clear(self):
        for segment in self.segments:
            destroy(segment["entity"])
        self.segments = []
        self.last_point = None
