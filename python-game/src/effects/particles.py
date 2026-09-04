from src.utils.vector import Vector2
"""Juice, chunk, slash, and screen-flash effects (Section 4).

Design notes:
- Every effect entity is self-managing (own update() + destroy), mirroring
  SlicedHalf: none are tracked by ObjectManager, so the sword-vs-fruit
  collision loop never sees them.
- juice_burst(position, rgb) keeps its Phase 1 signature — game.py needs no
  signature changes; the rgb it passes is now the fruit's juice color.
- Juice/chunks get real z-spread so debris flies toward the camera.
- ScreenFlash is a camera-parented overlay quad covering the full FOV; one
  instance is reused (never re-created per flash) for combos and bombs.
"""

import random



from config import config
from src.utils.constants import (
    FRUIT_CHUNK_COUNT,
    JUICE_PARTICLE_COUNT,
    SCORE_POPUP_LIFETIME,
    SLASH_FLASH_LIFETIME,
)

JUICE_Z_SPREAD = 2.0
JUICE_GRAVITY = 15.0
CHUNK_GRAVITY = 22.0


class _Particle:
    def __init__(self, position, rgb, velocity, lifetime, model="circle", scale=None):
        super().__init__(
            model=model,
            color=color.rgb32(*rgb),
            scale=scale if scale is not None else random.uniform(0.07, 0.18),
            position=position,
            double_sided=True,
        )
        self.velocity = velocity
        self.lifetime = lifetime
        self.age = 0.0

    def update(self):
        self.age += time.dt
        if self.age >= self.lifetime:
            destroy(self)
            return
        self.velocity += Vector2(0, -JUICE_GRAVITY * time.dt, 0)
        self.position += self.velocity * time.dt
        self.alpha = 1 - self.age / self.lifetime


class _Chunk:
    """Peel/skin debris: a small spinning tinted quad that falls fast."""

    def __init__(self, position, rgb, velocity, lifetime):
        super().__init__(
            model="quad",
            color=color.rgb32(*rgb),
            scale=(random.uniform(0.08, 0.22), random.uniform(0.08, 0.16), 1),
            position=position,
            double_sided=True,
        )
        self.velocity = velocity
        self.lifetime = lifetime
        self.age = 0.0
        self.spin = random.uniform(-720, 720)

    def update(self):
        self.age += time.dt
        if self.age >= self.lifetime:
            destroy(self)
            return
        self.velocity += Vector2(0, -CHUNK_GRAVITY * time.dt, 0)
        self.position += self.velocity * time.dt
        self.rotation_z += self.spin * time.dt
        self.alpha = 1 - self.age / self.lifetime


class _SlashFlash:
    """Bright streak along the slash, fading in ~0.15s."""

    def __init__(self, position, direction, length=None):
        import math

        super().__init__(
            model="quad",
            color=color.rgb32(255, 255, 255),
            position=position,
            double_sided=True,
        )
        # stretch along the swipe direction; thin across it
        length = length or 2.2
        self.scale = (length, 0.25, 1)
        self.rotation_z = math.degrees(math.atan2(direction.y, direction.x))
        self.lifetime = config.effects.flash_lifetime
        self.age = 0.0

    def update(self):
        self.age += time.dt
        if self.age >= self.lifetime:
            destroy(self)
            return
        self.alpha = 1 - self.age / self.lifetime


class _ScorePopup(Text):
    def __init__(self, position, content, lifetime):
        super().__init__(
            text=content,
            position=position + Vector2(0, 0.6, -0.3),
            scale=0.7,
            origin=(0, 0),
            color=color.rgb32(255, 235, 120),
        )
        self.lifetime = lifetime
        self.age = 0.0

    def update(self):
        self.age += time.dt
        if self.age >= self.lifetime:
            destroy(self)
            return
        self.y += 2.5 * time.dt
        self.alpha = 1 - self.age / self.lifetime


class ScreenFlash:
    """Camera-parented full-FOV overlay that decays after each trigger.

    Reused across triggers (bombs, combos): trigger() only resets intensity;
    the entity persists and its update decays alpha toward zero every frame.
    """

    def __init__(self, rgb=(255, 60, 60)):
        from math import radians, tan

        distance = abs(config.play_area.plane_z - config.camera.position[2])
        world_height = tan(radians(config.camera.fov / 2)) * distance * 2
        self._overlay = Entity(
            parent=camera,
            model="quad",
            color=color.rgba32(*rgb, 0),
            scale=(world_height * camera.aspect_ratio * 1.1, world_height * 1.1, 1),
            position=(0, 0, 1.5),  # 1.5 units in front of the camera
            enabled=False,
            double_sided=True,
        )
        self._decay_rate = 4.0
        self._max_alpha = 0.65

    def trigger(self, intensity=1.0, rgb=None):
        if rgb is not None:
            self._overlay.color = color.rgba32(*rgb, 0)
        self._overlay.enabled = True
        self._overlay.alpha = min(self._max_alpha, self._max_alpha * intensity)

    def update(self):
        if not self._overlay.enabled:
            return
        new_alpha = self._overlay.alpha - self._decay_rate * time.dt * self._max_alpha
        if new_alpha <= 0.01:
            self._overlay.enabled = False
            self._overlay.alpha = 0.0
        else:
            self._overlay.alpha = new_alpha

    def clear(self):
        self._overlay.enabled = False
        self._overlay.alpha = 0.0


def juice_burst(position, rgb):
    """Droplet spray with real z-spread toward the camera."""
    for _ in range(JUICE_PARTICLE_COUNT):
        velocity = Vector2(
            random.uniform(-4, 4),
            random.uniform(-1, 6),
            random.uniform(-JUICE_Z_SPREAD, JUICE_Z_SPREAD),
        )
        _Particle(
            Vector2(position),
            rgb,
            velocity,
            random.uniform(0.3, 0.6),
            model="circle",
        )


def fruit_chunks(position, rgb, direction=None):
    """Peel/skin debris flung along the slash, spinning as it falls."""
    base = Vector2(direction) if direction is not None else Vector2(0, 1, 0)
    for _ in range(FRUIT_CHUNK_COUNT):
        velocity = Vector2(
            base.x * random.uniform(1.5, 4.0) + random.uniform(-1.5, 1.5),
            base.y * random.uniform(1.5, 4.0) + random.uniform(1.0, 3.0),
            random.uniform(-1.2, 1.2),
        )
        _Chunk(Vector2(position), rgb, velocity, random.uniform(0.4, 0.7))


def slash_flash(position, direction):
    """White-hot streak along the swipe at the cut point."""
    _SlashFlash(Vector2(position), direction)


def score_popup(position, content):
    _ScorePopup(Vector2(position), content, SCORE_POPUP_LIFETIME)
