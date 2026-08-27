from src.utils.helpers import clamp, random_range, weighted_choice


def test_clamp_within_range():
    assert clamp(5, 0, 10) == 5


def test_clamp_below_range():
    assert clamp(-3, 0, 10) == 0


def test_clamp_above_range():
    assert clamp(15, 0, 10) == 10


def test_random_range_within_bounds():
    for _ in range(100):
        value = random_range(-2.0, 2.0)
        assert -2.0 <= value <= 2.0


def test_weighted_choice_returns_valid_item():
    items = [("apple", 50), ("orange", 50)]
    for _ in range(50):
        assert weighted_choice(items) in ("apple", "orange")
