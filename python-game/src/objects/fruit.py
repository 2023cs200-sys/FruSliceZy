import random

from ursina import Entity, Vec3, color, time

from config import config
from src.utils.constants import FRUIT_TYPES
from src.utils.helpers import random_range


class Fruit(Entity):
    def __init__(self, fruit_type):
        info = FRUIT_TYPES[fruit_type]
        shape_scale = info.get("shape_scale", (1, 1, 1))
        super().__init__(
            model="sphere",
            color=color.rgb32(*info["color"]),
            scale=(
                info["scale"] * shape_scale[0],
                info["scale"] * shape_scale[1],
                info["scale"] * shape_scale[2],
            ),
        )
        play_area = config.play_area
        self.fruit_type = fruit_type
        self.points = info["points"]
        self.radius = info["scale"] * 0.55
        self.cut = False
        self.fell_out = False
        self.position = Vec3(
            random_range(play_area.min_x + 2, play_area.max_x - 2),
            play_area.spawn_y,
            play_area.plane_z,
        )
        self.velocity = Vec3(
            random_range(
                -config.physics.horizontal_drift_max,
                config.physics.horizontal_drift_max,
            ),
            random_range(
                config.physics.launch_speed_min,
                config.physics.launch_speed_max,
            ),
            0,
        )
        self.spin = random.uniform(-120, 120)

    def update(self):
        if self.cut:
            return
        self.velocity += Vec3(0, -config.physics.gravity * time.dt, 0)
        self.position += self.velocity * time.dt
        self.rotation_x += self.spin * time.dt
        self.rotation_y += self.spin * 0.6 * time.dt
        if self.y < config.play_area.despawn_y and self.velocity.y < 0:
            self.fell_out = True
