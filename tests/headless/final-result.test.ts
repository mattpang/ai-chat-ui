import { describe, expect, it } from 'vitest'

import { finalResultPayloadOfPart, isFinalResultToolPart } from '@/lib/final-result'
import type { DynamicToolUIPart } from 'ai'

describe('final_result tool rendering payloads', () => {
  it('reads streamed response text and citation widgets from tool input', () => {
    const part: DynamicToolUIPart = {
      type: 'dynamic-tool',
      toolName: 'final_result',
      toolCallId: 'call-1',
      state: 'input-streaming',
      input: {
        response_text: 'Use Protein G beads.',
        widget: {
          widget_name: 'citation',
          document_id: 'immuno-with-protein-g',
          url: 'https://example.com/protocol',
        },
      },
    }

    expect(isFinalResultToolPart(part)).toBe(true)
    expect(finalResultPayloadOfPart(part)).toEqual({
      responseText: 'Use Protein G beads.',
      widgets: [
        {
          widgetName: 'citation',
          documentId: 'immuno-with-protein-g',
          url: 'https://example.com/protocol',
        },
      ],
    })
  })

  it('reads protocol and citation widget arrays from available final_tool output', () => {
    const part: DynamicToolUIPart = {
      type: 'dynamic-tool',
      toolName: 'final_tool',
      toolCallId: 'call-2',
      state: 'output-available',
      input: {},
      output: {
        response_text: 'sample_text',
        widget: [
          {
            widget_name: 'protocol',
            title: 'Protein G magnetic bead immunoprecipitation (starting protocol)',
            text: '### Materials\n- Protein G magnetic bead slurry\n- Specific antibody\n- Clarified cell or tissue lysate\n- ',
            citations: ['immuno-with-protein-g'],
          },
          {
            widget_name: 'citation',
            document_id: 'immuno-with-protein-g',
            url: 'https://www.thermofisher.com/us/en/home/references/protocols/proteins-expression-isolation-and-analysis/protein-purification-protocol/immunoprecipitation-with-dynabeads-protein-g.html',
          },
        ],
      },
      preliminary: true,
    }

    expect(isFinalResultToolPart(part)).toBe(true)
    expect(finalResultPayloadOfPart(part)).toEqual({
      responseText: 'sample_text',
      widgets: [
        {
          widgetName: 'protocol',
          title: 'Protein G magnetic bead immunoprecipitation (starting protocol)',
          text: '### Materials\n- Protein G magnetic bead slurry\n- Specific antibody\n- Clarified cell or tissue lysate\n- ',
          citations: ['immuno-with-protein-g'],
        },
        {
          widgetName: 'citation',
          documentId: 'immuno-with-protein-g',
          url: 'https://www.thermofisher.com/us/en/home/references/protocols/proteins-expression-isolation-and-analysis/protein-purification-protocol/immunoprecipitation-with-dynabeads-protein-g.html',
        },
      ],
    })
  })

  it('keeps the streamed input when the tool output is not a final_result payload', () => {
    const part: DynamicToolUIPart = {
      type: 'dynamic-tool',
      toolName: 'final_result',
      toolCallId: 'call-3',
      state: 'output-available',
      input: {
        response_text: 'Rendered while streaming.',
        widget: null,
      },
      output: 'ok',
      preliminary: false,
    }

    expect(finalResultPayloadOfPart(part)).toEqual({
      responseText: 'Rendered while streaming.',
      widgets: [],
    })
  })
})
