"""Generate a realistic text-based sample resume PDF (needs `reportlab`, a dev dependency).

    python scripts/make_sample_pdf.py ./sample_data/prateek_resume.pdf
"""
from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer

RESUME = {
    "name": "Prateek Sharma",
    "contact": "prateek@mnnit.ac.in | +91 98765 43210 | github.com/prateek | linkedin.com/in/prateek",
    "sections": [
        ("Summary", ["Backend-focused CSE student building REST services and LLM-powered applications."]),
        ("Education", ["B.Tech, Computer Science and Engineering, MNNIT Allahabad (2023 - 2027)", "CGPA: 8.5"]),
        ("Skills", ["Python, FastAPI, Postgres, ReactJS, REST APIs, Git, containerization with Docker Compose"]),
        ("Experience", [
            "Backend Intern, XYZ Corp (May 2026 - Jul 2026)",
            "- Built 6 FastAPI microservices handling 10k requests per day",
            "- Cut average API latency by 35% by adding Redis caching",
        ]),
        ("Projects", [
            "CogniVault - FastAPI chatbot with RAG and session memory (Python, FastAPI, LangChain)",
            "- Implemented retrieval over 2,000 documents with 90% answer relevance in manual tests",
            "CampusLink - placement portal with role-based dashboards (React, Node.js, PostgreSQL)",
        ]),
    ],
}


def build(path: Path) -> None:
    styles = getSampleStyleSheet()
    story = [Paragraph(RESUME["name"], styles["Title"]), Paragraph(RESUME["contact"], styles["Normal"]), Spacer(1, 8)]
    for heading, lines in RESUME["sections"]:
        story.append(Paragraph(heading, styles["Heading2"]))
        bullets = [l[2:] for l in lines if l.startswith("- ")]
        for l in lines:
            if not l.startswith("- "):
                story.append(Paragraph(l, styles["Normal"]))
        if bullets:
            story.append(ListFlowable([ListItem(Paragraph(b, styles["Normal"])) for b in bullets], bulletType="bullet"))
    path.parent.mkdir(parents=True, exist_ok=True)
    SimpleDocTemplate(str(path), pagesize=A4).build(story)


if __name__ == "__main__":
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "sample_data/prateek_resume.pdf")
    build(out)
    print(f"wrote {out}")
