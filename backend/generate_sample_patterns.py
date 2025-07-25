"""
Script to organize and setup batik patterns from the provided dataset.
Handles the actual 960 batik images with proper naming conventions.
"""

import os
import shutil
import re

def extract_pattern_info(filename):
    """Extract pattern information from filename"""
    # Handle patterns like "58 Jayakusuma 4.jpg" or "59 Rengganis 1_rotate_90.jpg"
    base_name = os.path.splitext(filename)[0]
    
    # Extract number and pattern name
    match = re.match(r'(\d+)\s+([^_\d]+)', base_name)
    if match:
        number = match.group(1)
        pattern_name = match.group(2).strip()
        
        # Convert to pattern_id format
        pattern_id = pattern_name.lower().replace(' ', '_')
        
        # Handle rotation info
        rotation = 0
        if '_rotate_' in base_name:
            rot_match = re.search(r'_rotate_(\d+)', base_name)
            if rot_match:
                rotation = int(rot_match.group(1))
        
        return {
            'number': number,
            'pattern_name': pattern_name,
            'pattern_id': pattern_id,
            'rotation': rotation,
            'original_filename': filename
        }
    
    return None

def setup_batik_patterns():
    """
    Setup batik patterns directory and organize existing files.
    """
    
    patterns_dir = 'data/batik_patterns'
    os.makedirs(patterns_dir, exist_ok=True)
    
    print("""
    ========================================
    BATIK PATTERN ORGANIZATION
    ========================================
    """)
    
    # Map of pattern names to expected IDs
    pattern_mapping = {
        'jayakusuma': 'jayakusuma',
        'rengganis': 'rengganis', 
        'sekar gambir': 'sekar_gambir',
        'sekar kemuning': 'sekar_kemuning',
        'ceplok liring': 'ceplok_liring',
        'sekar duren': 'sekar_duren',
        'sekar gayam': 'sekar_gayam',
        'sekar pacar': 'sekar_pacar',
        'arumdalu': 'arumdalu',
        'sekar srigading': 'sekar_srigading',
        'kemukus': 'kemukus',
        'sekar gudhe': 'sekar_gudhe',
        'sekar ketongkeng': 'sekar_ketongkeng',
        'brendi': 'brendi',
        'cakar ayam': 'cakar_ayam',
        'sekar menur': 'sekar_menur',
        'sekar tebu': 'sekar_tebu',
        'sekar manggis': 'sekar_manggis',
        'sekar randu': 'sekar_randu',
        'worawari rumpuk': 'worawari_rumpuk',
        'sekar duku': 'sekar_duku',
        'sekar jagung': 'sekar_jagung',
        'jayakirana': 'jayakirana',
        'mawur': 'mawur',
        'sekar tanjung': 'sekar_tanjung',
        'sekar keben': 'sekar_keben',
        'sekar srengenge': 'sekar_srengenge',
        'sekar soka': 'sekar_soka',
        'sekar nangka': 'sekar_nangka',
        'kawung nitik': 'kawung_nitik',
        'sekar kentang': 'sekar_kentang',
        'sekar pudak': 'sekar_pudak',
        'sekar dlima': 'sekar_dlima',
        'karawitan': 'karawitan',
        'cinde wilis': 'cinde_wilis',
        'sekar mlati': 'sekar_mlati',
        'kuncup kanthil': 'kuncup_kanthil',
        'sekar dangan': 'sekar_dangan',
        'sekar sawo': 'sekar_sawo',
        'manggar': 'manggar',
        'sekar cengkeh': 'sekar_cengkeh',
        'sritaman': 'sritaman',
        'sekar mundu': 'sekar_mundu',
        'sekar andong': 'sekar_andong',
        'gedhangan': 'gedhangan',
        'sekar pala': 'sekar_pala',
        'klampok arum': 'klampok_arum',
        'sekar jali': 'sekar_jali',
        'sekar lintang': 'sekar_lintang',
        'sekar kenanga': 'sekar_kenanga',
        'sekar jeruk': 'sekar_jeruk',
        'sekar mindi': 'sekar_mindi',
        'tanjung gunung': 'tanjung_gunung',
        'sekar kenikir': 'sekar_kenikir',
        'sekar blimbing': 'sekar_blimbing',
        'sekar pijetan': 'sekar_pijetan',
        'sarimulat': 'sarimulat',
        'sekar mrica': 'sekar_mrica',
        'sekar kepel': 'sekar_kepel',
        'truntum kurung': 'truntum_kurung'
    }
    
    # Scan directory for files
    found_files = []
    pattern_counts = {}
    
    if not os.path.exists(patterns_dir):
        print(f"Directory {patterns_dir} does not exist!")
        return
    
    files = [f for f in os.listdir(patterns_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    print(f"Found {len(files)} image files in {patterns_dir}")
    
    for filename in files:
        pattern_info = extract_pattern_info(filename)
        if pattern_info:
            found_files.append(pattern_info)
            
            # Count patterns
            pattern_key = pattern_info['pattern_name'].lower()
            if pattern_key not in pattern_counts:
                pattern_counts[pattern_key] = 0
            pattern_counts[pattern_key] += 1
    
    print(f"\nExtracted information from {len(found_files)} files")
    print(f"Found {len(pattern_counts)} unique patterns")
    
    # Show pattern statistics
    print("\nPattern Statistics:")
    for pattern, count in sorted(pattern_counts.items()):
        mapped_id = pattern_mapping.get(pattern, pattern.replace(' ', '_'))
        print(f"  {pattern:<20} -> {mapped_id:<20} ({count} files)")
    
    # Create organized structure
    organized_dir = os.path.join(patterns_dir, 'organized')
    os.makedirs(organized_dir, exist_ok=True)
    
    # Group files by pattern
    pattern_groups = {}
    for file_info in found_files:
        pattern_key = file_info['pattern_name'].lower()
        if pattern_key not in pattern_groups:
            pattern_groups[pattern_key] = []
        pattern_groups[pattern_key].append(file_info)
    
    # Copy and organize files
    print(f"\nOrganizing files into {organized_dir}:")
    
    for pattern_key, files in pattern_groups.items():
        mapped_id = pattern_mapping.get(pattern_key, pattern_key.replace(' ', '_'))
        
        # Create pattern directory
        pattern_dir = os.path.join(organized_dir, mapped_id)
        os.makedirs(pattern_dir, exist_ok=True)
        
        # Copy files with organized names
        for file_info in files:
            src_path = os.path.join(patterns_dir, file_info['original_filename'])
            
            # Create organized filename
            if file_info['rotation'] > 0:
                new_filename = f"{mapped_id}_rotate_{file_info['rotation']}.jpg"
            else:
                new_filename = f"{mapped_id}.jpg"
            
            dst_path = os.path.join(pattern_dir, new_filename)
            
            try:
                if not os.path.exists(dst_path):
                    shutil.copy2(src_path, dst_path)
                    print(f"  Copied: {file_info['original_filename']} -> {mapped_id}/{new_filename}")
            except Exception as e:
                print(f"  Error copying {file_info['original_filename']}: {e}")
    
    # Create main pattern files (use base rotation for each pattern)
    print(f"\nCreating main pattern files in {patterns_dir}:")
    
    for pattern_key, files in pattern_groups.items():
        mapped_id = pattern_mapping.get(pattern_key, pattern_key.replace(' ', '_'))
        
        # Find base file (rotation 0 or first available)
        base_file = None
        for file_info in files:
            if file_info['rotation'] == 0:
                base_file = file_info
                break
        
        if not base_file and files:
            base_file = files[0]  # Use first available
        
        if base_file:
            src_path = os.path.join(patterns_dir, base_file['original_filename'])
            dst_path = os.path.join(patterns_dir, f"{mapped_id}.jpg")
            
            try:
                if not os.path.exists(dst_path):
                    shutil.copy2(src_path, dst_path)
                    print(f"  Created: {mapped_id}.jpg")
            except Exception as e:
                print(f"  Error creating {mapped_id}.jpg: {e}")
    
    # Final status
    available_patterns = len([f for f in os.listdir(patterns_dir) 
                            if f.endswith('.jpg') and not f.startswith('temp_')])
    
    print(f"""
    ========================================
    ORGANIZATION COMPLETE
    ========================================
    
    Results:
    - Processed: {len(files)} original files
    - Available patterns: {available_patterns}
    - Organized files in: {organized_dir}
    - Main pattern files in: {patterns_dir}
    
    The application can now use these organized patterns!
    
    ========================================
    """)

if __name__ == "__main__":
    setup_batik_patterns()