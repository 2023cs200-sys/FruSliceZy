from math import radians, tan

from ursina import Entity, Vec3, camera, color, mouse, time

from config import config
from src.utils.helpers import clamp
from src.player.motion_mapper import MotionMapper


class Sword(Entity):
    def __init__(self):
        super().__init__(position=(0, 0, config.play_area.plane_z))
        Entity(
            parent=self,
            model="quad",
            scale=(0.14, 1.7),
            color=color.rgb32(225, 232, 245),
            position=(0, 0.9),
        )
        Entity(
            parent=self,
            model="quad",
            scale=(0.55, 0.12),
            color=color.rgb32(120, 85, 45),
            position=(0, 0.02),
        )
        Entity(
            parent=self,
            model="circle",
            scale=0.17,
            color=color.rgb32(205, 175, 70),
            position=(0, -0.28),
        )
        self.motion_mapper = MotionMapper()
        self.previous_tip_position = self.tip_position
        self.velocity = Vec3(0, 0, 0)

    @property
    def tip_position(self):
        return self.position + Vec3(0, 1.75, 0)

    @property
    def speed(self):
        return self.velocity.length()

    @property
    def is_slashing(self):
        return self.speed >= config.sword.slash_speed_threshold

    def update(self):
        self.motion_mapper.update(self)
        self.velocity = self.motion_mapper.get_velocity()
        self.previous_tip_position = self.motion_mapper.get_tip_position(self)
        self.rotation_z = clamp(-self.velocity.x * 1.2, -30, 30)

    @staticmethod
    def mouse_world_position():
        distance = abs(config.play_area.plane_z - camera.z)
        world_height = tan(radians(camera.fov / 2)) * distance * 2
        return Vec3(
            mouse.position.x * world_height,
            mouse.position.y * world_height,
            config.play_area.plane_z,
        )