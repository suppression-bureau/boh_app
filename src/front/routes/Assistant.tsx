import { useCallback, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import ItemsView from "./Items"
import { PrincipleIcon } from "./Principles"

const assistantQueryDocument = graphql(`
    query Assistant {
        assistant {
            id
            season
            base_principles {
                principle {
                    id
                }
                count
            }
            aspects {
                id
            }
        }
    }
`)

type AssistantFromQuery = types.AssistantQuery["assistant"][number]
type PrincipleFromQuery =
    types.AssistantQuery["assistant"][number]["base_principles"][number]["principle"][number]

type AssistantItemProps = {
    principle: PrincipleFromQuery["id"]
    assistant: AssistantFromQuery
}

function AssistantItems({ principle, assistant }: AssistantItemProps) {
    return (
        <Stack maxWidth={"auto"}>
            {assistant?.aspects?.map((aspect) => (
                <div key={aspect?.id + "grouping"}>
                    <Typography
                        key={aspect?.id + "header"}
                        variant="h5"
                        color={"secondary"}
                    >
                        {aspect?.id}
                    </Typography>
                    <ItemsView
                        key={aspect?.id + principle}
                        filters={{
                            [principle]: true,
                            aspect: aspect?.id,
                        }}
                    />
                </div>
            ))}
        </Stack>
    )
}

const AssistantView = () => {
    const [{ data }] = useQuery({ query: assistantQueryDocument })
    const [selectedAssistant, setAssistant] =
        useState<AssistantFromQuery | null>(null)

    const [selectedPrinciple, setPrinciple] =
        useState<PrincipleFromQuery | null>(null)

    const handleNewAssistant = useCallback(
        (
            _event: React.SyntheticEvent,
            assistant: AssistantFromQuery | null,
        ) => {
            setAssistant(assistant)
        },
        [setAssistant],
    )

    const handlePrinciple = useCallback(
        (principle: PrincipleFromQuery) => {
            setPrinciple(principle)
        },
        [setPrinciple],
    )

    return (
        <div>
            <Card sx={{ padding: 2 }}>
                <Autocomplete
                    key="assistant-selector"
                    id="assistant-selector"
                    options={data!.assistant}
                    getOptionLabel={({ id }) => id}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={(params) => (
                        <TextField {...params} label="Select your Assistant" />
                    )}
                    onChange={handleNewAssistant}
                />
                <CardActions>
                    {selectedAssistant &&
                        selectedAssistant.base_principles!.map(
                            ({ principle, count }) => (
                                <Button
                                    key={principle.id}
                                    startIcon={
                                        <PrincipleIcon id={principle.id} />
                                    }
                                    onClick={() =>
                                        handlePrinciple(principle.id)
                                    }
                                    variant={
                                        selectedPrinciple === principle.id
                                            ? "contained"
                                            : "outlined"
                                    }
                                >
                                    {count}
                                </Button>
                            ),
                        )}
                </CardActions>
            </Card>
            {selectedAssistant && selectedPrinciple && (
                <AssistantItems
                    principle={selectedPrinciple}
                    assistant={selectedAssistant}
                />
            )}
        </div>
    )
}
export default AssistantView
