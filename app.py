from pathlib import Path
import json, threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from mathbrain.math_engine import is_math_request, solve_math

ROOT = Path(__file__).parent
FEEDBACK = ROOT / "data" / "feedback.jsonl"
FEEDBACK.parent.mkdir(exist_ok=True)
app = FastAPI(title="MathBrain AI", version="1.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=False,
    allow_methods=["GET", "POST"], allow_headers=["*"]
)
_write_lock = threading.Lock()

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: list[dict] = Field(default_factory=list, max_length=8)

class ChatResponse(BaseModel):
    reply: str
    verified: bool = False
    learning_saved: bool = False
    mode: str = "tutor"

@app.get("/api/health")
def health():
    return {"ok": True, "name": "MathBrain AI", "focus": "age-appropriate mathematics"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    question = req.message.strip()
    if not is_math_request(question):
        return ChatResponse(
            reply=("I’m MathBrain, a maths tutor for learners around age 10. 🌟 "
                   "I can help with addition, subtraction, multiplication, division, "
                   "fractions, decimals, percentages, and simple geometry. "
                   "Let’s keep our chat focused on maths. What would you like to practise?")
        )
    if question.lower() in {"hi", "hello", "hey", "good morning", "good afternoon"}:
        return ChatResponse(reply="Hello, maths explorer! 🌟 What maths problem shall we solve together?")
    try:
        result = solve_math(question)
    except ValueError as exc:
        return ChatResponse(reply=str(exc))
    reply = f"**Answer: {result['answer']}**\n\n{result['explanation']}\n\nWould you like to try a similar question?"
    # Automatic learning: store only normalized maths prompts and deterministic verified answers.
    # Raw conversation history and personal details are never written to the training file.
    item = {
        "question": result["normalized_question"],
        "answer": f"The verified answer is {result['answer']}. {result['explanation']}",
        "verified": True
    }
    saved = False
    try:
        with _write_lock:
            with FEEDBACK.open("a", encoding="utf-8") as f:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")
        saved = True
    except OSError:
        pass
    return ChatResponse(reply=reply, verified=True, learning_saved=saved)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
