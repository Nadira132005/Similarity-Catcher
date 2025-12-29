def generate_test_with_modified_problems(problems):
    """
    Generates a student/scholar test using only the problems provided by the user, with numbers slightly changed for each problem.
    """
    prompt = f"""
    You are an expert educator and test designer. Given the following list of problems, generate a test for students or scholars using only these problems, but change the numbers in each problem slightly to create new versions. Organize the test with easy, medium, and hard sections, and provide a grading rubric for each level.

    PROBLEMS:
    {problems}

    Respond with:
    1. A test with modified problems for each grading level (easy, medium, hard).
    2. A grading rubric for each level.
    """
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educator and test designer. Generate tests and grading rubrics using only the provided problems, with numbers changed.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=512,
            temperature=0.3,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            model=openrouter_model
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[ERROR] OpenRouter test generation failed: {e}"
def generate_student_test(chapter_text, related_chapters):
    """
    Generates a test for students/scholars based on a chapter, identifies significant related chapters, and creates questions with grading (easy, medium, hard).
    """
    prompt = f"""
    You are an expert educator and test designer. Given the following chapter text, identify the most significant chapters related to it, and then generate a test for students or scholars based on the content. The test should include questions graded as easy, medium, and hard, and provide a grading rubric for each level.

    CHAPTER TEXT: "{chapter_text}"

    RELATED CHAPTERS TO CONSIDER:
    {related_chapters}

    Respond with:
    1. A list of significant related chapters.
    2. A test with questions for each grading level (easy, medium, hard).
    3. A grading rubric for each level.
    """
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educator and test designer. Generate tests and grading rubrics for students/scholars based on provided chapters.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=512,
            temperature=0.3,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            model=openrouter_model
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[ERROR] OpenRouter test generation failed: {e}"
import httpx
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
openrouter_token = os.getenv("OPENROUTER_API_KEY")

print(f"OpenRouter Token Loaded: {'Yes' if openrouter_token else 'No'}")

# Use OpenRouter endpoint and model
openrouter_endpoint = "https://openrouter.ai/api/v1"
# Using Meta's Llama 3.2 3B - free and stable model
openrouter_model = "meta-llama/llama-3.2-3b-instruct:free"
proxy_url = os.getenv("PROXY_URL")

client = OpenAI(
    base_url=openrouter_endpoint,
    api_key=openrouter_token,
    http_client=httpx.Client(proxy=proxy_url) if proxy_url else None
)

system_prompt = """
You are a software testing assistant. Your task is to generate C# test cases that address and cover issues described by the user within the <user_issue> tag.
Use the HTML documentation files provided in <html_files> to understand the relevant class(es) and function(s). These HTML files contain the full API or class documentation—parse them carefully to identify only the classes and methods relevant to the user’s described issue.
Follow these instructions:
1. Analyze the <user_issue> content to understand the problem or bug.
2.Parse the HTML documentation in <html_files> to locate the class(es) and method(s) that are directly relevant to the issue.
3.Ignore unrelated classes or functions.
4.Focus only on what is necessary to write meaningful, targeted tests.
5. Use clear method names that describe the behavior being tested.
6. Include setup logic if needed.
7. Ensure edge cases and expected failures are covered where appropriate.
8. Your output should be a single, clean C# test file, ready to be integrated into a test suite.
"""

def ask_llm(prompt):
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=512,
            temperature=0.3,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            model=openrouter_model
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[ERROR] OpenRouter request failed: {e}"

def calculate_semantic_similarity(query, matches):
    """
    Uses LLM to calculate more accurate semantic similarity percentages.
    Returns a dict mapping match content to refined percentage.
    """
    import re
    try:
        # Build the comparison text
        matches_text = "\n\n".join([
            f"Match {i+1}:\n{match.get('content', '')}"
            for i, match in enumerate(matches)
        ])

        prompt = f"""You are a semantic similarity expert. Compare this query against each match and provide a similarity percentage (0-100%) for each based on semantic meaning.

Query:
{query}

Matches:
{matches_text}

IMPORTANT:
- Give varied percentages from 0-100%
- 80-100%: Nearly identical meaning
- 60-79%: Similar topic, related concepts
- 40-59%: Same general domain
- 20-39%: Some connection
- 0-19%: Unrelated

Respond with ONLY numbers in this exact format:
Match 1: XX%
Match 2: XX%
Match 3: XX%
Match 4: XX%
Match 5: XX%"""

        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a semantic similarity analyzer. Respond ONLY with percentages in the exact format requested.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=150,
            temperature=0.1,
            model=openrouter_model
        )

        result_text = response.choices[0].message.content.strip()

        # Parse percentages from response
        percentages = []
        for line in result_text.split('\n'):
            match = re.search(r'(\d+)%', line)
            if match:
                percentages.append(float(match.group(1)) / 100.0)

        # Map percentages back to matches
        refined_matches = {}
        for i, match in enumerate(matches):
            if i < len(percentages):
                refined_matches[match.get('content', '')] = percentages[i]
            else:
                # Fallback to original if parsing failed
                refined_matches[match.get('content', '')] = match.get('match', 0)

        return refined_matches

    except Exception as e:
        import logging
        logging.warning(f"LLM similarity calculation failed: {e}, using original scores")
        # Return original scores as fallback
        return {match.get('content', ''): match.get('match', 0) for match in matches}

def summary_generator(input_text, entries):
    try:
        # Concatenate all inquiries for a single request
        inquiries_text = "\n\n".join([f"Inquiry {i+1}: {entry}" for i, entry in enumerate(entries)])
        prompt = f"""
        You are an expert technical analyst. Given the following input text and a list of inquiries, analyze their semantic similarity, technical context, and problem domain relevance.

        INPUT TEXT:
        "{input_text}"

        INQUIRIES TO COMPARE AGAINST:
        {inquiries_text}

        For each inquiry, provide a similarity percentage (0-100%) and a brief explanation of how the input text is relevant to the inquiry. Then, generate a comprehensive summary of the overall results and their relevance to the inquiries.

        Respond in the following format:
        Inquiry 1: [percentage]% - [short explanation]
        Inquiry 2: [percentage]% - [short explanation]
        ...
        Summary: [comprehensive summary]
        """
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert technical analyst specializing in inquiry similarity analysis. Provide similarity percentages and concise explanations for each inquiry, followed by a comprehensive summary of the overall relevance.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=512,
            temperature=0.3,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            model=openrouter_model
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[ERROR] OpenRouter analysis failed: {e}"
