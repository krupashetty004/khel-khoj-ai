from typing import List
from khelkhoj_ai.report.schema import Metric, ScoutingReport
from khelkhoj_ai.providers.providers import Provider


def build_prompt(athlete_id: str, video_id: str, metrics: List[Metric], action_label: str | None) -> str:
    metric_lines = "\n".join([f"- {m.name}: {m.value} {m.unit or ''}" for m in metrics])
    return (
        "You are a scout generating a concise field report.\n"
        f"Athlete ID: {athlete_id}\nVideo ID: {video_id}\n"
        f"Exercise label: {action_label or 'conditioning'}\n"
        "Metrics:\n" + metric_lines + "\n"
        "Write 4-6 sentences focused on the detected exercise and metric interpretation for that specific movement pattern."
    )


def _recommendations_for_action(action_label: str | None) -> List[str]:
    action = (action_label or "").lower()
    if action == "running":
        return [
            "Include interval blocks and progression runs to improve running stamina and pace stability.",
            "Add cadence drills (metronome or stride rhythm work) to improve step efficiency.",
            "Track weekly pace consistency over fixed distance to monitor endurance gains.",
        ]
    if action == "jumping":
        return [
            "Build lower-limb elastic strength with controlled plyometric progressions.",
            "Use round-based jump sets to improve jump-rate endurance over longer durations.",
            "Monitor landing control and rhythm consistency to reduce fatigue-related form drop.",
        ]
    if action == "pushup":
        return [
            "Prioritize full-depth reps with stable trunk alignment before increasing volume.",
            "Use tempo push-up sets to improve control and rep consistency.",
            "Progress weekly total reps while keeping form quality high in later sets.",
        ]
    if action == "squat":
        return [
            "Improve squat depth gradually while maintaining neutral knee tracking.",
            "Train controlled eccentric tempo to increase movement consistency.",
            "Use repetition blocks to build squat endurance without sacrificing technique.",
        ]
    if action == "lunge":
        return [
            "Train unilateral control with equal left/right rep quality.",
            "Focus on front-knee alignment and balanced depth in each lunge rep.",
            "Build lunge endurance through structured set progression while preserving technique.",
        ]
    if action == "plank":
        return [
            "Prioritize strict body-line alignment and minimize hip drift during holds.",
            "Increase hold duration progressively while maintaining breathing control.",
            "Add anti-rotation core work to improve trunk stability under fatigue.",
        ]
    if action == "situp":
        return [
            "Use controlled tempo sit-up sets to improve core endurance and rhythm.",
            "Maintain neutral neck position and full range without momentum-assisted reps.",
            "Track reps-per-minute over fixed windows to monitor progression.",
        ]
    if action == "burpee":
        return [
            "Develop cycle efficiency by standardizing each burpee phase transition.",
            "Use interval work-rest structures to improve sustainable burpee pace.",
            "Monitor rep quality late in sets to avoid technique breakdown under fatigue.",
        ]
    return [
        "Maintain a consistent movement tempo and track quality across sessions.",
        "Add targeted mobility and stability drills relevant to the exercise pattern.",
        "Re-test with the same camera angle and duration for comparable progress tracking.",
    ]


def generate_report(
    athlete_id: str,
    video_id: str,
    metrics: List[Metric],
    action_label: str | None,
    provider: Provider,
) -> ScoutingReport:
    prompt = build_prompt(athlete_id, video_id, metrics, action_label)
    narrative = provider.generate(prompt)
    recommendations = _recommendations_for_action(action_label)
    return ScoutingReport(
        athlete_id=athlete_id,
        video_id=video_id,
        action_label=action_label,
        metrics=metrics,
        narrative=narrative,
        recommendations=recommendations,
        confidence=0.6,
        quality="draft",
    )
