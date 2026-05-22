import json
import hashlib
import redis as redis_lib
from groq import AsyncGroq, BadRequestError as GroqBadRequestError
from tavily import TavilyClient
from app.core.config import settings


SYSTEM_PROMPT = """You are CareFindr AI, a warm and professional medical assistant that helps patients in Pakistan find the right doctor.

MANDATORY STEP-BY-STEP FLOW — you MUST complete each step before moving to the next:

STEP 1 — COLLECT SYMPTOMS:
When the patient first mentions any symptom or health problem, ask 1 or 2 short follow-up questions to understand better.
Example follow-ups: How long have you had this? Is it mild or severe? Any other symptoms?
DO NOT suggest a condition yet. DO NOT ask for a city. DO NOT call search_doctors.

STEP 2 — GIVE ASSESSMENT:
After the patient answers your follow-up questions, tell them what condition it could possibly be (use "possibly", "could be", "it seems like") and mention the type of specialist they should see.
Then ask: "Would you like me to find doctors near you?"
DO NOT call search_doctors yet.

STEP 3 — ASK FOR CITY:
If the patient says yes (or "okay", "sure", "yes please", "find doctors"), ask: "Please share your city name so I can find doctors near you."
DO NOT call search_doctors yet.

STEP 4 — SEARCH:
ONLY call search_doctors after ALL of the following are true:
  a) Patient has described their symptoms
  b) You have asked follow-up questions
  c) You have given a possible condition and specialist recommendation
  d) Patient agreed to find doctors
  e) Patient has provided a city name
Call search_doctors with the city and specialist type. Show the COMPLETE results without summarizing.

CLOSING MESSAGES — override everything:
If the patient says "thank you", "thanks", "bye", "goodbye", "that's all", or any polite closing — respond with a warm goodbye only. NEVER call search_doctors. NEVER ask for a city.

STRICT SCOPE — you ONLY discuss health and medical topics:
You are a medical assistant ONLY. If someone asks about celebrities, actors, sports, coding, programming, math, science, recipes, news, weather, politics, general knowledge, or ANYTHING not related to health symptoms or finding doctors — respond with ONLY this:
"I'm a medical assistant and can only help with health-related questions. Please describe your symptoms and I'll help you find the right doctor."
Do NOT answer the question. Do NOT be helpful about the off-topic subject. Do NOT call search_doctors.

MEDICAL RULES:
- NEVER give a definitive diagnosis — always say "possibly", "could be", "it seems like"
- NEVER recommend specific medications or treatments
- Always remind the patient to consult a real doctor
- Be empathetic, concise, and clear"""


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_doctors",
            "description": (
                "Search for real doctors in Pakistan by city and specialty. "
                "Call this ONLY when the patient asks to find doctors and provides a city or doctor name. "
                "Do NOT call this for greetings, thank-you messages, or general conversation."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query e.g. 'best Cardiologist doctors in Karachi Pakistan clinic address phone timings'"
                    }
                },
                "required": ["query"]
            }
        }
    }
]


class ChatService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)
        self._redis = None
        if settings.REDIS_URL:
            try:
                r = redis_lib.from_url(settings.REDIS_URL, socket_connect_timeout=2, decode_responses=True)
                r.ping()
                self._redis = r
            except Exception:
                pass  # Redis unavailable — caching silently disabled

    def _cache_get(self, key: str):
        if not self._redis:
            return None
        try:
            return self._redis.get(key)
        except Exception:
            return None

    def _cache_set(self, key: str, value: str, ttl: int = 21600):
        if not self._redis:
            return
        try:
            self._redis.setex(key, ttl, value)
        except Exception:
            pass

    def _search_doctors(self, query: str) -> str:
        # Ensure Pakistan is always in the query
        if "pakistan" not in query.lower():
            query = query + " Pakistan"

        cache_key = f"search:{hashlib.md5(query.lower().strip().encode()).hexdigest()}"
        cached = self._cache_get(cache_key)
        if cached:
            return cached

        try:
            results = self.tavily.search(
                query=query,
                search_depth="advanced",
                max_results=5,
                include_answer=True,
                include_domains=[
                    "marham.pk", "oladoc.com", "instacare.pk",
                    "shaukatkhanum.org.pk", "aga-khan.org", "doctors.com.pk",
                ],
            )
        except Exception:
            return "Search failed. Please try Marham.pk or Oladoc.com directly."

        if not results.get("results"):
            return "No results found. Please try Marham.pk or Oladoc.com directly."

        raw_parts = []

        # Tavily synthesized answer often contains actual doctor names
        answer = results.get("answer", "")
        if answer:
            raw_parts.append(f"SUMMARY:\n{answer}")

        for r in results["results"][:5]:
            title = r.get("title", "").strip()
            content = r.get("content", "").strip()
            url = r.get("url", "")
            raw_parts.append(f"Title: {title}\nContent: {content}\nURL: {url}")

        result = "\n\n---\n\n".join(raw_parts)
        self._cache_set(cache_key, result)
        return result

    async def process_message(self, user_message: str, history: list[dict]) -> str:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        try:
            response = await self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                max_tokens=1024,
            )
        except GroqBadRequestError:
            return "I'm a medical assistant and can only help with health-related questions. Please describe your symptoms and I'll help you find the right doctor."

        msg = response.choices[0].message

        # No tool call — plain response
        if not msg.tool_calls:
            return msg.content

        # Tool was called — execute search then format with a strict LLM call
        tool_call = msg.tool_calls[0]
        args = json.loads(tool_call.function.arguments)
        raw_results = self._search_doctors(args["query"])

        format_response = await self.client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You extract doctor information from search results and return ONLY a valid JSON object. "
                        "No explanation, no markdown, no code fences — raw JSON only.\n\n"
                        "Schema:\n"
                        '{"type":"doctors","items":[{"name":"Dr. Full Name","designation":"Specialty","clinic":"Clinic or Hospital Name","address":"Area, City","phone":"number or empty string","timings":"e.g. Mon-Sat 10am-5pm or empty string"}]}\n\n'
                        "Rules:\n"
                        "- Use the SUMMARY section first for doctor names — it is the most reliable source.\n"
                        "- Extract as many doctors as found, minimum 3 entries.\n"
                        "- For address: extract the area and city (e.g. 'Model Town, Bahawalpur'). If not found, put the city name.\n"
                        "- For phone: extract any Pakistani phone number (03XX, 042-, 051- format). If not found, use empty string.\n"
                        "- For clinic: extract the hospital or clinic name. If not found, use empty string.\n"
                        "- For timings: extract consultation hours or availability (e.g. 'Mon-Sat: 10am-5pm', 'Evenings only'). If not found, use empty string.\n"
                        "- Do NOT include any URL or link field.\n"
                        "- Output ONLY the JSON. Nothing else."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Extract doctors from these search results:\n\n{raw_results}",
                },
            ],
            max_tokens=700,
        )

        formatted = format_response.choices[0].message.content
        intro = (msg.content + "\n\n") if msg.content else ""
        return intro + formatted


chat_service = ChatService()
