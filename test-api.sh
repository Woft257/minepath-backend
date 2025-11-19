#!/bin/bash

# Test script for Minepath Backend API
BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Minepath Backend API"
echo "================================"
echo ""

# Test Health Check
echo "1️⃣ Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test Dashboard Stats
echo "2️⃣ Testing Dashboard Stats..."
curl -s "$BASE_URL/stats/dashboard" | jq '.'
echo ""

# Test KOL Overview
echo "3️⃣ Testing KOL Overview..."
curl -s "$BASE_URL/stats/kols/overview" | jq '.'
echo ""

# Test User Stats
echo "4️⃣ Testing User Stats..."
curl -s "$BASE_URL/stats/users/stats" | jq '.'
echo ""

# Test Transaction Stats
echo "5️⃣ Testing Transaction Stats..."
curl -s "$BASE_URL/stats/transactions/stats" | jq '.'
echo ""

echo "✅ API Tests Complete!"

