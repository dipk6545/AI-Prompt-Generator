from enum import Enum
from pydantic import BaseModel
from typing import Optional, Dict, Any

class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class PipelineEvent(BaseModel):
    stage: str
    status: StepStatus
    progress: int
    description: str
    details: Optional[Dict[str, Any]] = None
    
    # Live metadata payload
    metadata: Optional[Dict[str, Any]] = None

    def to_sse_string(self) -> str:
        """Converts the model to an SSE-formatted data string."""
        import json
        data_str = json.dumps(self.dict())
        return f"data: {data_str}\n\n"
