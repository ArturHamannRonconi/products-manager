#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="http://localhost:3001"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Products Manager — Seeding data...  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check dependencies
for cmd in curl jq; do
  if ! command -v "$cmd" &> /dev/null; then
    echo -e "${RED}Error: '$cmd' is required but not installed.${NC}"
    exit 1
  fi
done

# Check API is reachable
if ! curl -s "${API_URL}/health" > /dev/null 2>&1; then
  echo -e "${RED}Error: Backend is not reachable at ${API_URL}. Make sure the app is running.${NC}"
  exit 1
fi

# Helper: run curl and return "<body>\n<status_code>"
api_call() {
  # Usage: api_call <method> <path> [extra curl args...]
  local method="$1"
  local path="$2"
  shift 2
  curl -s -w "\n%{http_code}" -X "$method" "${API_URL}${path}" "$@"
}

# ─── 1. Create Sellers ───────────────────────────────────────────────────────

echo -e "${YELLOW}[1/5] Creating sellers...${NC}"

SELLERS_RESPONSE=$(api_call POST "/sellers" \
  -H "Content-Type: application/json" \
  -d '{
    "sellers": [
      {
        "name": "Alice Seller",
        "email": "seller1@test.com",
        "password": "12345678",
        "organization_name": "Alice Store"
      },
      {
        "name": "Bob Seller",
        "email": "seller2@test.com",
        "password": "12345678",
        "organization_name": "Bob Store"
      }
    ]
  }')

SELLERS_STATUS=$(echo "$SELLERS_RESPONSE" | tail -n1)
SELLERS_BODY=$(echo "$SELLERS_RESPONSE" | head -n-1)

if [ "$SELLERS_STATUS" = "201" ]; then
  echo -e "${GREEN}  Both sellers created successfully.${NC}"
elif [ "$SELLERS_STATUS" = "409" ]; then
  echo -e "${CYAN}  One or both sellers already exist, skipping creation.${NC}"
else
  echo -e "${RED}  Failed to create sellers (HTTP ${SELLERS_STATUS}): ${SELLERS_BODY}${NC}"
  exit 1
fi

# ─── 2. Create Customer ──────────────────────────────────────────────────────

echo -e "${YELLOW}[2/5] Creating customer (customer@test.com)...${NC}"

CUSTOMER_RESPONSE=$(api_call POST "/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "name": "Test Customer",
      "email": "customer@test.com",
      "password": "12345678"
    }]
  }')

CUSTOMER_STATUS=$(echo "$CUSTOMER_RESPONSE" | tail -n1)
CUSTOMER_BODY=$(echo "$CUSTOMER_RESPONSE" | head -n-1)

if [ "$CUSTOMER_STATUS" = "201" ]; then
  echo -e "${GREEN}  Customer created successfully.${NC}"
elif [ "$CUSTOMER_STATUS" = "409" ]; then
  echo -e "${CYAN}  Customer already exists, skipping creation.${NC}"
else
  echo -e "${RED}  Failed to create customer (HTTP ${CUSTOMER_STATUS}): ${CUSTOMER_BODY}${NC}"
  exit 1
fi

# ─── Helper: login seller and return access token ────────────────────────────

login_seller() {
  local email="$1"
  local password="$2"

  local RESPONSE
  RESPONSE=$(api_call POST "/seller/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${email}\", \"password\": \"${password}\"}")

  local STATUS
  STATUS=$(echo "$RESPONSE" | tail -n1)
  local BODY
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$STATUS" != "200" ]; then
    echo -e "${RED}  Login failed for ${email} (HTTP ${STATUS}): ${BODY}${NC}"
    exit 1
  fi

  echo "$BODY" | jq -r '.access_token'
}

# ─── Helper: create 50 products for a seller token ───────────────────────────

# All 100 product names as a JSON array (used by jq — no shell escaping issues)
ALL_PRODUCT_NAMES='[
  "Wireless Headphones","Bluetooth Speaker","Smart Watch","USB-C Hub","Mechanical Keyboard",
  "Monitor Stand","Webcam HD","LED Desk Lamp","Portable Charger","Noise Cancelling Earbuds",
  "The Art of Programming","Clean Code","Design Patterns","DDD Distilled","Refactoring",
  "You Don'\''t Know JS","The Pragmatic Programmer","Introduction to Algorithms",
  "System Design Interview","Cracking the Coding Interview",
  "Running Shoes","Gym T-Shirt","Sports Socks","Compression Leggings","Athletic Cap",
  "Yoga Mat","Resistance Bands","Jump Rope","Sports Water Bottle","Gym Gloves",
  "Dumbbell Set","Foam Roller","Pull-up Bar","Protein Shaker","Knee Sleeve",
  "Wireless Mouse","HDMI Cable","Ethernet Cable","Power Strip","Screen Cleaner Kit",
  "Laptop Bag","Backpack Pro","Ergonomic Chair","Standing Desk","Webcam Light Ring",
  "USB Microphone","Gaming Mousepad","Cable Management Kit","Monitor Arm","Laptop Cooling Pad",
  "Gardening Gloves","Plant Pot Set","Garden Hose","Pruning Shears","Watering Can",
  "Coffee Maker","Electric Kettle","Air Fryer","Blender Pro","Toaster Oven",
  "Face Moisturizer","Sunscreen SPF 50","Vitamin C Serum","Hair Dryer Pro","Electric Toothbrush",
  "Building Blocks","Remote Control Car","Puzzle 1000 Pieces","Board Game Classic","Stuffed Animal Set",
  "Organic Coffee Beans","Green Tea Pack","Protein Bars Box","Extra Virgin Olive Oil","Honey Jar",
  "Car Phone Holder","Trunk Organizer","Seat Cover Premium","Dashboard Camera","Car Vacuum Cleaner",
  "Ballpoint Pens Pack","Sticky Notes Set","Desk Organizer","Whiteboard","Stapler Set",
  "Storage Bins","Filing Cabinet","Bookshelf","Cookbook Collection","Art Sketchbook",
  "Language Learning Kit","Music Theory Book","Photography Guide","Camping Tent","Sleeping Bag",
  "Hiking Boots","Trekking Poles","Headlamp","Canvas Tote Bag","Premium Umbrella"
]'

create_products() {
  local TOKEN="$1"
  local OFFSET="$2"   # 0 for seller1, 50 for seller2
  local LABEL="$3"

  # Use jq to build the entire payload — avoids locale/escaping issues entirely
  local PAYLOAD
  PAYLOAD=$(jq -n \
    --argjson offset "$OFFSET" \
    --argjson names "$ALL_PRODUCT_NAMES" \
    --argjson categories '["Electronics","Books","Clothing","Sports","Home & Garden","Beauty","Toys","Food & Beverages","Automotive","Office Supplies"]' \
    --argjson descriptions '["High quality product with excellent performance and durability.","Premium grade item designed for everyday use and long-lasting reliability.","Compact and lightweight, perfect for home or office.","Best-in-class product backed by great customer reviews.","Affordable and efficient solution for your needs.","Modern design with top-notch materials and craftsmanship.","Ideal for professionals and enthusiasts alike.","Versatile product suitable for multiple use cases.","Ergonomically designed for maximum comfort and productivity.","Eco-friendly and sustainably made with care."]' \
    '{
      products: [
        range(50) | . as $i |
        ($offset + $i) as $idx |
        {
          name:              $names[$idx],
          description:       $descriptions[$idx % ($descriptions | length)],
          category:          $categories[$idx % ($categories | length)],
          price:             ((5 + ($idx * 3 % 495)) + ($idx % 99) * 0.01 | (. * 100 | round) / 100),
          inventory_ammount: (10 + ($idx * 7 % 490))
        }
      ]
    }')

  local RESPONSE
  RESPONSE=$(echo "$PAYLOAD" | curl -s -w "\n%{http_code}" -X POST "${API_URL}/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d @-)

  local STATUS
  STATUS=$(echo "$RESPONSE" | tail -n1)
  local BODY
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$STATUS" = "201" ]; then
    local COUNT
    COUNT=$(echo "$BODY" | jq '.products | length')
    echo -e "${GREEN}  ${COUNT} products created for ${LABEL}.${NC}"
  else
    echo -e "${RED}  Failed to create products for ${LABEL} (HTTP ${STATUS}): ${BODY}${NC}"
    exit 1
  fi
}

# ─── 3. Login as Seller 1 + create products ──────────────────────────────────

echo -e "${YELLOW}[3/5] Logging in as Seller 1 (seller1@test.com) and creating 50 products...${NC}"
TOKEN1=$(login_seller "seller1@test.com" "12345678")
echo -e "${GREEN}  Logged in successfully.${NC}"
create_products "$TOKEN1" 0 "Seller 1 (Alice Store)"

# ─── 4. Login as Seller 2 + create products ──────────────────────────────────

echo -e "${YELLOW}[4/5] Logging in as Seller 2 (seller2@test.com) and creating 50 products...${NC}"
TOKEN2=$(login_seller "seller2@test.com" "12345678")
echo -e "${GREEN}  Logged in successfully.${NC}"
create_products "$TOKEN2" 50 "Seller 2 (Bob Store)"

# ─── 5. Done ─────────────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}[5/5] Seed complete!${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   All done!                           ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Sellers:"
echo -e "    ${CYAN}seller1@test.com${NC}  / password: ${CYAN}12345678${NC}  (Alice Store — 50 products)"
echo -e "    ${CYAN}seller2@test.com${NC}  / password: ${CYAN}12345678${NC}  (Bob Store  — 50 products)"
echo ""
echo -e "  Customer:"
echo -e "    ${CYAN}customer@test.com${NC} / password: ${CYAN}12345678${NC}"
echo ""
