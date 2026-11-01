import argparse, json, random
from pathlib import Path
import torch
from torch.utils.data import Dataset, DataLoader
from mathbrain.model import MathBrainLM
from mathbrain.data import make_examples

ROOT = Path(__file__).parent
DATA = ROOT / "data"
MODELS = ROOT / "models"

class CharDataset(Dataset):
    def __init__(self, text, stoi, block):
        self.data = torch.tensor([stoi[c] for c in text], dtype=torch.long)
        self.block = block
    def __len__(self):
        return max(1, len(self.data) - self.block - 1)
    def __getitem__(self, i):
        x = self.data[i:i+self.block]
        y = self.data[i+1:i+self.block+1]
        return x, y

def main():
    ap = argparse.ArgumentParser(description="Train MathBrain's tiny transformer from scratch on CPU.")
    ap.add_argument("--epochs", type=int, default=3)
    ap.add_argument("--examples", type=int, default=5000)
    ap.add_argument("--batch-size", type=int, default=32)
    ap.add_argument("--block-size", type=int, default=128)
    ap.add_argument("--max-steps", type=int, default=500)
    args = ap.parse_args()

    random.seed(17)
    torch.manual_seed(17)
    torch.set_num_threads(max(1, min(4, torch.get_num_threads())))
    rows = make_examples(args.examples)
    feedback = DATA / "feedback.jsonl"
    if feedback.exists():
        for line in feedback.read_text(encoding="utf-8").splitlines():
            try:
                item = json.loads(line)
                if item.get("verified") is True:
                    rows.append(f"Q: {item['question']}\nA: {item['answer']}\n\n")
            except Exception:
                continue
    text = "".join(rows)
    chars = sorted(set(text))
    stoi = {c:i for i,c in enumerate(chars)}
    dataset = CharDataset(text, stoi, args.block_size)
    loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, drop_last=True)
    model = MathBrainLM(len(chars), block_size=args.block_size)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)
    model.train()
    print(f"Training from scratch on CPU: {len(rows):,} examples, {len(chars)} characters")
    for epoch in range(args.epochs):
        total, steps = 0.0, 0
        for x, y in loader:
            optimizer.zero_grad(set_to_none=True)
            _, loss = model(x, y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total += float(loss.item())
            steps += 1
            if steps >= args.max_steps:
                break
        print(f"Epoch {epoch+1}/{args.epochs} - loss {total/max(1,steps):.4f}")
    MODELS.mkdir(exist_ok=True)
    torch.save({
        "model": model.state_dict(), "vocab": chars,
        "config": {"block_size": args.block_size, "d_model": 64, "n_heads": 4, "n_layers": 2},
        "trained_examples": len(rows)
    }, MODELS / "mathbrain.pt")
    print("Saved models/mathbrain.pt")

if __name__ == "__main__":
    main()
