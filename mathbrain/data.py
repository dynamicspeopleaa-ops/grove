"""Synthetic, age-appropriate maths examples for training from scratch."""
import random

def make_examples(count=5000, seed=17):
    rng = random.Random(seed)
    rows = []
    for _ in range(count):
        kind = rng.choice(["add", "sub", "mul", "div", "percent", "area", "perimeter"])
        if kind == "add":
            a, b = rng.randint(0, 999), rng.randint(0, 999)
            q, ans = f"{a} + {b}", str(a+b)
            explanation = f"Add the numbers: {a} + {b} = {ans}."
        elif kind == "sub":
            a, b = rng.randint(0, 999), rng.randint(0, 999)
            if b > a: a, b = b, a
            q, ans = f"{a} - {b}", str(a-b)
            explanation = f"Subtract: {a} - {b} = {ans}."
        elif kind == "mul":
            a, b = rng.randint(0, 20), rng.randint(0, 12)
            q, ans = f"{a} * {b}", str(a*b)
            explanation = f"Multiply: {a} groups of {b} make {ans}."
        elif kind == "div":
            b, ans0 = rng.randint(1, 12), rng.randint(0, 20)
            a = b * ans0
            q, ans = f"{a} / {b}", str(ans0)
            explanation = f"Share {a} equally into {b} groups: {a} / {b} = {ans}."
        elif kind == "percent":
            p, n = rng.choice([10, 20, 25, 50, 75]), rng.randint(1, 20)*4
            q, ans = f"{p}% of {n}", str(n*p/100).rstrip("0").rstrip(".")
            explanation = f"{p}% means {p}/100. Multiply {n} by {p}/100 to get {ans}."
        elif kind == "area":
            a, b = rng.randint(1, 20), rng.randint(1, 20)
            q, ans = f"area rectangle {a} by {b}", str(a*b)
            explanation = f"Area = length times width: {a} × {b} = {ans} square units."
        else:
            a, b = rng.randint(1, 20), rng.randint(1, 20)
            q, ans = f"perimeter rectangle {a} by {b}", str(2*(a+b))
            explanation = f"Perimeter = 2 × (length + width) = 2 × ({a} + {b}) = {ans} units."
        rows.append(f"Q: {q}\nA: {explanation}\n\n")
    return rows
