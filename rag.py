import openai
from llama_index.core import GPTVectorStoreIndex, SimpleDirectoryReader

# Load documents
def load_documents(path):
    reader = SimpleDirectoryReader(path)
    return reader.load_data()


# Create index
def create_index(documents):
    return GPTVectorStoreIndex.from_documents(documents)


# Initialize query engine
def initialize_query_engine(index, top_k=3):
    return index.as_query_engine(similarity_top_k=top_k)


# Retrieval function
def retrieve_documents(query_engine, query):
    """
    Retrieves top-k relevant documents from the municipal knowledge base
    using semantic search.
    """
    retrieved_docs = query_engine.query(query)
    return retrieved_docs


# Generate response using RAG
def generate_response(retrieved_docs, query):
    """
    Generates a GPT-based response by combining retrieved documents
    with the user query.
    """
    try:
        prompt = f"Using the following information: {retrieved_docs}, please answer the question: {query}"
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        return response.choices[0].message["content"].strip()
    except Exception as e:
        return str(e)


# Main function
if __name__ == "__main__":
    path = r"C:\Users\risun\OneDrive - University of Mpumalanga\LLM_powered_chatbot\documents"
    documents = load_documents(path)
    index = create_index(documents)
    query_engine = initialize_query_engine(index)

    query = "How do I report a water shortage incident?"
    retrieved_docs = retrieve_documents(query_engine, query)
    answer = generate_response(retrieved_docs, query)
    print(answer)
