import os
import sys
import subprocess # Needed to run external commands like 'pip install'
import pathlib
import pymupdf_layout
from openai import OpenAI, APIError as OpenAIAPIError
from markitdown import MarkItDown 
import pymupdf4llm

def run_conversion():
    # import pdf_to_markdown #https://github.com/InectGit/pdf-to-markdown
    # 1. Check for API Key (passed via environment variables from Node.js)
    if 'OPENAI_API_KEY' not in os.environ:
        sys.stderr.write("Error: OPENAI_API_KEY environment variable is not set.\n")
        sys.exit(1)

    if len(sys.argv) < 2:
        sys.stderr.write("Error: Filename argument is missing.\n")
        sys.stderr.write("Usage: python script_name.py <path/to/file.pdf>\n")
        sys.exit(1)

    inputfile = sys.argv[1] # \public\documents\filename\filename.pdf
    outputfile = sys.argv[2] #  \public\documents\filename\filename.md

    # --- Path Extraction and Manipulation ---

    # Use pathlib.Path for robust, cross-platform path handling
    file_path = pathlib.Path(inputfile)

    # The directory containing the input file
    dirname = str(file_path.parent) # e.g.,  \public\documents\filename\
    # The file extension (including the dot)
    extension = file_path.suffix # e.g., .pdf
    # The file name without the extension (the 'stem' is the name of the directory/file)
    file_dir_stem = file_path.stem # e.g., filename
    # The full file name (including the extension)
    file_name = file_path.name # e.g., filename.pdf

    # Determine the directory where the current Python script is located
    # .resolve().parent ensures we get the absolute parent directory
    script_dir = pathlib.Path(__file__).resolve().parent
    
    # e.g., \public\documents\filename\images
    image_dir_path = file_path.parent / "images"

    try:
        if extension == '.pdf':
            md_text = pymupdf4llm.to_markdown(
                doc= inputfile, 
                write_images = True,
                image_path=image_dir_path,
                image_format='png',
                page_separators=True
                )
            
            pathlib.Path(outputfile).write_bytes(md_text.encode())
            print(md_text)

        else:
            openai_client = OpenAI()

            # Initialize MarkItDown
            md = MarkItDown(
                llm_client=openai_client, 
                llm_model='gpt-4o-mini',
                llm_prompt=f'Convert to markdown format, insert attachment like images, charts as markdown link target to public url : \documents\{file_dir_stem}\images'
            )

            # Convert the PDF bytes (passing raw bytes is a standard MarkItDown feature)
            result = md.convert(inputfile)

            # result = convert(inputfile)
            # Print the Markdown content to stdout, which the Node.js route will capture
            pathlib.Path(outputfile).write_bytes(result.text_content)

    except OpenAIAPIError as e:
        sys.stderr.write(f"OpenAI API Error: {e.status_code} - {e.response.json().get('error', {}).get('message', 'Unknown API Error')}\n")
        sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"Conversion error: {e}\n")
        sys.exit(1)