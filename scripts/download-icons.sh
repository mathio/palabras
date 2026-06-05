#!/bin/bash
# Downloads icons from thiings.co for words missing icons.
# Usage: bash scripts/download-icons.sh
# Icons saved to public/icons/<word-id>.png

ICONS_DIR="public/icons"
BASE_URL="https://www.thiings.co/things"
CDN_PATTERN='https://lftz25oez4aqbxpq\.public\.blob\.vercel-storage\.com/[^"]*\.png'

download() {
  local id="$1"
  shift

  if [[ -f "$ICONS_DIR/$id.png" ]]; then
    echo "SKIP $id (already exists)"
    return
  fi

  for slug in "$@"; do
    local img_url
    img_url=$(curl -s --max-time 10 "$BASE_URL/$slug" | grep -o "$CDN_PATTERN" | head -1)
    if [[ -n "$img_url" ]]; then
      if curl -s -f --max-time 10 -o "$ICONS_DIR/$id.png" "$img_url"; then
        sips -z 256 256 "$ICONS_DIR/$id.png" --out "$ICONS_DIR/$id.png" > /dev/null 2>&1
        echo "OK   $id <- $slug"
        return
      fi
    fi
  done
  echo "MISS $id (tried: $*)"
}

# ─── A2 VERBS ────────────────────────────────────────────────────────────────
download a2-011 arrow-uturn-left return boomerang
download a2-012 hourglass clock stopwatch
download a2-013 magnifying-glass search loupe
download a2-014 handshake people two-people
download a2-015 shopping-bag paper-bag backpack
download a2-016 arrow-right forward chevron-right
download a2-017 door exit doorway
download a2-018 mirror reflection magic-wand
download a2-019 play-button rocket flag
download a2-020 checkmark finish-flag trophy
download a2-021 graduation-cap diploma book
download a2-022 phone telephone receiver
download a2-023 wrench gear tools
download a2-024 chef-hat cooking pot pan
download a2-025 wallet purse cash money
download a2-026 piggy-bank savings coin
download a2-027 brain lightbulb thought
download a2-028 star sparkle faith
download a2-029 heart feeling emotion
download a2-030 scales balance decision
download a2-031 arrows refresh change cycle
download a2-032 helping-hand hand-shake hands
download a2-033 speech-bubble blackboard chalkboard
download a2-034 house pin map-pin location
download a2-035 key lock padlock
download a2-036 fork fork-and-knife spoon plate
download a2-037 share split arrow-split
download a2-038 checklist list options
download a2-039 clock arrow-forward hourglass
download a2-040 shirt coat hanger jacket
download a2-041 map-pin location arrival flag
download a2-043 arrow-up stairs elevator escalator
download a2-044 arrow-down stairs-down escalator

# ─── A2 CONNECTORS & EXPRESSIONS ─────────────────────────────────────────────
download a2-046 speech-bubble thought-bubble dialogue
download a2-047 plus-circle plus add
download a2-048 clouds cloud rain
download a2-049 hourglass timer clock
download a2-050 arrow-right therefore next
download a2-051 clock time watch
download a2-052 checkmark tick done
download a2-053 lightning-bolt flash surprise
download a2-054 finish-flag flag trophy
download a2-055 question-mark question
download a2-056 question-mark question thought
download a2-057 target bullseye dartboard
download a2-058 speech-bubble thought opinion
download a2-059 thumbs-up agree handshake
download a2-060 star heart wish

# ─── A2 COMMON NOUNS ─────────────────────────────────────────────────────────
download a2-061 warning exclamation danger
download a2-062 lightbulb key solution
download a2-063 lightbulb idea thought
download a2-064 clipboard map plan
download a2-065 newspaper news
download a2-066 mobile-phone smartphone phone
download a2-067 message chat speech-bubble
download a2-068 lock padlock key password
download a2-069 email envelope letter
download a2-070 network wifi globe
download a2-071 laptop computer screen
download a2-072 brain lightbulb reason
download a2-073 trophy chart result

# ─── NATURE & ENVIRONMENT ────────────────────────────────────────────────────
download nat-001 field grass countryside meadow
download nat-002 tree pine evergreen
download nat-003 river wave water stream
download nat-004 lake water waves
download nat-005 ocean wave sea
download nat-006 mountain peak hill
download nat-007 beach umbrella sun-beach
download nat-008 leaf flower plant nature
download nat-009 thermometer sun-cloud weather
download nat-010 factory smoke pollution cloud
download nat-011 recycle recycling arrows
download nat-012 globe earth world

# ─── EDUCATION ───────────────────────────────────────────────────────────────
download edu-001 university building columns
download edu-002 pencil test exam paper
download edu-003 checkmark stamp pass tick
download edu-004 x-mark fail red-cross
download edu-005 report-card star grades
download edu-006 graduation-cap diploma scroll
download edu-007 diploma scroll certificate
download edu-008 medal award scholarship
download edu-009 globe speech-bubble language
download edu-010 school building

# ─── RELATIONSHIPS & SOCIAL ───────────────────────────────────────────────────
download rel-001 handshake hearts friendship
download rel-002 heart love
download rel-003 wedding-rings ring cake
download rel-004 birthday-cake cake candles
download rel-005 gift gift-box present
download rel-006 party-popper balloon confetti
download rel-007 handshake wave person
download rel-008 smiley-face smile thumbs-up
download rel-009 speech-bubbles lightning storm
download rel-010 dove peace heart forgive
download rel-011 broken-heart wave goodbye
download rel-012 calendar heart date

# ─── PLACES & LEISURE ────────────────────────────────────────────────────────
download pl-001 clapperboard popcorn cinema film
download pl-002 masks theatre drama stage
download pl-003 museum columns building art
download pl-004 bench tree park
download pl-005 houses neighbourhood map
download pl-006 bank building coin money
download pl-007 bookshelf books library
download pl-008 market stall shopping-bag
download pl-009 newspaper journal press
download pl-010 television tv screen
download pl-011 radio speaker antenna
download pl-012 clapperboard film movie

# ─── DIRECTIONS ──────────────────────────────────────────────────────────────
download dir-001 compass north arrow
download dir-002 compass south arrow-down
download dir-003 compass east
download dir-004 compass west
download dir-005 map-pin envelope address

# ─── FOOD & DRINK ADDITIONS ──────────────────────────────────────────────────
download food-d14 cake ice-cream dessert
download food-d15 salad soup bowl starter
download food-d16 steak plate dinner main-course
download food-d17 olives tapas plate food
download food-d18 chilli-pepper pepper fire hot
download food-d19 candy sugar sweet lollipop
download food-d20 salt pretzel savoury
download food-d21 carrot leaf vegetable broccoli
download food-d22 water bottle bubbles glass

# ─── HOME ADDITIONS ───────────────────────────────────────────────────────────
download home-019 house key rent
download home-020 sofa couch armchair furniture
download home-021 elevator lift button
download home-022 radiator fire heater flame
download home-023 garage car door
download home-024 flower garden plant pot
download home-025 moving-boxes truck van box
download home-026 invoice paper receipt bill
download home-027 apartment building flat

# ─── HEALTH ADDITIONS ────────────────────────────────────────────────────────
download health-008 calendar stethoscope clipboard
download health-013 lightning-bolt pain ache
download health-014 flower sneeze pollen allergy
download health-015 thermometer sick face ill
download health-016 bandage plaster heal
download health-017 syringe injection needle vaccine
download health-018 shield stethoscope insurance
download health-019 bandage plaster wound

# ─── WORK ADDITIONS ──────────────────────────────────────────────────────────
download work-011 clipboard folder project
download work-012 person handshake client
download work-013 document chart report
download work-014 clock calendar deadline
download work-015 arrow-up trophy promotion
download work-016 house laptop remote work
download work-018 desk office chair

# ─── A2 ADJECTIVES ───────────────────────────────────────────────────────────
download desc-030 sofa pillow cushion comfortable
download desc-031 leaf zen calm meditation
download desc-032 speaker noise loudspeaker
download desc-033 soap sparkle clean
download desc-034 mud stain dirty
download desc-035 lightning design modern
download desc-036 hourglass clock ancient old
download desc-037 wrench toolbox spanner
download desc-038 mountain puzzle difficult hard
download desc-039 feather smile easy
download desc-040 star sparkle special
download desc-041 scales balance different
download desc-042 twins mirror similar
download desc-043 warning skull danger
download desc-044 shield protection safe

# ─── MORE A2 ADJECTIVES ───────────────────────────────────────────────────────
download desc-045 calendar clock busy
download desc-046 bird dove free
download desc-048 lightning star exciting
download desc-049 smile sun pleasant
download desc-050 alien ghost strange

# ─── ESSENTIAL VERBS (A1) ────────────────────────────────────────────────────
download ev-016 gift hand giving
download ev-017 eye glasses sight
download ev-018 speech-bubble microphone mouth
download ev-019 moon bed sleep night
download ev-020 cup coffee mug drink

# ─── MORE A2 VERBS ────────────────────────────────────────────────────────────
download a2-074 scales gavel rule obligation
download a2-075 brain memory lightbulb
download a2-076 car steering-wheel drive
download a2-077 paper-plane envelope send
download a2-078 bed sofa rest relax
download a2-079 map-pin binoculars visit
download a2-080 party-popper balloon celebrate
download a2-081 envelope invitation card
download a2-082 price-tag coin tag cost
download a2-083 scales heart prefer choice
download a2-084 shirt hanger clothes
download a2-085 hand heart care
download a2-086 broken-heart hammer shatter break

# ─── MORE A2 NOUNS ────────────────────────────────────────────────────────────
download a2-087 credit-card card payment
download a2-088 island palm-tree beach tropical
download a2-089 lighthouse beach coast
download a2-090 globe passport world abroad
download a2-091 book pencil subject
download a2-092 book scroll history story
download a2-093 corner turn street
download a2-094 arrows opposite direction

echo ""
echo "Done. Missing icons listed above as MISS."
