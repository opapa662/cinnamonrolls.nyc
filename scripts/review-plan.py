#!/usr/bin/env python3
"""
review-plan.py — Sends a plan to ChatGPT for independent review.

Usage:
    python scripts/review-plan.py tasks/todo.md
    python scripts/review-plan.py tasks/todo.md --spec SPEC.md
    echo "my plan text" | python scripts/review-plan.py

Requires:
    OPENAI_API_KEY environment variable set
    pip install openai
"""

import sys
import os
import argparse
import json

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)


REVIEW_PROMPT = """You are a senior engineering reviewer. You've been given a development plan 
and optionally a project spec. Your job is to review the plan and provide honest, constructive feedback.

Review the plan for:
1. **Over-engineering** — Is this more complex than it needs to be? Could it be simpler?
2. **Missing edge cases** — What could go wrong that the plan doesn't address?
3. **Simpler alternatives** — Is there a fundamentally different (and easier) approach?
4. **Risks** — What's the riskiest part? What's most likely to cause problems?
5. **Completeness** — Does the plan cover enough to actually build from, or is it vague?

Respond in this exact format:

## Verdict: [APPROVE / REVISE / RETHINK]

## Strengths
- (what's good about this plan)

## Concerns
- (what worries you)

## Suggestions
- (specific changes you'd recommend)

## Simplicity Check
(Could this be done in a meaningfully simpler way? If yes, describe it.)

Keep your review concise and direct. No fluff.
"""


def read_file(path: str) -> str:
    """Read a file and return its contents."""
    try:
        with open(path, "r") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {path}")
        sys.exit(1)


def read_stdin() -> str:
    """Read from stdin if available."""
    if not sys.stdin.isatty():
        return sys.stdin.read()
    return ""


def review_plan(plan_text: str, spec_text: str = None) -> str:
    """Send plan to ChatGPT for review and return the response."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set.")
        print("Set it with: export OPENAI_API_KEY='your-key-here'")
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    user_message = f"## Plan to Review\n\n{plan_text}"
    if spec_text:
        user_message = f"## Project Spec\n\n{spec_text}\n\n---\n\n{user_message}"

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": REVIEW_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        max_tokens=1500,
    )

    return response.choices[0].message.content


def main():
    parser = argparse.ArgumentParser(
        description="Send a development plan to ChatGPT for review."
    )
    parser.add_argument(
        "plan_file",
        nargs="?",
        help="Path to the plan file (or pipe via stdin)",
    )
    parser.add_argument(
        "--spec",
        help="Path to SPEC.md for additional context",
        default=None,
    )
    args = parser.parse_args()

    # Get plan text
    if args.plan_file:
        plan_text = read_file(args.plan_file)
    else:
        plan_text = read_stdin()

    if not plan_text.strip():
        print("Error: No plan text provided. Pass a file path or pipe text via stdin.")
        sys.exit(1)

    # Get spec text if provided
    spec_text = None
    if args.spec:
        spec_text = read_file(args.spec)

    print("Sending plan to ChatGPT for review...\n")
    print("=" * 60)

    result = review_plan(plan_text, spec_text)
    print(result)

    print("\n" + "=" * 60)
    print("Review complete.")


if __name__ == "__main__":
    main()
