from flask import Flask, request, jsonify
from flask_cors import CORS
import main
import json

app = Flask(__name__)
CORS(app)

# Initialize global variables for reuse
vectorstore = None
question_set = None
llm = None

@app.route('/')
def home():
    return jsonify({"status": "AI Agent is running"}), 200

@app.route('/eval', methods=['POST'])
def evaluate():
    try:
        data = request.get_json() or {}
        print(f"Received data: {data}")

        patient_email = data.get('email', '')
        need_organ = data.get('organRequired', 'heart')  # Default to heart if not specified
        
        response = main.main()

        # Load data from heart_answers.json
        with open('heart_answers.json', 'r') as file:
            heart_answers = json.load(file)

        response = heart_answers
        print(f"Response: {response}")

        # Return the dictionary directly without wrapping it in {}
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
