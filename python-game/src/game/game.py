from ursina import application, camera, color, destroy, time, window

from config import config
from src.collision.collision_detector import check_sword_hits
from src.effects.particles import juice_burst, score_popup
from src.game.game_state import GameState
from src.objects.object_manager import ObjectManager
from src.objects.spawner import Spawner
from src.player.slash import SlashTrail
from src.player.sword import Sword
from src.scoring.combo_manager import ComboManager
from src.scoring.score_manager import ScoreManager
from src.ui.game_over import GameOverScreen
from src.ui.hud import HUD
from src.ui.main_menu import MainMenu
from src.utils.constants import FRUIT_TYPES


class Game:
    def __init__(self):
        window.color = color.rgb32(*config.window.background)
        camera.position = config.camera.position
        camera.fov = config.camera.fov
        self.state = GameState.MENU
        self.sword = Sword()
        self.trail = SlashTrail()
        self.object_manager = ObjectManager()
        self.spawner = Spawner(self.object_manager)
        self.score_manager = ScoreManager()
        self.combo_manager = ComboManager(config.round.combo_window)
        self.hud = HUD()
        self.main_menu = MainMenu()
        self.game_over_screen = GameOverScreen()
        self.time_left = config.round.duration

    def start_game(self):
        self.object_manager.clear()
        self.trail.clear()
        self.score_manager.reset()
        self.combo_manager.reset()
        self.spawner.reset()
        self.time_left = config.round.duration
        self.hud.set_score(0)
        self.hud.set_combo(0)
        self.hud.set_timer(self.time_left)
        self.hud.set_visible(True)
        self.main_menu.set_visible(False)
        self.game_over_screen.set_visible(False)
        self.state = GameState.PLAYING

    def end_game(self):
        self.state = GameState.GAME_OVER
        self.object_manager.clear()
        self.trail.clear()
        self.hud.set_visible(False)
        self.game_over_screen.show_results(
            self.score_manager.score,
            self.combo_manager.best_combo,
            self.score_manager.fruits_cut,
        )

    def update(self):
        if self.state != GameState.PLAYING:
            return
        now = time.time()
        self.trail.update(self.sword)
        self.spawner.update(time.dt)
        self.object_manager.update()
        for fruit in check_sword_hits(self.sword, self.object_manager.fruits):
            self._cut_fruit(fruit)
        self.combo_manager.update(now)
        self.hud.set_combo(self.combo_manager.combo)
        self.time_left -= time.dt
        self.hud.set_timer(self.time_left)
        if self.time_left <= 0:
            self.end_game()

    def _cut_fruit(self, fruit):
        fruit.cut = True
        combo = self.combo_manager.register_hit(time.time())
        earned = self.score_manager.add_hit(fruit.points, combo)
        self.hud.set_score(self.score_manager.score)
        juice_burst(fruit.position, FRUIT_TYPES[fruit.fruit_type]["color"])
        score_popup(fruit.position, f"+{earned}")
        self.object_manager.remove(fruit)

    def handle_input(self, key):
        if key == "escape":
            application.quit()
            return
        if self.state == GameState.MENU and key in ("space", "left mouse down"):
            self.start_game()
        elif self.state == GameState.GAME_OVER and key == "r":
            self.start_game()
