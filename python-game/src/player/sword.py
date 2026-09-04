from math import cos, radians, sin, tan

from ursina import Entity, Vec3, camera, color, mouse, time
from ursina.models.procedural.cone import Cone
from ursina.models.procedural.cylinder import Cylinder

from config import config
from src.utils.helpers import clamp
from src.player.motion_mapper import MotionMapper

# blade spans local y in [0.05, 1.75] so tip_position (y+1.75) matches the
# visible tip of the blade exactly — collision uses tip_position
_BLADE_LEN = 1.70
_BLADE_Y0 = 0.05
_TIP_Y = 1.75


class Sword(Entity):
    def __init__(self):
        super().__init__(position=(0, 0, config.play_area.plane_z))

        # ---- blade: flat steel box with a bright edge and cone tip ----
        self._blade = Entity(
            parent=self,
            model="cube",
            scale=(0.045, _BLADE_LEN, 0.011),
            position=(0, _BLADE_Y0 + _BLADE_LEN / 2, 0),
            color=color.rgb32(212, 222, 238),
        )
        Entity(  # bright cutting edge on +x side of the blade
            parent=self,
            model="cube",
            scale=(0.012, _BLADE_LEN * 0.97, 0.013),
            position=(0.028, _BLADE_Y0 + _BLADE_LEN / 2, 0),
            color=color.rgb32(245, 250, 255),
        )
        Entity(  # mirrored dark back-edge for depth
            parent=self,
            model="cube",
            scale=(0.010, _BLADE_LEN * 0.97, 0.013),
            position=(-0.028, _BLADE_Y0 + _BLADE_LEN / 2, 0),
            color=color.rgb32(150, 160, 180),
        )
        Entity(  # cone tip: apex lands exactly at the collision tip (1.75);
            parent=self,   # Cone is center-origin, so center at 1.70
            model=Cone(),
            scale=(0.045, 0.10, 0.011),
            position=(0, _TIP_Y - 0.05, 0),
            color=color.rgb32(235, 242, 252),
        )

        # ---- guard: 4 boxes forming a ring (tsuba-style cross guard) ----
        for i in range(4):
            ang = i * 90
            Entity(
                parent=self,
                model="cube",
                scale=(0.16, 0.035, 0.03),
                position=(0.09 * cos(radians(ang)), 0.02, 0.09 * sin(radians(ang))),
                rotation_y=-ang,
                color=color.rgb32(190, 150, 55),
            )

        # ---- grip: cylinder with wrapped-band texture rings ----
        Entity(
            parent=self,
            model=Cylinder(),
            scale=(0.032, 0.34, 0.032),
            position=(0, -0.17, 0),
            color=color.rgb32(70, 45, 28),
        )
        for i in range(4):  # gold wrap bands along the grip
            Entity(
                parent=self,
                model="cube",
                scale=(0.036, 0.012, 0.036),
                position=(0, -0.05 - i * 0.09, 0),
                color=color.rgb32(205, 170, 75),
            )
        Entity(  # pommel disc
            parent=self,
            model=Cylinder(),
            scale=(0.045, 0.03, 0.045),
            position=(0, -0.35, 0),
            color=color.rgb32(205, 175, 70),
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
