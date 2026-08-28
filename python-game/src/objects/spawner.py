import random

from config import config
from src.objects.fruit import Fruit
from src.utils.constants import FRUIT_WEIGHTS
from src.utils.helpers import weighted_choice


class Spawner:
    def __init__(self, object_manager):
        self.object_manager = object_manager
        self.timer = 0.0
        self.interval = config.spawn.interval_start

    def update(self, dt):
        self.timer += dt
        if self.timer >= self.interval:
            self.timer = 0.0
            self.spawn_wave()

    def spawn_wave(self):
        count = random.randint(config.spawn.min_per_wave, config.spawn.max_per_wave)
        for _ in range(count):
            fruit = Fruit(weighted_choice(FRUIT_WEIGHTS))
            self.object_manager.add(fruit)

    def reset(self):
        self.timer = 0.0
        self.interval = config.spawn.interval_start
