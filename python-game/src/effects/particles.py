import random

from ursina import Entity, Text, Vec3, color, destroy, time

from src.utils.constants import JUICE_PARTICLE_COUNT, SCORE_POPUP_LIFETIME


class _Particle(Entity):
    def __init__(self, position, rgb, velocity, lifetime):
        super().__init__(
            model="quad",
            color=color.rgb32(*rgb),
            scale=random.uniform(0.07, 0.18),
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
        self.velocity += Vec3(0, -15 * time.dt, 0)
        self.position += self.velocity * time.dt
        self.alpha = 1 - self.age / self.lifetime


class _ScorePopup(Text):
    def __init__(self, position, content, lifetime):
        super().__init__(
            text=content,
            position=position + Vec3(0, 0.6, -0.3),
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


def juice_burst(position, rgb):
    for _ in range(JUICE_PARTICLE_COUNT):
        velocity = Vec3(random.uniform(-4, 4), random.uniform(-1, 6), 0)
        _Particle(Vec3(position), rgb, velocity, random.uniform(0.3, 0.6))


def score_popup(position, content):
    _ScorePopup(Vec3(position), content, SCORE_POPUP_LIFETIME)
