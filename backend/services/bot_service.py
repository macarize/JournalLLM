import os
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.docstore.document import Document
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

PERSIST_DIR = "db_chroma"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_KEY_HERE")

def get_vectorstore_for_user(user_id: int):
    collection_name = f"user_{user_id}_journal_entries"
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=os.path.join(PERSIST_DIR, collection_name)
    )

def update_user_vector_store(user_id: int, journal_entries):
    vectorstore = get_vectorstore_for_user(user_id)

    try:
        existing = vectorstore._collection.get()
        existing_ids = {
            metadata.get("entry_id")
            for metadata in existing.get("metadatas", [])
            if metadata.get("entry_id") is not None
        }
    except Exception:
        existing_ids = set()

    docs = []
    for entry in journal_entries:
        doc_id = f"journal_{entry.id}"
        docs.append(Document(
            page_content=entry.content,
            metadata={"entry_id": entry.id, "user_id": user_id},
            id=doc_id
        ))
    if docs:
        vectorstore.add_documents(docs)
        vectorstore.persist()

def generate_bot_comment(user_id: int, bot_prompt: str, new_journal_text: str, exclude_journal_id: int = None):
    vectorstore = get_vectorstore_for_user(user_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    docs = retriever.get_relevant_documents(new_journal_text)
    filtered_docs = [d for d in docs if d.metadata.get("entry_id") != exclude_journal_id]

    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",  # or "gpt-3.5-turbo"
        temperature=0.7,
        max_tokens=512
    )

    final_prompt = f"""
System: {bot_prompt}

The user wrote a new journal entry:
{new_journal_text}

Here are some possibly relevant past journals (excluding the current one):
{[d.page_content for d in filtered_docs]}

Respond thoroughly. Do not cut off or leave incomplete sentences.
"""

    response = llm.predict(final_prompt)
    return response.strip()