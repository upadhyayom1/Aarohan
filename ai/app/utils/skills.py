"""Skill normalisation, alias handling and alias-aware text search."""
from __future__ import annotations

import re
from functools import lru_cache
from typing import Optional

_SEP = r"[\s\.\-_/]+"
_SIMPLIFY_RE = re.compile(_SEP)


def simplify(skill: str) -> str:
    """'Node.js' -> 'nodejs', 'CI/CD' -> 'cicd', 'C++' -> 'c++'."""
    return _SIMPLIFY_RE.sub("", (skill or "").strip().lower())


# canonical display name -> known variants
SKILL_ALIASES: dict[str, list[str]] = {
    "JavaScript": ["js", "java script", "ecmascript", "es6", "vanilla js"],
    "TypeScript": ["ts"],
    "Python": ["py", "python3", "python 3"],
    "C++": ["cpp", "cplusplus"],
    "C#": ["csharp", "c sharp"],
    "Go": ["golang"],
    "React": ["reactjs", "react.js", "react js"],
    "React Native": ["reactnative"],
    "Node.js": ["node", "nodejs", "node js"],
    "Express": ["expressjs", "express.js"],
    "Next.js": ["nextjs", "next js"],
    "Vue": ["vuejs", "vue.js"],
    "Angular": ["angularjs", "angular.js"],
    "Django": [],
    "Flask": [],
    "FastAPI": ["fast api"],
    "Spring Boot": ["springboot", "spring"],
    "PostgreSQL": ["postgres", "psql", "postgre sql", "pgsql"],
    "MySQL": ["my sql"],
    "MongoDB": ["mongo", "mongo db"],
    "SQL": ["structured query language"],
    "NoSQL": ["no sql"],
    "Redis": [],
    "REST API": ["rest", "restful", "restful api", "restful apis", "rest apis", "restful web services", "rest services"],
    "GraphQL": ["graph ql"],
    "Docker": ["containerization", "containers", "docker compose"],
    "Kubernetes": ["k8s"],
    "AWS": ["amazon web services", "amazon aws"],
    "GCP": ["google cloud", "google cloud platform"],
    "Azure": ["microsoft azure"],
    "CI/CD": ["cicd", "continuous integration", "continuous delivery", "continuous deployment"],
    "Git": ["github", "version control"],
    "Linux": ["ubuntu"],
    "Machine Learning": ["ml"],
    "Deep Learning": ["dl"],
    "NLP": ["natural language processing"],
    "Computer Vision": ["cv"],
    "TensorFlow": ["tf"],
    "PyTorch": ["torch"],
    "scikit-learn": ["sklearn", "scikit learn"],
    "Pandas": [],
    "NumPy": ["numpy"],
    "Data Structures and Algorithms": ["dsa", "data structures", "dsa and algorithms"],
    "Object Oriented Programming": ["oop", "oops", "object-oriented programming"],
    "HTML": ["html5"],
    "CSS": ["css3"],
    "Tailwind CSS": ["tailwind", "tailwindcss"],
    "LangChain": ["lang chain"],
    "RAG": ["retrieval augmented generation", "retrieval-augmented generation"],
    "Power BI": ["powerbi"],
    "Tableau": [],
    "Microservices": ["micro services", "microservice"],
}

_VARIANT_TO_CANON: dict[str, str] = {}
CANON_FORMS: dict[str, set[str]] = {}
for _canon, _variants in SKILL_ALIASES.items():
    _c = simplify(_canon)
    _VARIANT_TO_CANON[_c] = _c
    CANON_FORMS.setdefault(_c, set()).add(_canon.lower())
    for _v in _variants:
        _VARIANT_TO_CANON[simplify(_v)] = _c
        CANON_FORMS[_c].add(_v.lower())

# Pairs that embeddings tend to confuse but are NOT interchangeable.
CONFUSABLE_PAIRS: set[frozenset[str]] = {
    frozenset({"java", "javascript"}),
    frozenset({"c", "c++"}),
    frozenset({"c", "c#"}),
    frozenset({"c++", "c#"}),
    frozenset({"java", "c#"}),
    frozenset({"react", "reactnative"}),
    frozenset({"sql", "nosql"}),
}


def canonical(skill: str) -> str:
    s = simplify(skill)
    return _VARIANT_TO_CANON.get(s, s)


def is_confusable(a: str, b: str) -> bool:
    return frozenset({canonical(a), canonical(b)}) in CONFUSABLE_PAIRS


def _variant_pattern(variant: str) -> str:
    parts = [re.escape(p) for p in re.split(_SEP, variant.strip()) if p]
    return r"[\s.\-_/]*".join(parts)


@lru_cache(maxsize=4096)
def mention_regex(skill: str) -> Optional[re.Pattern[str]]:
    """Regex that finds `skill` (or any alias) as a whole term inside free text."""
    canon = canonical(skill)
    forms = {skill.strip().lower()} | CANON_FORMS.get(canon, set())
    usable = [f for f in forms if f and (len(simplify(f)) > 2 or re.search(r"[+#]", f))]
    if not usable:  # too short/ambiguous ("c", "r", "go") – rely on the skill list only
        return None
    body = "|".join(sorted((_variant_pattern(f) for f in usable), key=len, reverse=True))
    return re.compile(rf"(?<![A-Za-z0-9+#])(?:{body})(?![A-Za-z0-9+#])", re.IGNORECASE)


def mentions(skill: str, text: str) -> bool:
    rx = mention_regex(skill)
    return bool(rx and text and rx.search(text))


def keyword_hit(skill: str, text: str) -> bool:
    """Plain, alias-free keyword search — what a naive ATS would do."""
    if not skill or not text:
        return False
    return bool(re.search(rf"(?<![A-Za-z0-9]){re.escape(skill.strip().lower())}(?![A-Za-z0-9])", text.lower()))


# Vocabulary used by the offline (no-LLM) resume parser.
SKILL_VOCAB: list[str] = sorted(
    set(SKILL_ALIASES.keys())
    | {
        "Java", "Kotlin", "Swift", "Rust", "PHP", "Ruby", "Scala", "R", "MATLAB", "Bash", "Shell Scripting",
        "Spring", "Hibernate", "Laravel", "Rails", ".NET", "ASP.NET", "Svelte", "Redux", "jQuery", "Bootstrap",
        "Sass", "Webpack", "Vite", "npm", "Prisma", "Sequelize", "SQLAlchemy", "TypeORM", "Mongoose",
        "SQLite", "Oracle", "Cassandra", "Elasticsearch", "Kafka", "RabbitMQ", "Firebase", "Supabase",
        "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Nginx", "Apache", "Postman", "Swagger", "JWT",
        "OAuth", "Selenium", "Jest", "Pytest", "JUnit", "Cypress", "Agile", "Scrum", "Jira", "Figma",
        "OpenCV", "Keras", "Hugging Face", "Transformers", "LLM", "Prompt Engineering", "Vector Databases",
        "ChromaDB", "Pinecone", "FAISS", "Spark", "Hadoop", "Airflow", "ETL", "Data Analysis", "Statistics",
        "Excel", "Matplotlib", "Seaborn", "Android", "iOS", "Flutter", "Dart", "Unity", "Arduino",
        "Embedded Systems", "VLSI", "IoT", "Verilog", "AutoCAD", "SolidWorks", "Networking", "Cybersecurity",
        "System Design", "Operating Systems", "DBMS", "Computer Networks", "WebSockets", "Socket.IO",
        "Celery", "Pydantic", "Streamlit", "Gradio", "Selenium", "Web Scraping", "BeautifulSoup",
    },
    key=str.lower,
)
