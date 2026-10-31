# RAG over the resume

`app/rag/` adds Retrieval-Augmented Generation to the resume features **without changing any
endpoint, schema, score or fallback**.

## What RAG does (and does not do)
| Feature | Deterministic output (unchanged) | Where RAG is used |
|---|---|---|
| `/analyze-resume` | skills/education/... schema, cache key, sanitising | Resumes that fit the 18 000-char prompt are sent **byte-for-byte as before**. Only longer resumes use retrieval (sections Skills/Education/Experience/Projects/Summary are kept, filler is dropped) instead of cutting off the end. |
| `/match-resume` | `match_score`, matched/missing skills, eligibility | The explanation prompt gets short quotes from the resume proving each matched skill. |
| `/ats-analysis` | `ats_score`, missing keywords, formatting feedback | Advice prompt gets the resume passage where each missing keyword could be added. |
| `/skill-gaps` | `missing_skills`, curated fallback | Prompt gets the closest passage for each missing skill (better `why` / `estimated_time`). |
| `/build-resume` | offline fallback | Prompt gets verbatim excerpts for each project/experience so details are not lost while rewriting. |

Scores never read RAG output. If RAG is off, the embedder fails, or no passage is relevant, the
code path is identical to the original.

## How it works
`chunker.py` splits the PDF text by resume section (bullets stay intact, small overlap).
`retriever.py` keeps one index per PDF sha256 (LRU), embeds with the **existing** embedder
(sentence-transformers / Gemini / TF-IDF) and ranks hybrid: an exact or alias mention of the skill
outranks a purely semantic hit, cosine similarity breaks ties. Skills with no relevant passage are
omitted, so the LLM never receives fabricated evidence.

## Settings (.env)
`RAG_ENABLED=true` (set `false` to restore the exact old prompts), `RAG_CHUNK_WORDS=90`,
`RAG_CHUNK_OVERLAP=15`, `RAG_SNIPPET_CHARS=320`, `RAG_MAX_SNIPPETS=8`, `RAG_INDEX_CACHE=64`.

## Tests
`pytest -q tests/test_rag.py`
