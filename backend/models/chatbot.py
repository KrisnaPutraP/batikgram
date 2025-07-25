import json
import os
import sys
from groq import Groq
from dotenv import load_dotenv
from .groq_models import get_best_available_model, get_model_max_tokens, list_active_models

# Load environment variables
load_dotenv()

class BatikChatbot:
    def __init__(self):
        # Initialize Groq API (free tier)
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.client = None
        self.model_name = get_best_available_model()
        
        # Initialize Groq client if API key is available
        if self.groq_api_key and self.groq_api_key != "your_groq_api_key_here":
            try:
                self.client = Groq(api_key=self.groq_api_key)
                print(f"✓ Groq API initialized successfully")
                print(f"✓ Using model: {self.model_name}")
                print(f"✓ Available models: {list_active_models()}")
                # Test the API connection
                self._test_api_connection()
            except Exception as e:
                print(f"✗ Failed to initialize Groq API: {e}")
                self.client = None
        else:
            print("⚠ No Groq API key found. Using fallback responses.")
        
        # Load batik metadata from training data
        self.batik_data = self._load_batik_training_data()
        print(f"✓ Loaded {len(self.batik_data)} batik motifs from training data")
        
        # System prompt untuk konteks batik
        self.system_prompt = """Anda adalah asisten AI yang ahli tentang batik Indonesia, khususnya Batik Nitik dari Yogyakarta dengan 60 motif tradisional. 

Konteks Batik Nitik:
- Batik klasik dari Yogyakarta dengan 60 motif tradisional
- Setiap motif memiliki makna filosofis yang mendalam
- Teknik pembuatan sangat detail dan teliti
- Mencerminkan kebijaksanaan masyarakat Jawa

Anda dapat memberikan informasi tentang:
- Asal-usul dan sejarah batik
- Makna filosofis dari motif batik  
- Karakteristik visual dan simbolisme
- Proses pembuatan batik
- Penggunaan dan etika pakai

Berikan jawaban yang informatif, singkat (maksimal 3-4 kalimat), dan menarik dalam Bahasa Indonesia.
Jika ditanya tentang motif spesifik, berikan informasi detail tentang motif tersebut."""

    def _test_api_connection(self):
        """Test Groq API connection"""
        if not self.client or not self.model_name:
            return False
            
        try:
            # Test with a simple query using best available model
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Test"}
                ],
                temperature=0.1,
                max_tokens=10
            )
            print(f"✓ Groq API connection test successful with {self.model_name}")
            return True
        except Exception as e:
            print(f"✗ Groq API connection test failed with {self.model_name}: {e}")
            # Try fallback to different model
            backup_models = ["llama3-8b-8192", "gemma-7b-it"]
            for backup_model in backup_models:
                try:
                    response = self.client.chat.completions.create(
                        model=backup_model,
                        messages=[
                            {"role": "system", "content": "You are a helpful assistant."},
                            {"role": "user", "content": "Test"}
                        ],
                        temperature=0.1,
                        max_tokens=10
                    )
                    self.model_name = backup_model
                    print(f"✓ Switched to backup model: {backup_model}")
                    return True
                except Exception as backup_e:
                    print(f"✗ Backup model {backup_model} also failed: {backup_e}")
                    continue
            
            self.client = None
            return False
        
    def _load_batik_training_data(self):
        """Load batik metadata from training data jsonl file"""
        batik_data = {}
        
        # Try different possible paths for the training data
        possible_paths = [
            'fine_tuning/batik_training_data.jsonl',
            '../fine_tuning/batik_training_data.jsonl',
            'batik_training_data.jsonl'
        ]
        
        jsonl_path = None
        for path in possible_paths:
            if os.path.exists(path):
                jsonl_path = path
                break
        
        if not jsonl_path:
            print("⚠ Training data file not found. Using built-in fallback data.")
            return self._get_builtin_batik_data()
        
        try:
            with open(jsonl_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    try:
                        line = line.strip()
                        if not line:
                            continue
                            
                        data = json.loads(line)
                        messages = data.get('messages', [])
                        
                        # Extract motif information from training data
                        for i, message in enumerate(messages):
                            if message['role'] == 'user':
                                content = message['content']
                                if 'motif' in content and ('Apa itu' in content or 'apa itu' in content):
                                    # Extract motif name
                                    motif_name = content.replace('Apa itu motif ', '').replace('apa itu motif ', '').replace('?', '')
                                    
                                    # Find corresponding assistant response
                                    if i + 1 < len(messages) and messages[i + 1]['role'] == 'assistant':
                                        response = messages[i + 1]['content']
                                        
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
                    except json.JSONDecodeError as e:
                        print(f"⚠ JSON decode error on line {line_num}: {e}")
                        continue
                    except Exception as e:
                        print(f"⚠ Error processing line {line_num}: {e}")
                        continue
                        
        except Exception as e:
            print(f"✗ Error loading training data: {e}")
            return self._get_builtin_batik_data()
        
        return batik_data if batik_data else self._get_builtin_batik_data()

    def _get_builtin_batik_data(self):
        """Fallback built-in batik data"""
        return {
            'sekar_kemuning': {
                'name': 'Sekar Kemuning',
                'description': 'Motif bunga kemuning yang melambangkan keseimbangan antara cipta, rasa, dan karsa',
                'meaning': 'Kemuning berasal dari kata "ning" yang berarti konsentrasi penuh. Melambangkan keseimbangan antara pemikiran, kemampuan, dan sarana dalam menciptakan kemajuan masyarakat.'
            },
            'ceplok_liring': {
                'name': 'Ceplok Liring', 
                'description': 'Penempatan ragam hias secara tidak beraturan dalam satu bidang',
                'meaning': 'Mengajarkan untuk tidak menganggap sepele segala sesuatu. Sikap hati-hati dan menghargai orang lain harus diutamakan.'
            },
            'cakar_ayam': {
                'name': 'Cakar Ayam',
                'description': 'Simbol semangat menyongsong hari esok untuk mencari rejeki',
                'meaning': 'Seperti ayam yang mengais tanah di pagi buta, melambangkan kerja keras dan ketekunan.'
            },
            'brendi': {
                'name': 'Brendi',
                'description': 'Motif terinspirasi dari simbol minuman brendi dengan 3 koin berjajar',
                'meaning': 'Simbol vitalitas dan stamina, digunakan secara bijaksana.'
            }
        }
    
    def get_response(self, query, pattern_id=None):
        """Get chatbot response for batik-related queries"""
        try:
            # Construct context message
            context = self.system_prompt
            
            # Add specific pattern info if provided
            if pattern_id and pattern_id in self.batik_data:
                pattern_info = self.batik_data[pattern_id]
                context += f"\n\nKonteks motif yang sedang dipilih:\n"
                context += f"Nama: {pattern_info.get('name', pattern_id)}\n"
                context += f"Deskripsi: {pattern_info.get('description', 'Tidak ada deskripsi')}\n"
                context += f"Makna: {pattern_info.get('meaning', 'Tidak ada informasi makna')}\n"
            
            # Use Groq API if available
            if self.client and self.model_name:
                try:
                    messages = [
                        {"role": "system", "content": context},
                        {"role": "user", "content": query}
                    ]
                    
                    max_tokens = min(300, get_model_max_tokens(self.model_name) // 4)
                    
                    response = self.client.chat.completions.create(
                        model=self.model_name,
                        messages=messages,
                        temperature=0.7,
                        max_tokens=max_tokens
                    )
                    
                    ai_response = response.choices[0].message.content.strip()
                    print(f"✓ Groq AI response generated successfully using {self.model_name}")
                    return ai_response
                    
                except Exception as e:
                    print(f"✗ Groq API error with {self.model_name}: {e}")
                    # Fall back to local response
                    return self._get_fallback_response(query, pattern_id)
            else:
                # Use fallback response
                return self._get_fallback_response(query, pattern_id)
                
        except Exception as e:
            print(f"✗ Chatbot error: {e}")
            return self._get_fallback_response(query, pattern_id)
    
    def _get_fallback_response(self, query, pattern_id):
        """Enhanced fallback responses using training data"""
        query_lower = query.lower()
        
        # Check if asking about specific pattern by ID first
        if pattern_id and pattern_id in self.batik_data:
            info = self.batik_data[pattern_id]
            
            if any(word in query_lower for word in ["apa itu", "what is", "jelaskan", "ceritakan"]):
                response = f"Motif {info['name']} adalah {info['description']}."
                if info['meaning']:
                    response += f" Motif ini memiliki makna: {info['meaning']}"
                return response
            
            elif any(word in query_lower for word in ["makna", "filosofi", "arti", "meaning"]):
                if info['meaning']:
                    return f"Makna dari motif {info['name']}: {info['meaning']}"
                else:
                    return f"Motif {info['name']} memiliki makna filosofis yang mendalam dalam budaya Jawa."
            
            else:
                # Default info for selected pattern
                response = f"Motif {info['name']} adalah {info['description']}."
                if info['meaning']:
                    response += f" Makna filosofisnya: {info['meaning']}"
                return response
        
        # Check if query contains any motif name
        for motif_id, info in self.batik_data.items():
            motif_variations = [
                info['name'].lower(),
                motif_id.replace('_', ' '),
                motif_id.replace('_', ''),
                info['name'].lower().replace(' ', '')
            ]
            
            if any(variation in query_lower for variation in motif_variations):
                if any(word in query_lower for word in ["makna", "filosofi", "arti"]):
                    return f"Makna dari motif {info['name']}: {info['meaning']}" if info['meaning'] else f"Motif {info['name']} memiliki nilai filosofis yang mendalam."
                else:
                    response = f"Motif {info['name']} adalah {info['description']}."
                    if info['meaning']:
                        response += f" Makna filosofisnya: {info['meaning']}"
                    return response
        
        # Enhanced keyword-based responses
        if any(word in query_lower for word in ["sejarah", "asal usul", "history", "origin"]):
            return "Batik Nitik berasal dari Yogyakarta dan merupakan salah satu jenis batik klasik. Motifnya terinspirasi dari tenun India tetapi telah diadaptasi dengan nilai-nilai lokal Jawa. Teknik pembuatannya sangat detail dan membutuhkan ketelitian tinggi."
        
        elif any(word in query_lower for word in ["cara", "teknik", "proses", "pembuatan"]):
            return "Batik Nitik dibuat dengan teknik yang sangat teliti menggunakan canting untuk membuat motif-motif kecil yang detail. Prosesnya meliputi pembatikan, pewarnaan dengan bahan alami, dan pelorodan (penghilangan malam)."
        
        elif any(word in query_lower for word in ["warna", "color", "pewarnaan"]):
            return "Batik Nitik tradisional menggunakan warna-warna natural seperti coklat soga, hitam, dan krem. Pewarna alami diperoleh dari kulit pohon, akar, dan daun yang memiliki simbolisme dalam budaya Jawa."
        
        elif any(word in query_lower for word in ["berapa", "jumlah", "how many"]):
            return f"Batik Nitik memiliki total 60 motif tradisional yang telah diwariskan turun-temurun. Saat ini tersedia {len(self.batik_data)} motif dalam database kami."
        
        elif any(word in query_lower for word in ["motif", "pattern", "pola"]):
            popular_motifs = ["Sekar Kemuning", "Ceplok Liring", "Cakar Ayam", "Kawung Nitik", "Sekar Melati", "Truntum"]
            return f"Batik Nitik memiliki 60 motif tradisional. Beberapa yang populer adalah {', '.join(popular_motifs)}. Setiap motif memiliki makna filosofis yang mendalam dan karakteristik visual yang unik."
        
        elif "batik" in query_lower:
            return 'Batik Nitik adalah batik klasik dari Yogyakarta dengan 60 motif tradisional. Setiap motif memiliki makna filosofis yang mencerminkan kebijaksanaan masyarakat Jawa. Teknik pembuatannya sangat detail dan membutuhkan keahlian tinggi.'
        
        elif any(word in query_lower for word in ["halo", "hai", "hello", "hi"]):
            return "Halo! Saya siap membantu Anda belajar tentang Batik Nitik dan 60 motif tradisionalnya. Silakan tanyakan tentang motif tertentu, makna filosofis, sejarah, atau aspek lain dari batik."
        
        else:
            return 'Saya membantu menjelaskan tentang Batik Nitik dan 60 motif tradisionalnya. Silakan tanyakan tentang:\n- Motif tertentu (misal: "Apa itu Sekar Kemuning?")\n- Makna filosofis\n- Sejarah dan asal usul\n- Teknik pembuatan\n- Warna dan simbolisme'