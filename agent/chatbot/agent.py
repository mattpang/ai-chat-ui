from typing import Any, cast

from pydantic_ai import Agent

import json 
from pathlib import Path
from pydantic_ai.models.test import TestModel
from pydantic_ai_harness.subagents import SubAgent, SubAgents
from dataclasses import dataclass
from chatbot.models import Protocol
from pydantic_ai.tools import RunContext


example_protocol = json.loads(Path("/Users/mattpang/projects/tfgenai-mono-repo/thermo-foundry-beta/science-foundry-agent/docs/protocol_model_example.json").read_text())

mock_protocol_model = TestModel(
    custom_output_args=example_protocol,
    call_tools=[],
)

@dataclass
class ProtocolPersistenceContext:
    saved_widget_id: str | None = None
    saved_protocol_path: Path | None = None
    widget_data: Protocol | None = None

# this example agent will just extract the protocol from a file.
protocol_agent = Agent(
    description=(
        "Used to extract protocols from data. This agent will create a protocol for the user."
    ),
    system_prompt=(
        "Use the `search_products` mcp tool to look up the products by key word or "
        "name and get the details for each material. For example `XenoRNA™ Control`"
    ),
    model=mock_protocol_model,  # use mock_protocol_model for instant response, and  "openai:gpt-5.6-luna" for normal ops
    deps_type=ProtocolPersistenceContext,
    output_type=Protocol,
    tool_timeout=60.0,
    retries=2,
)


@protocol_agent.output_validator
def save_protocol(ctx: RunContext[ProtocolPersistenceContext], protocol: Protocol) -> Protocol:
    file_id, path = '12345','/protocol/1.id'
    if ctx.deps is not None:
        ctx.deps.saved_widget_id = file_id
        ctx.deps.saved_protocol_path = path
        ctx.deps.widget_data = protocol
    return protocol

simple_prompt="""You are Thermo Fisher Foundry, an expert scientific collaborator. Help experienced scientists reason through experimental work, inspect relevant evidence, and deliberately retain useful results.

# Tools
- `get_reference` takes the a query text and matches that with related documents.

# Collaboration
- Preserve supplied conversational facts; let the latest correction override older context.
- Lead with the answer, decision, or evidence gap; expand when the scientist requests more detail.
- Answer directly when the request is actionable; pursue a complete, evidence-backed answer.
- Share concise progress through existing chat events while keeping private reasoning private.
- Give one substantive answer; do not present private thinking, tool plans, or progress.
- Keep assay, sample, chemistry, reagent, control, and normalization choices revisable; name conflicts.
- Make a brief, reversible assumption when clarification would not materially change the result.
- Refer to the company only as Thermo Fisher or Thermo Fisher Scientific; never abbreviate its name.
- Product replies omit public, experimental, provisional, only, fixture, development, internal, verification, commerce, unsaved, not saved, confirm compatibility, verify suitability, and before execution; never overstate evidence.

Sources:
Thermofisher website are the most trusted. 
Prefer pubmed papers over other websites. 
Avoid sales and marketing content. 


- Correct the next useful step; intent confirmation never precedes actionable read-only evidence.

"""

agent = Agent(
    system_prompt=simple_prompt
    + (
        "If a protocol is required, first tell the user in the output stream that you will "
        "hand off to the protocol agent to create the protocol, then delegate to the protocol "
        "agent. The protocol agent will persist this entry to file. Do not repeat the protocol "
        "in the final output."
        "You may also use the vector_retrieval_tool to look up any resources and documentation required. The client_id must be set to benchmark.all.docs.v1"
    ),
    model="openai:gpt-5.6-luna",
    deps_type=ProtocolPersistenceContext,
    output_type=str,
    capabilities=[
        # MCP(
        #     url=os.environ.get("VECTOR_SEARCH_MCP_URL"),
        #     headers={
        #         "Authorization": "Bearer "
        #         + get_auth_token(endpoint=os.environ.get("PRODUCT_MCP_URL"))
        #     },
        # ),
        SubAgents(agents=[SubAgent(name="protocol agent", agent=protocol_agent)]),
    ],
    tool_timeout=60.0,
    retries=3,
)

if __name__ == '__main__':
    # print(agent.run_sync('how do i see errors').output)
    # search_docs("logfire", "errors debugging view errors logs")
    agent.to_cli_sync()
