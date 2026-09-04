from src.utils.vector import Vector2
"""The slicing engine: turn one whole fruit into two animated halves.

Physics contract (documented for Section 3):

- slash_direction(sword): unit vector in the XY play plane along the tip's
  frame-to-frame movement. The sweep already caught the hit, so this IS the
  direction the blade moved through the fruit.
- half_velocities(...): fruit's momentum is inherited (scaled), and the two
  halves get equal-and-opposite pushes along `perp` — 90 degrees rotated from
  the slash. If you slash horizontally ->, the halves separate vertically
  (one up, one down), exactly like Fruit Ninja.
- SlicedHalf: self-managing Entity (gravity, spin, fade, destroy). It is NOT
  tracked by ObjectManager, exactly like _Particle — no manager changes, no
  interference with the sword-vs-fruit collision loop.
"""

import math
import random



from config import config
from src.objects.fruit_meshes import FRUIT_GEO
from src.utils.constants import FRUIT_TYPES
from src.utils.helpers import random_range

_FALLBACK_HALF_SCALE = 0.5


def slash_direction(sword):
    """Direction the sword tip moved through the fruit, in the XY plane."""
    d = sword.tip_position - sword.previous_tip_position
    d = Vector2(d.x, d.y, 0)
    if d.length() > 0.001:
        return d.normalized()
    return Vector2(1, 0, 0)


def half_velocities(fruit_velocity, slash_dir, push, inherit=0.4):
    """Velocities for (left, right) halves relative to the slash direction.

    push      : how hard the halves fly apart (config.effects.half_push)
    inherit   : fraction of the fruit's momentum kept (0..1)
    """
    perp = Vector2(-slash_dir.y, slash_dir.x, 0)
    base = fruit_velocity * inherit
    return base + perp * push, base - perp * push


class SlicedHalf:
    """One half of a cut fruit: flies apart, spins, falls, fades, destroys."""

    def __init__(
        self,
        fruit,
        side,
        velocity,
        slash_dir,
        lifetime=None,
        model_scale=None,
    ):
        super().__init__(position=fruit.position, rotation=fruit.rotation)

        info = FRUIT_TYPES[fruit.fruit_type]
        _whole, half_builder = FRUIT_GEO.get(fruit.fruit_type, (None, None))
        self._fade_targets = []
        if half_builder:
            inner = half_builder(side)
            inner.parent = self
            inner.scale = model_scale or info.get("model_scale", info["scale"])
            # Ursina cuts color-scale inheritance (setColorScaleOff), so the
            # wrapper's alpha never reaches the meshes: fade must target each.
            self._fade_targets = [inner] + list(inner.children)
        else:  # geometry registry missed: neutral sphere stub, never crash
            super_scale = info.get("scale", 0.5)
            self.model = "sphere"
            self.color = color.rgb32(*info["color"])
            self.scale = super_scale * 0.8
            self._fade_targets = [self]

        # Cut plane is x=0 in the half's local space. Rotate around Z so the
        # separation axis (local +/-X) aligns with `perp` = 90deg off the slash.
        perp = Vector2(-slash_dir.y, slash_dir.x, 0)
        self.rotation_z = math.degrees(math.atan2(perp.y, perp.x))

        self.velocity = velocity
        self.spin = random_range(-260, 260)
        self.lifetime = lifetime or config.effects.half_lifetime
        self.age = 0.0
        self.fell_out = False
        self._alpha = 1.0

    @property
    def alpha(self):
        return self._alpha

    @alpha.setter
    def alpha(self, value):
        self._alpha = value
        for target in self._fade_targets:
            target.alpha = value

    def update(self):
        dt = time.dt
        self.age += dt
        if self.age >= self.lifetime:
            destroy(self)
            return
        self.velocity += Vector2(0, -config.physics.gravity * dt, 0)
        self.position += self.velocity * dt
        self.rotation_z += self.spin * dt * 0.3
        self.rotation_x += self.spin * dt * 0.6
        if self.y < config.play_area.despawn_y and self.velocity.y < 0:
            self.fell_out = True
            destroy(self)
            return
        # fade out over the last 35% of the lifetime
        fade_start = self.lifetime * 0.65
        if self.age > fade_start:
            self.alpha = 1 - (self.age - fade_start) / (self.lifetime - fade_start)


def spawn_halves(fruit, sword):
    """Replace `fruit` with two SlicedHalf entities. Returns (left, right)."""
    slash = slash_direction(sword)
    push = config.effects.half_push
    v_left, v_right = half_velocities(fruit.velocity, slash, push)
    scale = FRUIT_TYPES[fruit.fruit_type].get("model_scale", FRUIT_TYPES[fruit.fruit_type]["scale"])

    left = SlicedHalf(fruit, -1, v_left, slash, model_scale=scale)
    right = SlicedHalf(fruit, +1, v_right, slash, model_scale=scale)
    return left, right
