import json

with open('c:/dev/os-koll/public/data/allsvenskan_matches.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

matches = data['matches']
unique_matches = []
seen_links = set()

for m in matches:
    key = (m.get('link'), m.get('home'), m.get('away'), m.get('date'))
    if key not in seen_links:
        unique_matches.append(m)
        seen_links.add(key)

print(f"Total matches: {len(matches)}")
print(f"Unique matches: {len(unique_matches)}")

data['matches'] = unique_matches

with open('c:/dev/os-koll/public/data/allsvenskan_matches.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
