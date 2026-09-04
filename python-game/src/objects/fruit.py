import random
from pathlib import Path

from ursina import Entity, Vec3, color, time

from config import config
from src.objects.fruit_meshes import FRUIT_GEO
from src.utils.constants import FRUIT_TYPES
from src.utils.helpers import random_range


def _resolve_model(info):
    model_path = info.get("model")
    if model_path and Path(model_path).exists():
        return Path(model_path).with_suffix("").as_posix()
    return None


def _mesh_extent(inner):
    """Largest world-space dimension of a procedural builder's geometry."""
    bounds = inner.bounds
    if bounds is None:
        return None
    size = bounds.size
    extent = max(size.x, size.y, size.z)
    return extent if extent > 0.001 else None


class Fruit(Entity):
    def __init__(self, fruit_type):
        info = FRUIT_TYPES[fruit_type]
        builder = FRUIT_GEO.get(fruit_type, (None, None))[0] if info.get("builtin") else None
        model = _resolve_model(info)
        if model:
            # Route A: real asset file on disk wins over procedural geometry
            size = info.get("model_scale", info["scale"])
            super().__init__()
            inner = Entity(parent=self, model=model, scale=size)
            if inner.find_all_textures().get_num_textures() == 0:
                inner.color = color.rgb32(*info["color"])
            bounds = inner.bounds
            if bounds is not None:
                inner.position = Vec3(
                    -bounds.center.x * size,
                    -bounds.center.y * size,
                    -bounds.center.z * size,
                )
                max_dim = max(bounds.size.x, bounds.size.y, bounds.size.z)
            else:
                max_dim = size
        elif builder:
            # Route B: procedural whole-fruit builder
            size = info.get("model_scale", info["scale"])
            super().__init__()
            inner = builder()
            inner.parent = self
            inner.scale = size
            max_dim = _mesh_extent(inner) or size
        else:
            shape_scale = info.get("shape_scale", (1, 1, 1))
            size = info["scale"]
            super().__init__(
                model="sphere",
                color=color.rgb32(*info["color"]),
                scale=(
                    size * shape_scale[0],
                    size * shape_scale[1],
                    size * shape_scale[2],
                ),
            )
            max_dim = size * max(shape_scale)
        play_area = config.play_area
        self.fruit_type = fruit_type
        self.points = info["points"]
        self.radius = max_dim * 0.55
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
