from src.scoring.score_manager import ScoreManager


def test_add_hit_awards_base_points_without_combo():
    manager = ScoreManager()
    earned = manager.add_hit(10, combo=1)
    assert earned == 10
    assert manager.score == 10
    assert manager.fruits_cut == 1


def test_add_hit_applies_combo_multiplier():
    manager = ScoreManager()
    earned = manager.add_hit(10, combo=3)
    assert earned == 12


def test_multiplier_capped_at_two():
    manager = ScoreManager()
    assert manager.multiplier_for(50) == 2.0


def test_score_accumulates_across_hits():
    manager = ScoreManager()
    manager.add_hit(10, combo=1)
    manager.add_hit(25, combo=2)
    assert manager.score == 10 + 28
    assert manager.fruits_cut == 2


def test_reset_clears_state():
    manager = ScoreManager()
    manager.add_hit(10, combo=1)
    manager.reset()
    assert manager.score == 0
    assert manager.fruits_cut == 0
