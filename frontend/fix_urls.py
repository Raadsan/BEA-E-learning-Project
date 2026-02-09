import os

# Configuration
target_dir = './src'
old_api_url = 'http://localhost:5000/api'
old_uploads_url = 'http://localhost:5000/uploads'

# Replacements
replacements = {
    'import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";': 
        'import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";\nimport { API_URL } from "@/constants";',
    'baseUrl: "http://localhost:5000/api': 'baseUrl: `${API_URL}',
    'baseUrl: "http://localhost:5000': 'baseUrl: API_BASE_URL', # for some edge cases
    'http://localhost:5000/api': 'API_URL', # for general strings
    'http://localhost:5000/uploads': 'UPLOADS_URL'
}

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    
    # Check if constants is already imported
    has_constants = 'import { API_URL }' in content or 'import { API_BASE_URL }' in content or 'import { UPLOADS_URL }' in content
    
    # Perform replacements
    new_content = content
    
    # 1. Update baseUrl in API slices
    if 'baseUrl: "http://localhost:5000/api' in new_content:
        new_content = new_content.replace('baseUrl: "http://localhost:5000/api', 'baseUrl: `${API_URL}')
        changed = True
    
    # 2. Add imports if needed
    if changed and not has_constants:
        if 'import { createApi, fetchBaseQuery }' in new_content:
            new_content = new_content.replace(
                'import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";',
                'import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";\nimport { API_URL } from "@/constants";'
            )
        else:
            # For non-Redux files
            new_content = 'import { API_URL, UPLOADS_URL } from "@/constants";\n' + new_content

    # 3. Replace direct string instances
    if old_api_url in new_content:
        new_content = new_content.replace(old_api_url, '${API_URL}')
        changed = True
    if old_uploads_url in new_content:
        new_content = new_content.replace(old_uploads_url, '${UPLOADS_URL}')
        changed = True

    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))
