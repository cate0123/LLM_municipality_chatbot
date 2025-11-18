import logging
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

import firebase_admin

logging.basicConfig(level=logging.INFO)

cred = credentials.Certificate("llm-chatbot-db-firebase-adminsdk-fbsvc-7f6e2f62c0.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def save_message(user_id: str, session_id: str, text: str, sender: str, municipality_id: str):
    try:
        messages_ref = db.collection("users").document(user_id).collection("messages")
        messages_ref.add({
            "text": text,
            "sender": sender,
            "session_id": session_id,
            "municipality_id": municipality_id,
            "timestamp": datetime.now(timezone.utc)
        })
        logging.info(f"Message saved for {user_id}")
    except Exception as e:
        logging.error(f"Error saving message: {e}")