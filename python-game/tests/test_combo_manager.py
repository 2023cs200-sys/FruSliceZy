from src.scoring.combo_manager import ComboManager


def test_first_hit_starts_combo_at_one():
    manager = ComboManager(window=1.2)
    assert manager.register_hit(now=0.0) == 1


def test_consecutive_hits_within_window_increase_combo():
    manager = ComboManager(window=1.2)
    manager.register_hit(now=0.0)
    assert manager.register_hit(now=0.5) == 2
    assert manager.register_hit(now=1.0) == 3


def test_hit_after_window_resets_combo():
    manager = ComboManager(window=1.2)
    manager.register_hit(now=0.0)
    manager.register_hit(now=0.5)
    assert manager.register_hit(now=5.0) == 1


def test_update_expires_active_combo():
    manager = ComboManager(window=1.2)
    manager.register_hit(now=0.0)
    manager.update(now=0.6)
    assert manager.combo == 1
    manager.update(now=2.0)
    assert manager.combo == 0


def test_best_combo_tracked():
    manager = ComboManager(window=1.2)
    manager.register_hit(now=0.0)
    manager.register_hit(now=0.3)
    manager.register_hit(now=0.6)
    manager.update(now=10.0)
    manager.register_hit(now=10.0)
    assert manager.best_combo == 3
