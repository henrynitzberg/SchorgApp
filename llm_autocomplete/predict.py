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
    prompt = f"Generate a description for a ToDo item named '{ToDo_name}'."
    response = ollama.chat(prompt)
    return ToDoDescription(description=response)

# see ollama.chat