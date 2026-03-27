import os
import re
import requests
from abc import ABC, abstractmethod
from typing import Dict


class Provider(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> str:
        ...


class TemplateProvider(Provider):
    """Generate a template-based scouting report when no LLM is available."""
    
    def generate(self, prompt: str) -> str:
        action_match = re.search(r"Exercise label:\s*([\w-]+)", prompt)
        action = action_match.group(1) if action_match else "conditioning"

        metric_pairs = re.findall(r"-\s*([a-zA-Z0-9_]+):\s*([-+]?\d+(?:\.\d+)?)\s*([^\n]*)", prompt)
        metric_map = {}
        metric_units = {}
        for name, value, unit in metric_pairs:
            metric_map[name] = float(value)
            metric_units[name] = unit.strip()

        primary_metric = None
        if metric_map:
            primary_metric = max(metric_map.items(), key=lambda item: abs(item[1]))

        if action == "running":
            speed = metric_map.get("running_speed", metric_map.get("avg_speed", metric_map.get("movement_speed", 0.0)))
            cadence = metric_map.get("cadence", 0.0)
            stamina = metric_map.get("running_stamina", 0.0)
            return (
                f"The athlete shows clear running-specific performance signals, with an estimated speed of {speed:.2f} m/s. "
                f"Cadence is approximately {cadence:.1f} steps/min, indicating the current stride rhythm under load. "
                f"Stamina proxy is {stamina:.1f}%, suggesting {'strong endurance sustainability' if stamina >= 60 else 'an opportunity to improve pace retention over longer efforts'}. "
                "Overall running ability appears measurable and trackable for progressive training cycles."
            )

        if action == "jumping":
            count = metric_map.get("jump_count", 0.0)
            rate = metric_map.get("jump_rate", 0.0)
            rhythm = metric_map.get("jump_rhythm", 0.0)
            return (
                f"The video reflects jumping/skip-oriented movement with an estimated {int(round(count))} repetitions. "
                f"Average jump frequency is {rate:.1f} jumps/min, which captures work-rate capacity for this exercise style. "
                f"Rhythm consistency is {rhythm:.2f}, indicating {'stable repetition timing' if rhythm >= 0.5 else 'variable timing under fatigue'}. "
                "This provides a practical baseline for jump endurance and technical consistency progression."
            )

        if action == "pushup":
            reps = metric_map.get("pushup_count", 0.0)
            rate = metric_map.get("pushup_rate", 0.0)
            depth = metric_map.get("pushup_depth", 0.0)
            return (
                f"The athlete demonstrates push-up execution with an estimated {int(round(reps))} valid repetitions. "
                f"Current pace is {rate:.1f} reps/min, while depth proxy is {depth:.1f} degrees of elbow flexion. "
                "These indicators suggest useful capacity for upper-body endurance tracking and form-quality progression over time."
            )

        if action == "squat":
            reps = metric_map.get("squat_count", 0.0)
            rate = metric_map.get("squat_rate", 0.0)
            depth = metric_map.get("squat_depth", 0.0)
            return (
                f"The athlete shows squat-focused movement with an estimated {int(round(reps))} repetitions. "
                f"Squat pace is {rate:.1f} reps/min and depth proxy is {depth:.1f} degrees, indicating current range and endurance quality. "
                "The profile is suitable for monitoring lower-body strength-endurance improvements session by session."
            )

        if primary_metric:
            metric_name, metric_value = primary_metric
            metric_unit = metric_units.get(metric_name, "")
            return (
                f"The athlete demonstrates measurable movement quality in {action} activity. "
                f"The strongest signal is {metric_name} at {metric_value:.2f} {metric_unit}. "
                "Performance appears trackable and should be compared longitudinally with consistent camera setup and task duration."
            )

        return (
            "The athlete demonstrates a valid movement sample for analysis. "
            "Current output provides a baseline that can be improved with exercise-specific progression and repeated testing."
        )


class GeminiProvider(Provider):
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.model = model
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        self._fallback = TemplateProvider()

    def generate(self, prompt: str) -> str:
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
        }
        params = {"key": self.api_key}
        try:
            resp = requests.post(self.endpoint, params=params, json=payload, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            return data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        except Exception as exc:
            # Use template fallback instead of showing error message
            print(f"[GeminiProvider] API error: {exc}, using template fallback")
            return self._fallback.generate(prompt)


class OllamaProvider(Provider):
    def __init__(self, host: str = "http://localhost:11434", model: str = "llama3"):
        self.host = host.rstrip("/")
        self.model = model

    def generate(self, prompt: str) -> str:
        try:
            resp = requests.post(f"{self.host}/api/generate", json={"model": self.model, "prompt": prompt}, timeout=20)
            resp.raise_for_status()
            text_parts = []
            for line in resp.iter_lines():
                if not line:
                    continue
                import json

                data = json.loads(line)
                if "response" in data:
                    text_parts.append(data["response"])
            return "".join(text_parts) or ""
        except Exception as exc:
            return f"[ollama-fallback] {exc} | prompt: {prompt[:400]}"


def choose_provider(gemini_key: str | None, ollama_host: str | None, model: str) -> Provider:
    if gemini_key:
        return GeminiProvider(gemini_key, model)
    if ollama_host:
        return OllamaProvider(ollama_host, model)
    return TemplateProvider()
