from flask import Flask, jsonify
import subprocess

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def run_python_script():
    # Execute the actual script (if it's a simple, fast-running task)
    # Alternatively, you can just call the function directly here
    try:
        result = subprocess.run(
            ['python', 'convert.py'],
            capture_output=True,
            text=True,
            check=True
        )
        return jsonify({
            'status': 'success',
            'output': result.stdout
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            'status': 'error',
            'error': e.stderr
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)