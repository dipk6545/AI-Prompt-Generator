import difflib

def generate_diff(original: str, optimized: str) -> str:
    """
    Generates a unified diff or a line-by-line diff between the original and optimized prompt.
    We will format it similar to a git diff so the frontend can easily parse it.
    """
    original_lines = original.splitlines()
    optimized_lines = optimized.splitlines()

    # Generate a unified diff
    diff_generator = difflib.unified_diff(
        original_lines, 
        optimized_lines, 
        fromfile='Original', 
        tofile='Optimized', 
        lineterm=''
    )
    
    diff_text = '\n'.join(list(diff_generator))
    
    # If there's no diff (unlikely but possible), return empty or identical signal
    if not diff_text:
        return ""
        
    return diff_text
