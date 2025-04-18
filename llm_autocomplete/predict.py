import ollama
from pydantic import BaseModel


class ToDoDescription(BaseModel):
    description: str


class DeliverableDescription(BaseModel):
    description: str


def generate_todo_description(ToDo_name: str) -> ToDoDescription:
    """
    Generate a description for a ToDo item using the Ollama model.
    """
    prompt = f"Generate a description for a ToDo item named '{ToDo_name}'. Please return the response in JSON format."
    response = ollama.chat(
        model="mistral",
        messages=[{"role": "user", "content": prompt}],
        format=ToDoDescription.model_json_schema(),
        options={"temperature": 0.0, "max_tokens": 150},
    )
    return ToDoDescription(description=response)


def generate_deliverable_description(deliverable_name: str) -> DeliverableDescription:
    """
    Generate a description for a ToDo item using the Ollama model.
    """
    prompt = f"Generate a description for a deliverable item (like a homework assignment, or work project) named '{deliverable_name}'. Please return the response in JSON format."
    response = ollama.chat(
        model="mistral",
        messages=[{"role": "user", "content": prompt}],
        format=DeliverableDescription.model_json_schema(),
        options={"temperature": 0.0, "max_tokens": 150},
    )
    return DeliverableDescription(description=response)