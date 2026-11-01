"""Deterministic, restricted maths solver. Never uses eval()."""
import ast
import operator
import re
from fractions import Fraction

OPS = {
    ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
    ast.Div: operator.truediv, ast.Pow: operator.pow,
    ast.USub: operator.neg, ast.UAdd: operator.pos,
}

MATH_HINTS = re.compile(
    r"(\d|[+\-*/×÷=]|plus|minus|times|multipl|divid|fraction|percent|"
    r"percentage|sum|difference|product|quotient|area|perimeter|"
    r"rectangle|triangle|square|math|calculate|solve|what is|how much)",
    re.I
)

def is_math_request(text: str) -> bool:
    s = text.strip().lower()
    if s in {"hi", "hello", "hey", "good morning", "good afternoon"}:
        return True
    return bool(MATH_HINTS.search(s))

def _safe_ast(node):
    if isinstance(node, ast.Expression):
        return _safe_ast(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        left, right = _safe_ast(node.left), _safe_ast(node.right)
        if isinstance(node.op, ast.Pow) and abs(right) > 6:
            raise ValueError("That power is too large for this practice tutor.")
        value = OPS[type(node.op)](left, right)
        if abs(value) > 10**12:
            raise ValueError("Please use smaller numbers for this practice question.")
        return value
    if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_safe_ast(node.operand))
    raise ValueError("I can solve basic arithmetic expressions only.")

def safe_calculate(expr: str):
    expr = expr.replace("×", "*").replace("÷", "/").replace("−", "-")
    if not re.fullmatch(r"[0-9+\-*/().\s]+", expr):
        raise ValueError("Please enter a maths expression using numbers and +, −, ×, ÷ or brackets.")
    tree = ast.parse(expr, mode="eval")
    result = _safe_ast(tree)
    if isinstance(result, float) and (result != result or abs(result) == float("inf")):
        raise ValueError("That calculation is not a finite number.")
    return result

def _fmt(value):
    if isinstance(value, float):
        if abs(value - round(value)) < 1e-10:
            return str(int(round(value)))
        return f"{value:.8g}"
    return str(value)

def solve_math(question: str):
    q = question.strip()
    low = q.lower()

    # Percentage of a number, e.g. "what is 20% of 50?"
    m = re.search(r"(-?\d+(?:\.\d+)?)\s*%\s*of\s*(-?\d+(?:\.\d+)?)", low)
    if m:
        p, n = map(float, m.groups())
        result = n * p / 100
        return {
            "answer": _fmt(result),
            "explanation": f"To find {m.group(1)}% of {m.group(2)}, change the percent to a decimal: {m.group(1)} ÷ 100.\\nThen multiply: {m.group(2)} × {m.group(1)} ÷ 100 = {_fmt(result)}.",
            "normalized_question": f"{m.group(2)} * {m.group(1)} / 100"
        }

    # Simple rectangle area/perimeter questions.
    m = re.search(r"(area|perimeter)\s+of\s+(?:a\s+)?rectangle\s+(?:with\s+)?(?:length\s+)?(\d+(?:\.\d+)?)\s+(?:by|and)\s+(\d+(?:\.\d+)?)", low)
    if m:
        kind, a, b = m.group(1), float(m.group(2)), float(m.group(3))
        result = a*b if kind == "area" else 2*(a+b)
        if kind == "area":
            explanation = f"Area of a rectangle = length × width.\\n{a:g} × {b:g} = {_fmt(result)} square units."
        else:
            explanation = f"Perimeter = 2 × (length + width).\\n2 × ({a:g} + {b:g}) = {_fmt(result)} units."
        return {"answer": _fmt(result), "explanation": explanation,
                "normalized_question": f"{kind} rectangle {a:g} by {b:g}"}

    # Translate common spoken operations into an expression.
    expr = low
    expr = re.sub(r"^(what is|calculate|work out|solve|please calculate)\s+", "", expr)
    expr = re.sub(r"[?=]\s*$", "", expr)
    expr = expr.replace("multiplied by", "*").replace("times", "*")
    expr = expr.replace("divided by", "/").replace("plus", "+").replace("add", "+")
    expr = expr.replace("minus", "-").replace("take away", "-")
    expr = expr.replace("×", "*").replace("÷", "/")
    # "a half" natural language is intentionally not guessed; use 1/2.
    expr = expr.strip(" .")
    try:
        result = safe_calculate(expr)
        pretty = _fmt(result)
        return {
            "answer": pretty,
            "explanation": f"Let's work it out step by step.\\nThe expression is {expr}.\\nCalculating it gives **{pretty}**.",
            "normalized_question": expr
        }
    except Exception as exc:
        raise ValueError(
            "I’m a maths tutor for learners around age 10. Try a question like "
            "“24 × 6”, “what is 20% of 50?”, or “area of rectangle 5 by 3”. "
            "For a word problem, include the numbers and the operation you want to practise."
        ) from exc

def verified_result(question: str, proposed_answer: str) -> bool:
    """Recompute the supported question and compare the proposed numeric answer."""
    try:
        expected = solve_math(question)["answer"]
        candidate = re.sub(r"[^0-9.eE+-]", "", str(proposed_answer))
        return abs(float(expected) - float(candidate)) < 1e-8
    except Exception:
        return False
