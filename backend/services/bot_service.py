import os
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.docstore.document import Document
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

# Directory to store local Chroma DB files
PERSIST_DIR = "db_chroma"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_KEY_HERE")

def get_vectorstore_for_user(user_id: int):
    """
    Create/return a user-specific Chroma collection,
    so each user has their own vector store and can't see others' data.
    """
    collection_name = f"user_{user_id}_journal_entries"
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=os.path.join(PERSIST_DIR, collection_name)
    )

def update_user_vector_store(user_id: int, journal_entries):
    """
    Embed and store (or update) the user's journal entries in their own Chroma collection.
    Only new journal entries (not already added) will be embedded and stored.
    """
    vectorstore = get_vectorstore_for_user(user_id)

    # Retrieve existing metadata from the vector store (if any)
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
        # Check if this journal entry is already stored using its unique id.
        if entry.id in existing_ids:
            continue  # Skip adding duplicate
        docs.append(
            Document(
                page_content=entry.content,
                metadata={"entry_id": entry.id, "user_id": user_id}
            )
        )
    if docs:
        vectorstore.add_documents(docs)
        vectorstore.persist()

def generate_bot_comment(user_id: int, bot_prompt: str, new_journal_text: str):
    """
    Use user-specific RAG with the bot's system prompt + new journal text + that user's past entries.
    """
    vectorstore = get_vectorstore_for_user(user_id)

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.8,
        max_tokens=256
    )

    results = vectorstore.similarity_search(new_journal_text, k=4)
    relevant_entries = "\n".join([doc.page_content for doc in results])
    final_prompt = f"""
You are a bot with the following personality or perspective:
{bot_prompt}

The user wrote a new journal entry:
{new_journal_text}

Here are some relevant past journal entries:
{relevant_entries}

You may refer to the user's past journals.
Respond thoroughly. Do not cut off or leave incomplete sentences.
"""
    # final_prompt = ChatPromptTemplate.from_template(final_prompt)
    parser = StrOutputParser()

    chain = llm | parser
    response = chain.invoke(final_prompt)
    return response.strip()
