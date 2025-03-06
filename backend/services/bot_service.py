import os
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.docstore.document import Document

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
    """
    vectorstore = get_vectorstore_for_user(user_id)
    docs = []
    for entry in journal_entries:
        # Use a unique key so we don't add duplicates
        # (Chroma doesn't automatically deduplicate yet)
        doc_id = f"journal_{entry.id}"
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
    retriever = vectorstore.as_retriever()

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
        openai_api_key=OPENAI_API_KEY,
        max_tokens=512
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        verbose=False
    )

    final_prompt = f"""
You are a bot with the following personality or perspective:
{bot_prompt}

The user wrote a new journal entry:
{new_journal_text}

You may refer only to the user's past journals (already embedded).
Respond thoroughly. Do not cut off or leave incomplete sentences.
"""

    response = chain.run(final_prompt)
    return response.strip()
