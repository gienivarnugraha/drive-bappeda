import sys
import os
import base64
from markitdown import MarkItDown
from openai import OpenAI
from openai import APIError

# --- Configuration ---
LLM_MODEL = "gpt-4o-mini"
# ---------------------

def run_conversion():
    # 1. Check for API Key (passed via environment variables from Node.js)
    if 'OPENAI_API_KEY' not in os.environ:
        sys.stderr.write("Error: OPENAI_API_KEY environment variable is not set.\n")
        sys.exit(1)

    try:
        # 2. Read Base64-encoded PDF data from stdin
        # Node.js will encode the file data as Base64 and pipe it here.
        pdf_base64_data = sys.stdin.read().strip()
        if not pdf_base64_data:
            sys.stderr.write("Error: No data received from stdin.\n")
            sys.exit(1)
        
        # 3. Decode the Base64 data into raw bytes
        pdf_bytes = base64.b64decode(pdf_base64_data)

        # 4. Initialize LLM Client
        openai_client = OpenAI()
        
        # 5. Initialize MarkItDown
        md = MarkItDown(
            llm_client=openai_client, 
            llm_model=LLM_MODEL
        )

        # 6. Convert the PDF bytes (passing raw bytes is a standard MarkItDown feature)
        # We also pass the content_type to help MarkItDown
        result = md.convert(
            pdf_bytes, 
            content_type='application/pdf'
        )

        # 7. Print the Markdown content to stdout, which the Node.js route will capture
        print(result.text_content)

    except OpenAIAPIError as e:
        sys.stderr.write(f"OpenAI API Error: {e.status_code} - {e.response.json().get('error', {}).get('message', 'Unknown API Error')}\n")
        sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"Conversion error: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    run_conversion()