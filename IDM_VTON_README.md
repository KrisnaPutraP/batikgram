# IDM-VTON Local Integration

Integrasi langsung IDM-VTON tanpa Gradio demo untuk aplikasi Batikgram.

## 🚀 Quick Setup

### 1. Setup IDM-VTON sebagai Submodule

```bash
# Otomatis setup submodule
python setup_submodule.py

# Atau manual:
git submodule add https://github.com/yisol/IDM-VTON.git models/IDM-VTON
git submodule update --init --recursive
```

### 2. Install Dependencies

```bash
# Install dependencies utama
pip install torch torchvision diffusers transformers accelerate

# Install requirements IDM-VTON (jika ada)
pip install -r models/IDM-VTON/requirements.txt

# Install additional packages
pip install opencv-python pillow numpy scipy omegaconf xformers
```

### 3. Download Model Weights

Model weights untuk IDM-VTON biasanya perlu didownload terpisah. Check dokumentasi IDM-VTON untuk:
- UNet weights
- VAE weights  
- Text encoder weights

## 📁 Struktur File

```
batikgram/
├── models/
│   └── IDM-VTON/              # Submodule IDM-VTON
│       ├── src/
│       ├── checkpoints/       # Model weights
│       ├── configs/
│       └── requirements.txt
├── backend/
│   └── models/
│       ├── idm_vton.py        # Wrapper utama
│       └── idm_vton_local.py  # Local implementation
├── direct_idm_vton.py         # Direct inference script
├── setup_submodule.py         # Setup submodule
└── setup_idmvton.py          # Verification script
```

## 🔧 Penggunaan

### Via Direct Script

```python
from direct_idm_vton import DirectIDMVTON

# Initialize
idm_vton = DirectIDMVTON()

# Run inference
result = idm_vton.create_batik_fitting(
    person_image_path="person.jpg",
    batik_pattern_path="batik.jpg",
    output_path="result.jpg"
)
```

### Via Backend Integration

```python
from backend.models.idm_vton_local import get_idm_vton_local_model

# Get model instance
model = get_idm_vton_local_model()

# Apply garment
result = model.apply_garment(person_image, garment_image)
```

### Via Flask API

```bash
# Start Flask server
cd backend
python app.py

# Test API
curl -X POST http://localhost:5000/api/virtual-fitting \
  -F "person_image=@person.jpg" \
  -F "garment_image=@batik.jpg"
```

## 🧪 Testing Setup

```bash
# Check IDM-VTON setup
python setup_idmvton.py

# Test direct inference
python direct_idm_vton.py

# Test Flask integration
cd backend && python app.py
```

## 🔍 Troubleshooting

### Import Errors

```bash
# Install missing dependencies
pip install diffusers transformers torch accelerate

# Check Python path
python -c "import sys; print('\\n'.join(sys.path))"
```

### Model Loading Issues

1. **Checkpoint not found**: Download model weights dari HuggingFace atau repository IDM-VTON
2. **CUDA out of memory**: Reduce batch size atau gunakan CPU
3. **Import errors**: Pastikan semua dependencies terinstall

### Submodule Issues

```bash
# Re-initialize submodule
git submodule deinit models/IDM-VTON
git submodule update --init --recursive

# Force update
git submodule update --remote --force
```

## ⚡ Performance Tips

1. **GPU Usage**: Pastikan CUDA tersedia untuk inference cepat
2. **Memory**: Gunakan `torch.float16` untuk mengurangi memory usage
3. **Batch Processing**: Process multiple images sekaligus
4. **Caching**: Cache model untuk menghindari reload berulang

## 🔄 Integration Flow

```
Input Images → Preprocessing → IDM-VTON Inference → Postprocessing → Output
```

1. **Preprocessing**: Resize, normalize, generate mask
2. **Inference**: Run diffusion model dengan IDM-VTON
3. **Postprocessing**: Cleanup, resize to original size
4. **Output**: Save atau return result image

## 📝 Notes

- IDM-VTON bekerja paling baik dengan images berukuran 512x768
- Mask generation otomatis untuk area clothing
- Fallback ke basic inpainting jika IDM-VTON gagal load
- Support untuk multiple batik patterns

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Test dengan berbagai batik patterns
4. Submit pull request

## 📄 License

Ikuti license dari IDM-VTON dan dependencies lainnya.
