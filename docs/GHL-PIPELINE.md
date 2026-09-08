# GHL pipeline reference

Created by API on 2026-09-08. Read-only record — the pipeline itself lives in GHL.

The token has `opportunities.write` but NOT `opportunities.readonly`, so this
could not be listed back to confirm no duplicate already existed. If a second
"Coco Subscriber Value" appears in GHL, delete the one whose id is not below.

**Pipeline:** `Coco Subscriber Value`
**id:** `oxFyJAz4xO5PgQe7RwwZ`

| # | Stage | id |
|---|---|---|
| 0 | Opted in | `f7d1b1b8-71b3-40f2-9fc4-a14f43bf027c` |
| 1 | Guide sent | `57163d44-5eb4-4c55-ab20-21398552ed6d` |
| 2 | Engaged | `774cd895-248c-4a25-ae15-cd0e28d172f3` |
| 3 | Offer seen | `57e48dae-f8c9-4fb1-87c3-6a566aa8cfde` |
| 4 | Buyer | `896990ca-8e49-46bf-ba2c-36fae4717a21` |
| 5 | Declined - Re-offered | `3b4071cd-4bff-43f9-ae00-842a0f5d2d03` |

## Settings applied

- `useOpportunityProbability: false` — GHL auto-assigned a win probability per
  stage (14% ... 86%). It is inert with this flag off, which is what we want:
  this is a subscriber-value board, not a sales forecast.
- No "lost" stage. A non-buyer is the re-offer segment, not a loss.
- Opportunity value stays 0 until the price lands. A placeholder would make the
  revenue column confidently wrong.
- Auto-move-on-stale must stay OFF — stuck is the signal this board exists to show.

## Stages 4-6 are deliberately empty

`Offer seen`, `Buyer` and `Declined - Re-offered` have nothing writing to them
yet. Offer-seen needs the thank-you offer instrumented; the other two are blocked
on pricing. Created now so the board does not need restructuring later.

## Why stages 1 and 2 both exist

They look redundant when delivery is instant. The point is isolating bounces:
anyone who never leaves `Opted in` gave you a bad address — and on a sending
domain this new, that is the number you most need visible.
