from ursina import Text, color


class GameOverScreen:
    def __init__(self):
        self.title = Text(
            text="Game Over",
            position=(0, 0.22),
            scale=2.2,
            origin=(0, 0.5),
            color=color.rgb32(255, 110, 90),
        )
        self.stats = Text(
            text="",
            position=(0, 0.02),
            scale=1.2,
            origin=(0, 0.5),
            color=color.rgb32(240, 240, 245),
        )
        self.prompt = Text(
            text="Press R to play again  -  ESC to quit",
            position=(0, -0.22),
            scale=1.1,
            origin=(0, 0.5),
            color=color.rgb32(140, 230, 140),
        )
        self.set_visible(False)

    def show_results(self, score, best_combo, fruits_cut):
        self.stats.text = (
            f"Final score: {score}\n"
            f"Best combo: {best_combo}\n"
            f"Fruits cut: {fruits_cut}"
        )
        self.set_visible(True)

    def set_visible(self, visible):
        self.title.enabled = visible
        self.stats.enabled = visible
        self.prompt.enabled = visible
