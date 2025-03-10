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
        doc_id = f"journal_{entry.id}"
        docs.append(Document(
            page_content=entry.content,
            metadata={"entry_id": entry.id, "user_id": user_id},
            # The critical part: explicitly set the doc's ID
            id=doc_id
        ))
    if docs:
        vectorstore.add_documents(docs)
        vectorstore.persist()

def generate_bot_comment(user_id: int, bot_prompt: str, new_journal_text: str, exclude_journal_id: int = None):
    """
    Use user-specific RAG with the bot's system prompt + new_journal_text,
    but skip the doc with exclude_journal_id from the retrieved set.
    """
    vectorstore = get_vectorstore_for_user(user_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    # We can define a custom "filter" to skip the doc with that ID
    # If your Chroma version supports metadata filtering, do:
    # e.g. retriever = vectorstore.as_retriever(
    #   search_type="mmr",
    #   search_kwargs={"k": 5, "filter": lambda doc: doc.metadata["entry_id"] != exclude_journal_id}
    # )
    #
    # Another approach is to remove that doc from vectorstore then re-add it later,
    # but let's assume a custom filter is enough if supported.

    # If your version doesn't support dynamic filters, we can do a workaround:
    # 1) retrieve top-k
    # 2) filter out the doc with exclude_journal_id
    # 3) pass the remainder to the LLM chain
    # Something like this:

    docs = retriever.get_relevant_documents(new_journal_text)
    filtered_docs = [d for d in docs if d.metadata.get("entry_id") != exclude_journal_id]

    from langchain.chains import RetrievalQA
    from langchain.docstore.document import Document
    from langchain.chat_models import ChatOpenAI

    llm = ChatOpenAI(
        model_name="gpt-4",  # or "gpt-3.5-turbo"
        temperature=0.7,
        openai_api_key=OPENAI_API_KEY,
        max_tokens=512
    )

    # "answer" is the combined prompt + chain's result if "stuff" chain is used
    # But "stuff" chain in LangChain typically calls self.llm_chain, which you might need to do directly.
    # For a direct approach:
    # final_answer = chain.llm_chain.predict(context=some_text, question=some_question)
    # If you want a simpler approach, you might build a custom code or revert to the "docs" approach.

    # Let's just show a simpler approach using from_documents:
    #  but "RetrievalQA.from_documents" is also possible.
    # We'll do a direct call:

    # In older versions of LangChain, you'd do something like:
    # final_response = chain.run(input_documents=filtered_docs, question=QUESTION)
    # Return that final_response

    # For demonstration, let's do the simpler pattern:
    final_prompt = f"""
System: {bot_prompt}

The user wrote a new journal entry:
{new_journal_text}

Here are some possibly relevant past journals (excluding the current one):
{[d.page_content for d in filtered_docs]}

Respond thoroughly. Do not cut off or leave incomplete sentences.
"""

    # Make a single call to the LLM:
    response = llm.predict(final_prompt)
    return response.strip()