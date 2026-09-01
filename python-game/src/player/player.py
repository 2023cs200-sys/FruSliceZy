from src.player.sword import Sword
from src.player.slash import SlashTrail


class Player:
    def __init__(self):
        self.sword = Sword()
        self.trail = SlashTrail()

    def update(self):
        if hasattr(self.sword, 'update'):
            self.sword.update()
        if hasattr(self.trail, 'update'):
            self.trail.update(self.sword)