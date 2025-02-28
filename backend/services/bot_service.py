import os
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.docstore.document import Document

# In production, store your API key in an environment variable.
# e.g. export OPENAI_API_KEY="sk-..."
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_KEY_HERE")

# Directory to store the local Chroma vector DB
PERSIST_DIR = "db_chroma"

embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
vectorstore = Chroma(
    collection_name="journal_entries",
    embedding_function=embeddings,
    persist_directory=PERSIST_DIR
)
retriever = vectorstore.as_retriever()

def update_vector_store(journal_entries):
    """Embed and store user's past journal entries in Chroma.
       A simple approach that doesn't separate by user. 
       In production, use separate collections or metadata filters."""
    docs = []
    for entry in journal_entries:
        docs.append(Document(page_content=entry.content, metadata={"entry_id": entry.id}))
    if docs:
        vectorstore.add_documents(docs)
        vectorstore.persist()

def generate_bot_comment(bot_prompt, new_journal_text):
    """Use RAG with the bot's system prompt + new journal text + past entries."""
    llm = ChatOpenAI(
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

    # Combine the bot prompt with new journal text
    final_prompt = f"""
You are a bot with the following personality or perspective:
{bot_prompt}

The user wrote a new journal entry:
{new_journal_text}

Use relevant past journal entries if needed to provide context.
Respond thoroughly. Do not cut off or leave incomplete sentences.
"""

    response = chain.run(final_prompt)
    return response.strip()
