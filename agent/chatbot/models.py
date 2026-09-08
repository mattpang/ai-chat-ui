from typing import Literal

from pydantic import BaseModel, Field

# we will use this as a reference for a procedure:
# https://documents.thermofisher.com/TFS-Assets/LSG/manuals/4385117_D.pdf#page=5


class Material(BaseModel):
    name: str
    product_id: str | None = Field(None, description="Thermofisher product id.")
    product_id_type: Literal["catalog_number", "sku"] | None = Field(
        None, description="Type of product id, could be a SKU or catalog number etc."
    )
    quantity: int | None = Field(None, description="Number of units required.")


class Step(BaseModel):
    step_name: str = Field(description="Name of the step")
    instruction: str = Field(description="Instructions for this step")
    optional: bool = Field(description="This step may be optional")


class Stage(BaseModel):
    stage_name: str = Field(description="Short title for this stage.")
    steps: list[Step]
    materials: list[Material] | None = Field(
        None,
        description=(
            "Any materials that are used during any of the stages. The details of this "
            "materials should be look up using the mcp tool: get_product_details. If there's no results then this can be None"
        ),
    )


class Protocol(BaseModel):
    widget_name: str = "protocol"
    title: str = Field(description="Protocol name")
    saved_widget_id: str | None = Field(
        None, description="File id for the persisted protocol widget JSON."
    )

    stages: list[Stage] = Field(description="Steps in the protocol procedure")

    references: list[str] | None = Field(
        description=(
            "Protocols must cite `document_id`s where the data originated and sources "
            "referenced, this field lists the document_id of where the information to "
            "build the protocol came from"
        )
    )
