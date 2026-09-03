#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VID="$ROOT/public/media/videos"
POST="$ROOT/public/media/posters"
mkdir -p "$VID" "$POST"

make_clip() {
  local id="$1"
  local c0="$2"
  local c1="$3"
  local freq="$4"
  local dur="$5"
  local title="$6"

  echo "Generating $id ($title)..."
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "gradients=s=1280x720:c0=${c0}:c1=${c1}:x0=0:y0=0:x1=1280:y1=720:duration=${dur}:speed=0.08" \
    -f lavfi -i "sine=frequency=${freq}:sample_rate=44100:duration=${dur}" \
    -f lavfi -i "sine=frequency=$((freq*2)):sample_rate=44100:duration=${dur}" \
    -filter_complex "[1:a][2:a]amix=inputs=2:duration=first,volume=0.35[a];[0:v]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${title}':fontcolor=white@0.85:fontsize=54:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black@0.5:shadowx=2:shadowy=2[v]" \
    -map "[v]" -map "[a]" \
    -c:v libx264 -pix_fmt yuv420p -preset veryfast -crf 23 \
    -c:a aac -b:a 128k -shortest \
    "$VID/${id}.mp4"

  ffmpeg -y -hide_banner -loglevel error \
    -ss 1 -i "$VID/${id}.mp4" -frames:v 1 -q:v 2 "$POST/${id}.jpg"
}

# id, color0, color1, baseFreq, duration, title
make_clip "neon-tide"      "0x0B3D3E" "0xF4A261" 220 12 "Neon Tide"
make_clip "glass-horizon"  "0x1B4332" "0x95D5B2" 196 11 "Glass Horizon"
make_clip "ember-lane"     "0x3D0C11" "0xE76F51" 165 13 "Ember Lane"
make_clip "silver-rush"    "0x1D3557" "0xA8DADC" 247 10 "Silver Rush"
make_clip "volt-garden"    "0x264653" "0x2A9D8F" 185 12 "Volt Garden"
make_clip "paper-moon"     "0x22223B" "0xC9ADA7" 210 11 "Paper Moon"
make_clip "coastline-fm"   "0x023E8A" "0x90E0EF" 233 14 "Coastline FM"
make_clip "amber-static"   "0x2B2D42" "0xEF8354" 174 12 "Amber Static"

echo "Done. Clips in $VID"