import sys
from pythainlp.transliterate import romanize

def get_transliteration(word):
    try:
        return romanize(word)
    except Exception as e:
        print(f"Error transliterating word: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python transliterate.py <thai_word>", file=sys.stderr)
        sys.exit(1)
    
    thai_word = sys.argv[1]
    result = get_transliteration(thai_word)
    if result:
        print(result) 