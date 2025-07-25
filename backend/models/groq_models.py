"""
Groq Models Configuration and Management
"""

# Available Groq models (updated as of January 2025)
AVAILABLE_MODELS = {
    "llama3-8b-8192": {
        "name": "Llama 3 8B",
        "max_tokens": 8192,
        "recommended_for": "general chat, reasoning",
        "active": True
    },
    "llama3-70b-8192": {
        "name": "Llama 3 70B", 
        "max_tokens": 8192,
        "recommended_for": "complex reasoning, detailed responses",
        "active": True
    },
    "gemma-7b-it": {
        "name": "Gemma 7B IT",
        "max_tokens": 8192,
        "recommended_for": "instruction following",
        "active": True
    },
    "mixtral-8x7b-32768": {
        "name": "Mixtral 8x7B",
        "max_tokens": 32768,
        "recommended_for": "long context",
        "active": False,  # Decommissioned
        "replacement": "llama3-8b-8192"
    }
}

def get_best_available_model():
    """Get the best available model for chatbot use"""
    # Prioritize models by capability
    priority_models = [
        "llama3-70b-8192",  # Best for detailed responses
        "llama3-8b-8192",   # Good balance of speed and quality
        "gemma-7b-it"       # Backup option
    ]
    
    for model in priority_models:
        if model in AVAILABLE_MODELS and AVAILABLE_MODELS[model].get("active", False):
            return model
    
    # Fallback to first active model
    for model, config in AVAILABLE_MODELS.items():
        if config.get("active", False):
            return model
    
    return None

def get_model_max_tokens(model_name):
    """Get max tokens for a specific model"""
    if model_name in AVAILABLE_MODELS:
        return AVAILABLE_MODELS[model_name].get("max_tokens", 4096)
    return 4096  # Default fallback

def list_active_models():
    """List all currently active models"""
    return [model for model, config in AVAILABLE_MODELS.items() 
            if config.get("active", False)]
