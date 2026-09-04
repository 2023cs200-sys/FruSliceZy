from math import atan2, degrees

from ursina import Entity, Vec3, color, destroy, time

from config import config

_GLOW_COLOR = (120, 180, 255)
_CORE_COLOR = (255, 255, 255)
_GLOW_WIDTH = 0.32
_CORE_WIDTH = 0.075
_MAX_SPEED_REF = 40.0  # speed that maps to full trail width
_TAPER_FLOOR = 0.35   # oldest segments keep this fraction of their width


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
            self._spawn_segment(self.last_point, point, sword.speed)
        self.last_point = point
        self._decay()

    def _spawn_segment(self, start, end, speed=0.0):
        length = self._distance_2d(start, end)
        angle = degrees(atan2(end.y - start.y, end.x - start.x))
        # faster swipes make a thicker trail (clamped to reference speed)
        speed_factor = min(speed / _MAX_SPEED_REF, 1.0)
        glow_width = _GLOW_WIDTH * (0.35 + 0.65 * speed_factor)
        core_width = _CORE_WIDTH * (0.35 + 0.65 * speed_factor)
        mid = Vec3(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2,
            config.play_area.plane_z - 0.2,
        )
        glow = Entity(
            model="quad",
            scale=(length, glow_width),
            color=color.rgba32(*_GLOW_COLOR, 90),
            position=mid,
            rotation_z=angle,
            double_sided=True,
        )
        core = Entity(
            model="quad",
            scale=(length, core_width),
            color=color.rgba32(*_CORE_COLOR, 230),
            position=mid + Vec3(0, 0, -0.05),
            rotation_z=angle,
            double_sided=True,
        )
        self.segments.append(
            {
                "glow": glow,
                "core": core,
                "age": 0.0,
                "width": glow_width,
                "core_width": core_width,
            }
        )
        while len(self.segments) > config.sword.trail_max_segments:
            oldest = self.segments.pop(0)
            destroy(oldest["glow"])
            destroy(oldest["core"])

    def _decay(self):
        remaining = []
        lifetime = config.sword.trail_lifetime
        for segment in self.segments:
            segment["age"] += time.dt
            if segment["age"] >= lifetime:
                destroy(segment["glow"])
                destroy(segment["core"])
                continue
            fade = 1 - segment["age"] / lifetime
            segment["glow"].alpha = fade
            segment["core"].alpha = fade
            # taper: oldest segments shrink toward the floor width
            taper = _TAPER_FLOOR + (1 - _TAPER_FLOOR) * fade
            segment["glow"].scale_y = segment["width"] * taper
            segment["core"].scale_y = segment["core_width"] * taper
            remaining.append(segment)
        self.segments = remaining

    def clear(self):
        for segment in self.segments:
            destroy(segment["glow"])
            destroy(segment["core"])
        self.segments = []
        self.last_point = None
