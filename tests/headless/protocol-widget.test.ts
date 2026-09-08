import { describe, expect, it } from 'vitest'

import { readStructuredProtocolWidget, readStructuredProtocolWidgetObject } from '@/lib/protocol-widget'
import { structuredProtocolOfMainChatToolPart } from '@/lib/structured-protocol-tool'

describe('structured protocol widgets', () => {
  it('reads the protocol JSON shape emitted by delegate_tool', () => {
    expect(
      readStructuredProtocolWidgetObject({
        widget_name: 'protocol',
        title: 'Cells-to-CT workflow',
        saved_widget_id: 'file-123',
        stages: [
          {
            stage_name: 'Cell lysis',
            steps: [
              {
                step_name: 'Lyse cells',
                instruction: 'Add lysis solution and mix.',
                optional: false,
              },
            ],
            materials: [
              {
                name: 'Cells-to-CT Kit',
                product_id: 'AM1729',
                product_id_type: 'catalog_number',
                quantity: 1,
              },
            ],
          },
        ],
        references: ['manual, page 5'],
      }),
    ).toEqual({
      title: 'Cells-to-CT workflow',
      savedWidgetId: 'file-123',
      stages: [
        {
          stageName: 'Cell lysis',
          steps: [
            {
              stepName: 'Lyse cells',
              instruction: 'Add lysis solution and mix.',
              optional: false,
            },
          ],
          materials: [
            {
              name: 'Cells-to-CT Kit',
              productId: 'AM1729',
              productIdType: 'catalog_number',
              quantity: '1',
            },
          ],
        },
      ],
      materials: [],
      references: [{ title: 'manual', meta: 'page 5' }],
    })
  })

  it('accepts a JSON string and rejects markdown-only protocol widgets', () => {
    expect(
      readStructuredProtocolWidget(
        JSON.stringify({
          widget_name: 'protocol',
          title: 'Structured',
          stages: [],
          references: null,
        }),
      ),
    ).toEqual({
      title: 'Structured',
      stages: [],
      materials: [],
      references: [],
    })

    expect(readStructuredProtocolWidget({ widget_name: 'protocol', text: '### Materials' })).toBeNull()
  })

  it('reads a Pydantic-style model repr string from delegate_task output', () => {
    const modelRepr = [
      "widget_name='protocol'",
      "title='TaqMan Gene Expression Cells-to-CT Kit'",
      'saved_widget_id=None',
      "stages=[Stage(stage_name='Cell lysis', steps=[Step(step_name='Lyse cells', instruction='Add lysis solution, mix five times.', optional=False)], materials=[Material(name='Cells-to-CT Kit', product_id='AM1729', product_id_type='catalog_number', quantity=1)])]",
      "references=['manual, page 5']",
    ].join(' ')

    expect(readStructuredProtocolWidget(modelRepr)).toEqual({
      title: 'TaqMan Gene Expression Cells-to-CT Kit',
      stages: [
        {
          stageName: 'Cell lysis',
          steps: [
            {
              stepName: 'Lyse cells',
              instruction: 'Add lysis solution, mix five times.',
              optional: false,
            },
          ],
          materials: [
            {
              name: 'Cells-to-CT Kit',
              productId: 'AM1729',
              productIdType: 'catalog_number',
              quantity: '1',
            },
          ],
        },
      ],
      materials: [],
      references: [{ title: 'manual', meta: 'page 5' }],
    })

    expect(readStructuredProtocolWidget(JSON.stringify(modelRepr))?.title).toBe(
      'TaqMan Gene Expression Cells-to-CT Kit',
    )
    expect(readStructuredProtocolWidget({ output: modelRepr })?.title).toBe('TaqMan Gene Expression Cells-to-CT Kit')
  })

  it('promotes delegate_task structured protocol output to main chat content', () => {
    const output = {
      widget_name: 'protocol',
      title: 'Cells-to-CT workflow',
      stages: [],
      references: [],
    }

    expect(
      structuredProtocolOfMainChatToolPart({
        type: 'dynamic-tool',
        toolName: 'delegate_task',
        toolCallId: 'call-1',
        state: 'output-available',
        input: {},
        output,
      }),
    ).toEqual({
      title: 'Cells-to-CT workflow',
      stages: [],
      materials: [],
      references: [],
    })

    expect(
      structuredProtocolOfMainChatToolPart({
        type: 'dynamic-tool',
        toolName: 'delegate_task',
        toolCallId: 'call-2',
        state: 'input-available',
        input: {},
      }),
    ).toBeNull()

    expect(
      structuredProtocolOfMainChatToolPart({
        type: 'dynamic-tool',
        toolName: 'run_code',
        toolCallId: 'call-3',
        state: 'output-available',
        input: {},
        output,
      }),
    ).toBeNull()
  })
})
