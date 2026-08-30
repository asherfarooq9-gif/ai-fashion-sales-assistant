# AI Fashion Sales Assistant

AI-powered sales assistant for clothing brands. Auto-replies to Instagram DM and WhatsApp
messages, understands customer queries, recommends products, and collects orders.

## Objective

Behave like a professional sales representative for a clothing brand across messaging channels.

## Features

- **Instagram DM automation** — auto-reply to greetings, price, availability, sizes, colors,
  delivery, exchange, and order queries
- **WhatsApp automation** — instant replies, catalog sharing, product recommendation, order
  capture, address collection, order confirmation
- **Intent detection** — greeting, product search, order placement, delivery inquiry,
  complaint, return request, discount inquiry
- **Sentiment analysis** — happy / angry / frustrated / interested buyer, with tailored responses
- **Product recommendation engine** — by gender, budget, favorite color, category, purchase
  history, and trending products
- **Admin dashboard** — product CRUD, customers, orders, conversations, data export, AI training

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React.js, Tailwind CSS             |
| Backend   | Node.js, Express.js                |
| Database  | MongoDB                            |
| AI        | OpenAI API, LangChain              |
| Automation| n8n                                |
| Messaging | Instagram Graph API, WhatsApp Business API |

## Data Model

- **Products** — name, category, price, description, sizes, colors, stock, images, discount, rating
- **Customers** — name, phone, Instagram ID, address, order history, preferences
- **Orders** — order ID, customer ID, products, quantity, status, payment status, tracking number

## Bonus

- Voice message support
- Urdu + English language support
- AI-generated sales replies
- Auto upselling

## Status

Early scaffolding.
