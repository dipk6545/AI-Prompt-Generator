import re

def format_optimized_prompt(prompt: str) -> str:
    """
    Format the optimized prompt into clear, readable sections using Markdown headings,
    bullet points, and numbered lists if it is not already formatted.
    
    If the prompt already contains Markdown headings (e.g. lines starting with '#'),
    it will normalize the spacing but leave the existing structure intact.
    """
    if not prompt:
        return prompt
    
    prompt = prompt.strip()
    
    # 1. If it already contains markdown headers, normalize spacing and return
    if re.search(r'^#+\s+', prompt, re.MULTILINE):
        text = re.sub(r'\n{3,}', '\n\n', prompt)
        text = re.sub(r'(^#\s+.*)\n+(?!#)', r'\1\n\n', text, flags=re.MULTILINE)
        return text.strip()
        
    # 2. Heuristic-based structure engine for unstructured/paragraph prompts
    # Split by sentences, carriage returns, or start of numbered list items in the middle of sentences
    raw_sentences = re.split(r'\.\s+(?=[A-Z]|\d+\.)|\n+|(?=\b\d+\.\s)', prompt)
    
    role_sentences = []
    objective_sentences = []
    input_sentences = []
    format_sentences = []
    guidelines_sentences = []
    other_sentences = []
    
    for s in raw_sentences:
        s = s.strip()
        if not s:
            continue
            
        # Clean trailing commas, colons, and spaces
        s = re.sub(r'[,\s:]+$', '', s)
        
        # Clean double spaces
        s = re.sub(r'\s+', ' ', s)
        
        # Put period/colon back if split removed it and it doesn't end in punctuation/list marker
        s_lower = s.lower()
        if not s.endswith('.') and not s.endswith('?') and not s.endswith('!') and not re.match(r'^\d+\.', s):
            if any(k in s_lower for k in ["include", "includes", "following", "such as", "as follows"]):
                s += ':'
            else:
                s += '.'
            
        # Priority 1: Check if it is a list item
        if re.match(r'^\d+\.', s):
            format_sentences.append(s)
        elif re.match(r'^[-*•]', s):
            guidelines_sentences.append(s)
        # Priority 2: Keyword heuristics
        elif any(k in s_lower for k in ["act as", "you are a", "persona", "specializing in", "specialist"]):
            # Separate "with the goal of" / "objective of" if combined in the same sentence
            goal_match = re.search(r'(.*?)\b(with the goal of|with the objective of|to achieve)\b(.*)', s, re.IGNORECASE)
            if goal_match:
                role_part = re.sub(r'[,\s]+$', '', goal_match.group(1).strip())
                goal_part = (goal_match.group(2) + " " + goal_match.group(3)).strip()
                # Clean double spaces
                role_part = re.sub(r'\s+', ' ', role_part)
                goal_part = re.sub(r'\s+', ' ', goal_part)
                if role_part:
                    role_sentences.append(role_part if role_part.endswith('.') else role_part + '.')
                objective_sentences.append(goal_part if goal_part.endswith('.') else goal_part + '.')
            else:
                role_sentences.append(s)
        elif any(k in s_lower for k in ["goal is to", "objective", "task is to", "primary goal", "purpose of"]):
            objective_sentences.append(s)
        elif any(k in s_lower for k in ["when presented", "given a", "input data", "user will provide", "scenario"]):
            input_sentences.append(s)
        elif any(k in s_lower for k in ["structure", "format", "structured format", "respond with", "following format"]):
            format_sentences.append(s)
        elif any(k in s_lower for k in ["ensure", "avoid", "should be", "must", "tone is", "limit", "do not", "guideline", "rule"]):
            guidelines_sentences.append(s)
        else:
            other_sentences.append(s)
            
    sections = []
    
    if role_sentences:
        sections.append("# Role\n\n" + " ".join(role_sentences))
        
    if objective_sentences:
        obj_text = " ".join(objective_sentences)
        if obj_text and obj_text[0].islower():
            obj_text = obj_text[0].upper() + obj_text[1:]
        sections.append("# Objective\n\n" + obj_text)
        
    if input_sentences:
        sections.append("# Input\n\n" + " ".join(input_sentences))
        
    if format_sentences:
        items = []
        for fs in format_sentences:
            if re.match(r'^\d+\.', fs):
                items.append(fs)
            else:
                items.append(fs if fs.endswith(':') else fs + ':')
        sections.append("# Response Format\n\n" + "\n".join(items))
        
    if guidelines_sentences:
        bullet_points = []
        for gs in guidelines_sentences:
            clean_gs = re.sub(r'^[-*•]\s*', '', gs).strip()
            bullet_points.append(f"- {clean_gs}")
        sections.append("# Guidelines\n\n" + "\n".join(bullet_points))
        
    if other_sentences:
        sections.append("# Notes\n\n" + " ".join(other_sentences))
        
    return "\n\n".join(sections).strip()
