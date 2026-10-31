"""Schemas handed to Gemini for structured output. Deliberately free of default values
(the Gemini response-schema format does not accept them)."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class LLMProject(BaseModel):
    title: str
    description: str
    tech_stack: list[str]


class LLMEducation(BaseModel):
    degree: str
    branch: str
    institution: str
    graduation_year: Optional[int]
    cgpa: Optional[float]


class LLMExperience(BaseModel):
    company: str
    role: str
    duration: str
    description: str


class LLMResumeAnalysis(BaseModel):
    skills: list[str]
    education: list[LLMEducation]
    experience: list[LLMExperience]
    projects: list[LLMProject]
    summary: str


class LLMSkillRecommendation(BaseModel):
    skill: str
    why: str
    learn_from: str
    estimated_time: str


class LLMSkillGap(BaseModel):
    recommendations: list[LLMSkillRecommendation]


class LLMAtsAdvice(BaseModel):
    improvement_suggestions: list[str]
    overall_feedback: str


class LLMImprovedResume(BaseModel):
    summary: str
    skills: list[str]
    experience: list[LLMExperience]
    projects: list[LLMProject]
    suggestions: list[str]
