import os
import sys
import subprocess # Needed to run external commands like 'pip install'
import pathlib

# Define the list of packages to install. Using the list syntax allows for dynamic packaging options.
PACKAGES_TO_INSTALL = [
    "markitdown[pptx, docx, xlsx, xls, pdf]",
    "openai",
    "pymupdf4llm",
    "pymupdf_layout"
]

def ensure_dependencies():
    """
    Checks if the required packages are already installed by attempting import.
    If the import fails, it attempts to install the packages using pip.
    This prevents running installation if requirements are already satisfied.
    """
    try:
        # --- Dependency Check ---
        # Attempt to import necessary modules. If successful, dependencies are satisfied.
        import pymupdf_layout 
        import openai
        import markitdown
        import pymupdf4llm
        # Check a specific deep import to ensure full functionality (e.g., pymupdf4llm requires pymupdf)
        
        print("Required dependencies are already installed.")
        return

    except ImportError:
        # --- Installation Block ---
        # If imports fail, proceed to install the packages.
        print("Required packages not found. Attempting installation...")
        try:
            # Construct the full command list for subprocess.
            command = [sys.executable, "-m", "pip", "install", *PACKAGES_TO_INSTALL]
            
            # Execute the installation command
            subprocess.check_call(command)
            
            print("Packages installed successfully. Re-verifying imports...")
            
            # Re-check imports after installation to ensure success
            import openai
            import markitdown
            import pymupdf4llm
            import pymupdf_layout
            
            print("Dependencies are now ready for use.")

        except subprocess.CalledProcessError as e:
            # Handle cases where pip install fails (e.g., network error, compilation issue)
            sys.stderr.write(f"Error installing packages: {e}\n")
            sys.exit(1)
        except ImportError as e:
            # Handle cases where installation succeeds, but imports still fail
            sys.stderr.write(
                f"Error: Installation succeeded but failed to import critical modules (e.g., 'openai' or 'pymupdf.layout'). "
                f"Please ensure your Python environment is correctly configured.\n  Details: {e}\n"
            )
            sys.exit(1)

def run_conversion():
    # Try to import MarkItDown and OpenAI libraries
    # If the import fails, the except block will execute
    try:
        import pymupdf_layout
        from openai import OpenAI, APIError as OpenAIAPIError
        from markitdown import MarkItDown 
        import pymupdf4llm
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
    except Exception as e:
        # Call the install function immediately if the initial import failed
        sys.stderr.write(f"An unexpected error occurred during the conversion run: {e}\n")


if __name__ == "__main__":
    ensure_dependencies()
    run_conversion()