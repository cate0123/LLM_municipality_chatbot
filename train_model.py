# train_model.py
import os
from llama_index.core import GPTVectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage

# Folder containing your text or PDF documents
DATA_PATH = r"C:\Users\risun\OneDrive - University of Mpumalanga\LLM_powered_chatbot\documents"

# Folder where the trained index will be saved
INDEX_PATH = r"C:\Users\risun\OneDrive - University of Mpumalanga\LLM_powered_chatbot\storage"

def train_index():
    # Load your documents
    print("Loading documents...")
    documents = SimpleDirectoryReader(DATA_PATH).load_data()

    # Create index from documents
    print(" Creating semantic index...")
    index = GPTVectorStoreIndex.from_documents(documents)

    # Save index to disk for later use
    print(" Saving index to storage...")
    index.storage_context.persist(persist_dir=INDEX_PATH)
    print(f" Index successfully saved at: {INDEX_PATH}")

if __name__ == "__main__":
    train_index()
