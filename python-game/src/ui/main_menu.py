from ursina import Text, color


class MainMenu:
    def __init__(self):
        self.title = Text(
            text="FruSliceZy",
            position=(0, 0.18),
            scale=2.6,
            origin=(0, 0.5),
            color=color.rgb32(255, 120, 90),
        )
        self.subtitle = Text(
            text="A motion-controlled fruit slicing game",
            position=(0, 0.06),
            scale=1.0,
            origin=(0, 0.5),
            color=color.rgb32(220, 220, 230),
        )
        self.prompt = Text(
            text="Press SPACE or CLICK to start",
            position=(0, -0.08),
            scale=1.2,
            origin=(0, 0.5),
            color=color.rgb32(140, 230, 140),
        )
        self.set_visible(True)

    def set_visible(self, visible):
        self.title.enabled = visible
        self.subtitle.enabled = visible
        self.prompt.enabled = visible
