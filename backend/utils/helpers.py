# backend/utils/helpers.py
import re
import difflib
from models import edu_vector

class ChapterCache:
    """
    Preload chapters into memory and maintain display_name -> list of cache_keys mapping.
    Handles many-to-one mapping for merged chapters and fuzzy lookup.
    """
    def __init__(self, vectordb):
        self.vectordb = vectordb
        self.chapters = {}        # raw_cache_key -> content (list of strings)
        self.display_map = {}     # normalized display_name -> list of raw_cache_keys
        self._load_cache()        # This is where the error triggered

    def _normalize(self, s: str) -> str:
        """Normalize string for matching: lowercase, remove special chars, collapse spaces."""
        s = str(s).lower().strip()
        s = re.sub(r'[^a-z0-9 ]', '', s)
        s = re.sub(r'\s+', ' ', s)
        return s

    def _generate_display_name(self, raw_key: str) -> str:
        """Maps raw DB keys to short, friendly names."""
        name = re.sub(r'^\d+[_-]*', '', raw_key).lower()
        pattern = r'(period education guide full final|human-reproduction|humanreproduction|legal rights of women)[\s_-]*chapter[-]?(\d+)'
        match = re.search(pattern, name)
        
        if match:
            base, chap_num = match.groups()
            if "period" in base: topic_name = "Periods"
            elif "women" in base: topic_name = "Women Rights"
            elif "human" in base: topic_name = "Human Reproduction"
            else: topic_name = base.title()
            return f"{topic_name} - {chap_num}"

        name = re.sub(r'[_-]+', ' ', name)
        return ' '.join([w.capitalize() for w in name.split()])

    def _load_cache(self):
        """Load all chapters from the vector DB into memory."""
        all_chapters = edu_vector.get_all_chapters(self.vectordb)
        
        for raw_key in all_chapters:
            norm_key = self._normalize(raw_key)

            if any(word in norm_key for word in ["intro", "preface", "overview", "readingmaterial"]):
                continue

            content = edu_vector.get_chapter_content(self.vectordb, raw_key)
            if content:
                # Ensure content is stored as a list of strings
                self.chapters[raw_key] = content if isinstance(content, list) else [content]
                
                # Initially map the raw key to its own friendly name
                display_name = self._generate_display_name(raw_key)
                self.add_display_name(display_name, raw_key)
        
        print(f"✅ Cache Loaded: {len(self.chapters)} files mapped.")

    def add_display_name(self, display_name: str, cache_keys: any):
        """Map normalized name to a LIST of raw keys to handle merges."""
        normalized_name = self._normalize(display_name)
        if normalized_name not in self.display_map:
            self.display_map[normalized_name] = []
        
        if isinstance(cache_keys, list):
            for k in cache_keys:
                if k not in self.display_map[normalized_name]:
                    self.display_map[normalized_name].append(k)
        else:
            if cache_keys not in self.display_map[normalized_name]:
                self.display_map[normalized_name].append(cache_keys)

    def get_chapter(self, name: str):
        """Retrieve and merge content from all keys associated with a name."""
        normalized = self._normalize(name)
        raw_keys = self.display_map.get(normalized, [])

        if not raw_keys and name in self.chapters:
            raw_keys = [name]

        if not raw_keys:
            # Fuzzy match as a last resort
            matches = difflib.get_close_matches(normalized, self.display_map.keys(), n=1, cutoff=0.5)
            if matches:
                raw_keys = self.display_map[matches[0]]

        if not raw_keys:
            return []

        all_content = []
        for key in raw_keys:
            content = self.chapters.get(key, [])
            all_content.extend(content)
            
        return all_content

    def list_chapters(self):
        """Return raw keys for the initial listing process."""
        return list(self.chapters.keys())