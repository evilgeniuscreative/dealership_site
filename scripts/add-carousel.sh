#!/bin/bash

curl -X POST http://localhost:3001/carousel-images \
-H "Content-Type: application/json" \
-d '{
  "title": "Featured Vehicle",
  "subtitle": "2020 Toyota Camry",
  "imageUrl": "https://example.com/camry-banner.jpg",
  "displayOrder": 1
}'
