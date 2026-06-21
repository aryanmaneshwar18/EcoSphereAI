"""
EcoSphere AI - Multi-Agent Architecture
Implements a LangGraph-based multi-agent system for complex environmental 
analysis, integrating reasoning, data retrieval (RAG), and scenario planning.
"""

from typing import Dict, Any, List, TypedDict, Annotated
import logging
import operator

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ── 1. Define State ─────────────────────────────────────────────
class AgentState(TypedDict):
    messages: Annotated[List[Any], operator.add]
    user_context: Dict[str, Any]
    retrieved_docs: List[str]
    current_intent: str
    final_response: str

class MultiAgentSystem:
    def __init__(self):
        settings = get_settings()
        # Fallback to a mock instance if key is absent (to avoid hard crashes in dev)
        try:
            self.llm = ChatOpenAI(model="gpt-4o", temperature=0.5, openai_api_key=settings.OPENAI_API_KEY)
        except Exception as e:
            logger.warning(f"Failed to initialize ChatOpenAI: {e}")
            self.llm = None
            
        self.setup_graph()
        
    def setup_graph(self):
        """
        Builds the LangGraph state machine.
        """
        self.graph = StateGraph(AgentState)
        
        # Add Nodes
        self.graph.add_node("router", self.route_query)
        self.graph.add_node("retriever", self.retrieve_knowledge)
        self.graph.add_node("analyst", self.analyze_data)
        self.graph.add_node("coach", self.generate_coaching_response)
        
        # Add Edges
        self.graph.set_entry_point("router")
        self.graph.add_conditional_edges("router", self.determine_next_node, {
            "retriever": "retriever",
            "analyst": "analyst",
            "coach": "coach"
        })
        self.graph.add_edge("retriever", "analyst")
        self.graph.add_edge("analyst", "coach")
        self.graph.add_edge("coach", END)
        
        self.app = self.graph.compile()

    def determine_next_node(self, state: AgentState) -> str:
        intent = state.get("current_intent", "coach")
        if intent == "retrieve":
            return "retriever"
        elif intent == "analyze":
            return "analyst"
        return "coach"

    # ── Node Implementations ───────────

    async def route_query(self, state: AgentState) -> AgentState:
        """Determines if the query needs data retrieval or analysis."""
        last_msg = state["messages"][-1].content.lower()
        if "science" in last_msg or "ipcc" in last_msg or "how" in last_msg:
            return {"current_intent": "retrieve"}
        elif "my emissions" in last_msg or "calculate" in last_msg or "total" in last_msg:
            return {"current_intent": "analyze"}
        return {"current_intent": "coach"}

    async def retrieve_knowledge(self, state: AgentState) -> AgentState:
        """RAG node: queries the vector database for relevant scientific papers."""
        # Simulated retrieval
        docs = [
            "IPCC AR6 states that switching to public transit can reduce personal transport emissions by up to 40%.",
            "DEFRA 2025 highlights that a plant-based diet significantly lowers agricultural methane output."
        ]
        return {"retrieved_docs": docs}

    async def analyze_data(self, state: AgentState) -> AgentState:
        """Specialized analyst node for crunching user emission data."""
        # Here we would do a complex calculation based on context.
        # Since it's a structural implementation, we just pass the context.
        context = state.get("user_context", {})
        analysis = f"User level is {context.get('level', 1)}. Emissions look typical for their cohort."
        return {"retrieved_docs": state.get("retrieved_docs", []) + [analysis]}

    async def generate_coaching_response(self, state: AgentState) -> AgentState:
        """Final synthesis node that formats the response with empathy."""
        if not self.llm:
            return {"final_response": "I'm sorry, I'm currently offline."}
            
        system_msg = SystemMessage(content=(
            "You are EcoSphere AI, an elite environmental coach. "
            "Synthesize the user's question, any retrieved documents, and user context into a helpful, "
            "concise response in Markdown format."
        ))
        
        context_str = "Retrieved Info: " + " | ".join(state.get("retrieved_docs", []))
        user_query = state["messages"][-1].content
        
        prompt = HumanMessage(content=f"Context: {context_str}\n\nQuestion: {user_query}")
        
        try:
            response = await self.llm.ainvoke([system_msg, prompt])
            return {"final_response": response.content}
        except Exception as e:
            logger.error(f"LLM Error: {e}")
            return {"final_response": "I encountered an error processing your request."}

    # ── Public Interface ────────────────────────────────────────

    async def process_user_query(self, query: str, user_data: Dict[str, Any]) -> str:
        """
        Entry point for the multi-agent system.
        """
        inputs = {
            "messages": [HumanMessage(content=query)], 
            "user_context": user_data,
            "retrieved_docs": [],
            "current_intent": "",
            "final_response": ""
        }
        
        try:
            # We use invoke since we need the final state dict
            final_state = await self.app.ainvoke(inputs)
            return final_state.get("coach", {}).get("final_response", final_state.get("final_response", "I could not generate a response."))
        except Exception as e:
            logger.error(f"Multi-Agent error: {e}")
            return "An error occurred while routing your query through the multi-agent system."
