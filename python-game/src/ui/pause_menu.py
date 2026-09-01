from ursina import Text, color


class PauseMenu:
    def __init__(self):
        self.background = Text(
            text="",
            position=(0, 0),
            scale=(100, 100),
            color=color.rgba32(0, 0, 0, 128),
            origin=(0, 0),
        )
        self.title = Text(
            text="PAUSED",
            position=(0, 0.2),
            scale=2.5,
            origin=(0, 0.5),
            color=color.rgb32(255, 255, 255),
        )
        self.resume_text = Text(
            text="Press P to Resume",
            position=(0, -0.06),
            scale=1.5,
            origin=(0, 0.5),
            color=color.rgb32(140, 230, 140),
        )
        self.quit_text = Text(
            text="Press ESC to Quit",
            position=(0, -0.2),
            scale=1.3,
            origin=(0, 0.5),
            color=color.rgb32(255, 140, 140),
        )
        self._visible = False
        self.background.enabled = False
        self.title.enabled = False
        self.resume_text.enabled = False
        self.quit_text.enabled = False

    @property
    def visible(self):
        return self._visible

    def set_visible(self, visible):
        self._visible = visible
        self.background.enabled = visible
        self.title.enabled = visible
        self.resume_text.enabled = visible
        self.quit_text.enabled = visible

    def handle_input(self, key):
        pass