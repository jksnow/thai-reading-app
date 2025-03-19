import sys
from pythainlp.transliterate import romanize

def get_transliteration(word):
    try:
        # Use default romanize with royin engine (Royal Thai General System of Transcription)
        return romanize(word, engine="royin")
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