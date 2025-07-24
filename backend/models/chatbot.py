import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class BatikChatbot:
    def __init__(self):
        # Initialize Groq API (free tier)
        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY", "")
        )
        
        # Load batik metadata
        self.batik_data = self._load_batik_metadata()
        
        # System prompt untuk konteks batik
        self.system_prompt = """Anda adalah asisten AI yang ahli tentang batik Indonesia, khususnya Batik Nitik dari Yogyakarta. 
        Anda dapat memberikan informasi tentang:
        - Asal-usul dan sejarah batik
        - Makna filosofis dari motif batik
        - Karakteristik visual dan simbolisme
        - Proses pembuatan batik
        
        Berikan jawaban yang informatif, singkat, dan menarik dalam Bahasa Indonesia.
        Jika ditanya tentang motif spesifik, berikan informasi detail tentang motif tersebut."""
        
    def _load_batik_metadata(self):
        """Load batik metadata from JSON file"""
        metadata_path = 'data/batik_metadata.json'
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def get_response(self, query, pattern_id=None):
        """Get chatbot response for batik-related queries"""
        try:
            # Construct context message
            context = self.system_prompt
            
            # Add specific pattern info if provided
            if pattern_id and pattern_id in self.batik_data:
                pattern_info = self.batik_data[pattern_id]
                context += f"\n\nInformasi tentang motif {pattern_info.get('name', pattern_id)}:\n"
                context += f"- Deskripsi: {pattern_info.get('description', 'Tidak ada deskripsi')}\n"
                context += f"- Makna: {pattern_info.get('meaning', 'Tidak ada informasi makna')}\n"
            
            # Create message for Groq API
            messages = [
                {"role": "system", "content": context},
                {"role": "user", "content": query}
            ]
            
            # Call Groq API (using free Mixtral model)
            if self.client.api_key:
                response = self.client.chat.completions.create(
                    model="mixtral-8x7b-32768",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500
                )
                return response.choices[0].message.content
            else:
                # Fallback response if no API key
                return self._get_fallback_response(query, pattern_id)
                
        except Exception as e:
            print(f"Chatbot error: {e}")
            return self._get_fallback_response(query, pattern_id)
    
    def _get_fallback_response(self, query, pattern_id):
        """Fallback responses when API is not available"""
        query_lower = query.lower()
        
        # Basic pattern matching for common questions
        if "apa itu" in query_lower or "what is" in query_lower:
            if pattern_id and pattern_id in self.batik_data:
                info = self.batik_data[pattern_id]
                return f"Motif {info.get('name', pattern_id)} adalah {info.get('description', 'motif batik tradisional yang indah.')} {info.get('meaning', '')}"
            else:
                return "Batik adalah warisan budaya Indonesia yang menggunakan teknik pewarnaan dengan malam (lilin) untuk menciptakan motif yang indah pada kain."
        
        elif "makna" in query_lower or "filosofi" in query_lower:
            if pattern_id and pattern_id in self.batik_data:
                info = self.batik_data[pattern_id]
                meaning = info.get('meaning', 'Setiap motif batik memiliki makna filosofis yang mendalam.')
                return f"Makna dari motif {info.get('name', pattern_id)}: {meaning}"
            else:
                return "Setiap motif batik memiliki makna filosofis yang mendalam, mencerminkan nilai-nilai budaya dan kehidupan masyarakat Jawa."
        
        elif "sejarah" in query_lower:
            return "Batik Nitik berasal dari Yogyakarta dan merupakan salah satu jenis batik klasik. Motifnya terinspirasi dari tenun India tetapi telah diadaptasi dengan nilai-nilai lokal Jawa."
        
        else:
            return "Saya dapat membantu Anda mengetahui tentang batik. Silakan tanyakan tentang asal-usul, makna, atau karakteristik motif batik yang Anda inginkan."