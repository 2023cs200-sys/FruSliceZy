


class ObjectManager:
    def __init__(self):
        self.fruits = []

    def add(self, fruit):
        self.fruits.append(fruit)

    def update(self):
        for fruit in list(self.fruits):
            if fruit.fell_out:
                self.remove(fruit)

    def remove(self, fruit):
        if fruit in self.fruits:
            self.fruits.remove(fruit)
        destroy(fruit)

    def clear(self):
        for fruit in self.fruits:
            destroy(fruit)
        self.fruits = []
