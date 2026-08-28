COMBO_MULTIPLIER_STEP = 0.1
COMBO_MULTIPLIER_CAP = 2.0


class ScoreManager:
    def __init__(self):
        self.reset()

    def reset(self):
        self.score = 0
        self.fruits_cut = 0

    @staticmethod
    def multiplier_for(combo):
        multiplier = 1 + max(0, combo - 1) * COMBO_MULTIPLIER_STEP
        return min(multiplier, COMBO_MULTIPLIER_CAP)

    def add_hit(self, base_points, combo):
        earned = round(base_points * self.multiplier_for(combo))
        self.score += earned
        self.fruits_cut += 1
        return earned
