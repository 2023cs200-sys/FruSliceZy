from ursina import Ursina

from config import config
from src.game.game import Game

app = Ursina(title=config.window.title, size=config.window.size)
game = Game()


def update():
    game.update()


def input(key):
    game.handle_input(key)


app.run()
