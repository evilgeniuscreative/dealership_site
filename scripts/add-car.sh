#!/bin/bash

curl -X POST http://localhost:3001/cars \
-H "Content-Type: application/json" \
-d '{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Silver",
  "doors": 4,
  "engineDisplacement": "2.5L",
  "horsepower": 203,
  "mileage": 35000,
  "price": 22500,
  "summary": "Well-maintained Toyota Camry",
  "description": "This Toyota Camry is in excellent condition with full service history.",
  "imageUrl": "https://example.com/camry.jpg"
}'
