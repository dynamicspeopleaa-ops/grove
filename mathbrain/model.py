"""Small character-level GPT-style transformer trained from scratch."""
import torch
from torch import nn

class MathBrainLM(nn.Module):
    def __init__(self, vocab_size: int, block_size: int = 128,
                 d_model: int = 64, n_heads: int = 4, n_layers: int = 2):
        super().__init__()
        self.block_size = block_size
        self.token = nn.Embedding(vocab_size, d_model)
        self.position = nn.Embedding(block_size, d_model)
        layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=n_heads, dim_feedforward=d_model * 4,
            batch_first=True, dropout=0.1, activation="gelu"
        )
        self.transformer = nn.TransformerEncoder(layer, num_layers=n_layers)
        self.norm = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab_size, bias=False)

    def forward(self, idx, targets=None):
        b, t = idx.shape
        if t > self.block_size:
            idx = idx[:, -self.block_size:]
            t = idx.shape[1]
            if targets is not None:
                targets = targets[:, -t:]
        pos = torch.arange(t, device=idx.device).unsqueeze(0)
        x = self.token(idx) + self.position(pos)
        # True entries are blocked by PyTorch's transformer attention mask.
        mask = torch.triu(torch.ones(t, t, device=idx.device, dtype=torch.bool), diagonal=1)
        x = self.transformer(x, mask=mask)
        logits = self.head(self.norm(x))
        loss = None
        if targets is not None:
            loss = nn.functional.cross_entropy(
                logits.reshape(-1, logits.size(-1)), targets.reshape(-1)
            )
        return logits, loss
