# Demo Script

Run the stack (`npm run dev` + local mongo, or `docker compose up`), seed
(`npm run seed`), open the web app, sign in (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), go to
**Chat Simulator**. Each line below is one customer message.

## 1. Greeting → menu
```
hi
```
→ "Welcome to FashionHub ❤️ … 1. New Arrivals 2. Women's Collection …"

## 2. Product search + recommendation + upsell
```
I need a black dress for Eid under 6000
```
→ lists **Black Embroidered Maxi — Rs 4,999**, Black Chiffon Dress, Black Bodycon Dress +
"Would you like to see pictures? 📸" + "Customers who bought this also liked…".
Insight panel: intent `product_search`, sentiment `neutral`, state `BROWSING`.

## 3. Size / colour follow-ups
```
Do you have size M?
Show red dresses
```

## 4. Place an order
```
I'll take the Black Embroidered Maxi in M
House 12, Gulberg, Lahore
confirm
```
→ "✅ Order confirmed! Order ID: AFS-… Tracking: TRK… Total: Rs 4,499 (COD)".
Insight panel shows the `orderId`. Check **Orders** and **Conversations** in the dashboard.

## 5. Delivery / discount / returns
```
Delivery charges?
Any discount? products under 3000
Return policy?
```

## 6. Order tracking
```
Where is my parcel?
```
→ status of the most recent order (or asks for an Order ID).

## 7. Complaint (sentiment + escalation)
```
I received a damaged item and I'm furious
```
→ apology + the conversation is flagged **needs human** (see Conversations list).

## 8. Urdu
```
mujhe kali dress chahiye kitne ki hai
```
→ replies in Urdu.

## 9. Voice (mock)
In the simulator this isn't wired to a mic; via the API send an attachment
`{type:"audio"}` with empty text → transcribed to "I need a black dress for Eid, size medium"
and handled normally.

## 10. Coverage of the spec query list
The ~50 example queries from the brief live in `packages/eval/src/exampleQueries.js` and are
asserted by `apps/api/tests/unit/intent.test.js`. Try any of them in the simulator:
"Summer collection", "Men's shirts", "Shoes under Rs 3000", "Same day delivery?",
"Beige color available?", "Can I exchange it?", "Best selling products", …
