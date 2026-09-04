from pathlib import Path

ASSET_ROOT = Path(__file__).resolve().parents[2] / "assets"


def asset(*parts):
    return ASSET_ROOT.joinpath(*parts)


FRUIT_TYPES = {
    "apple": {
        "points": 10,
        "color": (220, 40, 40),
        "scale": 0.45,
        "builtin": "apple",
        "model_scale": 0.55,
        "flesh": (250, 246, 230),
        "juice": (250, 246, 230),
    },
    "orange": {
        "points": 10,
        "color": (240, 150, 30),
        "scale": 0.5,
        "builtin": "orange",
        "model_scale": 0.55,
        "flesh": (255, 200, 90),
        "juice": (255, 170, 40),
    },
    "banana": {
        "points": 15,
        "color": (240, 220, 80),
        "scale": 0.42,
        "builtin": "banana",
        "model_scale": 1.5,
        "flesh": (250, 245, 215),
        "juice": (250, 245, 215),
    },
    "pineapple": {
        "points": 20,
        "color": (200, 190, 60),
        "scale": 0.55,
        "builtin": "pineapple",
        "model_scale": 0.55,
        "flesh": (250, 235, 160),
        "juice": (255, 240, 130),
    },
    "watermelon": {
        "points": 25,
        "color": (60, 160, 70),
        "scale": 0.7,
        "builtin": "watermelon",
        "model_scale": 0.62,
        "flesh": (235, 80, 95),
        "juice": (235, 80, 95),
    },
}

FRUIT_WEIGHTS = [
    ("apple", 30),
    ("orange", 25),
    ("banana", 20),
    ("pineapple", 15),
    ("watermelon", 10),
]

JUICE_PARTICLE_COUNT = 8
SCORE_POPUP_LIFETIME = 0.7
