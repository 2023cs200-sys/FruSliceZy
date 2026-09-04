from src.utils.vector import Vector2
from math import radians, tan



from config import config
from src.utils.helpers import clamp


class MotionMapper:
    def __init__(self):
        self.previous_tip_position = None
        self.velocity = Vector2(0, 0, 0)

    def map_mouse_to_world(self):
        if mouse.position is None:
            return None
        distance = abs(config.play_area.plane_z - camera.z)
        world_height = tan(radians(config.camera.fov / 2)) * distance * 2
        return Vector2(
            mouse.position.x * world_height,
            mouse.position.y * world_height,
            config.play_area.plane_z,
        )

    def update(self, entity):
        target = self.map_mouse_to_world()
        if target is None:
            return
        x = clamp(target.x, config.play_area.min_x, config.play_area.max_x)
        y = clamp(target.y, config.play_area.min_y, config.play_area.max_y)
        entity.position = Vector2(x, y, config.play_area.plane_z)
        if self.previous_tip_position is not None and time.dt > 0:
            self.velocity = (entity.tip_position - self.previous_tip_position) / time.dt
        self.previous_tip_position = entity.tip_position

    def get_tip_position(self, entity):
        return entity.tip_position

    def get_velocity(self):
        return self.velocity