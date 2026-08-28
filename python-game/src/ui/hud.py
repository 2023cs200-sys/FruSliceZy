from ursina import Text, color


class HUD:
    def __init__(self):
        self.score_text = Text(
            text="Score: 0",
            position=(-0.85, 0.46),
            scale=1.1,
            origin=(-0.5, 0.5),
            color=color.rgb32(245, 245, 245),
        )
        self.combo_text = Text(
            text="",
            position=(0.85, 0.46),
            scale=1.1,
            origin=(0.5, 0.5),
            color=color.rgb32(255, 200, 90),
        )
        self.timer_text = Text(
            text="60",
            position=(0, 0.46),
            scale=1.3,
            origin=(0, 0.5),
            color=color.rgb32(190, 235, 190),
        )
        self.enabled = False
        self.set_visible(False)

    def set_visible(self, visible):
        self.enabled = visible
        self.score_text.enabled = visible
        self.combo_text.enabled = visible
        self.timer_text.enabled = visible

    def set_score(self, score):
        self.score_text.text = f"Score: {score}"

    def set_combo(self, combo):
        self.combo_text.text = f"x{combo}" if combo >= 2 else ""

    def set_timer(self, seconds_left):
        self.timer_text.text = str(max(0, round(seconds_left)))
