class ComboManager:
    def __init__(self, window):
        self.window = window
        self.reset()

    def reset(self):
        self.combo = 0
        self.best_combo = 0
        self.last_hit_time = None

    def register_hit(self, now):
        if self.last_hit_time is not None and now - self.last_hit_time <= self.window:
            self.combo += 1
        else:
            self.combo = 1
        self.last_hit_time = now
        self.best_combo = max(self.best_combo, self.combo)
        return self.combo

    def update(self, now):
        if (
            self.combo > 0
            and self.last_hit_time is not None
            and now - self.last_hit_time > self.window
        ):
            self.combo = 0
