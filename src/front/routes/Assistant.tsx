import { useCallback, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import TextField from "@mui/material/TextField"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
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
            special_aspect {
                id
            }
        }
    }
`)

type AssistantFromQuery = types.AssistantQuery["assistant"][number]
type PrincipleFromQuery =
    types.AssistantQuery["assistant"][number]["base_principles"][number]["principle"][number]

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
        <Card sx={{ padding: 2 }}>
            <Autocomplete
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
                    selectedAssistant.base_principles?.map(
                        ({ principle, count }) => (
                            <Button
                                key={principle.id}
                                startIcon={<PrincipleIcon id={principle.id} />}
                                onClick={() => handlePrinciple(principle.id)}
                            >
                                {count}
                            </Button>
                        ),
                    )}
            </CardActions>
        </Card>
    )
}
export default AssistantView
