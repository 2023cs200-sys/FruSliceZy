from ursina import Vec3


class FakeSword:
    def __init__(self, previous_tip, tip, is_slashing=True, position=None):
        self.previous_tip_position = previous_tip
        self.tip_position = tip
        self.position = position if position is not None else tip - Vec3(0, 1.75, 0)
        self._is_slashing = is_slashing

    @property
    def is_slashing(self):
        return self._is_slashing


class FakeFruit:
    def __init__(self, position, radius=0.5):
        self.position = position
        self.radius = radius
        self.cut = False
