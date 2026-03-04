# backend/utils/clean_chapter.py
import re

def clean_chapter(text: str) -> str:
    """
    Clean full chapter text for presentation:
    1. Remove unwanted patterns (resources, guides, etc.)
    2. Fix spaced-out words like 'W h e n' -> 'When'
    3. Normalize whitespace
    4. Keep paragraphs intact
    """

    # Step 1: Remove noisy patterns
    noisy_patterns = [
        r"Rack Your Brain.*",
        r"Previous Year.*",
        r"Resources.*",
        r"Apps.*",
        r"Definitions.*",
        r"Gray Matter.*",
        r"Watch this video.*",
        r"See[\s\S]{0,50}guide[\s\S]*"   # catches footer lines even if broken
    ]
    for pattern in noisy_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    # Step 2: Fix spaced-out words
    # Example: "W h e n y o u" -> "When you"
    def fix_spaced_block(match):
        block = match.group(0)
        # Collapse multiple spaces first
        block = re.sub(r"\s+", " ", block)
        # Then remove spaces *inside* words but keep word boundaries
        # e.g. "W h e n y o u" -> ["When", "you"]
        words = []
        for w in block.split():
            if len(w) > 1 and all(ch.isalpha() and len(ch) == 1 for ch in w.split()):
                # shouldn't trigger because split removes spacing
                words.append(w)
            else:
                # detect "W h e n"
                if re.fullmatch(r"(?:[A-Za-z]\s*){2,}", w + " "):
                    words.append(w.replace(" ", ""))
                else:
                    words.append(w)
        return " ".join(words)

    # This catches long runs of "letters with spaces" possibly multiple words
    text = re.sub(r'(?:[A-Za-z]\s){2,}[A-Za-z](?:\s+[A-Za-z]\s+[A-Za-z])+?', 
                  lambda m: "".join(ch if ch != " " else "" for ch in m.group(0)), text)

    # Step 3: Collapse multiple spaces/newlines
    text = re.sub(r'\n\s*\n', '\n\n', text)  # keep paragraph separation
    text = re.sub(r'[ \t]+', ' ', text)      # normalize spaces
    text = text.strip()

    return text
