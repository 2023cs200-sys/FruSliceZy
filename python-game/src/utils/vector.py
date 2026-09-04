from src.utils.vector import Vector2
import math

class Vector2:
    def __init__(self, x=0.0, y=0.0):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector2(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector2(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector2(self.x * scalar, self.y * scalar)

    def __truediv__(self, scalar):
        return Vector2(self.x / scalar, self.y / scalar)
        
    def __abs__(self):
        return math.hypot(self.x, self.y)
        
    def distance(self, other):
        return abs(self - other)

    def normalized(self):
        m = abs(self)
        if m == 0:
            return Vector2()
        return self / m
        
    def to_dict(self):
        return {"x": self.x, "y": self.y}
