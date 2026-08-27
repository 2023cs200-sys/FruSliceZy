import random


def clamp(value, min_value, max_value):
    return max(min_value, min(max_value, value))


def random_range(min_value, max_value):
    return random.uniform(min_value, max_value)


def weighted_choice(weighted_items):
    items, weights = zip(*weighted_items)
    return random.choices(items, weights=weights, k=1)[0]
