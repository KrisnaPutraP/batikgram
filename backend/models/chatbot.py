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
        
        # Load batik metadata from JSON file
        self.batik_data = self._load_batik_metadata()
        print(f"✓ Loaded {len(self.batik_data)} batik motifs from metadata")
        
        # Create motif names list for validation
        self.valid_motifs = set()
        for motif_id, info in self.batik_data.items():
            self.valid_motifs.add(info['name'].lower())
            self.valid_motifs.add(motif_id.lower())
            self.valid_motifs.add(motif_id.replace('_', ' ').lower())
        
        # System prompt yang sangat spesifik untuk Batik Nitik
        self.system_prompt = f"""Anda adalah asisten AI khusus yang HANYA membahas Batik Nitik dari Yogyakarta. Anda memiliki pengetahuan mendalam tentang {len(self.batik_data)} motif Batik Nitik yang tercatat dalam database.

ATURAN KETAT:
1. HANYA menjawab pertanyaan tentang Batik Nitik dan motif-motifnya
2. TIDAK menjawab pertanyaan tentang topik lain di luar batik
3. Jika ditanya tentang motif yang tidak ada dalam database, sampaikan bahwa data tidak tersedia
4. Berikan informasi akurat berdasarkan metadata yang tersedia

MOTIF YANG TERSEDIA: {', '.join([info['name'] for info in self.batik_data.values()])}

RESPONS FORMAT:
- Singkat dan informatif (maksimal 3-4 kalimat)
- Gunakan Bahasa Indonesia yang baik
- Sertakan makna filosofis jika relevan
- Jika tidak ada data, katakan dengan jelas

Jika pertanyaan di luar konteks Batik Nitik, tolak dengan sopan dan arahkan kembali ke topik batik."""

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
        
    def _load_batik_metadata(self):
        """Load batik metadata from JSON file"""
        metadata_paths = [
            'data/batik_metadata.json',
            '../data/batik_metadata.json',
            'backend/data/batik_metadata.json'
        ]
        
        for path in metadata_paths:
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except Exception as e:
                    print(f"⚠ Error loading metadata from {path}: {e}")
                    continue
        
        print("⚠ Metadata file not found. Using built-in fallback data.")
        return self._get_builtin_batik_data()

    def _get_builtin_batik_data(self):
        """Fallback built-in batik data"""
        return {
            'sekar_kemuning': {
                'name': 'Sekar Kemuning',
                'description': 'Motif bunga kemuning yang melambangkan keseimbangan antara cipta, rasa, dan karsa',
                'meaning': 'Kemuning berasal dari kata "ning" yang berarti konsentrasi penuh. Melambangkan keseimbangan antara pemikiran, kemampuan, dan sarana dalam menciptakan kemajuan masyarakat.',
                'visual': 'Bunga kecil berwarna putih dengan aroma harum'
            },
            'ceplok_liring': {
                'name': 'Ceplok Liring', 
                'description': 'Penempatan ragam hias secara tidak beraturan dalam satu bidang',
                'meaning': 'Mengajarkan untuk tidak menganggap sepele segala sesuatu. Sikap hati-hati dan menghargai orang lain harus diutamakan.',
                'visual': 'Pola ceplok dengan penempatan tidak beraturan'
            },
            'cakar_ayam': {
                'name': 'Cakar Ayam',
                'description': 'Simbol semangat menyongsong hari esok untuk mencari rejeki',
                'meaning': 'Seperti ayam yang mengais tanah di pagi buta, melambangkan kerja keras dan ketekunan.',
                'visual': 'Pola menyerupai cakar ayam'
            }
        }

    def _is_batik_related_query(self, query):
        """Check if query is related to batik or contains valid motif names"""
        query_lower = query.lower()
        
        # Batik-related keywords
        batik_keywords = [
            'batik', 'nitik', 'motif', 'sekar', 'pattern', 'tradisional', 
            'yogyakarta', 'jawa', 'filosofi', 'makna', 'ceplok', 'kawung'
        ]
        
        # Check for batik keywords
        if any(keyword in query_lower for keyword in batik_keywords):
            return True
        
        # Check for valid motif names
        if any(motif in query_lower for motif in self.valid_motifs):
            return True
        
        # Check for general greetings that are acceptable
        greetings = ['halo', 'hai', 'hello', 'selamat', 'terima kasih', 'thanks']
        if any(greeting in query_lower for greeting in greetings):
            return True
        
        return False

    def get_response(self, query, pattern_id=None):
        """Get chatbot response for batik-related queries only"""
        try:
            # First check if query is batik-related
            if not self._is_batik_related_query(query):
                return self._get_rejection_response()
            
            # Construct context message
            context = self.system_prompt
            
            # Add specific pattern info if provided
            if pattern_id and pattern_id in self.batik_data:
                pattern_info = self.batik_data[pattern_id]
                context += f"\n\nKONTEKS MOTIF TERPILIH:\n"
                context += f"Nama: {pattern_info.get('name', pattern_id)}\n"
                context += f"Deskripsi: {pattern_info.get('description', 'Tidak ada deskripsi')}\n"
                context += f"Makna: {pattern_info.get('meaning', 'Tidak ada informasi makna')}\n"
                context += f"Visual: {pattern_info.get('visual', 'Tidak ada deskripsi visual')}\n"
            
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

    def _get_rejection_response(self):
        """Response for non-batik related queries"""
        return "Maaf, saya adalah asisten khusus untuk Batik Nitik dari Yogyakarta. Saya hanya dapat membantu menjawab pertanyaan tentang motif-motif Batik Nitik dan aspek terkaitnya. Silakan tanyakan tentang motif batik, makna filosofis, sejarah, atau karakteristik visual Batik Nitik."

    def _get_fallback_response(self, query, pattern_id):
        """Enhanced fallback responses using metadata"""
        query_lower = query.lower()
        
        # Check if query is not batik-related
        if not self._is_batik_related_query(query):
            return self._get_rejection_response()
        
        # Check if asking about specific pattern by ID first
        if pattern_id and pattern_id in self.batik_data:
            info = self.batik_data[pattern_id]
            
            if any(word in query_lower for word in ["apa itu", "what is", "jelaskan", "ceritakan"]):
                response = f"Motif {info['name']} adalah {info['description']}."
                if info.get('meaning'):
                    response += f" Makna filosofisnya: {info['meaning']}"
                if info.get('visual'):
                    response += f" Karakteristik visualnya: {info['visual']}"
                return response
            
            elif any(word in query_lower for word in ["makna", "filosofi", "arti", "meaning"]):
                if info.get('meaning'):
                    return f"Makna filosofis motif {info['name']}: {info['meaning']}"
                else:
                    return f"Maaf, data makna filosofis untuk motif {info['name']} belum tersedia dalam database kami."
            
            elif any(word in query_lower for word in ["visual", "bentuk", "gambar", "tampilan"]):
                if info.get('visual'):
                    return f"Karakteristik visual motif {info['name']}: {info['visual']}"
                else:
                    return f"Maaf, deskripsi visual untuk motif {info['name']} belum tersedia dalam database kami."
            
            else:
                # Default info for selected pattern
                response = f"Motif {info['name']}: {info['description']}."
                if info.get('meaning'):
                    response += f" Makna: {info['meaning']}"
                return response
        
        # Check if query contains any motif name from our database
        for motif_id, info in self.batik_data.items():
            motif_variations = [
                info['name'].lower(),
                motif_id.replace('_', ' '),
                motif_id.replace('_', ''),
                info['name'].lower().replace(' ', '')
            ]
            
            if any(variation in query_lower for variation in motif_variations):
                if any(word in query_lower for word in ["makna", "filosofi", "arti"]):
                    if info.get('meaning'):
                        return f"Makna filosofis motif {info['name']}: {info['meaning']}"
                    else:
                        return f"Maaf, data makna untuk motif {info['name']} belum tersedia dalam database kami."
                else:
                    response = f"Motif {info['name']}: {info['description']}."
                    if info.get('meaning'):
                        response += f" Makna: {info['meaning']}"
                    return response
        
        # General batik questions
        if any(word in query_lower for word in ["sejarah", "asal usul", "history", "origin"]):
            return "Batik Nitik adalah batik klasik dari Yogyakarta dengan teknik yang sangat teliti. Nama 'nitik' berasal dari kata 'titik' yang menggambarkan motif-motif kecil dan detail. Batik ini memiliki 60 motif tradisional dengan makna filosofis mendalam."
        
        elif any(word in query_lower for word in ["berapa", "jumlah", "how many"]):
            return f"Batik Nitik memiliki 60 motif tradisional secara keseluruhan. Dalam database kami saat ini tersedia {len(self.batik_data)} motif dengan informasi lengkap mengenai deskripsi dan makna filosofisnya."
        
        elif any(word in query_lower for word in ["motif", "pattern", "pola"]) and "daftar" in query_lower:
            motif_names = [info['name'] for info in list(self.batik_data.values())[:10]]  # Show first 10
            return f"Beberapa motif Batik Nitik yang tersedia dalam database: {', '.join(motif_names)}. Silakan tanyakan tentang motif tertentu untuk informasi lebih detail."
        
        elif "batik nitik" in query_lower or "batik" in query_lower:
            return f'Batik Nitik adalah batik klasik dari Yogyakarta dengan {len(self.batik_data)} motif yang terdokumentasi dalam sistem kami. Setiap motif memiliki makna filosofis yang mencerminkan kebijaksanaan masyarakat Jawa. Silakan tanyakan tentang motif tertentu.'
        
        elif any(word in query_lower for word in ["halo", "hai", "hello", "hi"]):
            return f"Halo! Saya adalah asisten khusus Batik Nitik. Saya dapat membantu Anda mempelajari {len(self.batik_data)} motif Batik Nitik yang tersedia dalam database. Silakan tanyakan tentang motif tertentu, makna filosofis, atau aspek lain dari Batik Nitik."
        
        else:
            # Check if asking about motif not in our database
            possible_motif_words = ['sekar', 'motif', 'pattern']
            if any(word in query_lower for word in possible_motif_words):
                return f"Maaf, motif yang Anda tanyakan mungkin tidak tersedia dalam database kami yang berisi {len(self.batik_data)} motif Batik Nitik. Silakan cek daftar motif yang tersedia atau tanyakan tentang motif lain."
            
            return f'Silakan tanyakan tentang motif-motif Batik Nitik yang tersedia dalam database kami. Anda dapat bertanya tentang makna filosofis, deskripsi, atau karakteristik visual dari {len(self.batik_data)} motif yang terdokumentasi.'