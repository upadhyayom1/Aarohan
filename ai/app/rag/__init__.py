"""Retrieval-Augmented Generation over a student's resume.

The deterministic scores (match %, ATS %, matched/missing skills) never depend on this
package. RAG only supplies *grounding snippets* to the LLM prompts, and a smarter way to
fit very long resumes into the parsing prompt. If RAG is disabled or fails, every service
falls back to its original behaviour."""
from app.rag.chunker import Chunk, split_resume
from app.rag.retriever import ResumeIndex, ResumeRAG

__all__ = ["Chunk", "split_resume", "ResumeIndex", "ResumeRAG"]
