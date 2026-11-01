# MathBrain AI — CPU, from-scratch maths tutor

MathBrain is a small educational project: a character-level GPT-style transformer trained from scratch on generated maths examples, a deterministic maths solver/verifier, and a local FastAPI service for the Grove chat interface.

## Important design boundary

The neural network is genuinely trained from scratch, but the chat API does **not** trust free-form neural output for arithmetic. Supported calculations are recomputed by a restricted Python AST evaluator. Unsupported questions receive a clarification prompt rather than a guessed answer. This is intentional: a small CPU-trained model is not a dependable calculator or a general-purpose child-safety system.

“Automatic learning” means the app saves **normalized maths questions and verified answers only** to `data/feedback.jsonl`. The next training run automatically includes those records. It does not silently retrain after every chat message. This avoids CPU spikes and prevents unverified model-generated text from becoming training data.

## 1. Install

Python 3.10 or newer is recommended.

### Windows PowerShell

```powershell
cd MathBrain
py -3 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### macOS / Linux

```bash
cd MathBrain
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 2. Train the neural network from scratch

```bash
python train.py --epochs 3 --examples 5000
```

This creates `models/mathbrain.pt`. CPU training may take a while. Start with the defaults; use `--examples 1500 --epochs 1` for a quick smoke test.

## 3. Start the API

```bash
uvicorn app:app --host 127.0.0.1 --port 8000
```

Check `http://127.0.0.1:8000/api/health`. Interactive API docs are at `http://127.0.0.1:8000/docs`.

Example:

```bash
curl -X POST http://127.0.0.1:8000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"What is 24 times 6?\"}"
```

## 4. Connect Grove

The `frontend/` folder contains the supplied Grove JS/CSS files. Its `script.js` has been patched so the send action calls MathBrain at `http://127.0.0.1:8000/api/chat` instead of returning simulated demo messages.

Use the HTML page that already loads `styles.css`, `grove-polish.css`, and `script.js`. Keep all three files in the same folder. Open it through a local static web server (not `file://`) if your browser blocks requests:

```bash
python -m http.server 5500
```

Then open `http://127.0.0.1:5500`. The API must be running in another terminal. If you host Grove somewhere else, change `MATHBRAIN_API` near the top of `frontend/script.js` to your API URL and configure CORS in `app.py` to allow only that website's origin.

## 5. Automatic learning cycle

1. Ask supported maths questions in Grove.
2. MathBrain calculates the answer independently.
3. Only successful, deterministic solutions are added to `data/feedback.jsonl`.
4. Periodically retrain:

```bash
python train.py --epochs 3 --examples 5000
```

The feedback file stores normalized maths expressions, not chat history. Review it before training if this project will be used by children.

## Supported starter maths

- Whole-number addition, subtraction, multiplication, and division
- Decimal arithmetic and brackets
- Percentages in the form `20% of 50`
- Rectangle area/perimeter in the form `area of rectangle 5 by 3`

Examples: `24 × 6`, `what is 100 divided by 4`, `20% of 50`, `area of rectangle 5 by 3`.

This starter does not yet reliably interpret arbitrary word problems, algebra, or every fraction notation. Use explicit expressions such as `1/2 + 1/4` for fraction calculations.

## Child-appropriate use

- The tutor redirects non-maths topics.
- Keep the API local and do not expose it publicly without authentication, rate limits, logging controls, and a security review.
- Do not collect a child's name, address, school, contact details, or other personal information.
- Adult supervision is recommended. A topic filter is not a substitute for comprehensive child-safety controls.
