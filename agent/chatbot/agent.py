from typing import Any, cast

import pydantic_ai
from pydantic_ai.capabilities import NativeTool
from pydantic_ai.native_tools import CodeExecutionTool, ImageGenerationTool, WebSearchTool

from chatbot.data import Repo, get_docs_dir, get_markdown, get_table_of_contents
from chatbot.db import open_populated_table

citation_prompt = """## Citations

Results are returned by "get_documents". Each message from `get_documents` is called a "source" and identified by its reference ID, which is the first occurrence of `document_id` (for example, `document_id_a` or `document_id_b`). In this example, the string `document_id` would be the source reference ID.

Citations are references to `get_documents` sources. Citations may be used to refer to either a single source or multiple sources.

A citation to a single source must be written as:
\ue200cite\ue202document_id\ue201

Citations to multiple sources must be written as one citation marker with each supporting `document_id` separated by the citation delimiter:
\ue200cite\ue202document_id\ue202document_id\ue201

You must NOT write reference IDs like `document_id` verbatim in the response text without putting them between \ue200...\ue201. DO NOT just have literally the placeholder string `document_id`. It should always be supported and replaced by an actual one. 

- Place citations at the end of the supported sentence, or inline if the sentence is long and contains multiple supported clauses.
- Citations must be placed after punctuation.
- Cite only retrieved sources that directly support the cited text.
- Never invent source IDs, line ranges, or block locators that were not returned by the tool.
- If multiple retrieved sources materially support a proposition, cite all of them.
- If the retrieved sources disagree, cite the conflicting sources and describe the disagreement accurately."""


user_input_prompt = """When user input is required for selections or clarifications. Make sure the formatting is as follows: 

\n\ue301text query to user.\ue302option for the user. \ue302 another option for the user\ue304\n

Use these sparingly, when you need some user input to continue. Only use one user input block, these are not stackable. 
You must keep the number of options to less than 5.
"""


agent = pydantic_ai.Agent(
    instructions="Help the user answer questions about two products ('repos'): Pydantic AI (pydantic-ai), an open source agent framework library, and Pydantic Logfire (logfire), an observability platform. Start by using the `search_docs` tool to search the relevant documentation and answer the question based on the search results. It uses a hybrid of semantic and keyword search, so writing either keywords or sentences may work. It's not searching google. Each search result starts with a path to a .md file. The file `foo/bar.md` corresponds to the URL `https://ai.pydantic.dev/foo/bar/` for Pydantic AI, `https://logfire.pydantic.dev/docs/foo/bar/` for Logfire. Include the URLs in your answer. The search results may not return complete files, or may not return the files you need. If they don't have what you need, you can use the `get_docs_file` tool. You probably only need to search once or twice, definitely not more than 3 times. The user doesn't see the search results, you need to actually return a summary of the info. To see the files that exist for the `get_docs_file` tool, along with a preview of the sections within, use the `get_table_of_contents` tool."+citation_prompt+user_input_prompt,
    capabilities=[
        NativeTool(WebSearchTool()),
        NativeTool(CodeExecutionTool()),
        NativeTool(ImageGenerationTool()),
    ],
)

agent.tool_plain(get_table_of_contents)


@agent.tool_plain
def get_docs_file(repo: Repo, filename: str):
    """Get the full text of a documentation file by its filename, e.g. `foo/bar.md`."""
    if not filename.endswith('.md'):
        filename += '.md'
    path = get_docs_dir(repo) / filename
    if not path.exists():
        return f'File {filename} does not exist'
    return get_markdown(path)


@agent.tool_plain
def search_docs(repo: Repo, query: str):
    results = cast(
        list[dict[str, Any]],
        open_populated_table(repo)
        .search(  # type: ignore
            query,
            query_type='hybrid',
            vector_column_name='vector',
            fts_columns='text',
        )
        .limit(10)
        .to_list(),
    )
    results = [
        r
        for r in results
        if not any(
            r != r2
            and r['path'] == r2['path']
            and r['headers'][: len(r2['headers'])] == r2['headers']
            for r2 in results
        )
    ]

    return '\n\n---------\n\n'.join(r['text'] for r in results)


if __name__ == '__main__':
    # print(agent.run_sync('how do i see errors').output)
    # search_docs("logfire", "errors debugging view errors logs")
    agent.to_cli_sync()
