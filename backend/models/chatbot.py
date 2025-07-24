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
        
        # Load batik metadata from training data
        self.batik_data = self._load_batik_training_data()
        
        # System prompt untuk konteks batik
        self.system_prompt = """Anda adalah asisten AI yang ahli tentang batik Indonesia, khususnya Batik Nitik dari Yogyakarta dengan 60 motif tradisional. 
        Anda dapat memberikan informasi tentang:
        - Asal-usul dan sejarah batik
        - Makna filosofis dari motif batik
        - Karakteristik visual dan simbolisme
        - Proses pembuatan batik
        
        Berikan jawaban yang informatif, singkat, dan menarik dalam Bahasa Indonesia.
        Jika ditanya tentang motif spesifik, berikan informasi detail tentang motif tersebut."""
        
    def _load_batik_training_data(self):
        """Load batik metadata from training data jsonl file"""
        batik_data = {}
        jsonl_path = 'fine_tuning/batik_training_data.jsonl'
        
        if os.path.exists(jsonl_path):
            try:
                with open(jsonl_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        data = json.loads(line.strip())
                        messages = data.get('messages', [])
                        
                        # Extract motif information from training data
                        for message in messages:
                            if message['role'] == 'user':
                                content = message['content']
                                if 'motif' in content and ('Apa itu' in content or 'apa itu' in content):
                                    # Extract motif name
                                    motif_name = content.replace('Apa itu motif ', '').replace('apa itu motif ', '').replace('?', '')
                                    
                                    # Find corresponding assistant response
                                    for resp_msg in messages:
                                        if resp_msg['role'] == 'assistant':
                                            response = resp_msg['content']
                                            # Parse the response to extract information
                                            if 'adalah' in response:
                                                parts = response.split('adalah', 1)
                                                if len(parts) > 1:
                                                    description_and_meaning = parts[1].strip()
                                                    
                                                    # Extract description and meaning
                                                    if 'Motif ini memiliki makna' in description_and_meaning:
                                                        desc_parts = description_and_meaning.split('Motif ini memiliki makna', 1)
                                                        description = desc_parts[0].strip().rstrip('.')
                                                        meaning = desc_parts[1].strip() if len(desc_parts) > 1 else ""
                                                    else:
                                                        description = description_and_meaning.strip()
                                                        meaning = ""
                                                    
                                                    # Convert to snake_case for consistency
                                                    motif_id = motif_name.lower().replace(' ', '_')
                                                    
                                                    batik_data[motif_id] = {
                                                        'name': motif_name,
                                                        'description': description,
                                                        'meaning': meaning
                                                    }
                                            break
            except Exception as e:
                print(f"Error loading training data: {e}")
        
        return batik_data
    
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
        """Enhanced fallback responses using training data"""
        query_lower = query.lower()
        
        # Check if asking about specific pattern
        if pattern_id and pattern_id in self.batik_data:
            info = self.batik_data[pattern_id]
            
            if "apa itu" in query_lower or "what is" in query_lower:
                response = f"Motif {info['name']} adalah {info['description']}."
                if info['meaning']:
                    response += f" Motif ini memiliki makna {info['meaning']}"
                return response
            
            elif "makna" in query_lower or "filosofi" in query_lower:
                if info['meaning']:
                    return f"Makna dari motif {info['name']}: {info['meaning']}"
                else:
                    return f"Motif {info['name']} memiliki makna filosofis yang mendalam dalam budaya Jawa."
        
        # Check if query contains any motif name
        for motif_id, info in self.batik_data.items():
            if info['name'].lower() in query_lower or motif_id.replace('_', ' ') in query_lower:
                if "makna" in query_lower:
                    return f"Makna dari motif {info['name']}: {info['meaning']}" if info['meaning'] else f"Motif {info['name']} memiliki nilai filosofis yang mendalam."
                else:
                    response = f"Motif {info['name']} adalah {info['description']}."
                    if info['meaning']:
                        response += f" Makna filosofisnya: {info['meaning']}"
                    return response
        
        # General responses
        if "motif" in query_lower or "pattern" in query_lower:
            return "Batik Nitik memiliki 60 motif tradisional. Beberapa yang populer adalah Sekar Kemuning, Ceplok Liring, Cakar Ayam, dan Kawung Nitik. Setiap motif memiliki makna filosofis yang mendalam."
        
        elif "batik" in query_lower:
            return 'Batik Nitik adalah batik klasik dari Yogyakarta dengan 60 motif tradisional. Setiap motif memiliki makna filosofis yang mencerminkan kebijaksanaan masyarakat Jawa.'
        
        elif "sejarah" in query_lower:
            return "Batik Nitik berasal dari Yogyakarta dan merupakan salah satu jenis batik klasik. Motifnya terinspirasi dari tenun India tetapi telah diadaptasi dengan nilai-nilai lokal Jawa."
        
        else:
            return 'Maaf, saya membantu menjelaskan tentang motif-motif Batik Nitik. Silakan tanyakan tentang motif tertentu atau ketik nama motif yang ingin Anda ketahui.'