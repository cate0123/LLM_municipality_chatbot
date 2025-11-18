from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from dotenv import load_dotenv
import os
from openai import OpenAI
from firebase import save_message as save_chat

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# System prompt for THEO
SYSTEM_PROMPT = (
    "You are THEO, a friendly municipal assistant for Bushbuckridge local Municipality. "
    "Answer about services (roads, water, waste, permits, billing). "
    "Suggest next steps if unsure."
)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
        )

        reply = response.choices[0].message.content

        # Save messages to Firestore
        save_chat(
            user_id="anonymous",
            session_id="session_xyz",
            text=user_message,
            sender="user",
            municipality_id="nkomazi",
        )
        save_chat(
            user_id="anonymous",
            session_id="session_xyz",
            text=reply,
            sender="chatbot",
            municipality_id="nkomazi",
        )

        return jsonify({"reply": reply})

    except Exception as e:
        logging.error(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
